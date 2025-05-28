// API連携対応版のチャット機能
class ChatGame {
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
        
        console.log(`チャットゲーム初期化完了 (API: ${this.useAPI ? '有効' : '無効'})`);
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

    // 送信処理
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // 送信ボタンを無効化
        this.sendButton.disabled = true;
        this.sendButton.textContent = '送信中...';

        // ユーザーメッセージを追加
        this.addMessage(message, true, this.getCurrentTime());
        this.messageInput.value = '';

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
                resolve();
            }, responseTime);
        });
    }

    // キャラクターらしい応答パターンを取得
    getCharacterResponses(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
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
        
        // 好き・お気に入り
        if (lowerMessage.includes('好き') || lowerMessage.includes('お気に入り') || lowerMessage.includes('趣味')) {
            return [
                'きゃ〜！私もそれ大好きです💕 一緒ですね〜♪',
                'わ〜！素敵な趣味をお持ちですね✨ もっと聞かせてください！',
                'いいですよね〜！私もとっても興味があります♪',
                'えー！私もです〜✨ 今度一緒にお話ししましょう💕'
            ];
        }
        
        // 質問・意見
        if (lowerMessage.includes('どう思う') || lowerMessage.includes('意見') || lowerMessage.includes('どうかな')) {
            return [
                'うーん、難しい質問ですね〜💭 でも私は素敵だと思います♪',
                'そうですね〜♪ 私的にはとってもいいと思います✨',
                'わ〜！深いお話ですね✨ 私なりに考えてみると...',
                'いい質問ですね〜！私も一緒に考えてみましょう💕'
            ];
        }
        
        // 悲しい・困った
        if (lowerMessage.includes('悲しい') || lowerMessage.includes('困った') || lowerMessage.includes('大変')) {
            return [
                'あらら〜💦 大丈夫ですか？私がお話聞きますよ♪',
                'そんな時もありますよね〜😢 でも、きっと大丈夫です✨',
                'わ〜...心配です💦 何かお手伝いできることがあったら言ってくださいね',
                'えー！それは大変ですね💦 でも一緒に頑張りましょう♪'
            ];
        }
        
        // 嬉しい・楽しい
        if (lowerMessage.includes('嬉しい') || lowerMessage.includes('楽しい') || lowerMessage.includes('最高')) {
            return [
                'わ〜い！私も一緒に嬉しいです〜💕✨',
                'きゃ〜！それは良かったですね♪ 私も幸せな気分です〜',
                'やった〜！素敵なことがあったんですね✨ おめでとうございます♪',
                'わ〜！聞いてるだけで私もワクワクしちゃいます💕'
            ];
        }
        
        // さくらちゃんについて
        if (lowerMessage.includes('さくら') || lowerMessage.includes('あなた') || lowerMessage.includes('君')) {
            return [
                'えへへ〜♪ 私のことですか？嬉しいです💕',
                'わ〜！私について聞いてくれるんですか〜？✨',
                '私、歌とダンスが大好きなんです♪ アイドル活動頑張ってます〜',
                'ありがとうございます💕 私、みんなとお話しするのが一番楽しいんです♪'
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
            'わかります〜！それってすっごく面白いですよね♪',
            'え〜！本当ですか？もっと詳しく聞きたいです💕',
            'そうなんですね〜♪ 私、そういうお話大好きです✨'
        ];
    }
}

// ページ読み込み完了時にチャットゲームを初期化
document.addEventListener('DOMContentLoaded', () => {
    new ChatGame();
});

// エラーハンドリング
window.addEventListener('error', (event) => {
    console.error('JavaScript エラー:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('未処理のPromise拒否:', event.reason);
});