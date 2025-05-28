# さくらVPS Git インストール手順

## CentOS/RHEL系の場合
```bash
# パッケージ更新
sudo yum update -y

# Git インストール
sudo yum install -y git

# バージョン確認
git --version
```

## Ubuntu/Debian系の場合
```bash
# パッケージ更新
sudo apt update

# Git インストール
sudo apt install -y git

# バージョン確認
git --version
```

## 基本設定
```bash
# ユーザー情報設定
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 設定確認
git config --list
```

## 権限確認
```bash
# 現在のユーザー確認
whoami

# ai_chat_game ディレクトリの権限確認
ls -la /path/to/ai_chat_game/

# 必要に応じて権限変更
chmod 755 /path/to/ai_chat_game/
```
