<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../lib/FirestoreClient.php';

$client = new FirestoreClient();
$input = json_decode(file_get_contents('php://input'), true);

$action = $input['action'] ?? '';
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

if ($action === 'register') {
    $result = $client->signUp($email, $password);
} else {
    $result = $client->signIn($email, $password);
}

if (isset($result['idToken'])) {
    echo json_encode([
        'success' => true,
        'token' => $result['idToken'],
        'userId' => $result['localId'],
        'email' => $result['email']
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => $result['error']['message'] ?? 'Ошибка авторизации'
    ]);
}
?>
