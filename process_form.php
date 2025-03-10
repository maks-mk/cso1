<?php
// Настройка заголовков для CORS и JSON
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Константа для выбора способа хранения данных
define('STORAGE_TYPE', 'json'); // Варианты: 'json', 'mysql', 'sqlite'

// Инициализация сессии для CSRF
session_start();
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Проверка метода запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
    exit;
}

// Получение данных из POST-запроса
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Проверка CSRF-токена
if (!isset($data['csrf_token']) || $data['csrf_token'] !== $_SESSION['csrf_token']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Недействительный токен безопасности']);
    exit;
}

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

// Функция для логирования и обработки ошибок
function logError($message, $data = []) {
    $timestamp = date('Y-m-d H:i:s');
    $log_message = "[{$timestamp}] {$message} " . (!empty($data) ? json_encode($data) : '') . PHP_EOL;
    
    // Записываем в файл ошибок
    @error_log($log_message, 3, 'errors.log');
    
    return [
        'success' => false,
        'message' => 'Произошла ошибка при обработке запроса. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону.'
    ];
}

// Защита от флуда
function checkFloodAttempt($ip) {
    $flood_file = 'flood_protection.json';
    $max_requests = 10; // Максимальное количество запросов
    $time_window = 3600; // Временное окно в секундах (1 час)
    
    $current_time = time();
    $flood_data = [];
    
    if (file_exists($flood_file)) {
        $flood_data = json_decode(file_get_contents($flood_file), true) ?: [];
    }
    
    // Очистка устаревших записей
    foreach ($flood_data as $ip_addr => $requests) {
        $flood_data[$ip_addr] = array_filter($requests, function($timestamp) use ($current_time, $time_window) {
            return $current_time - $timestamp < $time_window;
        });
        
        if (empty($flood_data[$ip_addr])) {
            unset($flood_data[$ip_addr]);
        }
    }
    
    // Проверка количества запросов
    if (isset($flood_data[$ip]) && count($flood_data[$ip]) >= $max_requests) {
        return true; // Флуд обнаружен
    }
    
    // Добавление нового запроса
    if (!isset($flood_data[$ip])) {
        $flood_data[$ip] = [];
    }
    $flood_data[$ip][] = $current_time;
    
    // Сохранение данных
    file_put_contents($flood_file, json_encode($flood_data));
    
    return false; // Флуда нет
}

// Проверка на флуд
$client_ip = $_SERVER['REMOTE_ADDR'];
if (checkFloodAttempt($client_ip)) {
    http_response_code(429); // Too Many Requests
    echo json_encode(['success' => false, 'message' => 'Слишком много запросов. Пожалуйста, попробуйте позже.']);
    exit;
}

// Сохранение данных в выбранное хранилище
function saveRequest($requestData) {
    switch (STORAGE_TYPE) {
        case 'mysql':
            return saveToMysql($requestData);
        case 'sqlite':
            return saveToSqlite($requestData);
        case 'json':
        default:
            return saveToJson($requestData);
    }
}

// Функция для сохранения в JSON
function saveToJson($data) {
    $db_file = 'requests.json';
    $requests = [];
    
    // Открываем файл с эксклюзивной блокировкой
    $file_handle = fopen($db_file, 'c+');
    if (!$file_handle) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Ошибка при доступе к файлу данных']);
        exit;
    }
    
    // Блокируем файл на время операции
    if (!flock($file_handle, LOCK_EX)) {
        fclose($file_handle);
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Невозможно заблокировать файл данных']);
        exit;
    }
    
    // Читаем содержимое файла
    $file_content = '';
    while (!feof($file_handle)) {
        $file_content .= fread($file_handle, 8192);
    }
    
    if ($file_content) {
        $requests = json_decode($file_content, true) ?: [];
    }
    
    $requests[] = $data;
    
    // Возвращаемся в начало файла и очищаем его
    ftruncate($file_handle, 0);
    rewind($file_handle);
    
    // Записываем обновленные данные
    $json_data = json_encode($requests, JSON_PRETTY_PRINT);
    $write_result = fwrite($file_handle, $json_data);
    
    // Сбрасываем блокировку и закрываем файл
    fflush($file_handle);
    flock($file_handle, LOCK_UN);
    fclose($file_handle);
    
    // Проверяем успешность записи
    if ($write_result === false) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Ошибка при сохранении данных']);
        exit;
    }
    
    return true;
}

// Функция для сохранения в MySQL (пример реализации)
function saveToMysql($data) {
    // Вместо этих переменных используйте безопасное хранилище для конфигурации
    $host = 'localhost';
    $db = 'feedback_db';
    $user = 'db_user';
    $pass = 'db_password';
    
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $stmt = $pdo->prepare("
            INSERT INTO requests 
            (id, number, date, fullname, phone, email, address, topic, request_type, message, status, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['id'], 
            $data['number'], 
            $data['date'], 
            $data['fullname'], 
            $data['phone'], 
            $data['email'] ?? '', 
            $data['address'] ?? '', 
            $data['topic'] ?? '', 
            $data['request_type'] ?? '', 
            $data['message'],
            $data['status'],
            $data['created_at']
        ]);
        
        return true;
    } catch (PDOException $e) {
        logError('Ошибка базы данных MySQL: ' . $e->getMessage());
        return false;
    }
}

// Вызов функции сохранения
if (!saveRequest($db_entry)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ошибка при сохранении данных']);
    exit;
}

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

$headers = "From: noreply@cso1.ru\r\n"; // Заменено на реальный домен
$headers .= "Reply-To: {$data['email'] ?? 'noreply@вашсайт.ru'}\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

$mail_sent = @mail($to, $subject, $message, $headers);

if (!$mail_sent) {
    logError('Ошибка при отправке email', [
        'requestNumber' => $requestNumber,
        'email' => $data['email'] ?? 'не указан'
    ]);
}

// Ограничьте доступ к JSON-файлу через .htaccess
// Создайте файл .htaccess в директории с requests.json
$htaccess_file = '.htaccess';

// Проверяем существование файла htaccess
if (!file_exists($htaccess_file)) {
    $htaccess_content = "
    # Защита файла данных
    <Files requests.json>
        Order Allow,Deny
        Deny from all
    </Files>
    
    # Запрет доступа к скрытым файлам
    <FilesMatch '^\.'>
        Order Allow,Deny
        Deny from all
    </FilesMatch>
    
    # Дополнительная защита PHP-скриптов
    <Files admin.php>
        AuthType Basic
        AuthName \"Restricted Area\"
        AuthUserFile " . __DIR__ . "/.htpasswd
        Require valid-user
    </Files>
    ";
    
    // Записываем файл .htaccess только если его еще нет
    if (!@file_put_contents($htaccess_file, $htaccess_content)) {
        error_log('Предупреждение: Не удалось создать файл .htaccess. Проверьте права доступа к директории.');
    }
}

// Возвращаем успешный ответ
echo json_encode([
    'success' => true,
    'message' => 'Обращение успешно отправлено',
    'requestNumber' => $requestNumber,
    'requestDate' => $requestDate
]);
?> 