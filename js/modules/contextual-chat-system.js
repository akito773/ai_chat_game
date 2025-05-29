/**
 * コンテキスト対応チャットシステム
 * ストーリー進行に応じた動的応答生成
 */
class ContextualChatSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.storyContextManager = null;
        this.responseTemplates = {};
        
        this.initializeResponseTemplates();
        console.log('💬 ContextualChatSystem 初期化');
    }

    /**
     * 初期化
     */
    initialize() {
        this.storyContextManager = this.gameEngine.modules.storycontextmanager;
        
        if (!this.storyContextManager) {
            console.warn('⚠️ StoryContextManager が見つかりません');
            return false;
        }
        
        console.log('✅ ContextualChatSystem 初期化完了');
        return true;
    }

    /**
     * 応答テンプレートを初期化
     */
    initializeResponseTemplates() {
        this.responseTemplates = {
            sakura: {
                // 基本応答
                default: [
                    'わ〜！{message}ですね♪ とっても嬉しいです✨',
                    'えへへ〜！{message}って言ってくれるんですね💕',
                    'きゃー！{message}なんて、素敵ですね〜♪'
                ],
                
                // ストーリー進行別応答
                chapter_aware: {
                    1: [
                        'あの...学園祭のこと覚えてくれてますか？💕',
                        '一人で練習してた時のこと、恥ずかしかったです〜'
                    ],
                    2: [
                        'お母さんのお話をした時...聞いてくれてありがとうございました',
                        '家族のことって、なかなか話しにくいんですけど...'
                    ],
                    3: [
                        'あの時は...本当に落ち込んでました😢',
                        '支えてくれたから、また頑張れたんです'
                    ]
                },
                
                // フラグ別応答
                flag_responses: {
                    'praised_singing': [
                        '歌を褒めてくれた時のこと、今でも覚えてます♪',
                        'あなたが「素敵」って言ってくれたから、自信が持てたんです'
                    ],
                    'supported_dream': [
                        '夢を応援してくれて...本当にありがとうございます💕',
                        'あなたがいてくれるから、頑張れるんです'
                    ],
                    'became_friends': [
                        '友達になってくれて、とっても嬉しいです♪',
                        '一緒にいると、安心するんです〜'
                    ]
                },
                
                // 話題別応答
                topic_responses: {
                    '音楽': [
                        '音楽のお話ですね♪ 私、音楽が大好きなんです！',
                        '今度一緒に音楽を聞きませんか？'
                    ],
                    '家族': [
                        'お母さんのこと...前にお話ししましたよね',
                        '家族って、大切ですよね💕'
                    ],
                    '夢': [
                        '私の夢...覚えてくれてるんですか？',
                        'アイドルになる夢、まだ諦めてません！'
                    ]
                }
            },

            misaki: {
                // 基本応答
                default: [
                    'そうですね...{message}について、考えてみました',
                    '{message}というお話、とても興味深いです',
                    'あなたのお話を聞いていると...心が落ち着きます'
                ],
                
                // ストーリー進行別応答
                chapter_aware: {
                    1: [
                        '図書館で初めてお会いした時のこと...覚えています',
                        'あの静かな午後...今でも大切な思い出です'
                    ],
                    2: [
                        '古典文学のお話をした時...同じ趣味だと分かって嬉しかったです',
                        '文学について語れる方は...なかなかいらっしゃらないので'
                    ],
                    3: [
                        'あの雨の日...辛い過去をお話ししました',
                        'あなたに話せて...少し楽になりました'
                    ]
                },
                
                // フラグ別応答
                flag_responses: {
                    'interested_in_books': [
                        '本に興味を持ってくださって...嬉しいです',
                        '一緒に図書館に行きませんか？'
                    ],
                    'promised_protection': [
                        'あの時...「守ってくれる」と言ってくださって',
                        '初めて安心できると思えました'
                    ],
                    'became_friends': [
                        '生まれて初めて...本当の友達ができました',
                        'あなたとの友情は...私の宝物です'
                    ]
                },
                
                // 話題別応答
                topic_responses: {
                    '本': [
                        '本のお話ですね...私の一番好きな話題です',
                        '最近はどんな本をお読みになりますか？'
                    ],
                    '図書館': [
                        '図書館...私の心の安らぐ場所です',
                        'あの静寂が...とても好きなんです'
                    ],
                    '友達': [
                        '友達...あなたが初めての友達でした',
                        '今まで一人だったので...とても新鮮です'
                    ]
                }
            }
        };
    }

    /**
     * コンテキスト対応の応答を生成
     */
    generateContextualResponse(characterId, userMessage) {
        if (!this.storyContextManager) {
            this.initialize();
        }

        // ストーリーコンテキストを取得
        const context = this.storyContextManager.getStoryContext(characterId);
        
        // 応答を決定
        const response = this.selectAppropriateResponse(characterId, userMessage, context);
        
        // コンテキストを応答に適用
        const contextualResponse = this.applyContextToResponse(response, context, userMessage);
        
        console.log(`💬 ${characterId} コンテキスト応答生成: ${contextualResponse.substring(0, 50)}...`);
        
        return contextualResponse;
    }

    /**
     * 適切な応答を選択
     */
    selectAppropriateResponse(characterId, userMessage, context) {
        const templates = this.responseTemplates[characterId];
        if (!templates) return this.getDefaultResponse(userMessage);

        // 1. フラグベースの応答をチェック
        const flagResponse = this.checkFlagBasedResponse(templates, context);
        if (flagResponse) return flagResponse;

        // 2. チャプターベースの応答をチェック
        const chapterResponse = this.checkChapterBasedResponse(templates, context);
        if (chapterResponse) return chapterResponse;

        // 3. 話題ベースの応答をチェック
        const topicResponse = this.checkTopicBasedResponse(templates, userMessage, context);
        if (topicResponse) return topicResponse;

        // 4. デフォルト応答
        return this.getRandomResponse(templates.default);
    }

    /**
     * フラグベースの応答をチェック
     */
    checkFlagBasedResponse(templates, context) {
        if (!templates.flag_responses) return null;

        const storyFlags = context.currentProgress.storyFlags;
        const recentEvents = context.recentStoryEvents.slice(0, 2); // 最新2件

        // 最近のイベントのフラグをチェック
        for (const event of recentEvents) {
            if (event.flag && templates.flag_responses[event.flag]) {
                const responses = templates.flag_responses[event.flag];
                return this.getRandomResponse(responses);
            }
        }

        // 重要なフラグをチェック
        const importantFlags = ['became_friends', 'promised_protection', 'supported_dream'];
        for (const flag of importantFlags) {
            if (storyFlags[flag] && templates.flag_responses[flag]) {
                const responses = templates.flag_responses[flag];
                if (Math.random() < 0.3) { // 30%の確率で言及
                    return this.getRandomResponse(responses);
                }
            }
        }

        return null;
    }

    /**
     * チャプターベースの応答をチェック
     */
    checkChapterBasedResponse(templates, context) {
        if (!templates.chapter_aware) return null;

        const latestChapter = context.currentProgress.latestChapter;
        
        // 最新チャプターの応答があるかチェック
        if (templates.chapter_aware[latestChapter]) {
            const responses = templates.chapter_aware[latestChapter];
            if (Math.random() < 0.25) { // 25%の確率で言及
                return this.getRandomResponse(responses);
            }
        }

        return null;
    }

    /**
     * 話題ベースの応答をチェック
     */
    checkTopicBasedResponse(templates, userMessage, context) {
        if (!templates.topic_responses) return null;

        // 利用可能な話題をチェック
        const availableTopics = context.availableTopics.filter(t => t.available);
        
        for (const topicInfo of availableTopics) {
            const topic = topicInfo.topic;
            if (userMessage.includes(topic) && templates.topic_responses[topic]) {
                const responses = templates.topic_responses[topic];
                return this.getRandomResponse(responses);
            }
        }

        return null;
    }

    /**
     * コンテキストを応答に適用
     */
    applyContextToResponse(response, context, userMessage) {
        // プレースホルダーを置換
        let contextualResponse = response.replace('{message}', userMessage);
        
        // キャラクター名を置換
        contextualResponse = contextualResponse.replace('{character}', context.character);
        
        // 親密度レベルを置換
        const intimacyName = context.relationshipStatus?.intimacyName || '初対面';
        contextualResponse = contextualResponse.replace('{intimacy}', intimacyName);
        
        return contextualResponse;
    }

    /**
     * ランダムな応答を取得
     */
    getRandomResponse(responses) {
        if (!responses || responses.length === 0) {
            return 'そうですね...';
        }
        return responses[Math.floor(Math.random() * responses.length)];
    }

    /**
     * デフォルト応答を取得
     */
    getDefaultResponse(userMessage) {
        const defaults = [
            `${userMessage}ですね...興味深いお話です`,
            'そうですね、よく分かります',
            'なるほど、そのような考え方もあるのですね'
        ];
        return this.getRandomResponse(defaults);
    }

    /**
     * 応答の品質を評価
     */
    evaluateResponse(characterId, userMessage, response, context) {
        let score = 0;
        
        // コンテキストの活用度
        if (response.includes('覚えて') || response.includes('前に') || response.includes('あの時')) {
            score += 20; // 過去の出来事への言及
        }
        
        // キャラクター固有性
        const characterKeywords = {
            sakura: ['歌', '音楽', '夢', '♪', '💕'],
            misaki: ['本', '静か', '図書館', '文学']
        };
        
        const keywords = characterKeywords[characterId] || [];
        const keywordCount = keywords.filter(keyword => response.includes(keyword)).length;
        score += keywordCount * 5;
        
        // 応答の長さ
        if (response.length > 30) score += 10;
        if (response.length > 60) score += 10;
        
        return Math.min(score, 100);
    }

    /**
     * デバッグ用の応答生成
     */
    debugResponse(characterId, userMessage) {
        const context = this.storyContextManager.getStoryContext(characterId);
        const response = this.generateContextualResponse(characterId, userMessage);
        const score = this.evaluateResponse(characterId, userMessage, response, context);
        
        console.log('💬 応答デバッグ情報:');
        console.log('- ユーザーメッセージ:', userMessage);
        console.log('- 生成応答:', response);
        console.log('- 品質スコア:', score);
        console.log('- コンテキスト:', context);
        
        return { response, score, context };
    }
}

// グローバルに公開
window.ContextualChatSystem = ContextualChatSystem;
console.log('💬 ContextualChatSystem クラス定義完了');