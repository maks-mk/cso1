<?php
// Запуск сессии для аутентификации
session_start();

// Конфигурация
$admin_username = 'cso1admin';
$admin_password = password_hash('надежный_пароль_2024', PASSWORD_DEFAULT);
$requests_file = 'requests.json';

// Функции для работы с данными
function loadRequests() {
    global $requests_file;
    if (file_exists($requests_file)) {
        $content = file_get_contents($requests_file);
        return json_decode($content, true) ?: [];
    }
    return [];
}

function saveRequests($requests) {
    global $requests_file;
    file_put_contents($requests_file, json_encode($requests, JSON_PRETTY_PRINT));
}

function updateRequestStatus($id, $status) {
    $requests = loadRequests();
    foreach ($requests as &$request) {
        if ($request['id'] === $id) {
            $request['status'] = $status;
            $request['updated_at'] = date('Y-m-d H:i:s');
            break;
        }
    }
    saveRequests($requests);
}

function addComment($id, $comment) {
    $requests = loadRequests();
    foreach ($requests as &$request) {
        if ($request['id'] === $id) {
            if (!isset($request['comments'])) {
                $request['comments'] = [];
            }
            $request['comments'][] = [
                'text' => $comment,
                'time' => date('Y-m-d H:i:s'),
                'user' => $_SESSION['admin_username']
            ];
            break;
        }
    }
    saveRequests($requests);
}

// Обработка выхода из системы
if (isset($_GET['logout'])) {
    unset($_SESSION['admin_authenticated']);
    header('Location: admin.php');
    exit;
}

// Обработка действий с заявками
if (isset($_SESSION['admin_authenticated']) && $_SESSION['admin_authenticated'] === true) {
    // Изменение статуса
    if (isset($_POST['action']) && $_POST['action'] === 'update_status' && isset($_POST['id']) && isset($_POST['status'])) {
        updateRequestStatus($_POST['id'], $_POST['status']);
        header('Location: admin.php?view=' . $_POST['id'] . '&status_updated=1');
        exit;
    }
    
    // Добавление комментария
    if (isset($_POST['action']) && $_POST['action'] === 'add_comment' && isset($_POST['id']) && isset($_POST['comment']) && !empty($_POST['comment'])) {
        addComment($_POST['id'], $_POST['comment']);
        header('Location: admin.php?view=' . $_POST['id'] . '&comment_added=1');
        exit;
    }
}

// Обработка формы входа
if (isset($_POST['login']) && isset($_POST['username']) && isset($_POST['password'])) {
    if ($_POST['username'] === $admin_username && password_verify($_POST['password'], $admin_password)) {
        $_SESSION['admin_authenticated'] = true;
        $_SESSION['admin_username'] = $admin_username;
        header('Location: admin.php');
        exit;
    } else {
        $login_error = "Неверное имя пользователя или пароль";
    }
}

// Проверка авторизации
$is_authenticated = isset($_SESSION['admin_authenticated']) && $_SESSION['admin_authenticated'] === true;

// Подготовка данных для отображения
$requests = [];
$current_request = null;
$filter_status = isset($_GET['filter']) ? $_GET['filter'] : '';
$sort_by = isset($_GET['sort']) ? $_GET['sort'] : 'date';
$sort_dir = isset($_GET['dir']) ? $_GET['dir'] : 'desc';

if ($is_authenticated) {
    $requests = loadRequests();
    
    // Применение фильтра
    if (!empty($filter_status)) {
        $requests = array_filter($requests, function($req) use ($filter_status) {
            return $req['status'] === $filter_status;
        });
    }
    
    // Сортировка
    usort($requests, function($a, $b) use ($sort_by, $sort_dir) {
        $result = 0;
        if ($sort_by === 'date') {
            $time_a = strtotime($a['created_at']);
            $time_b = strtotime($b['created_at']);
            $result = $time_a <=> $time_b;
        } elseif ($sort_by === 'status') {
            $result = strcmp($a['status'], $b['status']);
        } elseif ($sort_by === 'name') {
            $result = strcmp($a['fullname'], $b['fullname']);
        }
        
        return $sort_dir === 'asc' ? $result : -$result;
    });
    
    // Получение деталей выбранной заявки
    if (isset($_GET['view'])) {
        foreach ($requests as $req) {
            if ($req['id'] === $_GET['view']) {
                $current_request = $req;
                break;
            }
        }
    }
}

// Подсчет количества заявок по статусам
$stats = [
    'total' => 0,
    'new' => 0,
    'in_progress' => 0,
    'completed' => 0,
    'rejected' => 0
];

if ($is_authenticated) {
    $all_requests = loadRequests();
    $stats['total'] = count($all_requests);
    
    foreach ($all_requests as $req) {
        if (isset($req['status'])) {
            if (isset($stats[$req['status']])) {
                $stats[$req['status']]++;
            }
        }
    }
}

// HTML вывод
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Административная панель - Обращения граждан</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="styles.css">
    <style>
        /* Стили для админ-панели */
        :root {
            --admin-primary: #1e88e5;
            --admin-secondary: #455a64;
            --admin-success: #4caf50;
            --admin-warning: #ff9800;
            --admin-danger: #f44336;
            --admin-info: #00bcd4;
            --admin-light: #eceff1;
            --admin-dark: #263238;
            --admin-border: #cfd8dc;
        }
        
        body.admin-panel {
            background-color: #f5f5f5;
            color: #333;
            font-family: 'Roboto', sans-serif;
        }
        
        .admin-container {
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .admin-header {
            background-color: var(--admin-primary);
            color: white;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 4px;
            margin-bottom: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .admin-title {
            font-size: 1.5rem;
            margin: 0;
        }
        
        .admin-user-info {
            display: flex;
            align-items: center;
        }
        
        .admin-user-info .user-name {
            margin-right: 15px;
        }
        
        .admin-content {
            display: grid;
            grid-template-columns: 300px 1fr;
            gap: 20px;
        }
        
        .admin-sidebar {
            background: white;
            border-radius: 4px;
            padding: 15px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .admin-main {
            background: white;
            border-radius: 4px;
            padding: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .admin-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .stat-card {
            background: white;
            border-radius: 4px;
            padding: 15px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .stat-card.new {
            border-top: 3px solid var(--admin-info);
        }
        
        .stat-card.in-progress {
            border-top: 3px solid var(--admin-warning);
        }
        
        .stat-card.completed {
            border-top: 3px solid var(--admin-success);
        }
        
        .stat-card.rejected {
            border-top: 3px solid var(--admin-danger);
        }
        
        .stat-card.total {
            border-top: 3px solid var(--admin-primary);
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: #78909c;
            font-size: 0.9rem;
        }
        
        .filter-controls {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            align-items: center;
        }
        
        .filter-group {
            display: flex;
            align-items: center;
        }
        
        .filter-label {
            margin-right: 10px;
            font-weight: 500;
        }
        
        .filter-select {
            padding: 8px 10px;
            border-radius: 4px;
            border: 1px solid var(--admin-border);
            background-color: white;
        }
        
        .request-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .request-item {
            padding: 15px;
            border-bottom: 1px solid var(--admin-border);
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .request-item:hover {
            background-color: #f5f7fa;
        }
        
        .request-item.active {
            background-color: #e3f2fd;
            border-left: 3px solid var(--admin-primary);
        }
        
        .request-number {
            font-weight: 500;
            color: var(--admin-primary);
            margin-bottom: 5px;
        }
        
        .request-date {
            font-size: 0.85rem;
            color: #78909c;
            margin-bottom: 8px;
        }
        
        .request-name {
            font-weight: 500;
        }
        
        .request-status {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
            margin-left: 10px;
        }
        
        .status-new {
            background-color: #e0f7fa;
            color: #006064;
        }
        
        .status-in-progress {
            background-color: #fff8e1;
            color: #ff8f00;
        }
        
        .status-completed {
            background-color: #e8f5e9;
            color: #2e7d32;
        }
        
        .status-rejected {
            background-color: #ffebee;
            color: #c62828;
        }
        
        .request-detail {
            padding: 20px;
            border: 1px solid var(--admin-border);
            border-radius: 4px;
        }
        
        .detail-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--admin-border);
        }
        
        .detail-title {
            margin: 0 0 5px 0;
            font-size: 1.4rem;
        }
        
        .detail-actions {
            display: flex;
            gap: 10px;
        }
        
        .detail-section {
            margin-bottom: 25px;
        }
        
        .detail-section-title {
            font-size: 1.1rem;
            font-weight: 500;
            margin-bottom: 15px;
            color: var(--admin-secondary);
            border-bottom: 1px solid var(--admin-border);
            padding-bottom: 8px;
        }
        
        .detail-row {
            display: flex;
            margin-bottom: 12px;
        }
        
        .detail-label {
            font-weight: 500;
            width: 150px;
            color: #546e7a;
        }
        
        .detail-value {
            flex: 1;
        }
        
        .status-form {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 15px;
        }
        
        .comment-form {
            margin-top: 15px;
        }
        
        .comment-textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid var(--admin-border);
            border-radius: 4px;
            min-height: 100px;
            margin-bottom: 10px;
        }
        
        .comments-list {
            list-style: none;
            padding: 0;
        }
        
        .comment-item {
            background-color: #f5f7fa;
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        
        .comment-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 0.85rem;
            color: #78909c;
        }
        
        .login-container {
            max-width: 400px;
            margin: 100px auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .login-title {
            text-align: center;
            margin-bottom: 30px;
            color: var(--admin-primary);
        }
        
        .login-form {
            display: flex;
            flex-direction: column;
        }
        
        .login-input {
            padding: 12px 15px;
            margin-bottom: 15px;
            border: 1px solid var(--admin-border);
            border-radius: 4px;
            font-size: 1rem;
        }
        
        .login-button {
            padding: 12px;
            background-color: var(--admin-primary);
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .login-button:hover {
            background-color: #1565c0;
        }
        
        .login-error {
            color: var(--admin-danger);
            margin-bottom: 15px;
            text-align: center;
        }
        
        .admin-button {
            padding: 8px 15px;
            border: none;
            border-radius: 4px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .admin-button-primary {
            background-color: var(--admin-primary);
            color: white;
        }
        
        .admin-button-primary:hover {
            background-color: #1565c0;
        }
        
        .admin-button-secondary {
            background-color: var(--admin-light);
            color: var(--admin-dark);
        }
        
        .admin-button-secondary:hover {
            background-color: #cfd8dc;
        }
        
        .admin-button-success {
            background-color: var(--admin-success);
            color: white;
        }
        
        .admin-button-success:hover {
            background-color: #388e3c;
        }
        
        .admin-button-danger {
            background-color: var(--admin-danger);
            color: white;
        }
        
        .admin-button-danger:hover {
            background-color: #d32f2f;
        }
        
        .alert {
            padding: 10px 15px;
            border-radius: 4px;
            margin-bottom: 15px;
        }
        
        .alert-success {
            background-color: #e8f5e9;
            color: #2e7d32;
            border: 1px solid #c8e6c9;
        }
        
        .alert-info {
            background-color: #e3f2fd;
            color: #0d47a1;
            border: 1px solid #bbdefb;
        }
        
        .text-muted {
            color: #78909c;
            font-style: italic;
        }
        
        /* Адаптивность для мобильных устройств */
        @media (max-width: 768px) {
            .admin-content {
                grid-template-columns: 1fr;
            }
            
            .admin-stats {
                grid-template-columns: 1fr 1fr;
            }
        }
    </style>
</head>
<body class="admin-panel">
    <?php if (!$is_authenticated): ?>
    <!-- Форма входа -->
    <div class="login-container">
        <h2 class="login-title">Вход в административную панель</h2>
        
        <?php if (isset($login_error)): ?>
        <div class="login-error">
            <?php echo $login_error; ?>
        </div>
        <?php endif; ?>
        
        <form method="post" class="login-form">
            <input type="text" name="username" placeholder="Имя пользователя" class="login-input" required>
            <input type="password" name="password" placeholder="Пароль" class="login-input" required>
            <button type="submit" name="login" class="login-button">Войти</button>
        </form>
    </div>
    <?php else: ?>
    <!-- Административная панель -->
    <div class="admin-container">
        <header class="admin-header">
            <h1 class="admin-title">Панель администрирования обращений</h1>
            <div class="admin-user-info">
                <span class="user-name">Администратор</span>
                <a href="admin.php?logout=1" class="admin-button admin-button-secondary">Выйти</a>
            </div>
        </header>
        
        <div class="admin-stats">
            <div class="stat-card total">
                <div class="stat-value"><?php echo $stats['total']; ?></div>
                <div class="stat-label">Всего обращений</div>
            </div>
            <div class="stat-card new">
                <div class="stat-value"><?php echo $stats['new']; ?></div>
                <div class="stat-label">Новые</div>
            </div>
            <div class="stat-card in-progress">
                <div class="stat-value"><?php echo $stats['in_progress']; ?></div>
                <div class="stat-label">В обработке</div>
            </div>
            <div class="stat-card completed">
                <div class="stat-value"><?php echo $stats['completed']; ?></div>
                <div class="stat-label">Завершенные</div>
            </div>
            <div class="stat-card rejected">
                <div class="stat-value"><?php echo $stats['rejected']; ?></div>
                <div class="stat-label">Отклоненные</div>
            </div>
        </div>
        
        <div class="admin-content">
            <div class="admin-sidebar">
                <div class="filter-controls">
                    <div class="filter-group">
                        <span class="filter-label">Статус:</span>
                        <select class="filter-select" onchange="window.location='admin.php?filter='+this.value">
                            <option value="" <?php echo $filter_status == '' ? 'selected' : ''; ?>>Все</option>
                            <option value="new" <?php echo $filter_status == 'new' ? 'selected' : ''; ?>>Новые</option>
                            <option value="in_progress" <?php echo $filter_status == 'in_progress' ? 'selected' : ''; ?>>В обработке</option>
                            <option value="completed" <?php echo $filter_status == 'completed' ? 'selected' : ''; ?>>Завершенные</option>
                            <option value="rejected" <?php echo $filter_status == 'rejected' ? 'selected' : ''; ?>>Отклоненные</option>
                        </select>
                    </div>
                </div>
                
                <ul class="request-list">
                    <?php if (empty($requests)): ?>
                        <li class="text-muted" style="padding: 15px;">Нет обращений для отображения</li>
                    <?php else: ?>
                        <?php foreach ($requests as $request): ?>
                            <li class="request-item <?php echo isset($_GET['view']) && $_GET['view'] === $request['id'] ? 'active' : ''; ?>" 
                                onclick="window.location='admin.php?view=<?php echo $request['id']; ?><?php echo !empty($filter_status) ? '&filter='.$filter_status : ''; ?>'">
                                <div class="request-number"><?php echo $request['number']; ?></div>
                                <div class="request-date"><?php echo $request['date']; ?></div>
                                <div class="request-name">
                                    <?php echo $request['fullname']; ?>
                                    <span class="request-status status-<?php echo $request['status']; ?>">
                                        <?php 
                                        $status_labels = [
                                            'new' => 'Новое',
                                            'in_progress' => 'В обработке',
                                            'completed' => 'Завершено',
                                            'rejected' => 'Отклонено'
                                        ];
                                        echo isset($status_labels[$request['status']]) ? $status_labels[$request['status']] : $request['status']; 
                                        ?>
                                    </span>
                                </div>
                            </li>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </ul>
            </div>
            
            <div class="admin-main">
                <?php if (isset($_GET['status_updated']) && $_GET['status_updated'] == 1): ?>
                    <div class="alert alert-success">
                        Статус обращения успешно обновлен.
                    </div>
                <?php endif; ?>
                
                <?php if (isset($_GET['comment_added']) && $_GET['comment_added'] == 1): ?>
                    <div class="alert alert-success">
                        Комментарий успешно добавлен.
                    </div>
                <?php endif; ?>
                
                <?php if ($current_request): ?>
                    <div class="request-detail">
                        <div class="detail-header">
                            <div>
                                <h2 class="detail-title">Обращение <?php echo $current_request['number']; ?></h2>
                                <div class="request-date">Дата: <?php echo $current_request['date']; ?></div>
                            </div>
                            <div class="detail-actions">
                                <a href="admin.php<?php echo !empty($filter_status) ? '?filter='.$filter_status : ''; ?>" class="admin-button admin-button-secondary">
                                    <i class="fas fa-arrow-left"></i> Назад к списку
                                </a>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h3 class="detail-section-title">Информация об обращении</h3>
                            
                            <div class="detail-row">
                                <div class="detail-label">Статус:</div>
                                <div class="detail-value">
                                    <span class="request-status status-<?php echo $current_request['status']; ?>">
                                        <?php 
                                        $status_labels = [
                                            'new' => 'Новое',
                                            'in_progress' => 'В обработке',
                                            'completed' => 'Завершено',
                                            'rejected' => 'Отклонено'
                                        ];
                                        echo isset($status_labels[$current_request['status']]) ? $status_labels[$current_request['status']] : $current_request['status']; 
                                        ?>
                                    </span>
                                    
                                    <form method="post" class="status-form">
                                        <input type="hidden" name="action" value="update_status">
                                        <input type="hidden" name="id" value="<?php echo $current_request['id']; ?>">
                                        <select name="status" class="filter-select">
                                            <option value="new" <?php echo $current_request['status'] == 'new' ? 'selected' : ''; ?>>Новое</option>
                                            <option value="in_progress" <?php echo $current_request['status'] == 'in_progress' ? 'selected' : ''; ?>>В обработке</option>
                                            <option value="completed" <?php echo $current_request['status'] == 'completed' ? 'selected' : ''; ?>>Завершено</option>
                                            <option value="rejected" <?php echo $current_request['status'] == 'rejected' ? 'selected' : ''; ?>>Отклонено</option>
                                        </select>
                                        <button type="submit" class="admin-button admin-button-primary">Обновить статус</button>
                                    </form>
                                </div>
                            </div>
                            
                            <div class="detail-row">
                                <div class="detail-label">ФИО:</div>
                                <div class="detail-value"><?php echo $current_request['fullname']; ?></div>
                            </div>
                            
                            <div class="detail-row">
                                <div class="detail-label">Телефон:</div>
                                <div class="detail-value"><?php echo $current_request['phone']; ?></div>
                            </div>
                            
                            <?php if (!empty($current_request['email'])): ?>
                            <div class="detail-row">
                                <div class="detail-label">Email:</div>
                                <div class="detail-value"><?php echo $current_request['email']; ?></div>
                            </div>
                            <?php endif; ?>
                            
                            <?php if (!empty($current_request['address'])): ?>
                            <div class="detail-row">
                                <div class="detail-label">Адрес:</div>
                                <div class="detail-value"><?php echo $current_request['address']; ?></div>
                            </div>
                            <?php endif; ?>
                            
                            <?php if (!empty($current_request['topic'])): ?>
                            <div class="detail-row">
                                <div class="detail-label">Тема:</div>
                                <div class="detail-value"><?php echo $current_request['topic']; ?></div>
                            </div>
                            <?php endif; ?>
                            
                            <?php if (!empty($current_request['request_type'])): ?>
                            <div class="detail-row">
                                <div class="detail-label">Тип обращения:</div>
                                <div class="detail-value"><?php echo $current_request['request_type']; ?></div>
                            </div>
                            <?php endif; ?>
                            
                            <div class="detail-row">
                                <div class="detail-label">Сообщение:</div>
                                <div class="detail-value"><?php echo nl2br($current_request['message']); ?></div>
                            </div>
                            
                            <div class="detail-row">
                                <div class="detail-label">Дата создания:</div>
                                <div class="detail-value"><?php echo $current_request['created_at']; ?></div>
                            </div>
                            
                            <?php if (isset($current_request['updated_at'])): ?>
                            <div class="detail-row">
                                <div class="detail-label">Дата обновления:</div>
                                <div class="detail-value"><?php echo $current_request['updated_at']; ?></div>
                            </div>
                            <?php endif; ?>
                        </div>
                        
                        <div class="detail-section">
                            <h3 class="detail-section-title">Комментарии</h3>
                            
                            <?php if (isset($current_request['comments']) && !empty($current_request['comments'])): ?>
                                <ul class="comments-list">
                                    <?php foreach ($current_request['comments'] as $comment): ?>
                                        <li class="comment-item">
                                            <div class="comment-header">
                                                <span><?php echo $comment['user']; ?></span>
                                                <span><?php echo $comment['time']; ?></span>
                                            </div>
                                            <div class="comment-text"><?php echo nl2br($comment['text']); ?></div>
                                        </li>
                                    <?php endforeach; ?>
                                </ul>
                            <?php else: ?>
                                <p class="text-muted">Нет комментариев</p>
                            <?php endif; ?>
                            
                            <form method="post" class="comment-form">
                                <input type="hidden" name="action" value="add_comment">
                                <input type="hidden" name="id" value="<?php echo $current_request['id']; ?>">
                                <textarea name="comment" class="comment-textarea" placeholder="Добавьте комментарий..." required></textarea>
                                <button type="submit" class="admin-button admin-button-primary">Добавить комментарий</button>
                            </form>
                        </div>
                    </div>
                <?php else: ?>
                    <div class="alert alert-info">
                        Выберите обращение из списка слева для просмотра подробной информации.
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
    <?php endif; ?>
</body>
</html> 