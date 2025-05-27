# 🚀 本番サーバーGit化手順（さくらVPS用）

## 📋 事前確認
- SSH接続可能か？
- Gitがインストール済みか？
- ディレクトリへの書き込み権限は？

## 🛠️ サーバー側Git化手順

### 1. SSH接続
```bash
ssh your-username@tk2-411-46534.vs.sakura.ne.jp
```

### 2. プロジェクトディレクトリに移動
```bash
cd /home/your-username/www/ai_chat_game
# または
cd /var/www/html/ai_chat_game
```

### 3. 既存ファイルをバックアップ
```bash
cp -r ai_chat_game ai_chat_game_backup_$(date +%Y%m%d)
```

### 4. Git初期化
```bash
cd ai_chat_game
git init
git add .
git commit -m "本番環境の現在状態をコミット"
```

### 5. リモートリポジトリ設定（GitHub等）
```bash
git remote add origin https://github.com/your-username/ai_chat_game.git
git branch -M main
git push -u origin main
```

## 🔄 理想的なワークフロー

### ローカル開発
```bash
# 機能開発
git checkout -b feature/new-function
# 開発作業...
git add .
git commit -m "新機能追加"
git push origin feature/new-function
```

### 本番デプロイ
```bash
# サーバーにSSH接続
ssh your-username@server
cd /path/to/ai_chat_game

# 最新版を取得
git pull origin main

# 設定ファイルがあれば復元
cp ../config_backup/config.php api/config.php
```

## 🔧 設定ファイル管理

### .gitignore設定
```
# 本番用機密ファイル
api/config.php
.env
*.key
logs/*.log

# ローカル用ファイル
config_local.php
start_server.bat
```

### 環境別設定
- `config_local.php` → ローカル用
- `config_production.php` → 本番用テンプレート
- `config.php` → 実際の本番用（.gitignoreで除外）

## 🚨 注意事項

### 機密情報の扱い
1. APIキーは絶対にGitにコミットしない
2. 本番用設定は手動で配置
3. 環境変数または別ファイルで管理

### デプロイ時の手順
1. ローカルでテスト完了
2. GitHubにpush
3. サーバーでgit pull
4. 設定ファイル確認
5. 動作テスト

## 💡 さくらVPS特有の注意点

### ディレクトリ構造確認
```bash
ls -la /home/your-username/www/
# または
ls -la /var/www/html/
```

### Apache設定
- DocumentRootの確認
- .htaccessの権限確認
- PHP設定確認

### ファイル権限
```bash
chmod 755 ai_chat_game/
chmod 644 ai_chat_game/api/*.php
chmod 755 ai_chat_game/logs/
```

---

**次のステップ：サーバーのSSH情報を確認して、Git化を実行しましょう！**
