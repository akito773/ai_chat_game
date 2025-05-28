@echo off
echo ====================================
echo 本番環境からローカルへの同期準備
echo ====================================
echo.
echo 1. 本番サーバーから最新ファイルをダウンロードしてください
echo    URL: http://tk2-411-46534.vs.sakura.ne.jp/ai_chat_game/
echo.
echo 2. ダウンロード後、このフォルダと比較してください
echo    差分があるファイルを手動で更新してください
echo.
echo 3. 更新完了後、以下のコマンドを実行してください：
echo    git add .
echo    git commit -m "本番環境から同期: [修正内容の説明]"
echo.
echo ====================================
pause
