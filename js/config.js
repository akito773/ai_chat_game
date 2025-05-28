// アプリケーション設定
window.CONFIG = {
    // API使用設定
    useAPI: true,                     // true: AI APIを使用, false: ローカル応答のみ
    apiEndpoint: 'api/chat.php',      // API エンドポイント
    
    // キャラクター設定
    character: {
        name: 'さくらちゃん',
        description: '元気いっぱいの学園アイドル♪',
        imageUrl: 'assets/images/sakura.png'
    },
    
    // チャット設定
    chat: {
        maxMessageLength: 400,        // メッセージの最大文字数（GPT-4o miniで安くなったので増加）
        showTimestamp: true,          // タイムスタンプ表示
        animationEnabled: true,       // アニメーション有効
        typingIndicatorDelay: 1000,   // タイピングインジケーター最小表示時間
    },
    
    // UI設定
    ui: {
        theme: 'sakura',              // テーマ名
        enableSounds: false,          // 効果音（将来実装予定）
        enableVibration: false,       // バイブレーション（モバイル用）
    },
    
    // デバッグ設定
    debug: {
        enabled: true,               // デバッグモード
        logLevel: 'info'             // ログレベル (error, warn, info, debug)
    }
};

// 設定の妥当性チェック
(function validateConfig() {
    if (typeof window.CONFIG !== 'object') {
        console.error('CONFIG オブジェクトが正しく定義されていません');
        return;
    }
    
    // 必須設定の確認
    const requiredSettings = [
        'useAPI',
        'apiEndpoint',
        'character.name'
    ];
    
    requiredSettings.forEach(setting => {
        const keys = setting.split('.');
        let current = window.CONFIG;
        
        for (const key of keys) {
            if (current[key] === undefined) {
                console.warn(`設定項目 ${setting} が定義されていません`);
                break;
            }
            current = current[key];
        }
    });
    
    if (window.CONFIG.debug.enabled) {
        console.log('アプリケーション設定:', window.CONFIG);
    }
})();