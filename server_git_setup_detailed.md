# サーバー側 Git化手順

## 前提条件
- 場所: /var/www/html/ai_chat_game
- ユーザー: root
- Webサーバー: Apache (稼働中)

## Step 1: Gitインストール
```bash
yum update -y
yum install -y git
git --version
```

## Step 2: プロジェクトディレクトリに移動
```bash
cd /var/www/html/ai_chat_game
pwd
ls -la
```

## Step 3: 現状のバックアップ
```bash
# バックアップディレクトリ作成
cd /var/www/html/
cp -r ai_chat_game ai_chat_game_backup_$(date +%Y%m%d_%H%M%S)
ls -la ai_chat_game_backup*
```

## Step 4: Git設定
```bash
# Gitユーザー設定
git config --global user.name "Server Admin"
git config --global user.email "admin@your-domain.com"
git config --global init.defaultBranch main
```

## Step 5: Git初期化
```bash
cd /var/www/html/ai_chat_game
git init
git status
```

## Step 6: .gitignore作成（重要）
```bash
cat > .gitignore << 'EOF'
# サーバー用 .gitignore
api/config.php
api/config_local.php
logs/*.log
*.tmp
*.bak
.env
*.key
EOF
```

## Step 7: 現状をコミット
```bash
git add .
git status
git commit -m "サーバー環境の現状スナップショット"
git log --oneline
```

## Step 8: リモートリポジトリ設定
```bash
# GitHub リポジトリを作成後
git remote add origin https://github.com/USERNAME/ai_chat_game.git
git branch -M main
git remote -v
```

## Step 9: 最初のプッシュ
```bash
git push -u origin main
```

---

## 注意事項

### ファイル権限の維持
```bash
# Apache用権限設定
chown -R apache:apache /var/www/html/ai_chat_game
chmod -R 755 /var/www/html/ai_chat_game
chmod 644 /var/www/html/ai_chat_game/api/*.php
```

### 設定ファイルの保護
- `api/config.php` は .gitignore で除外
- 本番用設定は手動で管理
- 機密情報は絶対にコミットしない

### 今後のデプロイフロー
```bash
# サーバー側での更新
cd /var/www/html/ai_chat_game
git pull origin main
# 必要に応じて権限修正
chown -R apache:apache .
```
