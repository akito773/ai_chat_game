// キャラクター管理システム
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
            const data = await response.json();
            this.characters = data;
            
            // デフォルトキャラクターを設定
            const defaultCharacter = localStorage.getItem('selectedCharacter') || 'sakura';
            this.setCharacter(defaultCharacter);
            
            console.log('キャラクターデータ読み込み完了:', Object.keys(this.characters));
        } catch (error) {
            console.error('キャラクターデータ読み込みエラー:', error);
            // フォールバック: さくらちゃんのみ
            this.characters = {
                sakura: {
                    id: 'sakura',
                    name: 'さくらちゃん',
                    description: '元気いっぱいの学園アイドル♪',
                    emoji: '🌸',
                    color: '#ff69b4'
                }
            };
            this.setCharacter('sakura');
        }
    }

    // キャラクターを設定
    setCharacter(characterId) {
        if (this.characters[characterId]) {
            this.currentCharacter = this.characters[characterId];
            localStorage.setItem('selectedCharacter', characterId);
            this.updateUI();
            return true;
        }
        return false;
    }

    // 現在のキャラクターを取得
    getCurrentCharacter() {
        return this.currentCharacter;
    }

    // 全キャラクターリストを取得
    getAllCharacters() {
        return this.characters;
    }

    // キャラクター専用プロンプトを生成
    generatePrompt(characterId = null) {
        const character = characterId ? this.characters[characterId] : this.currentCharacter;
        if (!character || !character.prompt_template) {
            return this.getDefaultPrompt(character);
        }

        // テンプレート変数を置換
        let prompt = character.prompt_template;
        
        // シンプルな置換（実際のテンプレートエンジンの代替）
        prompt = prompt.replace(/{name}/g, character.name);
        prompt = prompt.replace(/{personality\.base}/g, character.personality.base);
        prompt = prompt.replace(/{personality\.speech_style}/g, character.personality.speech_style);
        prompt = prompt.replace(/{personality\.tone_markers}/g, character.personality.tone_markers.join('、'));
        prompt = prompt.replace(/{personality\.favorite_emojis}/g, character.personality.favorite_emojis.join(' '));
        prompt = prompt.replace(/{personality\.hobbies}/g, character.personality.hobbies.join('、'));
        prompt = prompt.replace(/{personality\.age_setting}/g, character.personality.age_setting);

        return prompt;
    }

    // デフォルトプロンプト（後方互換性のため）
    getDefaultPrompt(character) {
        return `あなたは「${character.name}」というキャラクターです。

【キャラクター設定】
- 名前: ${character.name}
- 説明: ${character.description}

【応答ルール】
1. 70文字以内で簡潔に応答
2. キャラクターらしい口調で話す
3. 適度に絵文字を使用
4. ユーザーに共感し興味を示す

${character.name}として自然に応答してください。`;
    }

    // UIを更新
    updateUI() {
        if (!this.currentCharacter) return;

        const character = this.currentCharacter;
        
        // キャラクター画像
        const characterImg = document.getElementById('characterImg');
        const characterPlaceholder = document.getElementById('characterPlaceholder');
        if (characterImg && characterPlaceholder) {
            characterImg.src = character.image || 'assets/images/default.png';
            characterImg.alt = character.name;
            characterPlaceholder.textContent = character.emoji || '👤';
        }

        // キャラクター名
        const characterName = document.getElementById('characterName') || document.querySelector('.character-name');
        if (characterName) {
            characterName.textContent = character.name;
        }

        // キャラクター説明
        const characterDescription = document.getElementById('characterDescription') || document.querySelector('.character-description');
        if (characterDescription) {
            characterDescription.textContent = character.description;
        }

        // テーマカラーを適用
        if (character.color) {
            document.documentElement.style.setProperty('--character-color', character.color);
        }

        console.log(`キャラクター変更: ${character.name} (${character.id})`);
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
                <div class="character-card ${isActive}" onclick="characterManager.selectCharacter('${character.id}')">
                    <div class="character-avatar" style="background-color: ${character.color}">
                        <span class="character-emoji">${character.emoji}</span>
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
            </div>
        `;

        return html;
    }

    // キャラクター選択処理
    selectCharacter(characterId) {
        if (this.setCharacter(characterId)) {
            // チャット履歴をリセット
            if (window.chatGame) {
                window.chatGame.resetChat();
            }
            
            // 選択UIを更新
            this.updateCharacterSelector();
            
            // 新しいキャラクターからの挨拶
            this.sendGreeting();
        }
    }

    // キャラクター選択UIを更新
    updateCharacterSelector() {
        const selector = document.querySelector('.character-selector');
        if (selector) {
            selector.innerHTML = this.createCharacterSelector().replace(/<div class="character-selector">|<\/div>$/g, '');
        }
    }

    // 新しいキャラクターからの挨拶
    sendGreeting() {
        if (!window.chatGame || !this.currentCharacter) return;

        const greetings = {
            sakura: 'こんにちは〜！私、さくらです♪ 今日はどんなお話しましょうか？✨',
            akira: 'こんにちは。アキラです。何かお手伝いできることがあれば、お聞かせください。📚',
            yuki: 'こんにちはですわ〜。ユキと申しますの。ゆっくりお話しましょう❄️✨',
            riko: 'やっほー！私はリコだよ！今日も元気にいこうぜ！⚽💪'
        };

        const greeting = greetings[this.currentCharacter.id] || `こんにちは！${this.currentCharacter.name}です♪`;
        
        setTimeout(() => {
            window.chatGame.addMessage(greeting, false, window.chatGame.getCurrentTime());
        }, 500);
    }
}

// グローバルインスタンス
window.characterManager = new CharacterManager();