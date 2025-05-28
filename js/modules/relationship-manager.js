requiredChapters) {
                if (!completedChapters.includes(requiredChapter)) {
                    canAchieve = false;
                    break;
                }
            }
            
            // フラグチェック
            for (const requiredFlag of conditions.requiredFlags) {
                if (!eventFlags[requiredFlag] || !eventFlags[requiredFlag].value) {
                    canAchieve = false;
                    break;
                }
            }
            
            if (canAchieve) {
                availableEndings.push(endingType);
            }
        }
        
        return availableEndings;
    }

    /**
     * 関係性データの保存
     */
    saveRelationships() {
        this.gameEngine.updateGameState({ relationships: this.relationships });
    }

    /**
     * 関係性データのリセット
     */
    resetRelationship(characterId) {
        delete this.relationships[characterId];
        this.saveRelationships();
        console.log(`🔄 ${characterId}の関係性をリセットしました`);
    }

    /**
     * デバッグ用情報表示
     */
    debugRelationshipInfo(characterId = null) {
        if (characterId) {
            const relationship = this.relationships[characterId];
            console.log(`💕 ${characterId} 関係性情報:`);
            console.log('- 親密度:', relationship?.intimacy || 0);
            console.log('- レベル:', relationship?.intimacyName || '未初期化');
            console.log('- 会話回数:', relationship?.totalInteractions || 0);
        } else {
            console.log('💕 全関係性情報:');
            console.log('- 登録キャラ数:', Object.keys(this.relationships).length);
            for (const [charId, rel] of Object.entries(this.relationships)) {
                console.log(`  ${charId}: ${rel.intimacy} (${rel.intimacyName})`);
            }
        }
    }
}

// グローバルに登録
window.RelationshipManager = RelationshipManager;