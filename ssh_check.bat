@echo off
echo ====================================
echo さくらVPS SSH接続テスト
echo ====================================
echo.
echo 1. 以下のコマンドでSSH接続を試してください:
echo    ssh username@tk2-411-46534.vs.sakura.ne.jp
echo.
echo 2. 接続できたら、以下のコマンドで現在の状況を確認:
echo    pwd
echo    ls -la
echo    which git
echo    git --version
echo.
echo 3. ai_chat_gameの場所を確認:
echo    find /home -name "ai_chat_game" -type d 2>/dev/null
echo    find /var/www -name "ai_chat_game" -type d 2>/dev/null
echo.
echo 4. 確認結果をメモして、チャットで教えてください
echo.
echo ====================================
pause
