<?php
// ローカル開発用設定
error_reporting(E_ALL);
ini_set('display_errors', 1);

// OpenAI API設定
define('API_KEY', 'あなたのローカル用APIキー');
define('API_URL', 'https://api.openai.com/v1/chat/completions');

// CORS設定（ローカル用）
$allowed_origins = [
    'http://localhost:8000',
    'http://localhost:3000',
    'http://127.0.0.1:8000',
    'file://' // ローカルファイルアクセス用
];

// ローカル用ログ設定
define('LOG_FILE', __DIR__ . '/../logs/api_local.log');
?>
