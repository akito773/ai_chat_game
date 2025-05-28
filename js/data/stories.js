/**
 * ストーリーデータ（テスト用最小版）
 */
window.StoryData = {
    sakura: {
        chapters: {
            1: {
                id: 1,
                title: "輝く舞台の影で",
                description: "さくらちゃんとの最初の出会い",
                unlockCondition: { intimacy: 0 },
                content: "学園祭のステージで歌うさくらちゃん。しかし、観客の反応は今ひとつ...",
                choices: [
                    {
                        id: 'encourage',
                        text: '「歌、とても良かったよ」',
                        effect: { intimacy: +5 },
                        response: 'わ〜！本当ですか？ありがとうございます💕'
                    },
                    {
                        id: 'ask_feelings',
                        text: '「どんな気持ちで歌っているの？」',
                        effect: { intimacy: +3 },
                        response: 'えっと...みんなを笑顔にしたくて歌ってるんです♪'
                    }
                ]
            },
            2: {
                id: 2,
                title: "母への想い",
                description: "さくらちゃんの家族について",
                unlockCondition: { intimacy: 25 },
                content: "さくらちゃんがアイドルを目指す本当の理由が明かされる...",
                choices: [
                    {
                        id: 'support',
                        text: '「お母さんのために頑張っているんだね」',
                        effect: { intimacy: +8 },
                        response: 'はい...お母さんを楽にしてあげたいんです'
                    }
                ]
            }
        }
    },
    
    misaki: {
        chapters: {
            1: {
                id: 1,
                title: "静寂の中の出会い",
                description: "図書館でのミサキとの出会い",
                unlockCondition: { intimacy: 0 },
                content: "図書館の奥で一人静かに本を読むミサキ...",
                choices: [
                    {
                        id: 'ask_book',
                        text: '「どんな本を読んでいるの？」',
                        effect: { intimacy: +4 },
                        response: 'これは...古典文学の詩集です。美しい言葉に心が癒されます。'
                    },
                    {
                        id: 'quiet_approach',
                        text: '静かに隣に座る',
                        effect: { intimacy: +2 },
                        response: '...ありがとうございます。静かな方ですね。'
                    }
                ]
            }
        }
    }
};

console.log('📚 ストーリーデータ読み込み完了');