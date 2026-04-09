<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../lib/FirestoreClient.php';
require_once '../lib/PostManager.php';

$client = new FirestoreClient();
$manager = new PostManager();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Получить все посты
    $posts = $manager->getAllPosts(20);
    echo json_encode(['success' => true, 'posts' => $posts]);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Создать пост
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = $input['userId'] ?? '';
    $text = $input['text'] ?? '';
    $mediaBase64 = $input['media'] ?? null;
    
    $result = $manager->createPostFromBase64($userId, $text, $mediaBase64);
    echo json_encode($result);
}
?>
