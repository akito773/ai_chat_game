/**
 * ストーリーシステム管理
 * ライトノベル級のストーリー進行を管理
 */
class StoryManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.currentStory = null;
        this.currentChapter = 1;
        this.storyFlags = {};
        this.autoSaveEnabled = true;
        
        console.log('📚 StoryManager 初期化');
    }

    /**
     * キャラクターのストーリーを開始
     */
    startStory(characterId) {
        if (!window.StoryData[characterId]) {
            console.error(`❌ ${characterId}のストーリーデータが見つかりません`);
            return null;
        }

        this.currentStory = {
            characterId: characterId,
            storyData: window.StoryData[characterId],
            currentChapter: 1,
            completedChapters: [],
            flags: {}
        };

        console.log(`📖 ${characterId}のストーリー開始`);
        return this.currentStory;
    }

    /**
     * 指定チャプターが解放されているかチェック
     */
    isChapterUnlocked(characterId, chapterId) {
        const storyData = window.StoryData[characterId];
        if (!storyData) return false;

        const chapter = storyData.chapters[chapterId];
        if (!chapter) return false;

        const condition = chapter.unlockCondition;
        if (!condition) return true;

        // 親密度条件をチェック
        if (condition.intimacy !== undefined) {
            const relationship = this.gameEngine.modules.relationshipmanager?.getRelationship(characterId);
            const currentIntimacy = relationship?.intimacy || 0;
            
            if (currentIntimacy < condition.intimacy) {
                console.log(`🔒 Chapter ${chapterId} 未解放: 親密度 ${currentIntimacy}/${condition.intimacy}`);
                return false;
            }
        }

        // フラグ条件をチェック
        if (condition.flags) {
            const currentFlags = this.getStoryFlags(characterId);
            for (const requiredFlag of condition.flags) {
                if (!currentFlags[requiredFlag]) {
                    console.log(`🔒 Chapter ${chapterId} 未解放: フラグ ${requiredFlag} 未達成`);
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * チャプターを取得
     */
    getChapter(characterId, chapterId) {
        const storyData = window.StoryData[characterId];
        if (!storyData) return null;

        const chapter = storyData.chapters[chapterId];
        if (!chapter) return null;

        // 解放チェック
        if (!this.isChapterUnlocked(characterId, chapterId)) {
            return null;
        }

        return chapter;
    }

    /**
     * 利用可能なチャプター一覧を取得
     */
    getAvailableChapters(characterId) {
        const storyData = window.StoryData[characterId];
        if (!storyData) return [];

        const availableChapters = [];
        
        for (let chapterId = 1; chapterId <= storyData.totalChapters; chapterId++) {
            if (this.isChapterUnlocked(characterId, chapterId)) {
                const chapter = storyData.chapters[chapterId];
                if (chapter) {
                    availableChapters.push({
                        id: chapterId,
                        title: chapter.title,
                        description: chapter.description,
                        completed: this.isChapterCompleted(characterId, chapterId)
                    });
                }
            }
        }

        return availableChapters;
    }

    /**
     * 選択肢を処理
     */
    processChoice(characterId, chapterId, choiceId) {
        const chapter = this.getChapter(characterId, chapterId);
        if (!chapter) return null;

        // 選択肢を検索
        let choice = null;
        
        // 通常の選択肢をチェック
        if (chapter.content.choices) {
            choice = chapter.content.choices.find(c => c.id === choiceId);
        }
        
        // 最終選択肢をチェック
        if (!choice && chapter.content.final_choice) {
            choice = chapter.content.final_choice.find(c => c.id === choiceId);
        }

        if (!choice) {
            console.error(`❌ 選択肢 ${choiceId} が見つかりません`);
            return null;
        }

        // 選択肢の条件をチェック
        if (choice.condition) {
            if (!this.checkChoiceCondition(characterId, choice.condition)) {
                console.log(`🔒 選択肢 ${choiceId} 条件未満足`);
                return null;
            }
        }

        // 効果を適用
        if (choice.effect) {
            this.applyChoiceEffect(characterId, choice.effect);
        }

        return {
            choice: choice,
            response: choice.response,
            nextScene: choice.nextScene,
            ending: choice.ending
        };
    }

    /**
     * 選択肢の条件をチェック
     */
    checkChoiceCondition(characterId, condition) {
        if (condition.intimacy !== undefined) {
            const relationship = this.gameEngine.modules.relationshipmanager?.getRelationship(characterId);
            const currentIntimacy = relationship?.intimacy || 0;
            
            if (currentIntimacy < condition.intimacy) {
                return false;
            }
        }

        if (condition.flags) {
            const currentFlags = this.getStoryFlags(characterId);
            for (const requiredFlag of condition.flags) {
                if (!currentFlags[requiredFlag]) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * 選択肢の効果を適用
     */
    applyChoiceEffect(characterId, effect) {
        // 親密度変更
        if (effect.intimacy) {
            const relationshipManager = this.gameEngine.modules.relationshipmanager;
            if (relationshipManager) {
                relationshipManager.modifyRelationship(characterId, effect.intimacy);
                console.log(`💕 ${characterId} 親密度 ${effect.intimacy > 0 ? '+' : ''}${effect.intimacy}`);
            }
        }

        // フラグ設定
        if (effect.flag) {
            this.setStoryFlag(characterId, effect.flag, true);
            console.log(`🚩 フラグ設定: ${effect.flag}`);
        }

        // エンディング設定
        if (effect.ending) {
            this.setStoryFlag(characterId, `ending_${effect.ending}`, true);
            console.log(`🎭 エンディング設定: ${effect.ending}`);
        }

        // 自動セーブ
        if (this.autoSaveEnabled) {
            this.gameEngine.modules.savemanager?.saveGame(0); // スロット0に自動保存
        }
    }

    /**
     * ストーリーフラグを取得
     */
    getStoryFlags(characterId) {
        return this.storyFlags[characterId] || {};
    }

    /**
     * ストーリーフラグを設定
     */
    setStoryFlag(characterId, flagName, value) {
        if (!this.storyFlags[characterId]) {
            this.storyFlags[characterId] = {};
        }
        this.storyFlags[characterId][flagName] = value;
    }

    /**
     * チャプター完了状態をチェック
     */
    isChapterCompleted(characterId, chapterId) {
        const flags = this.getStoryFlags(characterId);
        return flags[`chapter_${chapterId}_completed`] || false;
    }

    /**
     * チャプターを完了マーク
     */
    markChapterCompleted(characterId, chapterId) {
        this.setStoryFlag(characterId, `chapter_${chapterId}_completed`, true);
        console.log(`✅ Chapter ${chapterId} 完了`);
    }

    /**
     * 利用可能なエンディング一覧を取得
     */
    getAvailableEndings(characterId) {
        const storyData = window.StoryData[characterId];
        if (!storyData || !storyData.endings) return [];

        const availableEndings = [];
        const relationship = this.gameEngine.modules.relationshipmanager?.getRelationship(characterId);
        const currentIntimacy = relationship?.intimacy || 0;
        const currentFlags = this.getStoryFlags(characterId);

        for (const [endingId, ending] of Object.entries(storyData.endings)) {
            const condition = ending.unlockCondition;
            let canUnlock = true;

            // 親密度条件チェック
            if (condition.intimacy && currentIntimacy < condition.intimacy) {
                canUnlock = false;
            }

            // チャプター条件チェック
            if (condition.chapter && !this.isChapterCompleted(characterId, condition.chapter)) {
                canUnlock = false;
            }

            // フラグ条件チェック
            if (condition.flags) {
                for (const requiredFlag of condition.flags) {
                    if (!currentFlags[requiredFlag]) {
                        canUnlock = false;
                        break;
                    }
                }
            }

            if (canUnlock) {
                availableEndings.push({
                    id: endingId,
                    title: ending.title,
                    description: ending.description,
                    achieved: currentFlags[`ending_${endingId}`] || false
                });
            }
        }

        return availableEndings;
    }

    /**
     * セーブデータからストーリー状態を復元
     */
    loadStoryState(saveData) {
        if (saveData.storyFlags) {
            this.storyFlags = saveData.storyFlags;
        }
        if (saveData.currentStory) {
            this.currentStory = saveData.currentStory;
        }
        console.log('📚 ストーリー状態復元完了');
    }

    /**
     * ストーリー状態をセーブデータに保存
     */
    getStoryState() {
        return {
            storyFlags: this.storyFlags,
            currentStory: this.currentStory
        };
    }

    /**
     * デバッグ情報を表示
     */
    debugInfo(characterId) {
        const storyData = window.StoryData[characterId];
        const flags = this.getStoryFlags(characterId);
        const relationship = this.gameEngine.modules.relationshipmanager?.getRelationship(characterId);
        
        console.log(`📚 ${characterId} ストーリー状況:`);
        console.log('・親密度:', relationship?.intimacy || 0);
        console.log('・フラグ:', flags);
        console.log('・利用可能チャプター:', this.getAvailableChapters(characterId));
        console.log('・利用可能エンディング:', this.getAvailableEndings(characterId));
    }
}

// グローバルに公開
window.StoryManager = StoryManager;
console.log('📚 StoryManager クラス定義完了');