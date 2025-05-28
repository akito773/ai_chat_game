@echo off
echo ========================================
echo  AIチャットゲーム - XAMPP配置スクリプト
echo ========================================
echo.

REM XAMPPのhtdocsディレクトリに移動
set XAMPP_DIR=c:\xampp2
set HTDOCS_DIR=%XAMPP_DIR%\htdocs
set GAME_DIR=%HTDOCS_DIR%\ai_chat_game

echo 📁 XAMPP Directory: %XAMPP_DIR%
echo 📁 htdocs Directory: %HTDOCS_DIR%
echo 📁 Game Directory: %GAME_DIR%
echo.

REM XAMPPディレクトリの確認
if not exist "%XAMPP_DIR%" (
    echo ❌ エラー: XAMPPが見つかりません
    echo 💡 XAMPPがc:\xampp2以外にインストールされている場合は、
    echo    手動でファイルをコピーしてください
    pause
    exit /b 1
)

echo ✅ XAMPP確認完了
echo.

REM htdocsディレクトリの確認
if not exist "%HTDOCS_DIR%" (
    echo ❌ エラー: htdocsディレクトリが見つかりません
    pause
    exit /b 1
)

echo ✅ htdocs確認完了
echo.

REM 既存のゲームディレクトリを削除（更新のため）
if exist "%GAME_DIR%" (
    echo 🗑️  既存のゲームディレクトリを削除中...
    rmdir /s /q "%GAME_DIR%"
)

REM ゲームディレクトリを作成
echo 📂 ゲームディレクトリを作成中...
mkdir "%GAME_DIR%"

REM ファイルをコピー
echo 📋 ファイルをコピー中...
echo.

copy "%~dp0index.html" "%GAME_DIR%\" >nul
echo ✅ index.html コピー完了

copy "%~dp0setup_complete.html" "%GAME_DIR%\" >nul
echo ✅ setup_complete.html コピー完了

copy "%~dp0test.html" "%GAME_DIR%\" >nul
echo ✅ test.html コピー完了

copy "%~dp0troubleshoot.html" "%GAME_DIR%\" >nul
echo ✅ troubleshoot.html コピー完了

copy "%~dp0gpt4o_mini_update.html" "%GAME_DIR%\" >nul
echo ✅ gpt4o_mini_update.html コピー完了

copy "%~dp0README.md" "%GAME_DIR%\" >nul
echo ✅ README.md コピー完了

REM フォルダをコピー
echo 📁 フォルダをコピー中...
xcopy /E /I /Q "%~dp0css" "%GAME_DIR%\css" >nul
echo ✅ css フォルダ コピー完了

xcopy /E /I /Q "%~dp0js" "%GAME_DIR%\js" >nul
echo ✅ js フォルダ コピー完了

xcopy /E /I /Q "%~dp0api" "%GAME_DIR%\api" >nul
echo ✅ api フォルダ コピー完了

xcopy /E /I /Q "%~dp0assets" "%GAME_DIR%\assets" >nul
echo ✅ assets フォルダ コピー完了

xcopy /E /I /Q "%~dp0logs" "%GAME_DIR%\logs" >nul
echo ✅ logs フォルダ コピー完了

echo.
echo 🎉 コピー完了！
echo.
echo 🌐 ブラウザで以下のURLにアクセスしてください:
echo http://localhost/ai_chat_game/
echo.
echo 🔧 テストページ:
echo http://localhost/ai_chat_game/test.html
echo.
echo 💡 XAMPPのApacheが起動していることを確認してください
echo.
pause
