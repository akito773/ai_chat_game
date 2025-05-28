# 🎨 AIキャラクター画像生成プロンプト集

## 📋 共通スタイル指定
```
Style: Anime/manga style, high quality digital art, clean lines, vibrant colors, 
School uniform setting, portrait style (upper body), 16-17 years old Japanese high school girl,
Background: Simple gradient or school setting, soft lighting
```

---

## 🌸 さくらちゃん (sakura.png)

### **基本設定**
- **性格**: 元気いっぱいの学園アイドル
- **髪色**: ピンク〜桜色
- **目の色**: 明るいピンク
- **特徴**: 明るい笑顔、可愛らしい

### **画像生成プロンプト**
```
A cheerful Japanese high school girl with pink hair in twin tails, bright pink eyes, 
wearing a cute school uniform (white blouse, pink ribbon, navy skirt), 
big bright smile, idol-like pose with one hand making a peace sign, 
cherry blossom petals floating around, anime style, high quality, 
vibrant colors, school background, soft lighting, very cute and energetic expression
```

### **ネガティブプロンプト**
```
sad expression, dark colors, messy hair, inappropriate clothing, 
adult appearance, realistic style, low quality
```

---

## 📚 アキラちゃん (akira.png)

### **基本設定**
- **性格**: クールで知的な図書委員長
- **髪色**: 黒髪〜ダークブルー
- **目の色**: 深いブルー
- **特徴**: 眼鏡、落ち着いた表情、本

### **画像生成プロンプト**
```
A cool and intelligent Japanese high school girl with long dark blue hair, 
deep blue eyes, wearing glasses, school uniform (white blouse, blue tie, navy skirt), 
holding a book, serious but gentle expression, library background, 
anime style, high quality, cool color palette, soft lighting, 
intellectual and elegant appearance
```

### **ネガティブプロンプト**
```
overly cheerful expression, bright flashy colors, messy appearance, 
inappropriate clothing, childish pose, low quality
```

---

## ❄️ ユキちゃん (yuki.png)

### **基本設定**
- **性格**: 天然で癒し系のお嬢様
- **髪色**: 銀白〜薄いブルー
- **目の色**: 淡いブルー
- **特徴**: 上品、ゆったりした雰囲気

### **画像生成プロンプト**
```
An elegant Japanese high school girl with long silver-white hair with light blue highlights, 
pale blue eyes, wearing an elegant school uniform (white blouse with lace details, 
light blue ribbon, navy skirt), gentle and dreamy expression, 
graceful pose with hands clasped, winter/snow theme background, 
anime style, high quality, soft pastel colors, ethereal lighting, 
noble and serene appearance
```

### **ネガティブプロンプト**
```
energetic expression, loud colors, casual pose, messy hair, 
inappropriate clothing, aggressive appearance, low quality
```

---

## ⚽ リコちゃん (riko.png)

### **基本設定**
- **性格**: 元気な体育会系スポーツ少女
- **髪色**: オレンジ〜赤茶色
- **目の色**: 明るいオレンジ
- **特徴**: スポーティ、元気、健康的

### **画像生成プロンプト**
```
An energetic Japanese high school girl with short orange-red hair in a sporty style, 
bright orange eyes, wearing a school uniform (white blouse, orange/red tie, navy skirt) 
or sports uniform, confident and bright smile, athletic pose with fist raised, 
soccer ball nearby, school sports ground background, 
anime style, high quality, warm energetic colors, bright lighting, 
healthy and athletic appearance
```

### **ネガティブプロンプト**
```
tired expression, pale colors, formal pose, long elaborate hair, 
overly feminine appearance, indoor setting only, low quality
```

---

## 🎯 生成時の推奨設定

### **共通パラメータ**
- **アスペクト比**: 1:1 または 3:4（ポートレート）
- **品質**: High/Maximum
- **ステップ数**: 50-80
- **サイズ**: 512x512 または 768x1024

### **推奨AI生成ツール**
- Stable Diffusion (AUTOMATIC1111)
- Midjourney
- NovelAI
- Waifu Diffusion

### **保存形式**
- PNG形式（透明度対応）
- サイズ: 200x220px（表示用にリサイズ）
- 保存場所: `C:\xampp2\htdocs\ai_chat_game\assets\images\`

---

## 📱 各キャラクターの期待される外見

| キャラ | 髪型 | 髪色 | 目の色 | 特徴 | テーマカラー |
|--------|------|------|--------|------|-------------|
| さくら | ツインテール | ピンク | ピンク | アイドル風、元気 | #ff69b4 |
| アキラ | ロング | ダークブルー | ブルー | 眼鏡、知的 | #4169e1 |
| ユキ | ロング | シルバー | 淡いブルー | 上品、癒し系 | #87ceeb |
| リコ | ショート | オレンジ | オレンジ | スポーティ | #ff4500 |

---

## 🔧 技術的な注意点

### **ファイル命名規則**
- `sakura.png` - さくらちゃん
- `akira.png` - アキラちゃん  
- `yuki.png` - ユキちゃん
- `riko.png` - リコちゃん

### **画像要件**
- **解像度**: 最低 512x512px
- **フォーマット**: PNG（透明背景推奨）
- **ファイルサイズ**: 1MB以下
- **背景**: 透明または単色グラデーション

### **配置方法**
1. 生成した画像を上記ファイル名で保存
2. `assets/images/` フォルダに配置
3. ブラウザで確認: `http://localhost:8080/ai_chat_game/multi_character.html`

---

## 🎨 カスタマイズのヒント

### **さらなる個性化**
- **アクセサリー**: 各キャラに特徴的な小物を追加
- **表情バリエーション**: 笑顔、困り顔、驚き顔など
- **季節感**: 制服のアレンジ、背景の変更
- **ポーズ**: キャラクターらしいジェスチャー

### **品質向上のコツ**
1. **複数枚生成**: 気に入った表情が出るまで試行
2. **細部調整**: 目の輝き、髪の流れに注意
3. **色彩調整**: テーマカラーとの統一感
4. **背景処理**: キャラクターが映える背景選択

これらのプロンプトを使用して、各キャラクターの個性が伝わる素敵な画像を作成してください！