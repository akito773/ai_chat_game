# 🚀 AIチャットゲーム サーバーアップロード手順

## 📋 アップロード前チェックリスト

### ✅ 必要な準備
- [ ] OpenAI APIキー（本番用）取得済み
- [ ] ドメイン名決定済み
- [ ] SSL証明書設定済み
- [ ] FTPアクセス情報確認済み

---

## 🛠️ ステップ1: ファイル準備

### A. 設定ファイルの変更
1. **`config_production.php` を `config.php` にリネーム**
2. **YOUR_PRODUCTION_OPENAI_API_KEY_HERE** を実際のAPIキーに変更
3. **yourdomain.com** を実際のドメインに変更

```php
// 例
define('API_KEY', 'sk-proj-abcd1234...');
$allowed_origins = [
    'https://mychatgame.com',
    'https://www.mychatgame.com'
];
```

### B. ディレクトリ構造確認
```
ai_chat_game/
├── .htaccess           ★ セキュリティ設定
├── api/
│   ├── chat.php
│   └── config.php      ★ 本番用設定
├── assets/images/      ★ キャラクター画像
├── characters/         ★ キャラクター設定
├── css/
├── js/
├── logs/               ★ 空ディレクトリでOK
├── index.html
└── multi_character.html ★ メインページ
```

---

## 📤 ステップ2: ファイルアップロード

### FTPソフト推奨設定
- **転送モード**: バイナリ
- **文字エンコード**: UTF-8
- **権限自動設定**: 有効

### アップロード手順
1. **ルートディレクトリに ai_chat_game フォルダをアップロード**
2. **ファイル権限を設定**:
   ```
   ディレクトリ: 755
   PHPファイル: 644
   HTMLファイル: 644
   ```

---

## ⚙️ ステップ3: サーバー設定

### A. 権限設定（SSH接続時）
```bash
# ディレクトリ権限
chmod 755 ai_chat_game/
chmod 755 ai_chat_game/logs/
chmod 755 ai_chat_game/assets/

# ファイル権限
chmod 644 ai_chat_game/api/config.php
chmod 644 ai_chat_game/*.html
chmod 644 ai_chat_game/.htaccess
```

### B. PHP設定確認
共有サーバーの場合、以下が有効か確認：
- cURL拡張
- JSON拡張
- mbstring拡張
- allow_url_fopen

---

## 🧪 ステップ4: 動作テスト

### A. 基本接続テスト
```
https://yourdomain.com/ai_chat_game/multi_character.html
```

### B. API動作テスト
1. **F12**で開発者ツールを開く
2. **Console**タブでエラーがないか確認
3. **Network**タブでAPI呼び出しの状況確認

### C. 各キャラクターテスト
- さくらちゃん: 関西弁風の応答
- アキラちゃん: 知的で丁寧な応答
- ユキちゃん: お嬢様言葉の応答
- リコちゃん: 元気なスポーツ系応答

---

## 💰 ステップ5: コスト管理設定

### OpenAI管理画面での設定
1. **https://platform.openai.com/usage** にアクセス
2. **「Usage limits」**で月間制限を設定（推奨: $5-10）
3. **通知設定**で80%時点でアラート設定

### 使用量監視
- `logs/api_usage.log` で使用状況を定期確認
- 異常なアクセスパターンの監視

---

## 🔒 ステップ6: セキュリティ確認

### A. アクセステスト
以下のURLに直接アクセスできないことを確認：
- `https://yourdomain.com/ai_chat_game/api/config.php`
- `https://yourdomain.com/ai_chat_game/logs/`
- `https://yourdomain.com/ai_chat_game/characters/characters.json`

### B. HTTPS確認
- すべてのページがHTTPS接続されていること
- 混在コンテンツ（HTTP）がないこと

---

## 🚨 トラブルシューティング

### よくある問題と解決法

#### 1. 500エラー（Internal Server Error）
**原因**: ファイル権限またはPHP構文エラー
**解決法**:
```bash
chmod 644 ai_chat_game/api/config.php
chmod 755 ai_chat_game/logs/
```

#### 2. CORS エラー
**原因**: ドメイン設定ミス
**解決法**: `config.php`の`$allowed_origins`を確認

#### 3. APIキーエラー
**原因**: APIキーが間違っているか期限切れ
**解決法**: OpenAI管理画面で新しいキーを生成

#### 4. キャラクターが表示されない
**原因**: 画像ファイルまたはJSONファイルのパス問題
**解決法**: ファイル名と拡張子を確認

---

## 📊 運用開始後の監視項目

### 日次チェック
- [ ] サイトの正常動作確認
- [ ] エラーログの確認
- [ ] API使用量の確認

### 週次チェック
- [ ] パフォーマンスの確認
- [ ] セキュリティアップデートの確認
- [ ] ユーザーフィードバックの確認

### 月次チェック
- [ ] APIコストの分析
- [ ] 機能改善の検討
- [ ] バックアップの確認

---

## 🎯 成功指標

### 技術指標
- ✅ サイトの表示速度 < 3秒
- ✅ API応答時間 < 5秒
- ✅ エラー率 < 5%
- ✅ 月間APIコスト < 設定制限

### ユーザー指標
- ✅ キャラクター切り替えが正常動作
- ✅ 各キャラクターの個性が表現される
- ✅ スマートフォンでも利用可能

---

**🚀 準備ができたら、ステップ1から順番に進めてください！**
**何か問題が発生したら、具体的なエラーメッセージを教えてください。**