/**
 * ストーリーUI管理 - 続き
 */

// StoryUIクラスの続きのメソッドを追加
Object.assign(StoryUI.prototype, {
    /**
     * ストーリーを開始
     */
    startStory(characterId) {
        this.storyManager = this.gameEngine.modules.storymanager;
        if (!this.storyManager) {
            console.error('❌ StoryManager が見つかりません');
            return;
        }

        this.currentCharacter = characterId;
        const storyData = window.StoryData[characterId];
        
        if (!storyData) {
            console.error(`❌ ${characterId}のストーリーデータが見つかりません`);
            return;
        }

        // ストーリー情報を設定
        document.getElementById('story-title').textContent = storyData.title;
        document.getElementById('story-theme').textContent = storyData.theme;

        // チャプター選択画面を表示
        this.showChapterSelection();
        
        // モーダルを表示
        document.getElementById('story-modal').style.display = 'block';
        
        console.log(`📖 ${characterId}のストーリー開始`);
    },

    /**
     * チャプター選択画面を表示
     */
    showChapterSelection() {
        // 画面切り替え
        document.getElementById('chapter-selection').style.display = 'block';
        document.getElementById('story-reading').style.display = 'none';
        document.getElementById('ending-screen').style.display = 'none';

        // チャプター一覧を更新
        this.updateChapterList();
        
        // 進行状況を更新
        this.updateProgress();
    },

    /**
     * チャプター一覧を更新
     */
    updateChapterList() {
        const chapterList = document.getElementById('chapter-list');
        chapterList.innerHTML = '';

        const availableChapters = this.storyManager.getAvailableChapters(this.currentCharacter);
        const storyData = window.StoryData[this.currentCharacter];

        // 全チャプターをチェック
        for (let i = 1; i <= storyData.totalChapters; i++) {
            const isUnlocked = this.storyManager.isChapterUnlocked(this.currentCharacter, i);
            const isCompleted = this.storyManager.isChapterCompleted(this.currentCharacter, i);
            const chapter = storyData.chapters[i];

            if (!chapter) continue;

            const chapterItem = document.createElement('div');
            chapterItem.className = `chapter-item ${!isUnlocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`;
            
            let statusIcon = '🔒';
            if (isUnlocked) statusIcon = isCompleted ? '✅' : '📖';

            chapterItem.innerHTML = `
                <div class="chapter-status">${statusIcon}</div>
                <h4>Chapter ${i}: ${chapter.title}</h4>
                <p>${chapter.description}</p>
            `;

            // クリックイベント
            if (isUnlocked) {
                chapterItem.addEventListener('click', () => {
                    this.startChapter(i);
                });
            }

            chapterList.appendChild(chapterItem);
        }
    },

    /**
     * 進行状況を更新
     */
    updateProgress() {
        const storyData = window.StoryData[this.currentCharacter];
        const totalChapters = storyData.totalChapters;
        let completedCount = 0;

        for (let i = 1; i <= totalChapters; i++) {
            if (this.storyManager.isChapterCompleted(this.currentCharacter, i)) {
                completedCount++;
            }
        }

        const progressPercentage = Math.round((completedCount / totalChapters) * 100);
        
        document.querySelector('.progress-fill').style.width = `${progressPercentage}%`;
        document.getElementById('progress-text').textContent = `進行状況: ${progressPercentage}% (${completedCount}/${totalChapters}章完了)`;
    },

    /**
     * チャプターを開始
     */
    startChapter(chapterId) {
        const chapter = this.storyManager.getChapter(this.currentCharacter, chapterId);
        if (!chapter) {
            console.error(`❌ Chapter ${chapterId} が見つかりません`);
            return;
        }

        this.currentChapter = chapter;
        this.currentScene = 'opening';

        // 画面切り替え
        document.getElementById('chapter-selection').style.display = 'none';
        document.getElementById('story-reading').style.display = 'block';
        document.getElementById('ending-screen').style.display = 'none';

        // チャプター情報を設定
        document.getElementById('chapter-title').textContent = `Chapter ${chapterId}: ${chapter.title}`;
        document.getElementById('chapter-description').textContent = chapter.description;

        // オープニングシーンを表示
        this.displayScene('opening');

        console.log(`📖 Chapter ${chapterId} 開始`);
    },

    /**
     * シーンを表示
     */
    displayScene(sceneKey) {
        const content = this.currentChapter.content;
        let sceneText = '';
        let choices = [];

        // シーンテキストを取得
        if (sceneKey === 'opening') {
            sceneText = content.opening;
            if (content.scene1) {
                sceneText += '\n\n' + content.scene1;
            }
            choices = content.choices || [];
        } else if (content[sceneKey]) {
            sceneText = content[sceneKey];
        }

        // 最終選択肢をチェック
        if (content.final_choice && sceneKey === 'final') {
            choices = content.final_choice;
        }

        // テキストを表示
        document.getElementById('story-text').textContent = sceneText;

        // 選択肢を表示
        this.displayChoices(choices);

        // スクロールを上部に
        document.getElementById('story-reading').scrollTop = 0;
    },

    /**
     * 選択肢を表示
     */
    displayChoices(choices) {
        const choicesContainer = document.getElementById('story-choices');
        choicesContainer.innerHTML = '';

        if (!choices || choices.length === 0) {
            // 選択肢がない場合は続行ボタンを表示
            document.getElementById('continue-story').style.display = 'inline-block';
            return;
        }

        choices.forEach(choice => {
            const choiceItem = document.createElement('div');
            choiceItem.className = 'choice-item';

            // 選択肢の条件をチェック
            const canSelect = !choice.condition || 
                this.storyManager.checkChoiceCondition(this.currentCharacter, choice.condition);

            if (!canSelect) {
                choiceItem.classList.add('disabled');
            }

            choiceItem.textContent = choice.text;

            // クリックイベント
            if (canSelect) {
                choiceItem.addEventListener('click', () => {
                    this.selectChoice(choice);
                });
            }

            choicesContainer.appendChild(choiceItem);
        });

        // 続行ボタンを隠す
        document.getElementById('continue-story').style.display = 'none';
    },

    /**
     * 選択肢を選択
     */
    selectChoice(choice) {
        // 選択肢を処理
        const result = this.storyManager.processChoice(
            this.currentCharacter, 
            this.currentChapter.id, 
            choice.id
        );

        if (!result) {
            console.error('❌ 選択肢の処理に失敗しました');
            return;
        }

        // 選択された選択肢をハイライト
        document.querySelectorAll('.choice-item').forEach(item => {
            item.classList.remove('selected');
            if (item.textContent === choice.text) {
                item.classList.add('selected');
            }
        });

        // レスポンステキストを表示
        const currentText = document.getElementById('story-text').textContent;
        document.getElementById('story-text').textContent = currentText + '\n\n' + result.response;

        // 選択肢を無効化
        document.querySelectorAll('.choice-item').forEach(item => {
            item.style.pointerEvents = 'none';
            item.style.opacity = '0.7';
        });

        // エンディングチェック
        if (result.ending) {
            setTimeout(() => {
                this.showEnding(result.ending);
            }, 2000);
        } else {
            // 続行ボタンを表示
            document.getElementById('continue-story').style.display = 'inline-block';
        }

        // 親密度変更の通知
        if (choice.effect && choice.effect.intimacy) {
            this.showIntimacyChange(choice.effect.intimacy);
        }
    },

    /**
     * 親密度変更を表示
     */
    showIntimacyChange(change) {
        const notification = document.createElement('div');
        notification.className = 'intimacy-notification';
        notification.textContent = `💕 親密度 ${change > 0 ? '+' : ''}${change}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #ff6b6b, #ee5a52);
            color: white;
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            z-index: 10001;
            animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2s forwards;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2500);
    },

    /**
     * エンディング画面を表示
     */
    showEnding(endingId) {
        const storyData = window.StoryData[this.currentCharacter];
        const ending = storyData.endings[endingId];

        if (!ending) {
            console.error(`❌ エンディング ${endingId} が見つかりません`);
            return;
        }

        // 画面切り替え
        document.getElementById('chapter-selection').style.display = 'none';
        document.getElementById('story-reading').style.display = 'none';
        document.getElementById('ending-screen').style.display = 'block';

        // エンディング情報を設定
        document.getElementById('ending-title').textContent = ending.title;
        document.getElementById('ending-description').textContent = ending.description;

        // チャプターを完了マーク
        this.storyManager.markChapterCompleted(this.currentCharacter, this.currentChapter.id);

        console.log(`🎭 エンディング達成: ${ending.title}`);
    },

    /**
     * ストーリーを閉じる
     */
    closeStory() {
        document.getElementById('story-modal').style.display = 'none';
        this.currentCharacter = null;
        this.currentChapter = null;
        this.currentScene = 'opening';
        
        console.log('📚 ストーリー終了');
    }
});

// アニメーション用CSS追加
const animationStyle = document.createElement('style');
animationStyle.textContent = `
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes fadeOut {
    from {
        opacity: 1;
    }
    to {
        opacity: 0;
    }
}
`;
document.head.appendChild(animationStyle);

// グローバルに公開
window.StoryUI = StoryUI;
console.log('🎨 StoryUI 完全定義完了');