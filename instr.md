# Полная инструкция по установке, настройке и использованию системы обратной связи

## Содержание

1. [Обзор системы](#1-обзор-системы)
2. [Установка необходимого ПО](#2-установка-необходимого-по)
3. [Пошаговая установка](#3-пошаговая-установка)
4. [Настройка компонентов](#4-настройка-компонентов)
5. [Безопасность](#5-безопасность)
6. [Использование административной панели](#6-использование-административной-панели)
7. [Диагностика и устранение проблем](#7-диагностика-и-устранение-проблем)
8. [Расширение функциональности](#8-расширение-функциональности)
9. [Техническая документация](#9-техническая-документация)

## 1. Обзор системы

### 1.1 Назначение и возможности

Система обратной связи предназначена для:
- Приема и обработки обращений посетителей сайта
- Хранения и категоризации обращений
- Управления статусами обращений
- Уведомления администраторов о новых обращениях
- Ведения истории коммуникаций с заявителями

### 1.2 Системные требования

**Минимальные требования:**
- PHP 7.4 или выше
- Веб-сервер Apache/Nginx
- Права на запись в директорию сайта
- Доступ к отправке email (функция mail() или SMTP)

**Рекомендуемые требования:**
- PHP 8.0 или выше
- Веб-сервер с поддержкой HTTPS
- База данных MySQL (опционально)
- Настроенный SMTP-сервер для надежной отправки email

### 1.3 Компоненты системы

Система состоит из следующих компонентов:
1. **Форма обратной связи** (HTML + JavaScript)
2. **Обработчик формы** (process_form.php)
3. **Административная панель** (admin.php)
4. **Хранилище данных** (requests.json или БД)
5. **Дополнительные скрипты** (защита, логирование и т.д.)

## 2. Установка необходимого ПО

### 2.1 Установка на Windows

#### 2.1.1 Установка с помощью XAMPP (рекомендуется)

XAMPP - это готовый пакет, включающий Apache, MySQL, PHP и другие необходимые компоненты.

1. **Скачайте XAMPP:**
   - Перейдите на официальный сайт: https://www.apachefriends.org/download.html
   - Загрузите последнюю версию для Windows (рекомендуется PHP 8.x)

2. **Установите XAMPP:**
   - Запустите скачанный установщик
   - Следуйте инструкциям мастера установки
   - Рекомендуется оставить все компоненты, отмеченные по умолчанию
   - Стандартная директория установки: `C:\xampp`

3. **Запустите XAMPP Control Panel:**
   - Запустите XAMPP Control Panel через меню Пуск или иконку на рабочем столе
   - Нажмите кнопки "Start" для модулей Apache и MySQL
   - Убедитесь, что в консоли отображается сообщение об успешном запуске

4. **Проверьте установку:**
   - Откройте в браузере адрес: http://localhost/
   - Вы должны увидеть стартовую страницу XAMPP
   - Перейдите по ссылке phpinfo() или http://localhost/dashboard/phpinfo.php, чтобы проверить установленную версию PHP

5. **Настройте PHP:**
   - Откройте файл `C:\xampp\php\php.ini` в текстовом редакторе
   - Убедитесь, что следующие расширения включены (раскомментированы, без точки с запятой в начале строки):
     ```
     extension=curl
     extension=fileinfo
     extension=gd
     extension=mbstring
     extension=exif
     extension=mysqli
     extension=openssl
     extension=pdo_mysql
     ```
   - Для настройки отправки email найдите и измените параметры:
     ```
     [mail function]
     SMTP=smtp.вашпочта.ru
     smtp_port=25
     sendmail_from=noreply@вашдомен.ru
     ```
   - Сохраните файл и перезапустите Apache через XAMPP Control Panel

#### 2.1.2 Установка с помощью OpenServer (альтернатива)

1. **Скачайте OpenServer:**
   - Перейдите на официальный сайт: https://ospanel.io/
   - Загрузите последнюю версию (Basic или Premium)

2. **Установите OpenServer:**
   - Распакуйте архив в удобное место на диске
   - Запустите файл Open Server.exe
   - Выполните первоначальную настройку, следуя инструкциям

3. **Настройте компоненты:**
   - В трее найдите иконку OpenServer и щелкните правой кнопкой мыши
   - Выберите "Настройки"
   - На вкладке "Компоненты" выберите:
     - Apache 2.4 или выше
     - PHP 7.4 или 8.x
     - MySQL 5.7 или 8.0
   - Перезапустите сервер после изменения настроек

### 2.2 Установка на Linux

#### 2.2.1 Ubuntu/Debian

1. **Обновите систему:**
   ```bash
   sudo apt update
   sudo apt upgrade
   ```

2. **Установите Apache:**
   ```bash
   sudo apt install apache2
   sudo systemctl start apache2
   sudo systemctl enable apache2
   ```

3. **Установите PHP и необходимые модули:**
   ```bash
   # Для Ubuntu 20.04/22.04 или Debian 11
   sudo apt install php php-common php-fpm php-json php-pdo php-mysql php-zip php-gd php-mbstring php-curl php-xml php-pear php-bcmath libapache2-mod-php
   
   # Проверьте установленную версию
   php -v
   ```

4. **Настройте PHP:**
   ```bash
   sudo nano /etc/php/8.*/apache2/php.ini
   ```
   
   Внесите следующие изменения:
   ```
   upload_max_filesize = 32M
   post_max_size = 48M
   memory_limit = 256M
   max_execution_time = 600
   max_input_vars = 3000
   date.timezone = 'Europe/Moscow'
   ```
   
   Сохраните файл и перезапустите Apache:
   ```bash
   sudo systemctl restart apache2
   ```

5. **Установите и настройте MySQL (опционально):**
   ```bash
   sudo apt install mysql-server
   sudo systemctl start mysql
   sudo systemctl enable mysql
   
   # Запустите скрипт безопасной настройки MySQL
   sudo mysql_secure_installation
   ```

6. **Настройте виртуальный хост Apache:**
   ```bash
   sudo nano /etc/apache2/sites-available/your-site.conf
   ```
   
   Содержимое файла:
   ```apache
   <VirtualHost *:80>
       ServerName your-domain.com
       ServerAlias www.your-domain.com
       DocumentRoot /var/www/html/your-site
       
       <Directory /var/www/html/your-site>
           Options Indexes FollowSymLinks
           AllowOverride All
           Require all granted
       </Directory>
       
       ErrorLog ${APACHE_LOG_DIR}/your-site-error.log
       CustomLog ${APACHE_LOG_DIR}/your-site-access.log combined
   </VirtualHost>
   ```
   
   Активируйте сайт и перезапустите Apache:
   ```bash
   sudo a2ensite your-site.conf
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```

#### 2.2.2 CentOS/RHEL/Fedora

1. **Обновите систему:**
   ```bash
   sudo dnf update
   ```

2. **Установите Apache:**
   ```bash
   sudo dnf install httpd
   sudo systemctl start httpd
   sudo systemctl enable httpd
   ```

3. **Установите PHP и необходимые модули:**
   ```bash
   # Для CentOS 8/RHEL 8/Fedora
   sudo dnf install php php-cli php-common php-fpm php-json php-pdo php-mysql php-zip php-gd php-mbstring php-curl php-xml php-pear php-bcmath
   
   # Проверьте установленную версию
   php -v
   ```

4. **Настройте PHP:**
   ```bash
   sudo nano /etc/php.ini
   ```
   
   Внесите те же изменения, что и для Ubuntu/Debian.

5. **Установите и настройте MySQL (опционально):**
   ```bash
   sudo dnf install mysql-server
   sudo systemctl start mysqld
   sudo systemctl enable mysqld
   
   # Запустите скрипт безопасной настройки
   sudo mysql_secure_installation
   ```

### 2.3 Настройка отправки email

#### 2.3.1 Настройка PHP mail() на Windows (XAMPP)

1. **Установите и настройте локальный SMTP-сервер:**
   - Установите программу "Fake Sendmail for Windows" или аналогичную
   - Скачайте архив sendmail с https://github.com/glob3/sendmail
   - Распакуйте архив в директорию C:\xampp\sendmail
   
2. **Настройте sendmail:**
   - Откройте файл C:\xampp\sendmail\sendmail.ini
   - Настройте параметры:
     ```
     [sendmail]
     smtp_server=smtp.gmail.com
     smtp_port=587
     error_logfile=error.log
     debug_logfile=debug.log
     auth_username=your-email@gmail.com
     auth_password=your-password-or-app-password
     force_sender=your-email@gmail.com
     ```

3. **Обновите настройки PHP:**
   - Откройте файл C:\xampp\php\php.ini
   - Найдите секцию [mail function] и измените на:
     ```
     [mail function]
     sendmail_path="C:\xampp\sendmail\sendmail.exe -t"
     ```

#### 2.3.2 Настройка PHP mail() на Linux

1. **Установите Postfix:**
   ```bash
   # Ubuntu/Debian
   sudo apt install postfix
   
   # CentOS/RHEL
   sudo dnf install postfix
   ```
   
   При установке выберите "Internet Site" и введите имя домена.

2. **Настройте Postfix:**
   ```bash
   sudo nano /etc/postfix/main.cf
   ```
   
   Проверьте и обновите следующие параметры:
   ```
   myhostname = your-domain.com
   mydomain = your-domain.com
   myorigin = $mydomain
   inet_interfaces = all
   mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain
   ```
   
   Перезапустите Postfix:
   ```bash
   sudo systemctl restart postfix
   ```

3. **Тестирование отправки email:**
   ```bash
   echo "This is a test." | mail -s "Test Email" recipient@example.com
   ```

#### 2.4 Проверка и устранение проблем с установкой

1. **Проверка работы Apache:**
   - Windows: откройте в браузере http://localhost/
   - Linux: `sudo systemctl status apache2` или `sudo systemctl status httpd`

2. **Проверка PHP:**
   - Создайте файл info.php с содержимым:
     ```php
     <?php phpinfo(); ?>
     ```
   - Откройте http://localhost/info.php

3. **Проверка SMTP:**
   - Создайте файл test_mail.php с содержимым:
     ```php
     <?php
     $to = "получатель@example.com";
     $subject = "Тестовое письмо";
     $message = "Это тестовое письмо от PHP mail()";
     $headers = "From: отправитель@example.com\r\n";
     
     if(mail($to, $subject, $message, $headers)) {
         echo "Письмо отправлено успешно";
     } else {
         echo "Ошибка при отправке письма";
     }
     ?>
     ```
   - Запустите скрипт через браузер

## 3. Пошаговая установка

### 3.1 Загрузка файлов на сервер

1. **Подготовка файлов:**
   - Убедитесь, что у вас есть все необходимые файлы системы
   - Проверьте структуру директорий согласно [разделу 9.1](#91-структура-файлов)

2. **Загрузка на сервер:**
   - Используйте FTP-клиент (например, FileZilla) или панель управления хостингом
   - Загрузите все файлы в корневую директорию сайта или поддиректорию
   - Сохраните структуру директорий при загрузке

### 3.2 Настройка прав доступа

**На Windows-сервере:**
1. Убедитесь, что учетная запись, под которой работает веб-сервер (IUSR или IIS_IUSRS), имеет права на чтение всех файлов
2. Предоставьте права на запись для следующих файлов и папок:
   - requests.json
   - errors.log
   - Директория, где хранятся эти файлы

**На Linux-сервере:**
```bash
# Установка базовых прав доступа
find /путь/к/проекту -type f -exec chmod 644 {} \;
find /путь/к/проекту -type d -exec chmod 755 {} \;

# Установка прав на запись для специальных файлов
chmod 664 /путь/к/проекту/requests.json
chmod 664 /путь/к/проекту/errors.log
touch /путь/к/проекту/flood_protection.json
chmod 664 /путь/к/проекту/flood_protection.json

# Установка владельца файлов (www-data - стандартный пользователь Apache)
# Замените на нужного пользователя, если используется другой (например, nginx)
chown -R www-data:www-data /путь/к/проекту
```

### 3.3 Создание необходимых файлов

1. **Создание пустого JSON-хранилища:**
   Если файл requests.json не существует, создайте его с базовой структурой:
   ```bash
   echo "[]" > requests.json
   ```

2. **Создание файла журнала ошибок:**
   ```bash
   touch errors.log
   ```

3. **Создание .htaccess для защиты данных:**
   Файл .htaccess будет создан автоматически при первом запуске process_form.php, но вы можете создать его вручную:
   ```apache
   # Защита файла данных
   <Files requests.json>
       Order Allow,Deny
       Deny from all
   </Files>
   
   # Запрет доступа к скрытым файлам
   <FilesMatch "^\.">
       Order Allow,Deny
       Deny from all
   </FilesMatch>
   
   # Защита административной панели
   <Files admin.php>
       AuthType Basic
       AuthName "Restricted Area"
       AuthUserFile /полный/путь/к/.htpasswd
       Require valid-user
   </Files>
   ```

## 4. Настройка компонентов

### 4.1 Настройка обработчика формы (process_form.php)

1. **Настройка получателя уведомлений:**
   Откройте файл process_form.php и найдите строку:
   ```php
   $to = 'cso-1@mail.ru'; // Замените на реальный адрес
   ```
   Измените адрес электронной почты на тот, куда должны приходить уведомления о новых обращениях.

2. **Настройка отправителя:**
   ```php
   $headers = "From: noreply@cso1.ru\r\n"; // Укажите ваш домен
   ```
   Замените домен на актуальный для вашего сайта.

3. **Настройка способа хранения данных:**
   По умолчанию система использует JSON-файл для хранения данных. При необходимости можно изменить:
   ```php
   define('STORAGE_TYPE', 'json'); // Варианты: 'json', 'mysql', 'sqlite'
   ```
   При выборе 'mysql' также потребуется настроить параметры подключения к базе данных в функции saveToMysql().

### 4.2 Настройка формы обратной связи (simple-modal.js)

1. **Подключение скрипта к страницам:**
   Убедитесь, что на всех страницах, где должна быть доступна форма обратной связи, подключены необходимые скрипты:
   ```html
   <script src="script.js"></script>
   <script src="simple-modal.js"></script>
   ```

2. **Добавление кнопок вызова формы:**
   На страницах сайта разместите элементы, которые будут открывать форму:
   ```html
   <!-- Вариант 1: Ссылка -->
   <a href="#" class="feedback-link">Написать обращение</a>
   
   <!-- Вариант 2: Кнопка -->
   <button class="contact-btn" onclick="openFeedbackModal()">Связаться с нами</button>
   
   <!-- Вариант 3: Баннер с кнопкой -->
   <div class="banner-action">
       <button class="btn-primary">Оставить заявку</button>
   </div>
   ```

3. **Настройка полей формы:**
   При необходимости измените HTML-структуру формы в функции createSimpleModal() файла simple-modal.js.

### 4.3 Настройка административной панели (admin.php)

1. **Изменение учетных данных:**
   Откройте файл admin.php и найдите следующие строки в начале файла:
   ```php
   // Конфигурация
   $admin_username = 'cso1admin';
   $admin_password = password_hash('надежный_пароль_2024', PASSWORD_DEFAULT);
   ```
   
   Замените 'cso1admin' на желаемое имя пользователя и 'надежный_пароль_2024' на надежный пароль.
   
   **Важно:** После изменения пароля с использованием password_hash(), сохраните его, так как восстановить исходный пароль из хеша невозможно.

2. **Настройка файла хранения данных:**
   ```php
   $requests_file = 'requests.json';
   ```
   При необходимости укажите другой путь к файлу с данными.

## 5. Безопасность

### 5.1 Защита данных обращений

1. **Проверка .htaccess:**
   Убедитесь, что файл .htaccess содержит правила, запрещающие прямой доступ к requests.json:
   ```apache
   <Files requests.json>
       Order Allow,Deny
       Deny from all
   </Files>
   ```

2. **Защита от XSS-атак:**
   В process_form.php уже реализована базовая защита с использованием htmlspecialchars():
   ```php
   $data['fullname'] = htmlspecialchars($data['fullname']);
   $data['message'] = htmlspecialchars($data['message']);
   ```

3. **Логирование ошибок:**
   Система автоматически логирует ошибки в файл errors.log. Регулярно проверяйте этот файл на наличие подозрительных активностей.

### 5.2 Защита административной панели

1. **Базовая HTTP-аутентификация:**
   Создайте файл .htpasswd для дополнительной защиты:
   ```bash
   # На Linux/Mac
   htpasswd -c .htpasswd имя_пользователя
   
   # На Windows (через openssl)
   echo имя_пользователя:$(openssl passwd -apr1 пароль) > .htpasswd
   ```
   
   Или используйте онлайн-генератор .htpasswd.

2. **Настройка защиты через PHP:**
   В admin.php уже реализована защита с использованием сессий и проверки пароля. Убедитесь, что используется надежный пароль.

3. **HTTPS-соединение:**
   Настоятельно рекомендуется настроить HTTPS для защиты передаваемых данных, особенно для административной панели.

### 5.3 Защита от атак

1. **CSRF-защита:**
   Система уже включает CSRF-защиту с использованием токенов:
   ```php
   // Проверка CSRF-токена
   if (!isset($data['csrf_token']) || $data['csrf_token'] !== $_SESSION['csrf_token']) {
       http_response_code(403);
       echo json_encode(['success' => false, 'message' => 'Недействительный токен безопасности']);
       exit;
   }
   ```

2. **Защита от флуд-атак:**
   В process_form.php реализована защита от многократных запросов:
   ```php
   // Проверка на флуд
   $client_ip = $_SERVER['REMOTE_ADDR'];
   if (checkFloodAttempt($client_ip)) {
       http_response_code(429); // Too Many Requests
       echo json_encode([...]);
       exit;
   }
   ```
   
   Вы можете настроить параметры в функции checkFloodAttempt():
   ```php
   $max_requests = 10; // Максимальное количество запросов
   $time_window = 3600; // Временное окно в секундах (1 час)
   ```

## 6. Использование административной панели

### 6.1 Вход в панель администратора

1. Откройте в браузере URL: `http://ваш-сайт/admin.php`
2. Введите имя пользователя и пароль, указанные при настройке
3. Если настроена HTTP-аутентификация, вам может потребоваться дважды вводить учетные данные

### 6.2 Интерфейс администратора

После успешного входа вы увидите интерфейс административной панели:

1. **Левая панель:** Список всех обращений с возможностью фильтрации
2. **Правая панель:** Детальная информация о выбранном обращении
3. **Верхняя панель:** Меню и кнопка выхода из системы

### 6.3 Работа с обращениями

1. **Просмотр списка обращений:**
   - Все обращения отображаются в левой части экрана
   - Используйте выпадающее меню "Фильтр" для отображения обращений по статусу:
     - Все обращения
     - Новые
     - В обработке
     - Завершенные
     - Отклоненные

2. **Просмотр деталей обращения:**
   - Щелкните на обращении в списке для просмотра полной информации
   - В правой панели отобразятся все данные обращения, включая:
     - ФИО заявителя
     - Контактные данные
     - Текст обращения
     - История статусов
     - Комментарии

3. **Изменение статуса обращения:**
   - В детальном просмотре обращения выберите новый статус из выпадающего меню
   - Нажмите кнопку "Обновить статус"
   - Статус обращения будет изменен, и в историю добавится запись об изменении

4. **Добавление комментариев:**
   - В нижней части детального просмотра найдите форму для комментариев
   - Введите текст комментария в текстовое поле
   - Нажмите "Добавить комментарий"
   - Комментарий будет добавлен к обращению с указанием времени и автора

### 6.4 Управление пользователями (для администраторов)

В текущей версии система поддерживает только одного администратора, настроенного в файле admin.php. Для добавления дополнительных пользователей требуется модификация кода.

## 7. Диагностика и устранение проблем

### 7.1 Проблемы с отправкой формы

**Симптом: Форма не отправляется или появляется ошибка**

1. **Проверьте консоль браузера:**
   - Откройте инструменты разработчика (F12 в большинстве браузеров)
   - Перейдите на вкладку "Console"
   - Проверьте наличие ошибок JavaScript

2. **Проверьте права доступа:**
   - Убедитесь, что файл requests.json существует и доступен для записи
   - Проверьте права доступа к директории

3. **Проверьте CSRF-токен:**
   - Убедитесь, что сессии PHP работают корректно
   - Проверьте, что токен генерируется и передается в форме

### 7.2 Проблемы с email-уведомлениями

**Симптом: Уведомления не приходят на почту**

1. **Проверьте настройки PHP:**
   - Функция mail() должна быть включена в php.ini
   - Проверьте настройки SMTP в php.ini или используйте альтернативный SMTP-клиент

2. **Проверьте журнал ошибок:**
   - Просмотрите файл errors.log на наличие ошибок, связанных с отправкой email

3. **Проверьте адрес получателя:**
   - Убедитесь, что адрес email, указанный в $to, корректен
   - Проверьте, не попадают ли письма в спам

### 7.3 Проблемы с административной панелью

**Симптом: Невозможно войти в админ-панель**

1. **Проверьте учетные данные:**
   - Убедитесь, что используете правильное имя пользователя и пароль
   - Если пароль был изменен с использованием password_hash(), восстановить его нельзя - создайте новый

2. **Проверьте сессии PHP:**
   - Убедитесь, что сессии PHP работают корректно
   - Проверьте настройки сессий в php.ini

3. **Проверьте .htaccess и .htpasswd:**
   - Если используется HTTP-аутентификация, проверьте корректность файлов
   - Убедитесь, что пути к .htpasswd в .htaccess указаны правильно

### 7.4 Общие проблемы и решения

1. **Ошибка 500 Internal Server Error:**
   - Проверьте журнал ошибок веб-сервера (error.log)
   - Проверьте синтаксис PHP-файлов
   - Временно включите отображение ошибок PHP:
     ```php
     ini_set('display_errors', 1);
     ini_set('display_startup_errors', 1);
     error_reporting(E_ALL);
     ```

2. **Ошибка 403 Forbidden:**
   - Проверьте права доступа к файлам и директориям
   - Проверьте настройки .htaccess

3. **Система не работает на мобильных устройствах:**
   - Убедитесь, что CSS-стили учитывают мобильные устройства
   - Проверьте JavaScript на совместимость с мобильными браузерами

## 8. Расширение функциональности

### 8.1 Переход на базу данных MySQL

Для перехода на MySQL:

1. **Создайте базу данных и таблицу:**
   ```sql
   CREATE DATABASE feedback_db;
   USE feedback_db;
   
   CREATE TABLE requests (
       id VARCHAR(32) PRIMARY KEY,
       number VARCHAR(20) NOT NULL,
       date VARCHAR(10) NOT NULL,
       fullname VARCHAR(255) NOT NULL,
       phone VARCHAR(20) NOT NULL,
       email VARCHAR(255),
       address TEXT,
       topic VARCHAR(255),
       request_type VARCHAR(50),
       message TEXT NOT NULL,
       status VARCHAR(20) NOT NULL DEFAULT 'new',
       created_at DATETIME NOT NULL,
       updated_at DATETIME
   );
   
   CREATE TABLE comments (
       id INT AUTO_INCREMENT PRIMARY KEY,
       request_id VARCHAR(32) NOT NULL,
       text TEXT NOT NULL,
       user VARCHAR(50) NOT NULL,
       time DATETIME NOT NULL,
       FOREIGN KEY (request_id) REFERENCES requests(id)
   );
   ```

2. **Настройте параметры подключения в process_form.php:**
   ```php
   // Измените константу типа хранилища
   define('STORAGE_TYPE', 'mysql');
   
   // Обновите параметры в функции saveToMysql()
   function saveToMysql($data) {
       $host = 'localhost';
       $db = 'feedback_db';
       $user = 'db_user'; // Замените на ваше имя пользователя
       $pass = 'db_password'; // Замените на ваш пароль
       
       // Остальной код функции
   }
   ```

3. **Обновите admin.php для работы с MySQL:**
   Потребуется модифицировать функции loadRequests(), saveRequests(), updateRequestStatus() и addComment() для работы с базой данных.

### 8.2 Интеграция с внешними сервисами

1. **Интеграция с Telegram:**
   Добавьте отправку уведомлений в Telegram-бот:
   ```php
   function sendTelegramNotification($message) {
       $botToken = 'YOUR_BOT_TOKEN';
       $chatId = 'YOUR_CHAT_ID';
       $url = "https://api.telegram.org/bot{$botToken}/sendMessage";
       
       $data = [
           'chat_id' => $chatId,
           'text' => $message,
           'parse_mode' => 'HTML'
       ];
       
       $options = [
           'http' => [
               'method' => 'POST',
               'header' => 'Content-Type: application/x-www-form-urlencoded',
               'content' => http_build_query($data)
           ]
       ];
       
       $context = stream_context_create($options);
       $result = file_get_contents($url, false, $context);
       
       return $result;
   }
   ```

2. **Интеграция с SMS-сервисами:**
   Добавьте отправку SMS-уведомлений через API-сервисы (например, Twilio, SMSAero и т.д.).

### 8.3 Расширение административных возможностей

1. **Добавление статистики:**
   Создайте dashboard с графиками и статистикой по обращениям.

2. **Экспорт данных:**
   Добавьте функцию экспорта обращений в Excel/CSV:
   ```php
   function exportToCsv($requests) {
       header('Content-Type: text/csv; charset=utf-8');
       header('Content-Disposition: attachment; filename=requests.csv');
       
       $output = fopen('php://output', 'w');
       
       // Заголовки CSV
       fputcsv($output, ['Номер', 'Дата', 'ФИО', 'Телефон', 'Email', 'Сообщение', 'Статус']);
       
       foreach ($requests as $request) {
           fputcsv($output, [
               $request['number'],
               $request['date'],
               $request['fullname'],
               $request['phone'],
               $request['email'] ?? '',
               $request['message'],
               $request['status']
           ]);
       }
       
       fclose($output);
       exit;
   }
   ```

## 9. Техническая документация

### 9.1 Структура файлов

```
project/
├── index.html                 # Главная страница сайта
├── structure.html             # Страница структуры организации
├── privacy.html               # Политика конфиденциальности
├── sitemap.html               # Карта сайта
├── styles.css                 # Основные стили сайта
├── script.js                  # Основной JavaScript
├── simple-modal.js            # Скрипт модального окна формы
├── process_form.php           # Обработчик формы
├── admin.php                  # Панель администратора
├── requests.json              # Файл для хранения обращений
├── flood_protection.json      # Файл для защиты от флуда
├── .htaccess                  # Настройки доступа
├── .htpasswd                  # Файл для HTTP-аутентификации
└── errors.log                 # Журнал ошибок
```

### 9.2 API обработчика формы

**Endpoint:** process_form.php
**Method:** POST
**Content-Type:** application/json

**Запрос:**
```json
{
  "csrf_token": "сгенерированный_токен",
  "fullname": "Иванов Иван Иванович",
  "phone": "+7(123)456-78-90",
  "email": "example@mail.ru",
  "message": "Текст обращения",
  "consent": true,
  "address": "ул. Примерная, д. 1",
  "subject": "Тема обращения",
  "request-type": "Жалоба"
}
```

**Успешный ответ (200 OK):**
```json
{
  "success": true,
  "message": "Обращение успешно отправлено",
  "requestNumber": "ЦСО-1234/2023",
  "requestDate": "01.01.2023"
}
```

**Ошибка (4xx):**
```json
{
  "success": false,
  "message": "Описание ошибки",
  "errors": {
    "field_name": "Описание ошибки для конкретного поля"
  }
}
```

### 9.3 Жизненный цикл обращения

1. **Новое** - обращение только что поступило
2. **В обработке** - обращение принято к рассмотрению
3. **Завершено** - работа с обращением завершена
4. **Отклонено** - обращение отклонено (например, спам)

### 9.4 Рекомендации по обслуживанию

1. **Регулярное резервное копирование:**
   ```bash
   # Создание резервной копии данных (Linux/Mac)
   cp requests.json requests.json.backup-$(date +%Y%m%d)
   
   # Ротация логов
   if [ -f errors.log ] && [ $(stat -c %s errors.log) -gt 5242880 ]; then
       mv errors.log errors.log.old
       touch errors.log
   fi
   ```

2. **Обновление системы:**
   - Создайте резервные копии всех файлов перед обновлением
   - Сохраните настройки из process_form.php и admin.php
   - Замените файлы на новые версии
   - Перенесите сохраненные настройки

3. **Мониторинг:**
   - Регулярно проверяйте журнал ошибок
   - Следите за размером файла requests.json (делайте резервные копии при превышении 5 МБ)
   - Проверяйте свободное место на диске

---

При возникновении вопросов или необходимости дополнительной поддержки обращайтесь в техническую поддержку.