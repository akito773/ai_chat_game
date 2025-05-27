<?php
// API設定ファイル - 修正版
// OpenAI API設定（gpt-4o-mini - 最も安価なモデル）

// ⚠️ 重要: この部分を修正してください ⚠️
// 古いAPIキーは無効になっている可能性があります
// OpenAI管理画面（https://platform.openai.com/api-keys）で新しいAPIキーを生成してください

define('API_KEY', 'YOUR_OPENAI_API_KEY_HERE'); // ← ここに新しいAPIキーを入力
define('API_ENDPOINT', 'https://api.openai.com/v1/chat/completions');

// モデル設定（コスト最重視 - GPT-4o mini）
define('AI_MODEL', 'gpt-4o-mini');             // 最も安価！
define('MAX_TOKENS', 120);                     // 応答の最大トークン数
define('TEMPERATURE', 0.8);                    // 創造性レベル（0.0-1.0）

// コスト制御設定
define('MAX_MESSAGE_LENGTH', 400);             // ユーザーメッセージ制限
define('RATE_LIMIT_PER_MINUTE', 20);           // 1分間のリクエスト制限
define('RATE_LIMIT_PER_HOUR', 150);            // 1時間のリクエスト制限

// データベース設定（将来的に会話履歴を保存する場合）
define('DB_HOST', 'localhost');
define('DB_NAME', 'chat_game');
define('DB_USER', 'your-db-user');
define('DB_PASS', 'your-db-password');

// アプリケーション設定
define('CHARACTER_NAME', 'さくらちゃん');
define('CHARACTER_DESCRIPTION', '元気いっぱいの学園アイドル♪');

// ログ設定
define('LOG_REQUESTS', true);                  // API使用量追跡のため
define('LOG_FILE', 'logs/api_usage.log');

/*
=== 🚨 APIキー設定手順 ===

1. OpenAI管理画面にアクセス: https://platform.openai.com/api-keys
2. "Create new secret key" をクリック
3. 名前を入力（例: "chat-game-key"）
4. 生成されたAPIキー（sk-proj-で始まる文字列）をコピー
5. 上記の 'YOUR_OPENAI_API_KEY_HERE' を実際のAPIキーに置き換え
6. このファイルを保存

=== ⚡ 最新の料金情報 ===
gpt-4o-mini (2024年最新):
- 入力: $0.15 / 1M tokens
- 出力: $0.60 / 1M tokens
- 1回の会話: 約0.01-0.03円

=== 🔧 トラブルシューティング ===
- APIキーエラー → 新しいキーを生成
- 支払いエラー → OpenAIアカウントでクレジットカード登録
- レート制限 → 少し待ってから再試行

=== 📞 サポート ===
問題が解決しない場合は api_test.php で詳細診断を実行してください
*/
?>
