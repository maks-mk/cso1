<?php
// Настройка заголовков для CORS и JSON
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Проверка метода запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
    exit;
}

// Получение данных из POST-запроса
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Проверка наличия обязательных полей
if (!isset($data['fullname']) || !isset($data['phone']) || !isset($data['message']) || !isset($data['consent'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Отсутствуют обязательные поля']);
    exit;
}

// Валидация согласия на обработку персональных данных
if (!$data['consent']) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Необходимо согласие на обработку персональных данных']);
    exit;
}

// Валидация данных
$errors = [];
if (empty($data['fullname'])) {
    $errors['fullname'] = 'Необходимо указать ФИО';
}
if (empty($data['phone'])) {
    $errors['phone'] = 'Необходимо указать телефон';
}
if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Указан некорректный email';
}
if (empty($data['message'])) {
    $errors['message'] = 'Необходимо написать сообщение';
}

// Если есть ошибки, возвращаем их
if (!empty($errors)) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

// Добавьте перед сохранением данных
$data['fullname'] = htmlspecialchars($data['fullname']);
$data['message'] = htmlspecialchars($data['message']);

// Генерация номера обращения
$requestNumber = 'ЦСО-' . rand(1000, 9999) . '/' . date('Y');
$requestDate = date('d.m.Y');
$timestamp = date('Y-m-d H:i:s');

// Создание записи в базе данных (пример с файлом)
$db_entry = [
    'id' => uniqid(),
    'number' => $requestNumber,
    'date' => $requestDate,
    'fullname' => $data['fullname'],
    'phone' => $data['phone'],
    'email' => $data['email'] ?? '',
    'address' => $data['address'] ?? '',
    'topic' => $data['subject'] ?? '',
    'request_type' => $data['request-type'] ?? '',
    'message' => $data['message'],
    'status' => 'new',
    'created_at' => $timestamp
];

// Сохранение в JSON-файл (простая альтернатива базе данных)
$db_file = 'requests.json';
$requests = [];

if (file_exists($db_file)) {
    $file_content = file_get_contents($db_file);
    if ($file_content) {
        $requests = json_decode($file_content, true) ?: [];
    }
}

$requests[] = $db_entry;
file_put_contents($db_file, json_encode($requests, JSON_PRETTY_PRINT));

// Ограничьте доступ к JSON-файлу через .htaccess
// Создайте файл .htaccess в директории с requests.json
file_put_contents('.htaccess', "
<Files requests.json>
    Order Allow,Deny
    Deny from all
</Files>
");

// Отправка уведомления на почту
$to = 'cso-1@mail.ru'; // Замените на реальный адрес для получения обращений
$subject = "Новое обращение №{$requestNumber}";
$message = "Поступило новое обращение №{$requestNumber} от {$requestDate}\n\n";
$message .= "ФИО: {$data['fullname']}\n";
$message .= "Телефон: {$data['phone']}\n";
if (!empty($data['email'])) {
    $message .= "Email: {$data['email']}\n";
}
if (!empty($data['address'])) {
    $message .= "Адрес: {$data['address']}\n";
}
if (!empty($data['request-type'])) {
    $message .= "Тип обращения: {$data['request-type']}\n";
}
if (!empty($data['subject'])) {
    $message .= "Тема: {$data['subject']}\n";
}
$message .= "Сообщение: {$data['message']}\n";

$headers = "From: noreply@вашсайт.ru\r\n"; // Замените на реальный домен
$headers .= "Reply-To: {$data['email'] ?? 'noreply@вашсайт.ru'}\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

$mail_sent = mail($to, $subject, $message, $headers);

if (!$mail_sent) {
    error_log('Ошибка при отправке email');
}

// Возвращаем успешный ответ
echo json_encode([
    'success' => true,
    'message' => 'Обращение успешно отправлено',
    'requestNumber' => $requestNumber,
    'requestDate' => $requestDate
]);
?> 