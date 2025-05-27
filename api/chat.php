<?php
// OpenAI API連携用のPHPファイル（修正版）
// エラー出力を無効化してJSON形式を保証
error_reporting(0);
ini_set('display_errors', 0);

// CORS設定
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// プリフライトリクエストの処理
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 出力バッファリング開始（不要な出力を防ぐ）
ob_start();

try {
    // 設定ファイル（環境別）
    if (file_exists('config_local.php') && ($_SERVER['HTTP_HOST'] === 'localhost:8000' || $_SERVER['HTTP_HOST'] === '127.0.0.1:8000')) {
        require_once 'config_local.php';
    } else {
        require_once 'config.php';
    }
    
    class ChatAPI {
        private $apiKey;
        private $apiEndpoint;
        
        public function __construct() {
            $this->apiKey = API_KEY;
            $this->apiEndpoint = API_ENDPOINT;
        }
        
        public function processMessage($userMessage, $characterId = 'sakura') {
            try {
                // メッセージ長制限チェック
                if (strlen($userMessage) > MAX_MESSAGE_LENGTH) {
                    throw new Exception('メッセージが長すぎます');
                }
                
                // ユーザーメッセージの検証
                if (empty($userMessage)) {
                    throw new Exception('メッセージが空です');
                }
                
                // レート制限チェック（簡易版）
                $this->checkRateLimit();
                
                // AI APIを呼び出し
                $response = $this->callAI($userMessage, $characterId);
                
                // API使用量をログに記録
                if (defined('LOG_REQUESTS') && LOG_REQUESTS) {
                    $this->logAPIUsage($userMessage, $response);
                }
                
                return [
                    'success' => true,
                    'response' => $response,
                    'timestamp' => date('Y-m-d H:i:s'),
                    'model' => AI_MODEL,
                    'character' => $characterId
                ];
                
            } catch (Exception $e) {
                // エラーログ（ファイルに記録、画面出力しない）
                error_log("ChatAPI Error: " . $e->getMessage());
                
                return [
                    'success' => false,
                    'error' => $e->getMessage(),
                    'response' => 'ごめんなさい〜💦 今ちょっと調子が悪いみたいです...',
                    'character' => $characterId
                ];
            }
        }
        
        private function callAI($message, $characterId = 'sakura') {
            // キャラクター設定を含むプロンプト
            $characterPrompt = $this->buildCharacterPrompt($characterId);
            
            // API呼び出し用のデータ（コスト最適化）
            $postData = [
                'model' => AI_MODEL,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $characterPrompt
                    ],
                    [
                        'role' => 'user',
                        'content' => $message
                    ]
                ],
                'max_tokens' => MAX_TOKENS,
                'temperature' => TEMPERATURE,
                'frequency_penalty' => 0.2,
                'presence_penalty' => 0.1
            ];
            
            // cURLでAPI呼び出し
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $this->apiEndpoint,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($postData),
                CURLOPT_HTTPHEADER => [
                    'Authorization: Bearer ' . $this->apiKey,
                    'Content-Type: application/json',
                    'User-Agent: ChatGame/1.0'
                ],
                CURLOPT_TIMEOUT => 30,
                CURLOPT_CONNECTTIMEOUT => 10
            ]);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);
            
            // cURLエラーチェック
            if ($curlError) {
                throw new Exception('接続エラー: ' . $curlError);
            }
            
            // HTTPステータスチェック
            if ($httpCode !== 200) {
                $errorData = json_decode($response, true);
                $errorMsg = isset($errorData['error']['message']) ? 
                           $errorData['error']['message'] : 
                           'API呼び出しに失敗しました (HTTP: ' . $httpCode . ')';
                throw new Exception($errorMsg);
            }
            
            $data = json_decode($response, true);
            
            // レスポンス検証
            if (!isset($data['choices'][0]['message']['content'])) {
                throw new Exception('APIレスポンスが不正です');
            }
            
            return trim($data['choices'][0]['message']['content']);
        }
        
        private function buildCharacterPrompt($characterId = 'sakura') {
            // キャラクターデータを読み込み
            $charactersFile = __DIR__ . '/../characters/characters.json';
            
            if (file_exists($charactersFile)) {
                $charactersData = json_decode(file_get_contents($charactersFile), true);
                
                if (isset($charactersData[$characterId])) {
                    $character = $charactersData[$characterId];
                    return $this->processCharacterTemplate($character);
                }
            }
            
            // フォールバック: デフォルトのさくらちゃん
            return $this->getDefaultSakuraPrompt();
        }
        
        private function processCharacterTemplate($character) {
            if (!isset($character['prompt_template'])) {
                return $this->getGenericPrompt($character);
            }
            
            $prompt = $character['prompt_template'];
            
            // テンプレート変数を置換
            $prompt = str_replace('{name}', $character['name'], $prompt);
            $prompt = str_replace('{personality.base}', $character['personality']['base'] ?? '', $prompt);
            $prompt = str_replace('{personality.speech_style}', $character['personality']['speech_style'] ?? '', $prompt);
            $prompt = str_replace('{personality.tone_markers}', implode('、', $character['personality']['tone_markers'] ?? []), $prompt);
            $prompt = str_replace('{personality.favorite_emojis}', implode(' ', $character['personality']['favorite_emojis'] ?? []), $prompt);
            $prompt = str_replace('{personality.hobbies}', implode('、', $character['personality']['hobbies'] ?? []), $prompt);
            $prompt = str_replace('{personality.age_setting}', $character['personality']['age_setting'] ?? '', $prompt);
            
            return $prompt;
        }
        
        private function getGenericPrompt($character) {
            return "あなたは「{$character['name']}」というキャラクターです。\n\n【キャラクター設定】\n- 名前: {$character['name']}\n- 説明: {$character['description']}\n\n【応答ルール】\n1. 70文字以内で簡潔に応答\n2. キャラクターらしい口調で話す\n3. 適度に絵文字を使用\n4. ユーザーに共感し興味を示す\n\n{$character['name']}として自然に応答してください。";
        }
        
        private function getDefaultSakuraPrompt() {
            return "あなたは「さくらちゃん」という元気いっぱいの学園アイドルのキャラクターです。\n\n【キャラクター設定】\n- 名前: さくらちゃん\n- 性格: 元気で明るく、人懐っこい\n- 口調: 関西弁風で可愛らしい（〜ですね、〜ですよ、〜だよ〜、など）\n- 特徴: 絵文字やマークを使う（♪ ✨ 💕 〜 など）\n- 趣味: 歌とダンス、お友達とのおしゃべり\n- 年齢: 高校生設定\n\n【応答ルール】\n1. 70文字以内で簡潔に応答（コスト削減）\n2. 明るく親しみやすい口調\n3. 適度に絵文字を使用（3個まで）\n4. ユーザーに共感し興味を示す\n5. 不適切な内容は可愛く回避\n\nさくらちゃんとして自然に応答してください。";
        }
        
        private function checkRateLimit() {
            // 簡易レート制限
            $rateLimitFile = __DIR__ . '/../logs/rate_limit.log';
            $currentTime = time();
            $currentMinute = floor($currentTime / 60);
            
            // ディレクトリが存在しない場合は作成
            $logDir = dirname($rateLimitFile);
            if (!is_dir($logDir)) {
                @mkdir($logDir, 0755, true);
            }
            
            if (file_exists($rateLimitFile)) {
                $lastMinute = (int)file_get_contents($rateLimitFile);
                if ($lastMinute === $currentMinute) {
                    // 実際の実装では、より詳細なカウンターが必要
                }
            }
            
            @file_put_contents($rateLimitFile, $currentMinute);
        }
        
        private function logAPIUsage($userMessage, $aiResponse) {
            if (!defined('LOG_FILE') || !LOG_FILE) return;
            
            $logFile = __DIR__ . '/../' . LOG_FILE;
            $logDir = dirname($logFile);
            
            // ディレクトリが存在しない場合は作成
            if (!is_dir($logDir)) {
                @mkdir($logDir, 0755, true);
            }
            
            $logEntry = [
                'timestamp' => date('Y-m-d H:i:s'),
                'model' => AI_MODEL,
                'user_message_length' => strlen($userMessage),
                'ai_response_length' => strlen($aiResponse),
                'estimated_tokens' => $this->estimateTokens($userMessage . $aiResponse)
            ];
            
            $logLine = json_encode($logEntry) . "\n";
            @file_put_contents($logFile, $logLine, FILE_APPEND | LOCK_EX);
        }
        
        private function estimateTokens($text) {
            return ceil(strlen($text) / 4);
        }
    }

    // 出力バッファをクリア
    ob_clean();
    
    // メイン処理
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['message'])) {
            throw new Exception('メッセージが指定されていません');
        }
        
        $chatAPI = new ChatAPI();
        $characterId = isset($input['character']) ? $input['character'] : 'sakura';
        $result = $chatAPI->processMessage($input['message'], $characterId);
        
        echo json_encode($result, JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'POSTメソッドのみ対応'
        ], JSON_UNESCAPED_UNICODE);
    }

} catch (Exception $e) {
    // 出力バッファをクリア
    ob_clean();
    
    // エラーレスポンス
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'response' => 'ごめんなさい〜💦 システムエラーが発生しました...'
    ], JSON_UNESCAPED_UNICODE);
}

// 出力バッファを終了
ob_end_flush();
?>