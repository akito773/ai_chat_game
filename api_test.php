<?php
// API接続診断ツール
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: text/html; charset=UTF-8");
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>API接続診断</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        .test-section { border: 1px solid #ccc; padding: 15px; margin: 10px 0; }
        pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🔧 AIチャットゲーム API診断ツール</h1>
    
    <?php
    echo "<div class='test-section'>";
    echo "<h2>1. 基本環境チェック</h2>";
    
    // PHP版本
    echo "<p>PHP Version: " . phpversion() . "</p>";
    
    // 必要な拡張機能
    $extensions = ['curl', 'json', 'mbstring'];
    foreach ($extensions as $ext) {
        if (extension_loaded($ext)) {
            echo "<p class='success'>✅ {$ext} 拡張: 有効</p>";
        } else {
            echo "<p class='error'>❌ {$ext} 拡張: 無効</p>";
        }
    }
    echo "</div>";
    
    // 設定ファイルチェック
    echo "<div class='test-section'>";
    echo "<h2>2. 設定ファイルチェック</h2>";
    
    if (file_exists('api/config.php')) {
        echo "<p class='success'>✅ config.php が存在します</p>";
        
        try {
            require_once 'api/config.php';
            echo "<p class='success'>✅ config.php 読み込み成功</p>";
            
            // API_KEY確認
            if (defined('API_KEY')) {
                $apiKey = API_KEY;
                $keyLength = strlen($apiKey);
                $maskedKey = substr($apiKey, 0, 7) . '...' . substr($apiKey, -4);
                echo "<p class='success'>✅ API_KEY 設定済み (長さ: {$keyLength}, 表示: {$maskedKey})</p>";
                
                // APIキーの基本的な妥当性チェック
                if (strpos($apiKey, 'sk-proj-') === 0 || strpos($apiKey, 'sk-') === 0) {
                    echo "<p class='success'>✅ APIキー形式: OpenAI形式</p>";
                } else {
                    echo "<p class='warning'>⚠️ APIキー形式が不明です</p>";
                }
            } else {
                echo "<p class='error'>❌ API_KEY が定義されていません</p>";
            }
            
            // その他の設定
            if (defined('AI_MODEL')) {
                echo "<p class='success'>✅ AI_MODEL: " . AI_MODEL . "</p>";
            }
            
            if (defined('API_ENDPOINT')) {
                echo "<p class='success'>✅ API_ENDPOINT: " . API_ENDPOINT . "</p>";
            }
            
        } catch (Exception $e) {
            echo "<p class='error'>❌ config.php エラー: " . $e->getMessage() . "</p>";
        }
    } else {
        echo "<p class='error'>❌ api/config.php が見つかりません</p>";
    }
    echo "</div>";
    
    // ファイル・ディレクトリチェック
    echo "<div class='test-section'>";
    echo "<h2>3. ファイル構造チェック</h2>";
    
    $requiredFiles = [
        'api/chat.php' => 'APIエンドポイント',
        'js/chat.js' => 'チャット機能',
        'css/style.css' => 'スタイルシート',
        'index.html' => 'メインページ'
    ];
    
    foreach ($requiredFiles as $file => $desc) {
        if (file_exists($file)) {
            echo "<p class='success'>✅ {$file} ({$desc})</p>";
        } else {
            echo "<p class='error'>❌ {$file} ({$desc}) が見つかりません</p>";
        }
    }
    
    $requiredDirs = ['logs', 'assets', 'api'];
    foreach ($requiredDirs as $dir) {
        if (is_dir($dir)) {
            $writable = is_writable($dir) ? "書き込み可" : "書き込み不可";
            echo "<p class='success'>✅ {$dir}/ ディレクトリ ({$writable})</p>";
        } else {
            echo "<p class='error'>❌ {$dir}/ ディレクトリがありません</p>";
        }
    }
    echo "</div>";
    
    // API接続テスト
    if (defined('API_KEY') && defined('API_ENDPOINT')) {
        echo "<div class='test-section'>";
        echo "<h2>4. API接続テスト</h2>";
        
        $testMessage = "Hello, this is a test message.";
        
        $postData = [
            'model' => defined('AI_MODEL') ? AI_MODEL : 'gpt-4o-mini',
            'messages' => [
                [
                    'role' => 'user',
                    'content' => $testMessage
                ]
            ],
            'max_tokens' => 50,
            'temperature' => 0.7
        ];
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => API_ENDPOINT,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($postData),
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . API_KEY,
                'Content-Type: application/json'
            ],
            CURLOPT_TIMEOUT => 15,
            CURLOPT_CONNECTTIMEOUT => 10
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        if ($curlError) {
            echo "<p class='error'>❌ cURL接続エラー: {$curlError}</p>";
        } else {
            echo "<p class='success'>✅ cURL接続成功 (HTTP: {$httpCode})</p>";
            
            if ($httpCode === 200) {
                $data = json_decode($response, true);
                if (isset($data['choices'][0]['message']['content'])) {
                    echo "<p class='success'>✅ API応答成功</p>";
                    echo "<p><strong>テスト応答:</strong> " . htmlspecialchars($data['choices'][0]['message']['content']) . "</p>";
                } else {
                    echo "<p class='error'>❌ API応答形式エラー</p>";
                    echo "<pre>" . htmlspecialchars($response) . "</pre>";
                }
            } else {
                echo "<p class='error'>❌ API呼び出し失敗 (HTTP: {$httpCode})</p>";
                $errorData = json_decode($response, true);
                if ($errorData && isset($errorData['error'])) {
                    echo "<p class='error'>エラー詳細: " . htmlspecialchars($errorData['error']['message']) . "</p>";
                    
                    // よくあるエラーの解決法を表示
                    $errorMsg = $errorData['error']['message'];
                    if (strpos($errorMsg, 'Incorrect API key') !== false) {
                        echo "<p class='warning'>💡 <strong>解決法:</strong> APIキーが間違っています。OpenAIの管理画面で新しいAPIキーを生成してください。</p>";
                    } elseif (strpos($errorMsg, 'quota') !== false) {
                        echo "<p class='warning'>💡 <strong>解決法:</strong> API使用量の上限に達しています。OpenAIアカウントで支払い情報を確認してください。</p>";
                    } elseif (strpos($errorMsg, 'rate limit') !== false) {
                        echo "<p class='warning'>💡 <strong>解決法:</strong> APIの呼び出し頻度が高すぎます。少し時間をおいてから再試行してください。</p>";
                    }
                } else {
                    echo "<pre>" . htmlspecialchars($response) . "</pre>";
                }
            }
        }
        echo "</div>";
    }
    
    // 解決策の提示
    echo "<div class='test-section'>";
    echo "<h2>5. 💡 トラブルシューティング</h2>";
    echo "<p><strong>よくある問題と解決法:</strong></p>";
    echo "<ul>";
    echo "<li><strong>APIキーエラー:</strong> OpenAI管理画面で新しいAPIキーを生成し、config.phpを更新</li>";
    echo "<li><strong>CORS エラー:</strong> ブラウザのコンソールでJavaScriptエラーを確認</li>";
    echo "<li><strong>XAMPPエラー:</strong> Apacheが起動しているか確認 (localhost/xampp/)</li>";
    echo "<li><strong>ファイル権限:</strong> logs/ ディレクトリが書き込み可能か確認</li>";
    echo "</ul>";
    
    echo "<p><strong>次のステップ:</strong></p>";
    echo "<ol>";
    echo "<li>上記のエラーを順番に修正</li>";
    echo "<li>修正後、このページを再読み込みして再テスト</li>";
    echo "<li>すべて ✅ になったら <a href='index.html'>チャットゲーム</a> を試す</li>";
    echo "</ol>";
    echo "</div>";
    ?>
    
    <div class="test-section">
        <h2>6. 🔄 再テスト</h2>
        <p><button onclick="location.reload()">このページを再読み込み</button></p>
        <p><a href="index.html">チャットゲームに戻る</a></p>
    </div>
</body>
</html>
