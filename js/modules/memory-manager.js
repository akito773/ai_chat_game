/**
 * 会話記憶管理システム
 * ライトノベル級の会話の継続性を実現
 */
class MemoryManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.maxShortTermMemory = 10; // 直近の会話数
        this.maxLongTermMemory = 50;  // 長期記憶の要約数
        this.memoryData = {
            shortTerm: [],     // 直近の生会話
            longTerm: [],      // 要約された重要な記憶
            keywords: {},      // ユーザーの特徴キーワード
            importantEvents: [], // 重要なイベント記録
            characterMemories: {} // キャラクター別記憶
        };
        
        console.log('🧠 MemoryManager 初期化');
        this.loadMemoryData();
    }

    /**
     * 新しい会話を追加
     */
    addConversation(message, isUser, characterId, context = {}) {
        // データ構造の安全性チェック
        if (!Array.isArray(this.memoryData.shortTerm)) {
            this.memoryData.shortTerm = [];
        }
        if (!Array.isArray(this.memoryData.longTerm)) {
            this.memoryData.longTerm = [];
        }
        if (!this.memoryData.characterMemories || typeof this.memoryData.characterMemories !== 'object') {
            this.memoryData.characterMemories = {};
        }
        
        const conversation = {
            id: Date.now() + Math.random(),
            message: message,
            isUser: isUser,
            characterId: characterId,
            timestamp: new Date().toISOString(),
            context: context,
            analyzed: false
        };

        // 短期記憶に追加
        this.memoryData.shortTerm.unshift(conversation);

        // 短期記憶が上限を超えた場合、古いものを長期記憶に移動
        if (this.memoryData.shortTerm.length > this.maxShortTermMemory) {
            const oldMemory = this.memoryData.shortTerm.pop();
            this.processToLongTerm(oldMemory);
        }

        // キャラクター別記憶に追加
        if (!this.memoryData.characterMemories[characterId]) {
            this.memoryData.characterMemories[characterId] = {
                conversations: [],
                topics: {},
                personality: {},
                userPreferences: {}
            };
        }

        this.memoryData.characterMemories[characterId].conversations.unshift({
            message: message,
            isUser: isUser,
            timestamp: conversation.timestamp,
            context: context
        });

        // ユーザーメッセージの場合、キーワード分析
        if (isUser) {
            this.analyzeUserMessage(message, characterId);
        }

        this.saveMemoryData();
        console.log(`🧠 会話追加: ${characterId} - ${isUser ? 'User' : 'AI'}: ${message.substring(0, 30)}...`);
    }

    /**
     * ユーザーメッセージの分析
     */
    analyzeUserMessage(message, characterId) {
        // 名前の抽出
        const namePatterns = [
            /私の名前は(.+?)です/,
            /私は(.+?)と申します/,
            /(.+?)と呼んでください/,
            /(.+?)です、よろしく/
        ];

        for (const pattern of namePatterns) {
            const match = message.match(pattern);
            if (match) {
                this.setUserInfo('name', match[1].trim(), characterId);
                break;
            }
        }

        // 好みの抽出
        const likePatterns = [
            /(.+?)が好き/,
            /(.+?)が大好き/,
            /(.+?)を愛している/
        ];

        for (const pattern of likePatterns) {
            const match = message.match(pattern);
            if (match) {
                this.addUserPreference('likes', match[1].trim(), characterId);
            }
        }

        // 嫌いなものの抽出
        const dislikePatterns = [
            /(.+?)が嫌い/,
            /(.+?)は苦手/,
            /(.+?)は好きじゃない/
        ];

        for (const pattern of dislikePatterns) {
            const match = message.match(pattern);
            if (match) {
                this.addUserPreference('dislikes', match[1].trim(), characterId);
            }
        }

        // 感情の抽出
        const emotions = {
            happy: ['嬉しい', '楽しい', '幸せ', 'うれしい'],
            sad: ['悲しい', 'つらい', '辛い', '寂しい'],
            angry: ['怒ってる', '腹が立つ', 'むかつく', 'イライラ'],
            excited: ['興奮', 'ワクワク', 'ドキドキ', '楽しみ']
        };

        for (const [emotion, keywords] of Object.entries(emotions)) {
            for (const keyword of keywords) {
                if (message.includes(keyword)) {
                    this.recordEmotion(emotion, characterId);
                    break;
                }
            }
        }
    }

    /**
     * ユーザー情報の設定
     */
    setUserInfo(key, value, characterId) {
        if (!this.memoryData.keywords[characterId]) {
            this.memoryData.keywords[characterId] = {};
        }
        
        this.memoryData.keywords[characterId][key] = value;
        console.log(`🧠 ユーザー情報更新: ${key} = ${value}`);
    }

    /**
     * ユーザーの好みを追加
     */
    addUserPreference(type, item, characterId) {
        if (!this.memoryData.characterMemories[characterId]) {
            this.memoryData.characterMemories[characterId] = { userPreferences: {} };
        }
        
        if (!this.memoryData.characterMemories[characterId].userPreferences[type]) {
            this.memoryData.characterMemories[characterId].userPreferences[type] = [];
        }
        
        if (!this.memoryData.characterMemories[characterId].userPreferences[type].includes(item)) {
            this.memoryData.characterMemories[characterId].userPreferences[type].push(item);
            console.log(`🧠 ユーザー好み追加: ${type} - ${item}`);
        }
    }

    /**
     * 感情を記録
     */
    recordEmotion(emotion, characterId) {
        if (!this.memoryData.characterMemories[characterId]) {
            this.memoryData.characterMemories[characterId] = { personality: {} };
        }
        
        if (!this.memoryData.characterMemories[characterId].personality.userEmotions) {
            this.memoryData.characterMemories[characterId].personality.userEmotions = {};
        }
        
        const emotions = this.memoryData.characterMemories[characterId].personality.userEmotions;
        emotions[emotion] = (emotions[emotion] || 0) + 1;
    }

    /**
     * 短期記憶を長期記憶に処理
     */
    processToLongTerm(conversation) {
        // 重要度判定
        const importance = this.calculateImportance(conversation);
        
        if (importance > 0.5) { // 閾値以上なら長期記憶に保存
            const summary = this.summarizeConversation(conversation);
            
            this.memoryData.longTerm.unshift({
                id: conversation.id,
                summary: summary,
                importance: importance,
                timestamp: conversation.timestamp,
                characterId: conversation.characterId,
                originalMessage: conversation.message.substring(0, 100) // 元メッセージの一部
            });

            // 長期記憶の上限チェック
            if (this.memoryData.longTerm.length > this.maxLongTermMemory) {
                this.memoryData.longTerm = this.memoryData.longTerm
                    .sort((a, b) => b.importance - a.importance)
                    .slice(0, this.maxLongTermMemory);
            }
        }
    }

    /**
     * 会話の重要度計算
     */
    calculateImportance(conversation) {
        let importance = 0;

        // 長いメッセージは重要度が高い
        importance += Math.min(conversation.message.length / 100, 0.3);

        // 特定のキーワードを含む場合
        const importantKeywords = [
            '名前', '好き', '嫌い', '家族', '夢', '将来', '過去', '秘密',
            'ありがとう', 'ごめん', '愛してる', '大切', '特別'
        ];

        for (const keyword of importantKeywords) {
            if (conversation.message.includes(keyword)) {
                importance += 0.2;
            }
        }

        // ユーザーからのメッセージは重要度が高い
        if (conversation.isUser) {
            importance += 0.1;
        }

        return Math.min(importance, 1.0);
    }

    /**
     * 会話の要約
     */
    summarizeConversation(conversation) {
        const message = conversation.message;
        
        // 簡単な要約生成（実際のプロジェクトではより高度な要約を実装）
        if (message.length <= 50) {
            return message;
        }
        
        // 重要な部分を抽出
        const sentences = message.split(/[。！？]/).filter(s => s.trim().length > 0);
        if (sentences.length <= 2) {
            return message.substring(0, 80) + '...';
        }
        
        return sentences[0] + '。' + (sentences[1] ? sentences[1] + '。' : '');
    }

    /**
     * API送信用の会話履歴を取得
     */
    getConversationForAPI(characterId, maxTokens = 2000) {
        const result = {
            shortTerm: [],
            longTerm: [],
            userInfo: {},
            estimatedTokens: 0
        };

        // ユーザー情報を含める
        if (this.memoryData.keywords[characterId]) {
            result.userInfo = { ...this.memoryData.keywords[characterId] };
        }

        // キャラクター固有の情報
        if (this.memoryData.characterMemories[characterId]) {
            const charMemory = this.memoryData.characterMemories[characterId];
            if (charMemory.userPreferences) {
                result.userInfo.preferences = charMemory.userPreferences;
            }
            if (charMemory.personality && charMemory.personality.userEmotions) {
                result.userInfo.emotionalTendency = charMemory.personality.userEmotions;
            }
        }

        // 短期記憶を追加（最新から）
        let currentTokens = JSON.stringify(result.userInfo).length;
        
        for (const conv of this.memoryData.shortTerm) {
            if (conv.characterId === characterId || !characterId) {
                const convTokens = conv.message.length;
                if (currentTokens + convTokens > maxTokens * 0.7) break; // 70%まで使用
                
                result.shortTerm.push({
                    message: conv.message,
                    isUser: conv.isUser,
                    timestamp: conv.timestamp
                });
                currentTokens += convTokens;
            }
        }

        // 長期記憶を重要度順に追加
        const relevantLongTerm = this.memoryData.longTerm
            .filter(mem => mem.characterId === characterId || !characterId)
            .sort((a, b) => b.importance - a.importance);

        for (const mem of relevantLongTerm) {
            const memTokens = mem.summary.length;
            if (currentTokens + memTokens > maxTokens * 0.9) break; // 90%まで使用
            
            result.longTerm.push({
                summary: mem.summary,
                importance: mem.importance,
                timestamp: mem.timestamp
            });
            currentTokens += memTokens;
        }

        result.estimatedTokens = currentTokens;
        return result;
    }

    /**
     * 重要なイベントを記録
     */
    recordImportantEvent(eventId, description, characterId, data = {}) {
        const event = {
            id: eventId,
            description: description,
            characterId: characterId,
            timestamp: new Date().toISOString(),
            data: data
        };

        this.memoryData.importantEvents.push(event);
        
        // キャラクター別にも記録
        if (!this.memoryData.characterMemories[characterId]) {
            this.memoryData.characterMemories[characterId] = {};
        }
        if (!this.memoryData.characterMemories[characterId].events) {
            this.memoryData.characterMemories[characterId].events = [];
        }
        
        this.memoryData.characterMemories[characterId].events.push(event);
        this.saveMemoryData();

        console.log(`🧠 重要イベント記録: ${eventId} - ${description}`);
    }

    /**
     * キャラクターとの関係性を分析
     */
    analyzeRelationship(characterId) {
        const charMemory = this.memoryData.characterMemories[characterId];
        if (!charMemory) return null;

        const analysis = {
            conversationCount: charMemory.conversations.length,
            averageMessageLength: 0,
            topTopics: {},
            emotionalProfile: charMemory.personality.userEmotions || {},
            userPreferences: charMemory.userPreferences || {},
            relationshipStage: 'unknown'
        };

        // 平均メッセージ長を計算
        if (charMemory.conversations.length > 0) {
            const totalLength = charMemory.conversations
                .filter(c => c.isUser)
                .reduce((sum, c) => sum + c.message.length, 0);
            const userMessageCount = charMemory.conversations.filter(c => c.isUser).length;
            analysis.averageMessageLength = userMessageCount > 0 ? totalLength / userMessageCount : 0;
        }

        // 関係性の段階を判定
        if (analysis.conversationCount < 5) {
            analysis.relationshipStage = 'initial';
        } else if (analysis.conversationCount < 20) {
            analysis.relationshipStage = 'getting_acquainted';
        } else if (analysis.conversationCount < 50) {
            analysis.relationshipStage = 'friends';
        } else {
            analysis.relationshipStage = 'close_friends';
        }

        return analysis;
    }

    /**
     * メモリデータの保存
     */
    saveMemoryData() {
        try {
            localStorage.setItem('chatRPG_memoryData', JSON.stringify(this.memoryData));
        } catch (error) {
            console.error('❌ メモリデータ保存エラー:', error);
        }
    }

    /**
     * メモリデータの読み込み
     */
    loadMemoryData() {
        try {
            const saved = localStorage.getItem('chatRPG_memoryData');
            if (saved) {
                const savedData = JSON.parse(saved);
                
                // データ構造の互換性チェックと修正
                this.memoryData = {
                    shortTerm: Array.isArray(savedData.shortTerm) ? savedData.shortTerm : [],
                    longTerm: Array.isArray(savedData.longTerm) ? savedData.longTerm : [],
                    keywords: savedData.keywords && typeof savedData.keywords === 'object' ? savedData.keywords : {},
                    importantEvents: Array.isArray(savedData.importantEvents) ? savedData.importantEvents : [],
                    characterMemories: savedData.characterMemories && typeof savedData.characterMemories === 'object' ? savedData.characterMemories : {}
                };
                
                console.log('🧠 メモリデータ読み込み完了');
            }
        } catch (error) {
            console.error('❌ メモリデータ読み込みエラー:', error);
            // エラー時は初期化
            this.memoryData = {
                shortTerm: [],
                longTerm: [],
                keywords: {},
                importantEvents: [],
                characterMemories: {}
            };
        }
    }

    /**
     * メモリデータのクリア
     */
    clearMemory(characterId = null) {
        if (characterId) {
            // 特定キャラクターのメモリをクリア
            delete this.memoryData.characterMemories[characterId];
            delete this.memoryData.keywords[characterId];
            
            // 短期・長期記憶から該当キャラの記憶を削除
            this.memoryData.shortTerm = this.memoryData.shortTerm.filter(conv => conv.characterId !== characterId);
            this.memoryData.longTerm = this.memoryData.longTerm.filter(mem => mem.characterId !== characterId);
            this.memoryData.importantEvents = this.memoryData.importantEvents.filter(event => event.characterId !== characterId);
            
            console.log(`🧠 ${characterId}のメモリクリア完了`);
        } else {
            // 全メモリクリア
            this.memoryData = {
                shortTerm: [],
                longTerm: [],
                keywords: {},
                importantEvents: [],
                characterMemories: {}
            };
            console.log('🧠 全メモリクリア完了');
        }
        
        this.saveMemoryData();
    }

    /**
     * デバッグ用メモリ情報表示
     */
    getMemoryDebugInfo() {
        return {
            shortTermCount: this.memoryData.shortTerm.length,
            longTermCount: this.memoryData.longTerm.length,
            charactersWithMemory: Object.keys(this.memoryData.characterMemories),
            totalEvents: this.memoryData.importantEvents.length,
            memorySize: JSON.stringify(this.memoryData).length
        };
    }
}

// グローバルに登録
window.MemoryManager = MemoryManager;