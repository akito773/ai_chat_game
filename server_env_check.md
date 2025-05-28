# さくらVPS環境確認コマンド集

## 1. 基本環境確認
```bash
# 現在の場所とユーザー確認
pwd
whoami
uname -a

# Git環境確認
which git
git --version

# Python環境確認（念のため）
which python3
python3 --version
```

## 2. ai_chat_gameディレクトリ探索
```bash
# 一般的な場所を確認
ls -la /home/
ls -la /var/www/
ls -la /var/www/html/

# ai_chat_gameを探す
find /home -name "ai_chat_game" -type d 2>/dev/null
find /var/www -name "ai_chat_game" -type d 2>/dev/null
find /usr/local -name "ai_chat_game" -type d 2>/dev/null

# Webサーバーのドキュメントルート確認
ls -la /var/www/html/
```

## 3. 権限とファイル確認
```bash
# ai_chat_gameが見つかったら、そのディレクトリで
cd /path/to/ai_chat_game/
ls -la

# 重要ファイルの存在確認
ls -la api/
ls -la api/config.php
ls -la index.html
ls -la multi_character.html
```

## 4. Webサーバー設定確認
```bash
# Apacheの場合
httpd -v
systemctl status httpd

# Nginxの場合
nginx -v
systemctl status nginx

# PHP確認
php --version
which php
```

## 5. Git初期化準備確認
```bash
# 現在のGit状況（.gitディレクトリがあるかチェック）
ls -la .git

# 書き込み権限確認
touch test_write.tmp
rm test_write.tmp
```

---

**これらの結果を教えてください。特に重要な情報：**
1. `ai_chat_game`ディレクトリの正確なパス
2. Git がインストール済みかどうか
3. そのディレクトリでの書き込み権限の有無
4. 現在動いているWebサーバーの種類
