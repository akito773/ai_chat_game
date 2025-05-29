/**
 * チャットRPG メインゲームエンジン
 * ライトノベル半巻レベルのストーリー管理
 */
class GameEngine {
    constructor() {
        this.version = '2.0.0';
        this.initialized = false;
        this.currentScene = null;
        this.gameState = {
            player: {
                name: '',
                level: 1,
                totalExp: 0,
                currentLocation: 'home'
            },
            progress: {
                currentChapter: {},
                completedEvents: [],
                storyFlags: {}
            },
            relationships: {},
            inventory: [],
            settings: {
                textSpeed: 50,
                soundEnabled: true,
                autoSave: true
            }
        };
        
        this.modules = {};
        this.eventListeners = {};
        
        console.log('🎮 GameEngine v' + this.version + ' 初期化開始');
    }

    /**
     * ゲームエンジンの初期化
     */
    async initialize() {
        try {
            console.log('🚀 GameEngine 初期化中...');
            
            // モジュールの初期化順序（依存関係を考慮）
            await this.initializeModule('SaveManager');
            await this.initializeModule('MemoryManager'); 
            await this.initializeModule('LocationManager');
            await this.initializeModule('RelationshipManager');
            await this.initializeModule('StoryManager');
            
            // UIManagerは現在使用されていないため、コメントアウト
            // await this.initializeModule('UIManager');
            
            // データの読み込み
            await this.loadGameData();
            
            // 初期化完了
            this.initialized = true;
            this.trigger('gameInitialized');
            
            console.log('✅ GameEngine 初期化完了');
            return true;
            
        } catch (error) {
            console.error('❌ GameEngine 初期化エラー:', error);
            throw error;
        }
    }

    /**
     * モジュールの手動登録
     */
    registerModule(name, moduleInstance) {
        this.modules[name.toLowerCase()] = moduleInstance;
        console.log(`📦 ${name} モジュール登録完了`);
    }

    /**
     * モジュールの初期化
     */
    async initializeModule(moduleName) {
        try {
            if (window[moduleName]) {
                this.modules[moduleName.toLowerCase()] = new window[moduleName](this);
                console.log(`📦 ${moduleName} モジュール初期化完了`);
            } else {
                console.warn(`⚠️ ${moduleName} モジュールが見つかりません`);
            }
        } catch (error) {
            console.error(`❌ ${moduleName} モジュール初期化エラー:`, error);
            throw error;
        }
    }

    /**
     * ゲームデータの読み込み
     */
    async loadGameData() {
        try {
            // セーブデータの読み込み
            if (this.modules.savemanager) {
                const savedData = await this.modules.savemanager.loadGame();
                if (savedData) {
                    this.gameState = { ...this.gameState, ...savedData };
                    console.log('💾 セーブデータ読み込み完了');
                }
            }
            
            // キャラクターデータの読み込み
            if (window.CharacterData) {
                console.log('👥 キャラクターデータ読み込み完了');
            }
            
            // ストーリーデータの読み込み
            if (window.StoryData) {
                console.log('📚 ストーリーデータ読み込み完了');
            }
            
        } catch (error) {
            console.error('❌ ゲームデータ読み込みエラー:', error);
        }
    }

    /**
     * ゲーム状態の取得
     */
    getGameState() {
        return { ...this.gameState };
    }

    /**
     * ゲーム状態の更新
     */
    updateGameState(updates) {
        this.gameState = { ...this.gameState, ...updates };
        this.trigger('gameStateUpdated', this.gameState);
        
        // オートセーブ
        if (this.gameState.settings.autoSave && this.modules.savemanager) {
            this.modules.savemanager.autoSave(this.gameState);
        }
    }

    /**
     * プレイヤーデータの更新
     */
    updatePlayer(updates) {
        this.gameState.player = { ...this.gameState.player, ...updates };
        this.updateGameState({ player: this.gameState.player });
    }

    /**
     * ストーリー進行
     */
    async progressStory(characterId, chapterId) {
        try {
            if (this.modules.storymanager) {
                return await this.modules.storymanager.progressChapter(characterId, chapterId);
            }
        } catch (error) {
            console.error('❌ ストーリー進行エラー:', error);
        }
    }

    /**
     * 場所移動
     */
    async moveToLocation(locationId) {
        try {
            if (this.modules.locationmanager) {
                const result = await this.modules.locationmanager.moveToLocation(locationId);
                if (result.success) {
                    this.updatePlayer({ currentLocation: locationId });
                    this.trigger('locationChanged', { locationId, locationData: result.location });
                }
                return result;
            }
        } catch (error) {
            console.error('❌ 場所移動エラー:', error);
        }
    }

    /**
     * 会話の送信
     */
    async sendMessage(message, characterId) {
        try {
            // メモリマネージャに会話を記録
            if (this.modules.memorymanager) {
                this.modules.memorymanager.addConversation(message, true, characterId);
            }
            
            // 関係性の更新
            if (this.modules.relationshipmanager) {
                this.modules.relationshipmanager.updateIntimacy(characterId, message);
            }
            
            // AI応答の生成（既存のチャットシステムを利用）
            this.trigger('messageReceived', { message, characterId });
            
        } catch (error) {
            console.error('❌ メッセージ送信エラー:', error);
        }
    }

    /**
     * イベントリスナーの登録
     */
    on(eventName, callback) {
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
        }
        this.eventListeners[eventName].push(callback);
    }

    /**
     * イベントの発火
     */
    trigger(eventName, data = null) {
        if (this.eventListeners[eventName]) {
            this.eventListeners[eventName].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ イベント "${eventName}" の処理でエラー:`, error);
                }
            });
        }
    }

    /**
     * モジュールの取得
     */
    getModule(moduleName) {
        return this.modules[moduleName.toLowerCase()];
    }

    /**
     * ゲームの一時停止
     */
    pause() {
        this.trigger('gamePaused');
        console.log('⏸️ ゲーム一時停止');
    }

    /**
     * ゲームの再開
     */
    resume() {
        this.trigger('gameResumed');
        console.log('▶️ ゲーム再開');
    }

    /**
     * ゲームのリセット
     */
    async reset() {
        try {
            // セーブデータの削除
            if (this.modules.savemanager) {
                await this.modules.savemanager.clearSave();
            }
            
            // ゲーム状態の初期化
            this.gameState = {
                player: {
                    name: '',
                    level: 1,
                    totalExp: 0,
                    currentLocation: 'home'
                },
                progress: {
                    currentChapter: {},
                    completedEvents: [],
                    storyFlags: {}
                },
                relationships: {},
                inventory: [],
                settings: {
                    textSpeed: 50,
                    soundEnabled: true,
                    autoSave: true
                }
            };
            
            this.trigger('gameReset');
            console.log('🔄 ゲームリセット完了');
            
        } catch (error) {
            console.error('❌ ゲームリセットエラー:', error);
        }
    }

    /**
     * デバッグ情報の出力
     */
    debug() {
        console.log('🐛 GameEngine Debug Info:');
        console.log('- Initialized:', this.initialized);
        console.log('- Modules:', Object.keys(this.modules));
        console.log('- Game State:', this.gameState);
        console.log('- Event Listeners:', Object.keys(this.eventListeners));
    }
}

// グローバルに登録
window.GameEngine = GameEngine;