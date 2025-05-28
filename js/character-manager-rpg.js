class CharacterManagerRPG {
    constructor() {
        this.characters = {};
        this.currentCharacter = null;
        this.unlockedCharacters = ['sakura']; // 最初はさくらのみ解放
        this.loadCharacters();
    }

    // キャラクターデータを読み込み（新キャラクター追加）
    async loadCharacters() {
        try {
            const response = await fetch('characters/characters.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const baseCharacters = await response.json();
            
            // 新キャラクター「ミサキ」を追加
            this.characters = {
                ...baseCharacters,
                misaki: {
                    id: 'misaki',
                    name: 'ミサキ',
                    emoji: '🌸',
                    description: '謎めいた美少女、古典文学が好き',
                    personality: '落ち着いていて知的。古典文学や歴史に詳しく、時々古風な言葉遣いをする。内気だが心を開いた相手には優しい。',
                    greeting: 'はじめまして...私はミサキと申します。\\n古い本の香りが好きで、図書館でよく過ごしています。\\nあなたとお話できて光栄です。',
                    color: '#9966cc',
                    image: 'assets/images/misaki.png',
                    unlockCondition: 'レベル3達成',
                    unlockLevel: 3
                }
            };
            
            console.log('キャラクターデータ読み込み完了（RPG版）:', this.characters);
            
            // デフォルトキャラクターを設定
            this.selectCharacter('sakura');
        } catch (error) {
            console.error('キャラクターデータの読み込みに失敗:', error);
            // フォールバック用のデフォルトキャラクター
            this.characters = {
                sakura: {
                    id: 'sakura',
                    name: 'さくらちゃん',
                    emoji: '👧',
                    description: '元気いっぱいの学園アイドル♪',
                    personality: 'とても明るく元気で、いつも笑顔。友達思いで、みんなを励ますのが得意。',
                    greeting: 'こんにちは〜！私、さくらです♪\\nチャットRPGの世界へようこそ！\\n会話を通じて経験値を積んで、新しい仲間を解放しましょう〜✨',
                    color: '#ff6b9d',
                    image: 'assets/images/sakura.png'
                },
                misaki: {
                    id: 'misaki',
                    name: 'ミサキ',
                    emoji: '🌸',
                    description: '謎めいた美少女、古典文学が好き',
                    personality: '落ち着いていて知的。古典文学や歴史に詳しく、時々古風な言葉遣いをする。内気だが心を開いた相手には優しい。',
                    greeting: 'はじめまして...私はミサキと申します。\\n古い本の香りが好きで、図書館でよく過ごしています。\\nあなたとお話できて光栄です。',
                    color: '#9966cc',
                    image: 'assets/images/misaki.png',
                    unlockCondition: 'レベル3達成',
                    unlockLevel: 3
                }
            };
            this.selectCharacter('sakura');
        }
    }

    // キャラクター解放チェック
    checkCharacterUnlock(playerLevel) {
        Object.values(this.characters).forEach(character => {
            if (character.unlockLevel && 
                playerLevel >= character.unlockLevel && 
                !this.unlockedCharacters.includes(character.id)) {
                
                this.unlockCharacter(character.id);
            }
        });
    }

    // キャラクターを解放
    unlockCharacter(characterId) {
        if (!this.unlockedCharacters.includes(characterId)) {
            this.unlockedCharacters.push(characterId);
            console.log(`🎉 新キャラクター解放: ${this.characters[characterId].name}`);
            
            // 解放通知を表示
            this.showUnlockNotification(characterId);
            
            // ゲームシステムに通知
            if (window.gameSystem) {
                window.gameSystem.onCharacterUnlock(characterId);
            }
        }
    }

    // キャラクター解放通知を表示
    showUnlockNotification(characterId) {
        const character = this.characters[characterId];
        const unlockDiv = document.getElementById('characterUnlock');
        const nameDiv = document.getElementById('newCharacterName');
        
        if (unlockDiv && nameDiv) {
            nameDiv.textContent = character.name;
            unlockDiv.style.display = 'block';
            
            // 3秒後に非表示
            setTimeout(() => {
                unlockDiv.style.display = 'none';
            }, 3000);
        }
    }

    // キャラクターを選択（解放済みのみ）
    selectCharacter(characterId) {
        if (this.characters[characterId] && this.unlockedCharacters.includes(characterId)) {
            this.currentCharacter = this.characters[characterId];
            console.log('🎯 キャラクター選択実行:', characterId, '->', this.currentCharacter.name);
            this.updateUI();
        } else if (this.characters[characterId]) {
            console.log('🔒 キャラクターが未解放:', characterId);
        }
    }

    // UIを更新
    updateUI() {
        if (!this.currentCharacter) {
            console.log('❌ currentCharacterが設定されていません');
            return;
        }

        console.log('🔄 UI更新開始:', this.currentCharacter.name);

        // 1. キャラクター画像を更新
        const characterImg = document.getElementById('characterImg');
        if (characterImg) {
            characterImg.src = this.currentCharacter.image;
            characterImg.alt = this.currentCharacter.name;
        }

        // 2. キャラクター名を更新
        const characterName = document.getElementById('characterName');
        if (characterName) {
            characterName.textContent = this.currentCharacter.name;
        }

        // 3. キャラクター説明を更新
        const characterDescription = document.getElementById('characterDescription');
        if (characterDescription) {
            characterDescription.textContent = this.currentCharacter.description;
        }

        // 4. テーマカラー変更
        document.documentElement.style.setProperty('--character-color', this.currentCharacter.color);

        // 5. 挨拶メッセージ表示
        if (this.currentCharacter.greeting) {
            this.displayGreeting();
        }

        console.log('✅ UI更新完了');
    }

    // 挨拶メッセージを表示
    displayGreeting() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            // 既存のメッセージをクリア
            chatMessages.innerHTML = '';
            
            // 挨拶メッセージを追加
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ai';
            messageDiv.innerHTML = `
                <div class="message-bubble">
                    ${this.currentCharacter.greeting.replace(/\\n/g, '<br>')}
                </div>
            `;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // 現在のキャラクター取得
    getCurrentCharacter() {
        return this.currentCharacter;
    }

    // 解放済みキャラクター取得
    getUnlockedCharacters() {
        return this.unlockedCharacters.map(id => this.characters[id]).filter(Boolean);
    }

    // 全キャラクター取得
    getAllCharacters() {
        return this.characters;
    }

    // キャラクター選択UIを表示
    showCharacterSelector() {
        const existingModal = document.querySelector('.character-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'character-modal';
        modal.innerHTML = this.createCharacterSelector();
        document.body.appendChild(modal);

        // モーダル外クリックで閉じる
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // キャラクター選択UIを生成（解放状態を考慮）
    createCharacterSelector() {
        const characters = this.getAllCharacters();
        const currentId = this.currentCharacter?.id;

        let html = `
            <div class="character-selector">
                <h3>キャラクター選択</h3>
                <div class="character-grid">
        `;

        Object.values(characters).forEach(character => {
            const isActive = character.id === currentId ? 'active' : '';
            const isUnlocked = this.unlockedCharacters.includes(character.id);
            const lockedClass = isUnlocked ? '' : 'locked';
            
            if (isUnlocked) {
                html += `
                    <div class="character-card ${isActive}" onclick="characterManager.selectCharacter('${character.id}'); document.querySelector('.character-modal').remove();">
                        <div class="character-avatar" style="background-color: ${character.color}">
                            <img src="${character.image}" alt="${character.name}" 
                                 onerror="this.style.display='none'; this.parentElement.innerHTML='${character.emoji}';">
                        </div>
                        <div class="character-info">
                            <div class="character-name-small">${character.name}</div>
                            <div class="character-desc-small">${character.description}</div>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="character-card locked">
                        <div class="character-avatar" style="background-color: #ccc">
                            🔒
                        </div>
                        <div class="character-info">
                            <div class="character-name-small">???</div>
                            <div class="character-desc-small">${character.unlockCondition || '条件未達成'}</div>
                        </div>
                    </div>
                `;
            }
        });

        html += `
                </div>
                <button onclick="document.querySelector('.character-modal').remove();" class="close-btn">閉じる</button>
            </div>
        `;

        return html;
    }
}

// グローバルインスタンス作成
const characterManager = new CharacterManagerRPG();

// グローバル関数として toggleCharacterSelector を定義
function toggleCharacterSelector() {
    console.log('🎯 toggleCharacterSelector呼び出し');
    if (window.characterManager) {
        characterManager.showCharacterSelector();
    } else {
        console.error('❌ characterManagerが見つかりません');
    }
}

// windowオブジェクトにも設定
window.characterManager = characterManager;
window.toggleCharacterSelector = toggleCharacterSelector;