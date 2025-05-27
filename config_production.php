<?php
// 本番環境用API設定
// ⚠️ 本番環境では必ずHTTPS接続を使用してください

// OpenAI API設定
define('API_KEY', 'YOUR_PRODUCTION_OPENAI_API_KEY_HERE'); // ← 本番用APIキーに変更
define('API_ENDPOINT', 'https://api.openai.com/v1/chat/completions');

// モデル設定（コスト最重視）
define('AI_MODEL', 'gpt-4o-mini');             // 最も安価
define('MAX_TOKENS', 120);                     // 応答の最大トークン数
define('TEMPERATURE', 0.8);                    // 創造性レベル

// セキュリティ設定（本番環境用）
define('MAX_MESSAGE_LENGTH', 400);             // メッセージ制限
define('RATE_LIMIT_PER_MINUTE', 10);           // 本番では制限を厳しく
define('RATE_LIMIT_PER_HOUR', 50);             // 1時間のリクエスト制限

// CORS設定（本番環境用）
$allowed_origins = [
    'https://yourdomain.com',        // ← あなたのドメインに変更
    'https://www.yourdomain.com'     // ← あなたのドメインに変更
];

// 現在のオリジンが許可リストにあるかチェック
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // 開発環境のみlocalhostを許可
    if (strpos($origin, 'localhost') !== false && $_ENV['ENVIRONMENT'] === 'development') {
        header("Access-Control-Allow-Origin: $origin");
    }
}

// データベース設定（将来的に会話履歴を保存する場合）
define('DB_HOST', 'localhost');
define('DB_NAME', 'chat_game_db');
define('DB_USER', 'your_db_username');
define('DB_PASS', 'your_db_password');

// アプリケーション設定
define('CHARACTER_NAME', 'さくらちゃん');
define('CHARACTER_DESCRIPTION', '元気いっぱいの学園アイドル♪');

// ログ設定
define('LOG_REQUESTS', true);                  // 本番でも使用量監視のため有効
define('LOG_FILE', 'logs/api_usage.log');

// セキュリティヘッダー（本番環境用）
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');

/*
=== 🚀 本番環境セットアップチェックリスト ===

□ APIキーを本番用に変更
□ ドメイン名をallowed_originsに設定
□ HTTPS/SSL証明書の設定
□ logsディレクトリの権限設定 (chmod 755)
□ config.phpのファイル権限設定 (chmod 644)
□ レート制限の調整
□ 監視・アラートの設定

=== 💰 コスト監視設定 ===
本番環境では必ずOpenAIの使用量制限を設定：
1. OpenAI管理画面 → Usage limits
2. Monthly limit を設定 (例: $10)
3. Email通知を有効化

=== 🔒 セキュリティ注意事項 ===
- config.phpを直接アクセス不可にする
- ログファイルへの外部アクセスを禁止
- 定期的なAPIキーのローテーション
- 異常なアクセスパターンの監視

=== 📊 推奨監視項目 ===
- API呼び出し回数/時間
- エラー率
- レスポンス時間
- 不正アクセス試行

*/
?>