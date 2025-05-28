/**
 * セーブ/ロード管理システム
 * ゲームの進行状況を管理
 */
class SaveManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.saveKey = 'chatRPG_saveData';
        this.autoSaveKey = 'chatRPG_autoSave';
        this.settingsKey = 'chatRPG_settings';
        this.maxSaveSlots = 10;
        
        console.log('💾 SaveManager 初期化');
    }

    /**
     * ゲームデータの保存
     */
    async saveGame(slotId = 'auto', gameState = null) {
        try {
            const saveData = {
                version: this.gameEngine.version,
                timestamp: new Date().toISOString(),
                slotId: slotId,
                gameState: gameState || this.gameEngine.getGameState()
            };

            const saveKey = slotId === 'auto' ? this.autoSaveKey : `${this.saveKey}_${slotId}`;
            localStorage.setItem(saveKey, JSON.stringify(saveData));
            
            console.log(`💾 セーブ完了 (スロット: ${slotId})`);
            return { success: true, slotId, timestamp: saveData.timestamp };
            
        } catch (error) {
            console.error('❌ セーブエラー:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * ゲームデータの読み込み
     */
    async loadGame(slotId = 'auto') {
        try {
            const saveKey = slotId === 'auto' ? this.autoSaveKey : `${this.saveKey}_${slotId}`;
            const savedData = localStorage.getItem(saveKey);
            
            if (!savedData) {
                console.log(`💾 セーブデータが見つかりません (スロット: ${slotId})`);
                return null;
            }

            const saveData = JSON.parse(savedData);
            
            // バージョン互換性チェック
            if (saveData.version !== this.gameEngine.version) {
                console.warn(`⚠️ セーブデータのバージョンが異なります (${saveData.version} → ${this.gameEngine.version})`);
                // 必要に応じてマイグレーション処理を行う
            }

            console.log(`💾 ロード完了 (スロット: ${slotId}, 日時: ${saveData.timestamp})`);
            return saveData.gameState;
            
        } catch (error) {
            console.error('❌ ロードエラー:', error);
            return null;
        }
    }

    /**
     * オートセーブ
     */
    async autoSave(gameState) {
        // 頻繁な呼び出しを制限
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        
        this.autoSaveTimeout = setTimeout(async () => {
            await this.saveGame('auto', gameState);
        }, 1000); // 1秒後に実行
    }

    /**
     * セーブスロット一覧の取得
     */
    getSaveSlots() {
        const slots = [];
        
        // オートセーブ
        const autoSave = this.loadGame('auto');
        if (autoSave) {
            slots.push({
                id: 'auto',
                name: 'オートセーブ',
                data: autoSave
            });
        }
        
        // 手動セーブスロット
        for (let i = 1; i <= this.maxSaveSlots; i++) {
            try {
                const saveData = localStorage.getItem(`${this.saveKey}_${i}`);
                if (saveData) {
                    const parsed = JSON.parse(saveData);
                    slots.push({
                        id: i,
                        name: `セーブ ${i}`,
                        timestamp: parsed.timestamp,
                        data: parsed
                    });
                } else {
                    slots.push({
                        id: i,
                        name: `セーブ ${i}`,
                        empty: true
                    });
                }
            } catch (error) {
                console.error(`❌ セーブスロット ${i} 読み込みエラー:`, error);
            }
        }
        
        return slots;
    }

    /**
     * セーブデータの削除
     */
    async deleteSave(slotId) {
        try {
            const saveKey = slotId === 'auto' ? this.autoSaveKey : `${this.saveKey}_${slotId}`;
            localStorage.removeItem(saveKey);
            
            console.log(`🗑️ セーブデータ削除完了 (スロット: ${slotId})`);
            return { success: true };
            
        } catch (error) {
            console.error('❌ セーブデータ削除エラー:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 全セーブデータの削除
     */
    async clearSave() {
        try {
            // オートセーブ削除
            localStorage.removeItem(this.autoSaveKey);
            
            // 手動セーブ削除
            for (let i = 1; i <= this.maxSaveSlots; i++) {
                localStorage.removeItem(`${this.saveKey}_${i}`);
            }
            
            console.log('🗑️ 全セーブデータ削除完了');
            return { success: true };
            
        } catch (error) {
            console.error('❌ 全セーブデータ削除エラー:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 設定の保存
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            console.log('⚙️ 設定保存完了');
            return { success: true };
        } catch (error) {
            console.error('❌ 設定保存エラー:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 設定の読み込み
     */
    loadSettings() {
        try {
            const settings = localStorage.getItem(this.settingsKey);
            if (settings) {
                console.log('⚙️ 設定読み込み完了');
                return JSON.parse(settings);
            }
            return null;
        } catch (error) {
            console.error('❌ 設定読み込みエラー:', error);
            return null;
        }
    }

    /**
     * ストレージ使用量の確認
     */
    getStorageInfo() {
        try {
            let totalSize = 0;
            const info = {};
            
            // 各キーのサイズを計算
            for (let key in localStorage) {
                if (key.startsWith('chatRPG_')) {
                    const size = localStorage[key].length;
                    totalSize += size;
                    info[key] = {
                        size: size,
                        sizeKB: Math.round(size / 1024 * 100) / 100
                    };
                }
            }
            
            return {
                totalSize: totalSize,
                totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
                details: info
            };
            
        } catch (error) {
            console.error('❌ ストレージ情報取得エラー:', error);
            return null;
        }
    }

    /**
     * エクスポート機能（将来の機能拡張用）
     */
    async exportSave(slotId) {
        try {
            const saveData = await this.loadGame(slotId);
            if (saveData) {
                const exportData = {
                    version: this.gameEngine.version,
                    exportDate: new Date().toISOString(),
                    gameData: saveData
                };
                
                return JSON.stringify(exportData, null, 2);
            }
            return null;
        } catch (error) {
            console.error('❌ エクスポートエラー:', error);
            return null;
        }
    }

    /**
     * インポート機能（将来の機能拡張用）
     */
    async importSave(importData, slotId) {
        try {
            const data = JSON.parse(importData);
            
            // バージョンチェック
            if (data.version !== this.gameEngine.version) {
                console.warn('⚠️ インポートデータのバージョンが異なります');
            }
            
            return await this.saveGame(slotId, data.gameData);
            
        } catch (error) {
            console.error('❌ インポートエラー:', error);
            return { success: false, error: error.message };
        }
    }
}

// グローバルに登録
window.SaveManager = SaveManager;