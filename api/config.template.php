<?php
// 本番環境用API設定テンプレート
// このファイルをコピーして config.php として使用してください

// OpenAI API設定
define('API_KEY', 'YOUR_OPENAI_API_KEY_HERE'); // sk-で始まるAPIキーを入力
define('API_ENDPOINT', 'https://api.openai.com/v1/chat/completions');

// または Claude API設定（Anthropic）
// define('API_KEY', 'YOUR_CLAUDE_API_KEY_HERE'); // sk-ant-で始まるAPIキーを入力
// define('API_ENDPOINT', 'https://api.anthropic.com/v1/messages');

// または Google Gemini API設定
// define('API_KEY', 'YOUR_GEMINI_API_KEY_HERE');
// define('API_ENDPOINT', 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent');

// データベース設定（オプション - 会話履歴保存用）
define('DB_HOST', 'localhost');
define('DB_NAME', 'chat_game_db');
define('DB_USER', 'your_db_username');
define('DB_PASS', 'your_db_password');

// セキュリティ設定
define('RATE_LIMIT_PER_MINUTE', 20);      // 1分間のリクエスト制限
define('MAX_MESSAGE_LENGTH', 500);        // メッセージの最大文字数
define('SESSION_TIMEOUT', 3600);          // セッションタイムアウト（秒）

// CORS設定（本番環境では適切なドメインを指定）
define('ALLOWED_ORIGINS', [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
]);

// SSL/HTTPS設定
define('FORCE_HTTPS', true);              // 本番環境では true に設定

// ログ設定
define('LOG_ENABLED', true);
define('LOG_LEVEL', 'error');             // error, warning, info, debug
define('LOG_FILE', 'logs/chat.log');

// キャラクター設定
define('CHARACTER_NAME', 'さくらちゃん');
define('CHARACTER_DESCRIPTION', '元気いっぱいの学園アイドル♪');
define('CHARACTER_AVATAR', 'assets/images/sakura.png');

// 機能ON/OFF設定
define('ENABLE_CHAT_HISTORY', false);     // 会話履歴保存機能
define('ENABLE_USER_SESSIONS', false);    // ユーザーセッション管理
define('ENABLE_ANALYTICS', false);        // アクセス解析

/*
=== セットアップ手順 ===

1. このファイルを config.php にリネーム
2. 使用するAI APIのAPIキーを設定
3. 必要に応じてデータベース設定を入力
4. ALLOWED_ORIGINS に本番ドメインを設定
5. ログディレクトリ logs/ を作成
6. Webサーバーにアップロード

=== APIキーの取得方法 ===

OpenAI: https://platform.openai.com/api-keys
Claude: https://console.anthropic.com/
Gemini: https://makersuite.google.com/app/apikey

=== 注意事項 ===

- APIキーは絶対に公開しないでください
- 本番環境では必ずHTTPS/SSLを使用してください
- レート制限を適切に設定してください
- ログファイルの権限設定に注意してください

*/
?>