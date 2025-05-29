/**
 * ストーリーコンテキスト管理
 * ストーリー進行状況をチャットシステムに提供
 */
class StoryContextManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.storyManager = null;
        this.memoryManager = null;
        
        console.log('📖 StoryContextManager 初期化');
    }

    /**
     * 初期化
     */
    initialize() {
        this.storyManager = this.gameEngine.modules.storymanager;
        this.memoryManager = this.gameEngine.modules.memorymanager;
        
        if (!this.storyManager || !this.memoryManager) {
            console.warn('⚠️ StoryManager または MemoryManager が見つかりません');
            return false;
        }
        
        console.log('✅ StoryContextManager 初期化完了');
        return true;
    }

    /**
     * キャラクターのストーリーコンテキストを取得
     */
    getStoryContext(characterId) {
        if (!this.storyManager) {
            this.initialize();
        }

        const context = {
            character: characterId,
            currentProgress: this.getCurrentProgress(characterId),
            completedEvents: this.getCompletedEvents(characterId),
            availableTopics: this.getAvailableTopics(characterId),
            recentStoryEvents: this.getRecentStoryEvents(characterId),
            relationshipStatus: this.getRelationshipStatus(characterId)
        };

        return context;
    }

    /**
     * 現在の進行状況を取得
     */
    getCurrentProgress(characterId) {
        const storyFlags = this.storyManager.getStoryFlags(characterId);
        const availableChapters = this.storyManager.getAvailableChapters(characterId);
        const completedChapters = availableChapters.filter(ch => ch.completed);

        return {
            totalChapters: window.StoryData[characterId]?.totalChapters || 0,
            availableChapters: availableChapters.length,
            completedChapters: completedChapters.length,
            latestChapter: Math.max(...availableChapters.map(ch => ch.id), 0),
            storyFlags: storyFlags
        };
    }

    /**
     * 完了したイベントを取得
     */
    getCompletedEvents(characterId) {
        const storyFlags = this.storyManager.getStoryFlags(characterId);
        const events = [];

        // 各チャプターの完了イベントをチェック
        const storyData = window.StoryData[characterId];
        if (!storyData) return events;

        for (let chapterId = 1; chapterId <= storyData.totalChapters; chapterId++) {
            if (storyFlags[`chapter_${chapterId}_completed`]) {
                const chapter = storyData.chapters[chapterId];
                if (chapter) {
                    events.push({
                        type: 'chapter_completed',
                        chapterId: chapterId,
                        title: chapter.title,
                        description: chapter.description,
                        timestamp: storyFlags[`chapter_${chapterId}_completed_time`] || new Date()
                    });
                }
            }
        }

        // 重要な選択肢フラグもイベントとして追加
        const importantFlags = this.getImportantFlags(characterId, storyFlags);
        events.push(...importantFlags);

        return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * 重要なフラグをイベント化
     */
    getImportantFlags(characterId, storyFlags) {
        const events = [];
        const flagEvents = {
            'praised_singing': { type: 'compliment', description: '歌声を褒めた' },
            'supported_dream': { type: 'support', description: '夢を応援した' },
            'offered_help': { type: 'support', description: '手助けを申し出た' },
            'promised_protection': { type: 'protection', description: '守ることを約束した' },
            'became_friends': { type: 'relationship', description: '友達になった' },
            'showed_empathy': { type: 'emotional', description: '共感を示した' },
            'encouraged_strongly': { type: 'encouragement', description: '強く励ました' }
        };

        for (const [flag, eventInfo] of Object.entries(flagEvents)) {
            if (storyFlags[flag]) {
                events.push({
                    type: eventInfo.type,
                    flag: flag,
                    description: eventInfo.description,
                    timestamp: storyFlags[`${flag}_time`] || new Date()
                });
            }
        }

        return events;
    }

    /**
     * 利用可能な話題を取得
     */
    getAvailableTopics(characterId) {
        const topics = [];
        const storyFlags = this.storyManager.getStoryFlags(characterId);
        const progress = this.getCurrentProgress(characterId);

        // キャラクター別の基本話題
        const characterTopics = {
            sakura: ['音楽', '歌', 'アイドル', '夢', '母親', '家族'],
            misaki: ['本', '読書', '文学', '古典', '図書館', '静寂'],
            akira: ['スポーツ', '運動', '練習', '努力', '強さ', '競技'],
            yuki: ['芸術', '文化', '上品', '美しさ', 'お嬢様', '家族']
        };

        // 基本話題を追加
        if (characterTopics[characterId]) {
            topics.push(...characterTopics[characterId].map(topic => ({
                topic: topic,
                category: 'basic',
                available: true
            })));
        }

        // ストーリー進行に基づく話題
        if (progress.latestChapter >= 2) {
            topics.push({
                topic: characterId === 'sakura' ? '家族の話' : '過去の話',
                category: 'personal',
                available: true,
                chapterRequired: 2
            });
        }

        if (progress.latestChapter >= 3) {
            topics.push({
                topic: characterId === 'sakura' ? '挫折の話' : '辛い体験',
                category: 'emotional',
                available: true,
                chapterRequired: 3
            });
        }

        if (storyFlags['became_friends']) {
            topics.push({
                topic: '友達としての関係',
                category: 'relationship',
                available: true,
                flagRequired: 'became_friends'
            });
        }

        return topics;
    }

    /**
     * 最近のストーリーイベントを取得
     */
    getRecentStoryEvents(characterId) {
        const completedEvents = this.getCompletedEvents(characterId);
        const recentLimit = 3; // 最新3件

        return completedEvents.slice(0, recentLimit);
    }

    /**
     * 関係性状況を取得
     */
    getRelationshipStatus(characterId) {
        const relationshipManager = this.gameEngine.modules.relationshipmanager;
        if (!relationshipManager) return null;

        const relationship = relationshipManager.getRelationship(characterId);
        if (!relationship) return null;

        return {
            intimacy: relationship.intimacy,
            intimacyName: relationship.intimacyName,
            totalInteractions: relationship.totalInteractions,
            lastInteraction: relationship.lastInteraction
        };
    }

    /**
     * チャット用のコンテキスト文字列を生成
     */
    generateChatContext(characterId) {
        const context = this.getStoryContext(characterId);
        let contextString = '';

        // 基本情報
        contextString += `キャラクター: ${characterId}\n`;
        contextString += `関係性: ${context.relationshipStatus?.intimacyName || '初対面'}\n`;
        contextString += `親密度: ${context.relationshipStatus?.intimacy || 0}\n`;

        // ストーリー進行状況
        contextString += `ストーリー進行: ${context.currentProgress.completedChapters}/${context.currentProgress.totalChapters}章完了\n`;

        // 最近のイベント
        if (context.recentStoryEvents.length > 0) {
            contextString += `最近の出来事:\n`;
            context.recentStoryEvents.forEach(event => {
                contextString += `- ${event.description}\n`;
            });
        }

        // 利用可能な話題
        const availableTopics = context.availableTopics.filter(t => t.available).map(t => t.topic);
        if (availableTopics.length > 0) {
            contextString += `話題: ${availableTopics.join(', ')}\n`;
        }

        return contextString;
    }

    /**
     * ストーリーイベントを記録
     */
    recordStoryEvent(characterId, eventType, eventData) {
        if (!this.memoryManager) return;

        const eventDescription = this.formatEventDescription(eventType, eventData);
        
        this.memoryManager.recordImportantEvent(
            eventType,
            eventDescription,
            characterId,
            {
                ...eventData,
                timestamp: new Date().toISOString(),
                source: 'story'
            }
        );

        console.log(`📖 ストーリーイベント記録: ${characterId} - ${eventDescription}`);
    }

    /**
     * イベント説明をフォーマット
     */
    formatEventDescription(eventType, eventData) {
        const formats = {
            'chapter_completed': `第${eventData.chapterId}章「${eventData.title}」を完了`,
            'choice_made': `選択「${eventData.choiceText}」を選んだ`,
            'intimacy_changed': `親密度が${eventData.change > 0 ? '上昇' : '下降'}（${eventData.change}）`,
            'flag_set': `フラグ「${eventData.flag}」が設定された`,
            'ending_achieved': `エンディング「${eventData.ending}」に到達`
        };

        return formats[eventType] || `${eventType}イベントが発生`;
    }

    /**
     * デバッグ情報を表示
     */
    debugContext(characterId) {
        const context = this.getStoryContext(characterId);
        console.log(`📖 ${characterId} ストーリーコンテキスト:`, context);
        console.log(`📝 チャット用コンテキスト:\n${this.generateChatContext(characterId)}`);
        return context;
    }
}

// グローバルに公開
window.StoryContextManager = StoryContextManager;
console.log('📖 StoryContextManager クラス定義完了');