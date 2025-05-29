/**
 * ストーリーUI管理（基盤クラス）
 * ライトノベル風ストーリー表示システム
 */
class StoryUI {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.storyManager = null;
        this.currentCharacter = null;
        this.currentChapter = null;
        this.currentScene = 'opening';
        
        this.initializeUI();
        console.log('🎨 StoryUI 初期化完了');
    }

    /**
     * UI要素を初期化
     */
    initializeUI() {
        this.createStoryModal();
        this.addStoryStyles();
        this.bindEvents();
    }

    /**
     * ストーリーモーダルを作成
     */
    createStoryModal() {
        const modalHTML = `
        <div id="story-modal" class="modal">
            <div class="modal-content story-modal-content">
                <!-- ストーリーヘッダー -->
                <div class="story-header">
                    <div class="story-title">
                        <h2 id="story-title">ストーリータイトル</h2>
                        <p id="story-theme">テーマ</p>
                    </div>
                    <button class="close-story-btn">&times;</button>
                </div>

                <!-- チャプター選択画面 -->
                <div id="chapter-selection" class="story-screen">
                    <div class="chapter-list-container">
                        <h3>📖 章選択</h3>
                        <div id="chapter-list" class="chapter-list">
                            <!-- チャプター一覧がここに表示される -->
                        </div>
                        <div class="story-progress">
                            <div id="story-progress-bar" class="progress-bar">
                                <div class="progress-fill"></div>
                            </div>
                            <p id="progress-text">進行状況: 0%</p>
                        </div>
                    </div>
                </div>

                <!-- ストーリー読み画面 -->
                <div id="story-reading" class="story-screen" style="display: none;">
                    <div class="story-content">
                        <div class="chapter-header">
                            <h3 id="chapter-title">Chapter 1</h3>
                            <p id="chapter-description">章の説明</p>
                        </div>
                        
                        <div class="story-text-container">
                            <div id="story-text" class="story-text">
                                <!-- ストーリーテキストがここに表示される -->
                            </div>
                        </div>

                        <div class="story-choices" id="story-choices">
                            <!-- 選択肢がここに表示される -->
                        </div>

                        <div class="story-navigation">
                            <button id="back-to-chapters" class="nav-btn">📖 章選択に戻る</button>
                            <button id="continue-story" class="nav-btn" style="display: none;">続きを読む</button>
                        </div>
                    </div>
                </div>

                <!-- エンディング画面 -->
                <div id="ending-screen" class="story-screen" style="display: none;">
                    <div class="ending-content">
                        <div class="ending-header">
                            <h2 id="ending-title">エンディング達成！</h2>
                            <div class="ending-icon">🎭</div>
                        </div>
                        <div id="ending-description" class="ending-description">
                            エンディングの説明がここに表示されます
                        </div>
                        <div class="ending-actions">
                            <button id="return-to-chapters" class="nav-btn">章選択に戻る</button>
                            <button id="close-story" class="nav-btn">ストーリーを閉じる</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    /**
     * ストーリー専用スタイルを追加
     */
    addStoryStyles() {
        const style = document.createElement('style');
        style.textContent = `
        /* ストーリーモーダル */
        .story-modal-content {
            max-width: 800px;
            width: 95%;
            height: 85vh;
            max-height: 700px;
            padding: 0;
            border-radius: 12px;
            overflow: hidden;
        }

        .story-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .story-title h2 {
            margin: 0;
            font-size: 1.4em;
            font-weight: bold;
        }

        .story-title p {
            margin: 5px 0 0 0;
            opacity: 0.9;
            font-size: 0.9em;
        }

        .close-story-btn {
            background: none;
            border: none;
            color: white;
            font-size: 1.8em;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .story-screen {
            height: calc(100% - 70px);
            overflow-y: auto;
            padding: 20px;
        }

        /* チャプター選択 */
        .chapter-list-container h3 {
            margin-top: 0;
            color: #333;
            text-align: center;
        }

        .chapter-list {
            display: grid;
            gap: 10px;
            margin-bottom: 20px;
        }

        .chapter-item {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        }

        .chapter-item:hover:not(.locked) {
            border-color: #667eea;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
            transform: translateY(-1px);
        }

        .chapter-item.locked {
            background: #f5f5f5;
            border-color: #ccc;
            cursor: not-allowed;
            opacity: 0.6;
        }

        .chapter-item.completed {
            border-color: #4caf50;
            background: linear-gradient(135deg, #f8fff8 0%, #e8f5e8 100%);
        }

        .chapter-item h4 {
            margin: 0 0 5px 0;
            color: #333;
            font-size: 1.1em;
        }

        .chapter-item p {
            margin: 0;
            color: #666;
            font-size: 0.9em;
        }

        .chapter-status {
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 1.2em;
        }

        /* ストーリー進行バー */
        .story-progress {
            text-align: center;
            margin-top: 20px;
        }

        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 10px;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 4px;
            transition: width 0.3s ease;
            width: 0%;
        }

        #progress-text {
            margin: 0;
            color: #666;
            font-size: 0.9em;
        }

        /* ストーリー読み画面 */
        .chapter-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e0e0e0;
        }

        .chapter-header h3 {
            margin: 0 0 5px 0;
            color: #333;
            font-size: 1.3em;
        }

        .chapter-header p {
            margin: 0;
            color: #666;
            font-style: italic;
        }

        .story-text-container {
            margin-bottom: 25px;
        }

        .story-text {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            line-height: 1.7;
            color: #333;
            font-size: 1.05em;
            white-space: pre-line;
            min-height: 200px;
        }

        /* 選択肢 */
        .story-choices {
            margin-bottom: 20px;
        }

        .choice-item {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }

        .choice-item:hover:not(.disabled) {
            border-color: #667eea;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
            transform: translateY(-1px);
        }

        .choice-item.disabled {
            background: #f5f5f5;
            border-color: #ccc;
            cursor: not-allowed;
            opacity: 0.6;
        }

        .choice-item.selected {
            border-color: #4caf50;
            background: linear-gradient(135deg, #f8fff8 0%, #e8f5e8 100%);
        }

        /* ナビゲーション */
        .story-navigation {
            display: flex;
            gap: 10px;
            justify-content: center;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
        }

        .nav-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9em;
            transition: all 0.3s ease;
        }

        .nav-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
        }

        /* エンディング画面 */
        .ending-content {
            text-align: center;
            padding: 40px 20px;
        }

        .ending-header {
            margin-bottom: 30px;
        }

        .ending-header h2 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 1.8em;
        }

        .ending-icon {
            font-size: 3em;
            margin: 10px 0;
        }

        .ending-description {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #4caf50;
            margin-bottom: 30px;
            line-height: 1.6;
            color: #333;
        }

        .ending-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
        }

        /* レスポンシブ対応 */
        @media (max-width: 600px) {
            .story-modal-content {
                width: 98%;
                height: 90vh;
            }
            
            .story-screen {
                padding: 15px;
            }
            
            .story-navigation {
                flex-direction: column;
            }
            
            .ending-actions {
                flex-direction: column;
            }
        }
        `;
        document.head.appendChild(style);
    }

    /**
     * イベントをバインド
     */
    bindEvents() {
        // モーダル閉じる
        document.querySelector('.close-story-btn').addEventListener('click', () => {
            this.closeStory();
        });

        // 章選択に戻る
        document.getElementById('back-to-chapters').addEventListener('click', () => {
            this.showChapterSelection();
        });

        // ストーリーを閉じる
        document.getElementById('close-story').addEventListener('click', () => {
            this.closeStory();
        });

        // 章選択に戻る（エンディングから）
        document.getElementById('return-to-chapters').addEventListener('click', () => {
            this.showChapterSelection();
        });
    }

    // 基本メソッド（拡張ファイルで実装される）
    startStory(characterId) {
        console.log(`📚 ストーリー開始: ${characterId}`);
    }

    showChapterSelection() {
        console.log('📖 チャプター選択表示');
    }

    closeStory() {
        const modal = document.getElementById('story-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        console.log('📚 ストーリー終了');
    }
}

// グローバルに公開
window.StoryUI = StoryUI;
console.log('🎨 StoryUI 基盤クラス定義完了');