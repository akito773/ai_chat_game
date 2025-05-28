class CharacterManager {
    constructor() {
        this.characters = {};
        this.currentCharacter = null;
        this.loadCharacters();
    }

    // キャラクターデータを読み込み
    async loadCharacters() {
        try {
            const response = await fetch('characters/characters.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.characters = await response.json();
            console.log('キャラクターデータ読み込み完了:', this.characters);
            
            // デフォルトキャラクターを設定
            const defaultCharacterId = Object.keys(this.characters)[0];
            if (defaultCharacterId) {
                this.selectCharacter(defaultCharacterId);
            }
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
                    greeting: 'こんにちは〜！私、さくらです♪\n今日はどんなお話しましょうか？何でも聞いてくださいね〜✨',
                    color: '#ff6b9d',
                    image: 'assets/images/sakura.png'
                }
            };
            this.selectCharacter('sakura');
        }
    }

    // キャラクターを選択
    selectCharacter(characterId) {
        if (this.characters[characterId]) {
            this.currentCharacter = this.characters[characterId];
            console.log('🎯 キャラクター選択実行:', characterId, '->', this.currentCharacter.name);
            console.log('📱 updateUI呼び出し開始');
            this.updateUI();
            console.log('キャラクター選択:', this.currentCharacter);
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
            console.log('✅ characterImg要素発見、画像更新中...');
            characterImg.src = this.currentCharacter.image;
            characterImg.alt = this.currentCharacter.name;
            console.log('📸 画像パス更新:', this.currentCharacter.image);
        } else {
            console.log('❌ characterImg要素が見つかりません');
        }

        // 2. キャラクター名を更新
        const characterName = document.querySelector('.character-name');
        if (characterName) {
            characterName.textContent = this.currentCharacter.name;
            console.log('📝 名前更新:', this.currentCharacter.name);
        } else {
            console.log('❌ character-name要素が見つかりません');
        }

        // 3. キャラクター説明を更新
        const characterDescription = document.querySelector('.character-description');
        if (characterDescription) {
            characterDescription.textContent = this.currentCharacter.description;
            console.log('📝 説明更新:', this.currentCharacter.description);
        } else {
            console.log('❌ character-description要素が見つかりません');
        }

        // 4. テーマカラー変更
        document.documentElement.style.setProperty('--character-color', this.currentCharacter.color);
        console.log('🎨 テーマカラー更新:', this.currentCharacter.color);

        // 5. 挨拶メッセージ表示
        if (this.currentCharacter.greeting) {
            this.displayGreeting();
            console.log('💬 挨拶メッセージ表示');
        }

        console.log('✅ UI更新完了');
    }

    // 挨拶メッセージを表示
    displayGreeting() {
        const messagesDiv = document.getElementById('messages');
        if (messagesDiv) {
            // 既存のメッセージをクリア
            messagesDiv.innerHTML = '';
            
            // 挨拶メッセージを追加
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ai-message';
            messageDiv.innerHTML = `
                <div class="message-content">
                    <strong>${this.currentCharacter.name}:</strong><br>
                    ${this.currentCharacter.greeting.replace(/\n/g, '<br>')}
                </div>
            `;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    }

    // 現在のキャラクター取得
    getCurrentCharacter() {
        return this.currentCharacter;
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

    // キャラクター選択UIを生成
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
const characterManager = new CharacterManager();

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

// DOMが読み込まれた後にキャラクター変更ボタンのイベント設定
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM読み込み完了 - イベント設定開始');
    
    // 既存ボタンの確認
    const oldBtn = document.querySelector('.character-select-btn');
    if (oldBtn) {
        console.log('✅ 既存ボタン発見:', oldBtn);
        console.log('✅ 既存ボタンのイベント設定完了');
    }
    
    // characterManagerをグローバルに設定
    window.characterManager = characterManager;
    console.log('✅ characterManagerをwindowオブジェクトに設定完了');
    
    setTimeout(() => {
        if (window.characterManager) {
            console.log('✅ characterManager正常に利用可能');
        } else {
            console.error('❌ characterManagerが見つかりません - 初期化に問題があります');
        }
    }, 2000);
});
