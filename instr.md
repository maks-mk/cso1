# Инструкция по установке и настройке формы обратной связи

## Содержание

1. [Обзор компонентов системы](#обзор-компонентов-системы)
2. [Установка на Windows](#установка-на-windows)
3. [Установка на Linux](#установка-на-linux)
4. [Настройка формы обратной связи](#настройка-формы-обратной-связи)
5. [Проверка и тестирование](#проверка-и-тестирование)
6. [Администрирование запросов](#администрирование-запросов)
7. [Диагностика проблем](#диагностика-проблем)
8. [FAQ](#faq)
9. [Структура проекта](#структура-проекта)

## 1. Обзор компонентов системы

Форма обратной связи включает следующие компоненты:

- **Frontend**: HTML-форма с CSS-стилями и JavaScript для валидации и отправки данных
- **Backend**: PHP-скрипт для обработки запросов формы
- **Хранилище данных**: JSON-файл для хранения обращений
- **Уведомления**: Отправка email-уведомлений о новых обращениях

### Файлы системы

- `index.html` - основная страница сайта с формой обратной связи
- `styles.css` - стили для оформления формы
- `simple-modal.js` - скрипт для работы модального окна и отправки формы
- `process_form.php` - скрипт обработки формы на сервере
- `requests.json` - файл для хранения обращений
- `feedback.html` - отдельная страница с формой обратной связи
- `script.js` - основной JavaScript-файл для всего сайта
- `privacy.html` - страница с политикой конфиденциальности
- `sitemap.html` - карта сайта
- `structure.html` - структура учреждения
- `admin.php` - панель администрирования для обращений

[⬆️ Вернуться к содержанию](#содержание)

## 2. Установка на Windows

### 2.1. Установка веб-сервера

#### Вариант 1: XAMPP

1. Скачайте XAMPP с [официального сайта](https://www.apachefriends.org/ru/index.html)
2. Запустите установщик и следуйте инструкциям мастера
3. Выберите компоненты для установки (минимум Apache и PHP)
4. После установки запустите XAMPP Control Panel
5. Запустите Apache нажатием кнопки "Start"

#### Вариант 2: OpenServer (для русскоязычных пользователей)

1. Скачайте OpenServer с [официального сайта](https://ospanel.io/)
2. Запустите установщик и следуйте инструкциям
3. После установки запустите OpenServer
4. В меню трея выберите "Запустить"

### 2.2. Размещение файлов сайта

1. Найдите директорию веб-сервера:
   - XAMPP: `C:\xampp\htdocs\`
   - OpenServer: `C:\OpenServer\domains\`

2. Создайте папку для вашего сайта:
   - XAMPP: `C:\xampp\htdocs\cso\`
   - OpenServer: `C:\OpenServer\domains\cso\`

3. Скопируйте все файлы сайта в созданную папку

4. Создайте пустой файл `requests.json` в корне папки

### 2.3. Настройка прав доступа

1. Щелкните правой кнопкой мыши на файле `requests.json`
2. Выберите "Свойства" → "Безопасность"
3. Нажмите кнопку "Изменить" или "Редактировать"
4. Добавьте пользователя IUSR (или IIS_IUSRS)
5. Установите полные права для этого пользователя
6. Нажмите "Применить" и "ОК"

### 2.4. Проверка конфигурации PHP

1. Откройте файл php.ini:
   - XAMPP: `C:\xampp\php\php.ini`
   - OpenServer: Через меню трея → "Настройки" → "PHP"

2. Убедитесь, что включены следующие расширения:
   ```
   extension=fileinfo
   extension=json
   extension=mbstring
   ```

3. Убедитесь, что функция mail настроена:
   ```
   [mail function]
   SMTP = localhost
   smtp_port = 25
   sendmail_from = cso-1@mail.ru
   ```

4. Перезапустите веб-сервер после изменений

[⬆️ Вернуться к содержанию](#содержание)

## 3. Установка на Linux

### 3.1. Установка веб-сервера и PHP

#### Ubuntu/Debian

```bash
# Обновление пакетов
sudo apt update
sudo apt upgrade -y

# Установка Apache и PHP
sudo apt install -y apache2 php php-json php-mbstring

# Запуск и активация Apache
sudo systemctl start apache2
sudo systemctl enable apache2
```

#### CentOS/RHEL/Fedora

```bash
# Обновление пакетов
sudo dnf update -y

# Установка Apache и PHP
sudo dnf install -y httpd php php-json php-mbstring

# Запуск и активация Apache
sudo systemctl start httpd
sudo systemctl enable httpd

# Настройка файрвола
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

### 3.2. Размещение файлов сайта

```bash
# Создание директории для сайта
sudo mkdir -p /var/www/html/cso

# Копирование файлов сайта
sudo cp -r /путь/к/файлам/сайта/* /var/www/html/cso/

# Создание файла для хранения данных
sudo touch /var/www/html/cso/requests.json
```

### 3.3. Настройка прав доступа

```bash
# Установка владельца файлов
sudo chown -R www-data:www-data /var/www/html/cso/
# или для CentOS/RHEL
# sudo chown -R apache:apache /var/www/html/cso/

# Установка прав доступа
sudo find /var/www/html/cso/ -type d -exec chmod 755 {} \;
sudo find /var/www/html/cso/ -type f -exec chmod 644 {} \;
sudo chmod 766 /var/www/html/cso/requests.json
```

### 3.4. Настройка виртуального хоста (опционально)

```apache
# Создание файла конфигурации виртуального хоста
sudo nano /etc/apache2/sites-available/cso.conf

# Содержимое файла:
<VirtualHost *:80>
    ServerName cso.local
    DocumentRoot /var/www/html/cso
    
    <Directory /var/www/html/cso>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/cso_error.log
    CustomLog ${APACHE_LOG_DIR}/cso_access.log combined
</VirtualHost>

# Активация виртуального хоста
sudo a2ensite cso.conf
sudo systemctl reload apache2
```

[⬆️ Вернуться к содержанию](#содержание)

## 4. Настройка формы обратной связи

### 4.1. Настройка обработчика формы

Откройте файл `process_form.php` и настройте следующие параметры:

```php
// Настройка email для уведомлений
$to = 'your-email@example.com'; // Замените на ваш email

// Настройка отправителя
$headers = "From: noreply@yoursite.com\r\n"; // Замените на ваш домен
```

### 4.2. Настройка путей в JavaScript

Откройте файл `simple-modal.js` и убедитесь, что пути к обработчику формы указаны правильно:

```javascript
// Отправка данных на сервер
fetch('process_form.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(formObject)
})
```

### 4.3. Настройка формы в HTML

Убедитесь, что форма имеет правильные ID и атрибуты:

```html
<form id="feedback-form" method="post">
    <!-- Поля формы -->
</form>
```

[⬆️ Вернуться к содержанию](#содержание)

## 5. Проверка и тестирование

### 5.1. Доступ к сайту

- **Windows**: 
  - XAMPP: `http://localhost/cso/`
  - OpenServer: `http://cso/` или `http://localhost/cso/`

- **Linux**: 
  - `http://ip-адрес-сервера/cso/`
  - или `http://cso.local/` (если настроен виртуальный хост)

### 5.2. Тестирование формы

1. Откройте страницу с формой обратной связи
2. Заполните все обязательные поля формы
3. Нажмите кнопку "Отправить"
4. Проверьте, что отображается сообщение об успешной отправке

### 5.3. Проверка сохранения данных

1. Проверьте, что в файле `requests.json` появилась новая запись
2. Проверьте, что на указанный email пришло уведомление

[⬆️ Вернуться к содержанию](#содержание)

## 6. Администрирование запросов

### 6.1. Создание простой админ-панели

Создайте файл `admin.php` в корне вашего сайта:

```php
<?php
// Базовая аутентификация
if (!isset($_SERVER['PHP_AUTH_USER']) || 
    $_SERVER['PHP_AUTH_USER'] != 'admin' || 
    $_SERVER['PHP_AUTH_PW'] != 'YOUR_SECURE_PASSWORD') {
    header('WWW-Authenticate: Basic realm="Admin Area"');
    header('HTTP/1.0 401 Unauthorized');
    echo 'Требуется авторизация';
    exit;
}

// Чтение запросов из файла
$requests = [];
if (file_exists('requests.json')) {
    $content = file_get_contents('requests.json');
    if ($content) {
        $requests = json_decode($content, true) ?: [];
        // Сортировка по дате (от новых к старым)
        usort($requests, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });
    }
}

// Обработка изменения статуса, если отправлена форма
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'changeStatus') {
    $id = $_POST['id'] ?? '';
    $newStatus = $_POST['status'] ?? '';
    
    if ($id && $newStatus && file_exists('requests.json')) {
        $updatedRequests = [];
        foreach ($requests as $request) {
            if ($request['id'] === $id) {
                $request['status'] = $newStatus;
            }
            $updatedRequests[] = $request;
        }
        file_put_contents('requests.json', json_encode($updatedRequests, JSON_PRETTY_PRINT));
        // Перезагрузка страницы для отображения обновлений
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit;
    }
}
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Панель администратора | Обращения пользователей</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        h1 {
            color: #2a5885;
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background-color: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #2a5885;
            color: white;
            font-weight: 500;
        }
        tr:hover {
            background-color: #f9f9f9;
        }
        .status-new {
            color: #e74c3c;
            font-weight: bold;
        }
        .status-processing {
            color: #f39c12;
            font-weight: bold;
        }
        .status-completed {
            color: #27ae60;
            font-weight: bold;
        }
        .actions {
            display: flex;
            gap: 5px;
        }
        .btn {
            padding: 5px 10px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
        }
        .btn-processing {
            background-color: #f39c12;
            color: white;
        }
        .btn-complete {
            background-color: #27ae60;
            color: white;
        }
        .btn-reopen {
            background-color: #3498db;
            color: white;
        }
        .empty-list {
            text-align: center;
            padding: 30px;
            color: #777;
            font-style: italic;
        }
        .message-text {
            max-width: 300px;
            white-space: pre-wrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .filters {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        }
        .filter-btn {
            padding: 8px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            background-color: #eee;
        }
        .filter-btn.active {
            background-color: #2a5885;
            color: white;
        }
    </style>
</head>
<body>
    <h1>Обращения пользователей</h1>
    
    <div class="filters">
        <button class="filter-btn active" onclick="filterRequests('all')">Все</button>
        <button class="filter-btn" onclick="filterRequests('new')">Новые</button>
        <button class="filter-btn" onclick="filterRequests('processing')">В обработке</button>
        <button class="filter-btn" onclick="filterRequests('completed')">Завершенные</button>
    </div>
    
    <?php if (empty($requests)): ?>
        <div class="empty-list">
            <p>Нет обращений</p>
        </div>
    <?php else: ?>
        <table>
            <thead>
                <tr>
                    <th>№</th>
                    <th>Дата</th>
                    <th>ФИО</th>
                    <th>Контакты</th>
                    <th>Тема</th>
                    <th>Сообщение</th>
                    <th>Статус</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($requests as $request): ?>
                <tr class="request-row" data-status="<?php echo htmlspecialchars($request['status']); ?>">
                    <td><?php echo htmlspecialchars($request['number']); ?></td>
                    <td><?php echo htmlspecialchars($request['date']); ?></td>
                    <td><?php echo htmlspecialchars($request['fullname']); ?></td>
                    <td>
                        <div>Тел: <?php echo htmlspecialchars($request['phone']); ?></div>
                        <?php if (!empty($request['email'])): ?>
                        <div>Email: <?php echo htmlspecialchars($request['email']); ?></div>
                        <?php endif; ?>
                    </td>
                    <td><?php echo htmlspecialchars($request['topic'] ?? 'Не указана'); ?></td>
                    <td>
                        <div class="message-text"><?php echo htmlspecialchars($request['message']); ?></div>
                    </td>
                    <td>
                        <span class="status-<?php echo $request['status']; ?>">
                            <?php
                                switch ($request['status']) {
                                    case 'new': echo 'Новое'; break;
                                    case 'processing': echo 'В обработке'; break;
                                    case 'completed': echo 'Завершено'; break;
                                    default: echo 'Новое';
                                }
                            ?>
                        </span>
                    </td>
                    <td>
                        <div class="actions">
                            <form method="post">
                                <input type="hidden" name="action" value="changeStatus">
                                <input type="hidden" name="id" value="<?php echo htmlspecialchars($request['id']); ?>">
                                
                                <?php if ($request['status'] === 'new'): ?>
                                    <button type="submit" name="status" value="processing" class="btn btn-processing">Принять в работу</button>
                                <?php endif; ?>
                                
                                <?php if ($request['status'] === 'new' || $request['status'] === 'processing'): ?>
                                    <button type="submit" name="status" value="completed" class="btn btn-complete">Завершить</button>
                                <?php endif; ?>
                                
                                <?php if ($request['status'] === 'completed'): ?>
                                    <button type="submit" name="status" value="new" class="btn btn-reopen">Переоткрыть</button>
                                <?php endif; ?>
                            </form>
                        </div>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    <?php endif; ?>
    
    <script>
        function filterRequests(status) {
            // Обновить активную кнопку фильтра
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // Фильтрация строк таблицы
            const rows = document.querySelectorAll('.request-row');
            rows.forEach(row => {
                if (status === 'all' || row.dataset.status === status) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }
    </script>
</body>
</html>

[⬆️ Вернуться к содержанию](#содержание)

## 7. Диагностика проблем

### 7.1. Права доступа

**Проблема**: Данные не сохраняются в `requests.json`

**Решение**:
- **Windows**: Проверьте права доступа для пользователя IUSR или IIS_IUSRS
- **Linux**: Проверьте права для пользователя www-data или apache

Команда для проверки прав:
```bash
ls -la /var/www/html/cso/requests.json
```

При необходимости исправьте:
```bash
sudo chmod 766 /var/www/html/cso/requests.json
sudo chown www-data:www-data /var/www/html/cso/requests.json
```

### 7.2. Отладка PHP

**Проблема**: Форма отправляется, но данные не сохраняются

**Решение**:
1. Включите отображение ошибок PHP в `php.ini`:
   ```
   display_errors = On
   error_reporting = E_ALL
   ```

2. Добавьте код для отладки в `process_form.php`:
   ```php
   // В начало файла
   error_log('Получен запрос: ' . file_get_contents('php://input'));
   
   // Перед записью в файл
   error_log('Попытка записи данных: ' . json_encode($db_entry));
   
   // После записи
   error_log('Результат записи: ' . ($result ? 'успешно' : 'ошибка'));
   ```

### 7.3. Проверка логов

**Проблема**: Скрытые ошибки в работе скриптов

**Решение**: Проверьте логи ошибок сервера:

- **Windows**:
  - XAMPP: `C:\xampp\apache\logs\error.log`
  - OpenServer: `C:\OpenServer\userdata\logs\apache_error.log`

- **Linux**:
  - Ubuntu/Debian: `/var/log/apache2/error.log`
  - CentOS/RHEL: `/var/log/httpd/error_log`

[⬆️ Вернуться к содержанию](#содержание)

## 8. FAQ

### 8.1. Как изменить внешний вид формы?

Для изменения стилей формы отредактируйте файл `styles.css`. Основные классы CSS для модального окна и формы:
- `.modal` - контейнер модального окна
- `.modal-header` - заголовок модального окна
- `.modal-body` - содержимое модального окна
- `.form-group` - группа поля формы
- `.btn-primary` - кнопка отправки формы

### 8.2. Как настроить хранение в базе данных вместо JSON-файла?

Для хранения обращений в MySQL/MariaDB:

1. Создайте базу данных и таблицу:
```sql
CREATE DATABASE cso_feedback;
USE cso_feedback;

CREATE TABLE requests (
    id VARCHAR(36) PRIMARY KEY,
    number VARCHAR(20) NOT NULL,
    date VARCHAR(20) NOT NULL,
    fullname VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    topic VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new',
    created_at DATETIME NOT NULL
);
```

2. Измените код в `process_form.php` для сохранения в БД:
```php
// Подключение к БД
$mysqli = new mysqli('localhost', 'username', 'password', 'cso_feedback');
if ($mysqli->connect_error) {
    error_log('Database connection error: ' . $mysqli->connect_error);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Внутренняя ошибка сервера']);
    exit;
}

// Подготовка и выполнение запроса
$stmt = $mysqli->prepare("INSERT INTO requests (id, number, date, fullname, phone, email, topic, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', NOW())");
$stmt->bind_param('ssssssss', $db_entry['id'], $db_entry['number'], $db_entry['date'], $db_entry['fullname'], $db_entry['phone'], $db_entry['email'], $db_entry['topic'], $db_entry['message']);
$stmt->execute();
$stmt->close();
$mysqli->close();
```

### 8.3. Как изменить темы обращений?

Отредактируйте список опций в HTML-коде формы в файле `index.html`:

```html
<select id="request-type" name="request-type" required>
    <option value="">Выберите тип обращения</option>
    <option value="question">Вопрос</option>
    <!-- Добавьте или измените опции здесь -->
    <option value="custom-type">Ваш тип обращения</option>
</select>
```

### 8.4. Как добавить дополнительные поля в форму?

1. Добавьте HTML-код нового поля в форму (`index.html`):
```html
<div class="form-group">
    <label for="new-field">Новое поле</label>
    <input type="text" id="new-field" name="new-field">
</div>
```

2. Обновите серверный скрипт для обработки нового поля (`process_form.php`):
```php
$db_entry = [
    // Существующие поля...
    'new_field' => $data['new-field'] ?? '',
    // Другие поля...
];
```

### 8.5. Как настроить автоответ отправителю?

Добавьте код отправки автоответа в `process_form.php`:

```php
// Если указан email отправителя, отправляем ему автоответ
if (!empty($data['email'])) {
    $autoReplySubject = "Ваше обращение №{$requestNumber} получено";
    $autoReplyMessage = "Здравствуйте, {$data['fullname']}!\n\n";
    $autoReplyMessage .= "Ваше обращение №{$requestNumber} от {$requestDate} получено и зарегистрировано.\n";
    $autoReplyMessage .= "Мы рассмотрим его в ближайшее время и свяжемся с Вами при необходимости.\n\n";
    $autoReplyMessage .= "С уважением,\nКоманда ЦСО №1 г. Шахты";
    
    $autoReplyHeaders = "From: cso-1@mail.ru\r\n";
    $autoReplyHeaders .= "Reply-To: cso-1@mail.ru\r\n";
    $autoReplyHeaders .= "X-Mailer: PHP/" . phpversion();
    
    mail($data['email'], $autoReplySubject, $autoReplyMessage, $autoReplyHeaders);
}
```

[⬆️ Вернуться к содержанию](#содержание)

## 9. Структура проекта

### 9.1. Основные файлы проекта

```
project/
├── index.html             # Главная страница сайта с информацией о центре
├── feedback.html          # Страница с формой обратной связи
├── privacy.html           # Страница с политикой конфиденциальности
├── sitemap.html           # Карта сайта со всеми разделами
├── structure.html         # Страница со структурой организации
├── documents.html         # Учредительные документы
├── schedule.html          # График работы
├── services.html          # Услуги центра
├── about.html             # Страница об учреждении
├── news.html              # Новости центра
├── contacts.html          # Контактная информация
│
├── css/
│   └── styles.css         # Основные стили сайта
│
├── js/
│   ├── script.js          # Основной JavaScript для сайта
│   └── simple-modal.js    # Скрипт для обработки форм
│
├── images/
│   ├── logo.png           # Логотип организации
│   └── ...                # Другие изображения
│
├── backend/
│   ├── process_form.php   # Обработчик формы обратной связи
│   ├── requests.json      # Файл для хранения обращений
│   ├── admin.php          # Панель администрирования обращений
│   └── .htaccess          # Настройки доступа к файлам
│
└── docs/
    └── instr.md           # Инструкция по установке и настройке
```

### 9.2. Рекомендации по организации файлов

1. **Разделение по директориям**:
   - Храните CSS файлы в директории `/css/`
   - Храните JavaScript файлы в директории `/js/`
   - Храните изображения в директории `/images/`
   - Храните серверные скрипты в директории `/backend/`

2. **Безопасность**:
   - Разместите файл `requests.json` вне корня веб-сервера или защитите его с помощью `.htaccess`
   - Защитите админ-панель через базовую HTTP-аутентификацию

3. **Оптимизация путей**:
   - При перемещении файлов, обновите все ссылки в HTML-файлах
   - Используйте относительные пути для внутренних ссылок

### 9.3. Связь между компонентами

```
+-----------+     HTTP POST     +---------------+
|           | ----------------> |               |
| Форма     |                   | process_form  |
| обратной  |                   | .php          |
| связи     | <---------------- |               |
|           |     JSON ответ    |               |
+-----------+                   +---------------+
                                        |
                                        | Сохранение
                                        v
                                 +---------------+
                                 |               |
                                 | requests.json |
                                 |               |
                                 +---------------+
                                        ^
                                        | Чтение
                                        |
                                 +---------------+
                                 |               |
                                 |   admin.php   |
                                 |               |
                                 +---------------+
```

### 9.4. Проверка целостности проекта

Перед публикацией проекта рекомендуется проверить:

- Целостность всех файлов в структуре проекта
- Правильность ссылок между HTML-страницами
- Соответствие имен файлов в HTML-коде и фактических имен файлов
- Совместимость переменных между `simple-modal.js` и `process_form.php`
- Наличие и доступность файла `requests.json` для записи
- Корректное отображение всех страниц в разных браузерах
- Работоспособность формы обратной связи