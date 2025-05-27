<?php
// 簡単なテスト用PHPファイル
// エラー表示を有効化
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>PHP動作テスト</h1>";
echo "<p>現在時刻: " . date('Y-m-d H:i:s') . "</p>";
echo "<p>PHP Version: " . phpversion() . "</p>";

// 設定ファイルテスト
echo "<h2>設定ファイルテスト</h2>";
if (file_exists('api/config.php')) {
    echo "<p>✅ api/config.php が存在します</p>";
    
    // 設定ファイル読み込みテスト
    try {
        require_once 'api/config.php';
        echo "<p>✅ config.php 読み込み成功</p>";
        
        if (defined('API_KEY')) {
            echo "<p>✅ API_KEY が定義されています</p>";
        } else {
            echo "<p>❌ API_KEY が定義されていません</p>";
        }
        
        if (defined('AI_MODEL')) {
            echo "<p>✅ AI_MODEL: " . AI_MODEL . "</p>";
        }
        
    } catch (Exception $e) {
        echo "<p>❌ config.php エラー: " . $e->getMessage() . "</p>";
    }
} else {
    echo "<p>❌ api/config.php が見つかりません</p>";
}

// curl拡張確認
echo "<h2>拡張機能テスト</h2>";
if (extension_loaded('curl')) {
    echo "<p>✅ CURL拡張が有効です</p>";
} else {
    echo "<p>❌ CURL拡張が無効です</p>";
}

if (extension_loaded('json')) {
    echo "<p>✅ JSON拡張が有効です</p>";
} else {
    echo "<p>❌ JSON拡張が無効です</p>";
}

// ディレクトリ権限確認
echo "<h2>ディレクトリ確認</h2>";
$dirs = ['api', 'logs', 'assets', 'css', 'js'];
foreach ($dirs as $dir) {
    if (is_dir($dir)) {
        echo "<p>✅ {$dir} ディレクトリ存在</p>";
    } else {
        echo "<p>❌ {$dir} ディレクトリ不在</p>";
    }
}

echo "<h2>ファイル確認</h2>";
$files = ['api/chat.php', 'js/chat.js', 'css/style.css'];
foreach ($files as $file) {
    if (file_exists($file)) {
        echo "<p>✅ {$file} 存在</p>";
    } else {
        echo "<p>❌ {$file} 不在</p>";
    }
}
?>
