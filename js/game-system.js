class GameSystem {
    constructor() {
        this.playerData = {
            level: 1,
            exp: 0,
            totalExp: 0,
            chatCount: 0,
            intimacyLevel: 0,
            intimacyName: '初対面'
        };
        
        this.missions = {
            'first-chat': {
                id: 'first-chat',
                title: '初回会話',
                description: 'キャラクターと最初の会話をしよう',
                reward: 10,
                completed: false,
                condition: () => this.playerData.chatCount >= 1
            },
            '5-messages': {
                id: '5-messages',
                title: '会話上手',
                description: '5回メッセージを送ろう',
                reward: 25,
                completed: false,
                condition: () => this.playerData.chatCount >= 5
            },
            'character-unlock': {
                id: 'character-unlock',
                title: '新たな出会い',
                description: '新キャラクターを解放しよう',
                reward: 50,
                completed: false,
                condition: () => this.playerData.level >= 3
            }
        };
        
        this.intimacyLevels = [
            { name: '初対面', threshold: 0 },
            { name: '知り合い', threshold: 20 },
            { name: '友達', threshold: 50 },
            { name: '親友', threshold: 100 },
            { name: '恋人', threshold: 200 }
        ];
        
        this.loadData();
        this.updateUI();
    }

    // データの保存
    saveData() {
        localStorage.setItem('chatGameRPG_playerData', JSON.stringify(this.playerData));
        localStorage.setItem('chatGameRPG_missions', JSON.stringify(this.missions));
    }

    // データの読み込み
    loadData() {
        const savedPlayerData = localStorage.getItem('chatGameRPG_playerData');
        const savedMissions = localStorage.getItem('chatGameRPG_missions');
        
        if (savedPlayerData) {
            this.playerData = JSON.parse(savedPlayerData);
        }
        
        if (savedMissions) {
            const loadedMissions = JSON.parse(savedMissions);
            // ミッション定義は保持しつつ、完了状態のみ復元
            Object.keys(this.missions).forEach(missionId => {
                if (loadedMissions[missionId]) {
                    this.missions[missionId].completed = loadedMissions[missionId].completed;
                }
            });
        }
    }

    // 経験値を追加
    addExp(amount, reason = '') {
        this.playerData.exp += amount;
        this.playerData.totalExp += amount;
        this.playerData.intimacyLevel += amount;
        
        console.log(`🎮 経験値獲得: +${amount} (${reason})`);
        
        // レベルアップチェック
        this.checkLevelUp();
        
        // 親密度更新
        this.updateIntimacy();
        
        // ミッションチェック
        this.checkMissions();
        
        // UI更新
        this.updateUI();
        
        // データ保存
        this.saveData();
    }

    // チャット回数を増加
    incrementChatCount() {
        this.playerData.chatCount++;
        console.log(`💬 チャット回数: ${this.playerData.chatCount}`);
        
        // 基本経験値獲得
        this.addExp(5, 'チャット');
    }

    // レベルアップチェック
    checkLevelUp() {
        const requiredExp = this.getRequiredExp(this.playerData.level);
        
        if (this.playerData.exp >= requiredExp) {
            this.playerData.level++;
            this.playerData.exp -= requiredExp;
            
            console.log(`🎉 レベルアップ！ レベル ${this.playerData.level}`);
            this.showAchievement(`🎉 レベルアップ！ レベル ${this.playerData.level}`);
            
            // キャラクター解放チェック
            if (window.characterManager) {
                window.characterManager.checkCharacterUnlock(this.playerData.level);
            }
        }
    }

    // 必要経験値計算
    getRequiredExp(level) {
        return level * 30 + 20; // レベル1で50、レベル2で80...
    }

    // 親密度更新
    updateIntimacy() {
        let newIntimacyName = this.playerData.intimacyName;
        
        for (let i = this.intimacyLevels.length - 1; i >= 0; i--) {
            if (this.playerData.intimacyLevel >= this.intimacyLevels[i].threshold) {
                newIntimacyName = this.intimacyLevels[i].name;
                break;
            }
        }
        
        if (newIntimacyName !== this.playerData.intimacyName) {
            this.playerData.intimacyName = newIntimacyName;
            console.log(`💕 親密度アップ: ${newIntimacyName}`);
            this.showAchievement(`💕 親密度が ${newIntimacyName} になりました！`);
        }
    }

    // ミッションチェック
    checkMissions() {
        Object.values(this.missions).forEach(mission => {
            if (!mission.completed && mission.condition()) {
                this.completeMission(mission.id);
            }
        });
    }

    // ミッション完了
    completeMission(missionId) {
        const mission = this.missions[missionId];
        if (mission && !mission.completed) {
            mission.completed = true;
            console.log(`📋 ミッション完了: ${mission.title}`);
            
            // 報酬獲得
            this.addExp(mission.reward, `ミッション: ${mission.title}`);
            
            // 完了通知
            this.showAchievement(`📋 ミッション完了: ${mission.title} (+${mission.reward} EXP)`);
            
            // UI更新
            this.updateMissionUI();
        }
    }

    // キャラクター解放時の処理
    onCharacterUnlock(characterId) {
        this.completeMission('character-unlock');
    }

    // 達成通知を表示
    showAchievement(message) {
        const notification = document.getElementById('achievementNotification');
        const text = document.getElementById('achievementText');
        
        if (notification && text) {
            text.textContent = message;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
    }

    // UI更新
    updateUI() {
        // プレイヤーレベル
        const levelElement = document.getElementById('playerLevel');
        if (levelElement) {
            levelElement.textContent = this.playerData.level;
        }
        
        // レベル進行度
        const levelProgress = document.getElementById('levelProgress');
        if (levelProgress) {
            const requiredExp = this.getRequiredExp(this.playerData.level);
            const progress = (this.playerData.exp / requiredExp) * 100;
            levelProgress.style.width = `${progress}%`;
        }
        
        // 総経験値
        const totalExpElement = document.getElementById('totalExp');
        if (totalExpElement) {
            totalExpElement.textContent = this.playerData.totalExp;
        }
        
        // 親密度
        const intimacyElement = document.getElementById('intimacyLevel');
        if (intimacyElement) {
            intimacyElement.textContent = this.playerData.intimacyName;
        }
        
        // 親密度進行度
        const intimacyProgress = document.getElementById('intimacyProgress');
        if (intimacyProgress) {
            const currentLevel = this.intimacyLevels.find(level => level.name === this.playerData.intimacyName);
            const nextLevel = this.intimacyLevels[this.intimacyLevels.indexOf(currentLevel) + 1];
            
            if (nextLevel) {
                const progress = ((this.playerData.intimacyLevel - currentLevel.threshold) / 
                                (nextLevel.threshold - currentLevel.threshold)) * 100;
                intimacyProgress.style.width = `${Math.min(progress, 100)}%`;
            } else {
                intimacyProgress.style.width = '100%';
            }
        }
        
        // 会話数
        const chatCountElement = document.getElementById('chatCount');
        if (chatCountElement) {
            chatCountElement.textContent = this.playerData.chatCount;
        }
        
        // ミッション更新
        this.updateMissionUI();
    }

    // ミッションUI更新
    updateMissionUI() {
        const missionList = document.getElementById('missionList');
        if (!missionList) return;
        
        missionList.innerHTML = '';
        
        Object.values(this.missions).forEach(mission => {
            const missionDiv = document.createElement('div');
            missionDiv.className = `mission-item ${mission.completed ? 'completed' : ''}`;
            missionDiv.dataset.mission = mission.id;
            
            const statusIcon = mission.completed ? '✅' : '📌';
            const rewardText = mission.completed ? '完了' : `報酬: ${mission.reward} EXP`;
            
            missionDiv.innerHTML = `
                ${statusIcon} ${mission.title}: ${mission.description} (${rewardText})
            `;
            
            missionList.appendChild(missionDiv);
        });
    }

    // プレイヤーデータ取得
    getPlayerData() {
        return this.playerData;
    }

    // データリセット（デバッグ用）
    resetData() {
        localStorage.removeItem('chatGameRPG_playerData');
        localStorage.removeItem('chatGameRPG_missions');
        location.reload();
    }
}

// グローバルインスタンス作成
window.GameSystem = GameSystem;