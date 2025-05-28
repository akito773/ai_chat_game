/**
 * 関係性管理システム
 * キャラクター別の親密度とストーリー進行を管理
 */
class RelationshipManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.relationships = {};
        this.intimacyLevels = [
            { name: '初対面', threshold: 0, description: 'まだお互いをよく知らない関係' },
            { name: '知り合い', threshold: 20, description: '挨拶を交わす程度の関係' },
            { name: '友達', threshold: 50, description: '普通に会話できる関係' },
            { name: '親友', threshold: 100, description: '深い話もできる関係' },
            { name: '恋人候補', threshold: 150, description: '恋愛感情が芽生え始めた関係' },
            { name: '恋人', threshold: 200, description: '愛し合う関係' },
            { name: '運命の人', threshold: 300, description: 'かけがえのない存在' }
        ];
        
        console.log('💕 RelationshipManager 初期化');
        this.loadRelationships();
    }

    /**
     * 関係性データの読み込み
     */
    loadRelationships() {
        const gameState = this.gameEngine.getGameState();
        this.relationships = gameState.relationships || {};
    }

    /**
     * キャラクターとの関係性を初期化
     */
    initializeRelationship(characterId) {
        if (!this.relationships[characterId]) {
            this.relationships[characterId] = {
                intimacy: 0,
                intimacyName: '初対面',
                lastInteraction: null,
                totalInteractions: 0,
                storyProgress: {
                    currentChapter: 1,
                    completedChapters: [],
                    availableChapters: [1],
                    eventFlags: {}
                },
                personalData: {
                    rememberedName: null,
                    rememberedInfo: {},
                    sharedSecrets: [],
                    commonInterests: []
                },
                statistics: {
                    totalConversations: 0,
                    totalTime: 0,
                    favoriteLocations: {},
                    emotionalMoments: []
                }
            };
            
            this.saveRelationships();
            console.log(`💕 ${characterId}との関係性を初期化`);
        }
    }

    /**
     * 親密度を更新
     */
    updateIntimacy(characterId, amount, reason = '') {
        this.initializeRelationship(characterId);
        
        const relationship = this.relationships[characterId];
        const oldIntimacy = relationship.intimacy;
        const oldLevel = this.getIntimacyLevel(oldIntimacy);
        
        // 親密度を加算
        relationship.intimacy = Math.max(0, relationship.intimacy + amount);
        
        // 新しいレベルを取得
        const newLevel = this.getIntimacyLevel(relationship.intimacy);
        relationship.intimacyName = newLevel.name;
        relationship.lastInteraction = new Date().toISOString();
        relationship.totalInteractions++;
        
        // レベルアップ判定
        if (newLevel.threshold > oldLevel.threshold) {
            this.triggerIntimacyLevelUp(characterId, oldLevel, newLevel);
        }
        
        this.saveRelationships();
        console.log(`💕 ${characterId}の親密度更新: ${oldIntimacy} → ${relationship.intimacy} (${reason})`);
        
        return {
            oldIntimacy: oldIntimacy,
            newIntimacy: relationship.intimacy,
            oldLevel: oldLevel,
            newLevel: newLevel,
            levelUp: newLevel.threshold > oldLevel.threshold
        };
    }

    /**
     * 会話による親密度更新
     */
    updateIntimacyFromConversation(characterId, message) {
        let intimacyGain = 2; // 基本値

        // メッセージの内容に基づく親密度計算
        intimacyGain += this.calculateMessageIntimacyBonus(message, characterId);

        // 親密度を更新
        return this.updateIntimacy(characterId, Math.round(intimacyGain), '会話');
    }

    /**
     * メッセージ内容に基づく親密度ボーナス計算
     */
    calculateMessageIntimacyBonus(message, characterId) {
        let bonus = 0;

        // 長いメッセージは親密度ボーナス
        if (message.length > 50) bonus += 1;
        if (message.length > 100) bonus += 1;

        // 感情的なキーワード
        const emotionalKeywords = {
            positive: ['好き', '愛してる', '大切', '嬉しい', '楽しい', '幸せ', 'ありがとう'],
            intimate: ['君', 'あなた', '一緒', '二人', '特別', '秘密', '本当'],
            caring: ['心配', '大丈夫', '守る', '助ける', '支える', '信じる']
        };

        for (const [category, keywords] of Object.entries(emotionalKeywords)) {
            for (const keyword of keywords) {
                if (message.includes(keyword)) {
                    bonus += category === 'positive' ? 2 : category === 'intimate' ? 3 : 1;
                }
            }
        }

        // キャラクター固有のキーワード反応
        bonus += this.getCharacterSpecificBonus(message, characterId);

        return Math.min(bonus, 8); // 最大ボーナス値を制限
    }

    /**
     * キャラクター固有のボーナス計算
     */
    getCharacterSpecificBonus(message, characterId) {
        const characterKeywords = {
            sakura: ['歌', 'アイドル', '夢', '音楽', 'ライブ', '頑張る'],
            misaki: ['本', '読書', '図書館', '静か', '文学', '詩'],
            akira: ['運動', 'スポーツ', '練習', '強い', '負けない', '努力'],
            yuki: ['上品', '美しい', '芸術', '文化', 'お嬢様', '優雅']
        };

        const keywords = characterKeywords[characterId] || [];
        let bonus = 0;

        for (const keyword of keywords) {
            if (message.includes(keyword)) {
                bonus += 2;
            }
        }

        return Math.min(bonus, 6);
    }

    /**
     * 親密度レベルを取得
     */
    getIntimacyLevel(intimacy) {
        for (let i = this.intimacyLevels.length - 1; i >= 0; i--) {
            if (intimacy >= this.intimacyLevels[i].threshold) {
                return this.intimacyLevels[i];
            }
        }
        return this.intimacyLevels[0];
    }

    /**
     * 親密度レベルアップイベント
     */
    triggerIntimacyLevelUp(characterId, oldLevel, newLevel) {
        console.log(`💕 ${characterId}との関係がレベルアップ: ${oldLevel.name} → ${newLevel.name}`);
        
        // ゲームエンジンにイベントを通知
        this.gameEngine.trigger('intimacyLevelUp', {
            characterId: characterId,
            oldLevel: oldLevel,
            newLevel: newLevel
        });

        // メモリマネージャーに重要イベントとして記録
        if (this.gameEngine.modules.memorymanager) {
            this.gameEngine.modules.memorymanager.recordImportantEvent(
                'intimacy_level_up',
                `${characterId}との関係が${newLevel.name}になりました`,
                characterId,
                { oldLevel: oldLevel.name, newLevel: newLevel.name }
            );
        }

        // 新しいストーリーチャプターの解放チェック
        this.checkChapterUnlock(characterId, newLevel.threshold);
    }

    /**
     * ストーリーチャプターの解放チェック
     */
    checkChapterUnlock(characterId, intimacyThreshold) {
        const relationship = this.relationships[characterId];
        const storyProgress = relationship.storyProgress;
        
        // 親密度に応じてチャプターを解放
        const chapterThresholds = {
            1: 0,    // 初回
            2: 25,   // 知り合い
            3: 50,   // 友達
            4: 100,  // 親友
            5: 150,  // 恋人候補
            6: 200   // 恋人
        };

        for (const [chapter, threshold] of Object.entries(chapterThresholds)) {
            const chapterNum = parseInt(chapter);
            if (intimacyThreshold >= threshold && !storyProgress.availableChapters.includes(chapterNum)) {
                storyProgress.availableChapters.push(chapterNum);
                console.log(`📚 ${characterId}の Chapter ${chapterNum} が解放されました`);
                
                this.gameEngine.trigger('chapterUnlocked', {
                    characterId: characterId,
                    chapter: chapterNum
                });
            }
        }
    }

    /**
     * 関係性データを取得
     */
    getRelationship(characterId) {
        return this.relationships[characterId] || null;
    }

    /**
     * 全キャラクターの関係性を取得
     */
    getAllRelationships() {
        return { ...this.relationships };
    }

    /**
     * 個人情報を記録
     */
    recordPersonalInfo(characterId, key, value) {
        this.initializeRelationship(characterId);
        const relationship = this.relationships[characterId];
        
        relationship.personalData.rememberedInfo[key] = {
            value: value,
            timestamp: new Date().toISOString()
        };
        
        this.saveRelationships();
        console.log(`💕 ${characterId}の個人情報を記録: ${key} = ${value}`);
    }

    /**
     * イベントフラグを設定
     */
    setEventFlag(characterId, flagName, value) {
        this.initializeRelationship(characterId);
        const relationship = this.relationships[characterId];
        
        relationship.storyProgress.eventFlags[flagName] = {
            value: value,
            timestamp: new Date().toISOString()
        };
        
        this.saveRelationships();
        console.log(`🏳️ ${characterId}のイベントフラグ設定: ${flagName} = ${value}`);
    }

    /**
     * エンディング条件をチェック
     */
    checkEndingConditions(characterId) {
        const relationship = this.relationships[characterId];
        if (!relationship) return null;
        
        const intimacy = relationship.intimacy;
        const completedChapters = relationship.storyProgress.completedChapters;
        const eventFlags = relationship.storyProgress.eventFlags;
        
        // エンディング条件の定義
        const endingConditions = {
            'good_ending': {
                intimacy: 200,
                requiredChapters: [1, 2, 3, 4, 5, 6],
                requiredFlags: ['confession_accepted']
            },
            'true_ending': {
                intimacy: 300,
                requiredChapters: [1, 2, 3, 4, 5, 6],
                requiredFlags: ['confession_accepted', 'deep_secret_shared']
            },
            'friend_ending': {
                intimacy: 150,
                requiredChapters: [1, 2, 3, 4],
                requiredFlags: ['friendship_confirmed']
            }
        };
        
        const availableEndings = [];
        
        for (const [endingType, conditions] of Object.entries(endingConditions)) {
            let canAchieve = true;
            
            // 親密度チェック
            if (intimacy < conditions.intimacy) canAchieve = false;
            
            // チャプターチェック
            for (const requiredChapter of conditions.requiredChapters) {
                if (!completedChapters.includes(requiredChapter)) {
                    canAchieve = false;
                    break;
                }
            }
            
            // フラグチェック
            for (const requiredFlag of conditions.requiredFlags) {
                if (!eventFlags[requiredFlag] || !eventFlags[requiredFlag].value) {
                    canAchieve = false;
                    break;
                }
            }
            
            if (canAchieve) {
                availableEndings.push(endingType);
            }
        }
        
        return availableEndings;
    }

    /**
     * 関係性データの保存
     */
    saveRelationships() {
        this.gameEngine.updateGameState({ relationships: this.relationships });
    }

    /**
     * 関係性データのリセット
     */
    resetRelationship(characterId) {
        delete this.relationships[characterId];
        this.saveRelationships();
        console.log(`🔄 ${characterId}の関係性をリセットしました`);
    }

    /**
     * デバッグ用情報表示
     */
    debugRelationshipInfo(characterId = null) {
        if (characterId) {
            const relationship = this.relationships[characterId];
            console.log(`💕 ${characterId} 関係性情報:`);
            console.log('- 親密度:', relationship?.intimacy || 0);
            console.log('- レベル:', relationship?.intimacyName || '未初期化');
            console.log('- 会話回数:', relationship?.totalInteractions || 0);
        } else {
            console.log('💕 全関係性情報:');
            console.log('- 登録キャラ数:', Object.keys(this.relationships).length);
            for (const [charId, rel] of Object.entries(this.relationships)) {
                console.log(`  ${charId}: ${rel.intimacy} (${rel.intimacyName})`);
            }
        }
    }
}

// グローバルに登録
window.RelationshipManager = RelationshipManager;