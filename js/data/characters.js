/**
 * キャラクターデータ（テスト用最小版）
 */
window.CharacterData = {
    sakura: {
        id: 'sakura',
        name: 'さくらちゃん',
        emoji: '🌸',
        description: '元気いっぱいの学園アイドル♪',
        personality: 'とても明るく元気で、いつも笑顔。友達思いで、みんなを励ますのが得意。',
        greeting: 'こんにちは〜！私、さくらです♪\\nライトノベル級のチャットRPGの世界へようこそ！\\n今日はどんなお話をしましょうか？✨',
        color: '#ff6b9d',
        image: 'assets/images/sakura.png',
        favoriteLocations: ['live_house', 'school'],
        keywords: ['歌', 'アイドル', '夢', '音楽', 'ライブ', '頑張る']
    },
    
    misaki: {
        id: 'misaki',
        name: 'ミサキ',
        emoji: '📚',
        description: '謎めいた美少女、古典文学が好き',
        personality: '落ち着いていて知的。古典文学や歴史に詳しく、時々古風な言葉遣いをする。内気だが心を開いた相手には優しい。',
        greeting: 'はじめまして...私はミサキと申します。\\n古い本の香りが好きで、図書館でよく過ごしています。\\nあなたとお話できて光栄です。',
        color: '#9966cc',
        image: 'assets/images/misaki.png',
        favoriteLocations: ['library', 'home'],
        keywords: ['本', '読書', '図書館', '静か', '文学', '詩'],
        unlockCondition: { intimacy: 30 }
    },
    
    akira: {
        id: 'akira',
        name: 'アキラ',
        emoji: '⚡',
        description: '運動部エース、クールビューティー',
        personality: 'クール、真面目、負けず嫌い、実は優しい。運動が得意で、常に上を目指している。',
        greeting: 'よろしく。私はアキラ。\\n毎日トレーニングに励んでいるわ。\\nあなたも何か目標はある？',
        color: '#4169e1',
        image: 'assets/images/akira.png',
        favoriteLocations: ['gym', 'school'],
        keywords: ['運動', 'スポーツ', '練習', '強い', '負けない', '努力'],
        unlockCondition: { intimacy: 40 }
    },
    
    yuki: {
        id: 'yuki',
        name: 'ユキ',
        emoji: '❄️',
        description: 'お嬢様、生徒会副会長',
        personality: '上品、優雅、少し天然、心優しい。裕福な家庭に育ったが、普通の友達関係に憧れている。',
        greeting: 'ごきげんよう。私はユキと申します。\\n美しいものが大好きで、よく美術館に足を運んでおります。\\nお話しできて嬉しいですわ。',
        color: '#87ceeb',
        image: 'assets/images/yuki.png',
        favoriteLocations: ['art_museum', 'cafe'],
        keywords: ['上品', '美しい', '芸術', '文化', 'お嬢様', '優雅'],
        unlockCondition: { intimacy: 35 }
    }
};

console.log('📊 キャラクターデータ読み込み完了:', Object.keys(window.CharacterData).length + '人');