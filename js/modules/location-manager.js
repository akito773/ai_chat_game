/**
 * 場所管理システム
 * ゲーム内の様々な場所とその特性を管理
 */
class LocationManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.currentLocation = 'home';
        this.locations = {};
        this.locationHistory = [];
        
        console.log('📍 LocationManager 初期化');
        this.initializeLocations();
    }

    /**
     * 場所データの初期化
     */
    initializeLocations() {
        this.locations = {
            home: {
                id: 'home',
                name: '自分の部屋',
                description: 'あなたの落ち着く場所。ゆっくりと会話を楽しめます。',
                atmosphere: 'relaxed',
                backgroundImage: 'assets/backgrounds/room.jpg',
                bgm: 'calm',
                availableActions: ['chat', 'think', 'rest'],
                characterModifiers: {
                    intimacyGain: 1.0,
                    conversationDepth: 1.2
                },
                timeOfDay: ['morning', 'afternoon', 'evening', 'night'],
                unlockCondition: null // 常に利用可能
            },
            
            cafe: {
                id: 'cafe',
                name: 'カフェ「Harmony」',
                description: '温かい雰囲気のカフェ。デートにぴったりの場所です。',
                atmosphere: 'romantic',
                backgroundImage: 'assets/backgrounds/cafe.jpg',
                bgm: 'cafe',
                availableActions: ['chat', 'date', 'gift'],
                characterModifiers: {
                    intimacyGain: 1.3,
                    romanticBonus: 1.5
                },
                timeOfDay: ['morning', 'afternoon', 'evening'],
                unlockCondition: { intimacy: 5 } // 親密度5で解放（テスト用に緩和）
            },
            
            park: {
                id: 'park',
                name: '桜ヶ丘公園',
                description: '美しい桜並木のある公園。散歩やピクニックが楽しめます。',
                atmosphere: 'peaceful',
                backgroundImage: 'assets/backgrounds/park.jpg',
                bgm: 'nature',
                availableActions: ['walk', 'chat', 'photo'],
                characterModifiers: {
                    intimacyGain: 1.1,
                    peaceBonus: 1.4
                },
                timeOfDay: ['morning', 'afternoon', 'evening'],
                unlockCondition: { intimacy: 3 },
                specialEvents: ['sakura_viewing', 'sunset_confession']
            },
            
            library: {
                id: 'library',
                name: '市立図書館',
                description: '静かで落ち着いた図書館。ミサキが好む場所です。',
                atmosphere: 'intellectual',
                backgroundImage: 'assets/backgrounds/library.jpg',
                bgm: 'quiet',
                availableActions: ['study', 'chat', 'read'],
                characterModifiers: {
                    misaki: { intimacyGain: 1.8, specialBonus: 2.0 }
                },
                timeOfDay: ['morning', 'afternoon', 'evening'],
                unlockCondition: { character: 'misaki', intimacy: 30 },
                characterSpecific: ['misaki']
            },
            
            live_house: {
                id: 'live_house',
                name: 'ライブハウス「Echo」',
                description: '音楽が響く熱気あふれる場所。さくらの特別な場所です。',
                atmosphere: 'energetic',
                backgroundImage: 'assets/backgrounds/live_house.jpg',
                bgm: 'rock',
                availableActions: ['watch', 'cheer', 'perform'],
                characterModifiers: {
                    sakura: { intimacyGain: 1.8, performanceBonus: 2.0 }
                },
                timeOfDay: ['evening', 'night'],
                unlockCondition: { character: 'sakura', intimacy: 40 },
                characterSpecific: ['sakura']
            },
            
            school: {
                id: 'school',
                name: '春風高校',
                description: 'みんなが通う学校。様々な出会いがある場所です。',
                atmosphere: 'youthful',
                backgroundImage: 'assets/backgrounds/school.jpg',
                bgm: 'school',
                availableActions: ['study', 'chat', 'club_activity'],
                characterModifiers: {
                    intimacyGain: 0.9,
                    friendshipBonus: 1.3
                },
                timeOfDay: ['morning', 'afternoon'],
                unlockCondition: { progress: 'story_started' }
            }
        };

        console.log('📍 場所データ初期化完了:', Object.keys(this.locations).length + '箇所');
    }

    /**
     * 場所への移動
     */
    async moveToLocation(locationId, characterId = null) {
        try {
            const location = this.locations[locationId];
            if (!location) {
                return { success: false, error: '存在しない場所です' };
            }

            // 解放条件チェック
            if (!this.isLocationUnlocked(locationId, characterId)) {
                return { success: false, error: 'この場所はまだ利用できません' };
            }

            // 時間帯チェック
            const currentTime = this.getCurrentTimeOfDay();
            if (!location.timeOfDay.includes(currentTime)) {
                return { 
                    success: false, 
                    error: `${location.name}は${currentTime}には利用できません` 
                };
            }

            // 移動履歴に記録
            this.locationHistory.push({
                from: this.currentLocation,
                to: locationId,
                timestamp: new Date().toISOString(),
                characterId: characterId
            });

            // 現在位置を更新
            const previousLocation = this.currentLocation;
            this.currentLocation = locationId;

            // ゲームエンジンに通知
            this.gameEngine.updatePlayer({ currentLocation: locationId });

            // 場所固有のイベントをチェック
            this.checkLocationEvents(locationId, characterId);

            console.log(`📍 場所移動: ${previousLocation} → ${locationId}`);

            return {
                success: true,
                location: location,
                previousLocation: previousLocation,
                availableActions: this.getAvailableActions(locationId, characterId)
            };

        } catch (error) {
            console.error('❌ 場所移動エラー:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 場所の解放条件チェック
     */
    isLocationUnlocked(locationId, characterId = null) {
        const location = this.locations[locationId];
        if (!location.unlockCondition) return true;

        const condition = location.unlockCondition;
        const gameState = this.gameEngine.getGameState();

        // 親密度条件
        if (condition.intimacy) {
            if (!characterId) return false;
            const relationship = gameState.relationships[characterId];
            if (!relationship || relationship.intimacy < condition.intimacy) {
                return false;
            }
        }

        // キャラクター固有条件
        if (condition.character && condition.character !== characterId) {
            return false;
        }

        // ストーリー進行条件
        if (condition.progress) {
            if (!gameState.progress.storyFlags[condition.progress]) {
                return false;
            }
        }

        return true;
    }

    /**
     * 現在の場所情報を取得
     */
    getCurrentLocation() {
        return this.locations[this.currentLocation];
    }

    /**
     * 利用可能な場所一覧を取得
     */
    getAvailableLocations(characterId = null) {
        const available = [];
        
        for (const [locationId, location] of Object.entries(this.locations)) {
            if (this.isLocationUnlocked(locationId, characterId)) {
                const currentTime = this.getCurrentTimeOfDay();
                const isOpenNow = location.timeOfDay.includes(currentTime);
                
                available.push({
                    id: locationId,
                    name: location.name,
                    description: location.description,
                    isOpenNow: isOpenNow,
                    atmosphere: location.atmosphere,
                    characterSpecific: location.characterSpecific || [],
                    availableActions: this.getAvailableActions(locationId, characterId)
                });
            }
        }
        
        return available;
    }

    /**
     * 現在の時間帯を取得
     */
    getCurrentTimeOfDay() {
        const hour = new Date().getHours();
        
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    }

    /**
     * 利用可能なアクションを取得
     */
    getAvailableActions(locationId, characterId = null) {
        const location = this.locations[locationId];
        if (!location) return [];

        let actions = [...location.availableActions];

        // キャラクター固有のアクションを追加
        if (characterId && location.characterSpecific && location.characterSpecific.includes(characterId)) {
            switch (locationId) {
                case 'library':
                    if (characterId === 'misaki') actions.push('poetry_reading');
                    break;
                case 'live_house':
                    if (characterId === 'sakura') actions.push('sing_together');
                    break;
            }
        }

        return actions;
    }

    /**
     * 場所固有のイベントをチェック
     */
    checkLocationEvents(locationId, characterId) {
        const location = this.locations[locationId];
        const gameState = this.gameEngine.getGameState();
        
        // 初回訪問イベント
        const visitKey = `${locationId}_first_visit_${characterId}`;
        if (!gameState.progress.storyFlags[visitKey]) {
            this.triggerFirstVisitEvent(locationId, characterId);
            this.gameEngine.updateGameState({
                progress: {
                    ...gameState.progress,
                    storyFlags: {
                        ...gameState.progress.storyFlags,
                        [visitKey]: true
                    }
                }
            });
        }
    }

    /**
     * 初回訪問イベント
     */
    triggerFirstVisitEvent(locationId, characterId) {
        const location = this.locations[locationId];
        console.log(`🆕 初回訪問: ${characterId} at ${location.name}`);
        
        this.gameEngine.trigger('firstVisit', {
            locationId: locationId,
            locationName: location.name,
            characterId: characterId
        });
    }

    /**
     * キャラクター固有のボーナスを取得
     */
    getLocationBonus(locationId, characterId) {
        const location = this.locations[locationId];
        if (!location) return { intimacyGain: 1.0 };

        let bonus = { ...location.characterModifiers };
        
        // キャラクター固有のボーナス
        if (location.characterModifiers[characterId]) {
            bonus = { ...bonus, ...location.characterModifiers[characterId] };
        }

        return bonus;
    }
}

// グローバルに登録
window.LocationManager = LocationManager;