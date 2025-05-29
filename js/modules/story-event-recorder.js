/**
 * Phase 3B: ストーリーイベント記録拡張
 */

// StoryUIの選択肢処理を拡張してイベント記録を追加
if (window.StoryUI) {
    const originalSelectChoice = StoryUI.prototype.selectChoice;
    
    StoryUI.prototype.selectChoice = function(choice) {
        // 元の処理を実行
        const result = this.storyManager.processChoice(
            this.currentCharacter, 
            this.currentChapter.id, 
            choice.id
        );

        if (!result) {
            console.error('❌ 選択肢の処理に失敗しました');
            return;
        }

        // ストーリーイベントを記録
        const storyContextManager = this.gameEngine.modules.storycontextmanager;
        if (storyContextManager) {
            storyContextManager.recordStoryEvent(this.currentCharacter, 'choice_made', {
                chapterId: this.currentChapter.id,
                choiceId: choice.id,
                choiceText: choice.text,
                intimacyChange: choice.effect?.intimacy || 0,
                flagSet: choice.effect?.flag
            });
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
            // エンディングイベントを記録
            if (storyContextManager) {
                storyContextManager.recordStoryEvent(this.currentCharacter, 'ending_achieved', {
                    ending: result.ending,
                    chapterId: this.currentChapter.id
                });
            }
            
            setTimeout(() => {
                this.showEnding(result.ending);
            }, 2000);
        } else {
            // 続行ボタンを表示
            document.getElementById('continue-story').style.display = 'inline-block';
        }

        // 親密度変化の通知
        if (choice.effect && choice.effect.intimacy) {
            this.showIntimacyChange(choice.effect.intimacy);
        }
    };
    
    console.log('📖 StoryUI選択肢処理拡張完了');
}

// チャプター完了イベントの記録
if (window.StoryUI) {
    const originalShowEnding = StoryUI.prototype.showEnding;
    
    StoryUI.prototype.showEnding = function(endingId) {
        // チャプター完了イベントを記録
        const storyContextManager = this.gameEngine.modules.storycontextmanager;
        if (storyContextManager) {
            storyContextManager.recordStoryEvent(this.currentCharacter, 'chapter_completed', {
                chapterId: this.currentChapter.id,
                title: this.currentChapter.title,
                endingId: endingId
            });
        }
        
        // 元の処理を実行
        originalShowEnding.call(this, endingId);
    };
}

console.log('🎮 Phase 3B: ストーリーイベント記録拡張完了');