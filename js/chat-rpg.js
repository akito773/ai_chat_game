// RPG要素統合版のチャット機能
class ChatGameRPG {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.typingIndicator = document.getElementById('typingIndicator');
        
        // API使用フラグ（config.jsで設定可能）
        this.useAPI = window.CONFIG ? window.CONFIG.useAPI : false;
        this.apiEndpoint = window.CONFIG ? window.CONFIG.apiEndpoint : 'api/chat.php';
        
        this.init();
    }

    init() {
        // イベントリスナーの設定
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 入力文字数制限
        this.messageInput.addEventListener('input', (e) => {
            const maxLength = 500;
            if (e.target.value.length > maxLength) {
                e.target.value = e.target.value.substring(0, maxLength);
            }
        });

        // 初期フォーカス
        this.messageInput.focus();
        
        // キャラクター画像の読み込み状態をチェック
        this.checkCharacterImage();
        
        console.log(`チャットゲームRPG初期化完了 (API: ${this.useAPI ? '有効' : '無効'})`);
    }

    // キャラクター画像の読み込みチェック
    checkCharacterImage() {
        const img = document.getElementById('characterImg');
        const placeholder = document.getElementById('characterPlaceholder');
        
        if (img) {
            img.onload = () => {
                console.log('キャラクター画像読み込み成功');
                img.style.display = 'block';
                placeholder.style.display = 'none';
            };
            
            img.onerror = () => {
                console.warn('キャラクター画像読み込み失敗 - プレースホルダー表示');
                img.style.display = 'none';
                placeholder.style.display = 'flex';
            };
        }
    }

    // メッセージを追加する関数
    addMessage(text, isUser = false, timestamp = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        bubbleDiv.innerHTML = this.sanitizeHTML(text);
        
        // タイムスタンプ（オプション）
        if (timestamp) {
            const timeDiv = document.createElement('div');
            timeDiv.className = 'message-time';
            timeDiv.textContent = timestamp;
            messageDiv.appendChild(timeDiv);
        }
        
        messageDiv.appendChild(bubbleDiv);
        this.chatMessages.appendChild(messageDiv);
        
        // アニメーション効果
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        });
        
        // スクロールを最下部に
        this.scrollToBottom();
    }

    // HTMLサニタイズ（基本的なセキュリティ対策）
    sanitizeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/\n/g, '<br>');
    }

    // チャットをリセット
    resetChat() {
        this.chatMessages.innerHTML = '';
    }
    
    // スムーズスクロール
    scrollToBottom() {
        this.chatMessages.scrollTo({
            top: this.chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }

    // 送信処理（RPG要素統合）
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // 送信ボタンを無効化
        this.sendButton.disabled = true;
        this.sendButton.textContent = '送信中...';

        // ユーザーメッセージを追加
        this.addMessage(message, true, this.getCurrentTime());
        this.messageInput.value = '';

        // 🎮 RPG要素: チャット回数増加と経験値獲得
        if (window.gameSystem) {
            window.gameSystem.incrementChatCount();
        }

        // タイピングインジケーターを表示
        this.showTypingIndicator();

        try {
            if (this.useAPI) {
                await this.generateAIResponseWithAPI(message);
            } else {
                await this.generateAIResponseLocal(message);
            }
        } catch (error) {
            console.error('応答生成エラー:', error);
            this.hideTypingIndicator();
            this.addMessage('ごめんなさい〜💦 ちょっと調子が悪いみたいです...', false, this.getCurrentTime());
        }

        // 送信ボタンを有効化
        this.sendButton.disabled = false;
        this.sendButton.textContent = '送信';
        this.messageInput.focus();
    }

    // 現在時刻を取得
    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('ja-JP', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    // タイピングインジケーターの表示
    showTypingIndicator() {
        this.typingIndicator.style.display = 'block';
        this.scrollToBottom();
    }

    // タイピングインジケーターの非表示
    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }

    // API連携での応答生成
    async generateAIResponseWithAPI(userMessage) {
        try {
            console.log('APIリクエスト開始:', userMessage);
            
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ 
                    message: userMessage,
                    character: window.characterManager ? window.characterManager.getCurrentCharacter()?.id || 'sakura' : 'sakura'
                })
            });
            
            console.log('APIレスポンス受信:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // レスポンステキストを取得
            const responseText = await response.text();
            console.log('レスポンステキスト:', responseText);
            
            // JSONパース前にHTML混入をチェック
            if (responseText.includes('<br />') || responseText.includes('<b>')) {
                console.error('PHPエラーが混入しています:', responseText);
                throw new Error('サーバーエラーが発生しました');
            }
            
            // JSONパース
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON解析エラー:', parseError);
                console.error('問題のあるレスポンス:', responseText);
                throw new Error('サーバーからの応答が無効です');
            }
            
            console.log('APIデータ:', data);
            
            this.hideTypingIndicator();
            
            if (data.success) {
                this.addMessage(data.response, false, this.getCurrentTime());
                
                // 🎮 RPG要素: 特別な会話での追加経験値
                this.checkSpecialConversation(userMessage, data.response);
            } else {
                throw new Error(data.error || 'API応答エラー');
            }
            
        } catch (error) {
            console.error('API呼び出しエラー:', error);
            this.hideTypingIndicator();
            
            // エラーメッセージを詳細化
            let errorMessage = 'ごめんなさい〜💦 接続に問題があるみたいです...';
            
            if (error.message.includes('サーバーエラー')) {
                errorMessage = 'ごめんなさい〜💦 サーバーでエラーが発生しました...';
            } else if (error.message.includes('HTTP error')) {
                errorMessage = 'ごめんなさい〜💦 通信エラーが発生しました...';
            } else if (error.message.includes('JSON') || error.message.includes('サーバーからの応答')) {
                errorMessage = 'ごめんなさい〜💦 サーバーからの応答に問題があります...';
            }
            
            this.addMessage(errorMessage, false, this.getCurrentTime());
        }
    }

    // ローカル応答生成（API未使用時）
    async generateAIResponseLocal(userMessage) {
        const responses = this.getCharacterResponses(userMessage);
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // 応答時間をランダムに設定（1-3秒）
        const responseTime = 1000 + Math.random() * 2000;
        
        return new Promise((resolve) => {
            setTimeout(() => {
                this.hideTypingIndicator();
                this.addMessage(randomResponse, false, this.getCurrentTime());
                
                // 🎮 RPG要素: 特別な会話での追加経験値
                this.checkSpecialConversation(userMessage, randomResponse);
                
                resolve();
            }, responseTime);
        });
    }

    // 🎮 特別な会話での追加経験値チェック
    checkSpecialConversation(userMessage, aiResponse) {
        if (!window.gameSystem) return;
        
        const lowerMessage = userMessage.toLowerCase();
        let bonusExp = 0;
        let reason = '';
        
        // 長いメッセージでボーナス
        if (userMessage.length > 50) {
            bonusExp += 3;
            reason = '長文会話ボーナス';
        }
        
        // 感情的な会話でボーナス
        if (lowerMessage.includes('好き') || lowerMessage.includes('嬉しい') || 
            lowerMessage.includes('楽しい') || lowerMessage.includes('ありがとう')) {
            bonusExp += 5;
            reason = '感情豊かな会話ボーナス';
        }
        
        // 質問や深い会話でボーナス
        if (lowerMessage.includes('どう思う') || lowerMessage.includes('意見') || 
            lowerMessage.includes('どうして') || lowerMessage.includes('なぜ')) {
            bonusExp += 4;
            reason = '深い会話ボーナス';
        }
        
        // キャラクターについての質問でボーナス
        if (lowerMessage.includes('あなた') || lowerMessage.includes('君') || 
            lowerMessage.includes('趣味') || lowerMessage.includes('好きな')) {
            bonusExp += 6;
            reason = 'キャラクター理解ボーナス';
        }
        
        if (bonusExp > 0) {
            window.gameSystem.addExp(bonusExp, reason);
        }
    }

    // キャラクターらしい応答パターンを取得（RPG版）
    getCharacterResponses(userMessage) {
        const currentCharacter = window.characterManager?.getCurrentCharacter();
        const lowerMessage = userMessage.toLowerCase();
        
        // キャラクター別の応答（ミサキの場合）
        if (currentCharacter?.id === 'misaki') {
            return this.getMisakiResponses(lowerMessage);
        }
        
        // デフォルト（さくら）の応答
        return this.getSakuraResponses(lowerMessage);
    }

    // さくらちゃんの応答パターン
    getSakuraResponses(lowerMessage) {
        // 挨拶
        if (lowerMessage.includes('こんにちは') || lowerMessage.includes('こんばんは') || lowerMessage.includes('おはよう')) {
            return [
                'こんにちは〜！✨ 今日もとってもいい天気ですね♪',
                'わ〜！ご挨拶ありがとうございます💕 私も嬉しいです〜！',
                'こんにちは♪ 今日はどんな楽しいお話をしましょうか〜？',
                'おはようございます〜✨ 今日も一日頑張りましょうね♪'
            ];
        }
        
        // 感謝
        if (lowerMessage.includes('ありがとう') || lowerMessage.includes('感謝')) {
            return [
                'えへへ〜♪ どういたしまして💕',
                'わ〜！そんなこと言ってくれるなんて嬉しいです✨',
                'こちらこそありがとうございます〜♪ お話できて楽しいです！',
                'そんな〜💕 私も楽しくお話しさせてもらってます〜♪'
            ];
        }
        
        // レベルアップ・ゲームについて
        if (lowerMessage.includes('レベル') || lowerMessage.includes('経験値') || lowerMessage.includes('ゲーム')) {
            return [
                'わ〜！レベルアップおめでとうございます〜♪ 一緒に頑張りましょう✨',
                'すごいですね〜！私もあなたと一緒に成長してる気分です💕',
                'ゲーム楽しんでもらえてますか〜？私も嬉しいです♪',
                'きゃ〜！どんどん上達してますね〜✨ 私も応援してます！'
            ];
        }
        
        // デフォルトの応答パターン
        return [
            'わ〜！それってとっても面白そうですね♪ もっと詳しく教えてください！',
            'へぇ〜！そうなんですね✨ 私も勉強になりました！',
            'うんうん、分かりますよ〜！一緒に考えてみましょう♪',
            'すごいですね〜！私もそういうの大好きです💕',
            'なるほど〜！とても興味深いお話ですね〜♪',
            'きゃ〜！それってすごく素敵ですね✨',
            'そうそう！私もそう思います〜♪ お話上手ですね！',
            'わかります〜！それってすっごく面白いですよね♪'
        ];
    }

    // ミサキの応答パターン
    getMisakiResponses(lowerMessage) {
        // 挨拶
        if (lowerMessage.includes('こんにちは') || lowerMessage.includes('こんばんは') || lowerMessage.includes('おはよう')) {
            return [
                'こんにちは...✨ 良い一日をお過ごしでしょうか？',
                'お疲れさまです... 今日も美しい夕暮れですね🌸',
                'おはようございます... 朝の静寂が心地よいですね',
                'ご挨拶いただき、ありがとうございます... 嬉しく思います💫'
            ];
        }
        
        // 感謝
        if (lowerMessage.includes('ありがとう') || lowerMessage.includes('感謝')) {
            return [
                'いえいえ... こちらこそお話しいただき、感謝しています🌸',
                'お優しいお言葉をありがとうございます... 心温まります',
                'そのようなお言葉をいただけて... 私も幸せです✨',
                'お気遣いいただき恐縮です... あなたのお心遣いに感謝いたします'
            ];
        }
        
        // 読書・学習について
        if (lowerMessage.includes('本') || lowerMessage.includes('読書') || lowerMessage.includes('勉強')) {
            return [
                '読書はお好きですか？ 私は古典文学に心惹かれます📚',
                '本の世界は素晴らしいですね... 時を忘れて読み耽ってしまいます',
                '学ぶことの喜び... あなたも感じていらっしゃるのですね✨',
                '図書館の静寂の中で読書をすると、心が落ち着きます🌸'
            ];
        }
        
        // レベルアップ・ゲームについて
        if (lowerMessage.includes('レベル') || lowerMessage.includes('経験値') || lowerMessage.includes('ゲーム')) {
            return [
                '成長を感じることは... とても尊いことですね✨',
                'あなたの努力が実を結んでいるのですね... 素晴らしいことです',
                '経験を積み重ねることで... 人は美しく成長するのでしょう🌸',
                'ゲームを通じて学ぶことも多いですね... 興味深いです'
            ];
        }
        
        // デフォルトの応答パターン
        return [
            'そうですね... とても興味深いお話です🌸',
            'あなたのお話を聞いていると... 心が豊かになります',
            'なるほど... そのような視点もあるのですね✨',
            '静かに考えてみると... 深い意味があるのかもしれません',
            'お話しいただき、ありがとuございます... 勉強になります',
            '美しいお心をお持ちですね... 感銘を受けます🌸',
            'そのような考え方... 私も学ばせていただきます',
            '穏やかな時間を過ごせて... 幸せです✨'
        ];
    }
}

// エラーハンドリング
window.addEventListener('error', (event) => {
    console.error('JavaScript エラー:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('未処理のPromise拒否:', event.reason);
});