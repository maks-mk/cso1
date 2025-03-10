/**
 * Модуль модального окна обратной связи
 * Оптимизированная и доступная версия
 */
(function() {
    'use strict';
    
    // Конфигурация модального окна
    const CONFIG = {
        modalId: 'simple-modal',
        animationDuration: 300,
        autoCloseSuccessTimeout: 5000
    };
    
    // DOM-элементы и состояние
    let modal, closeBtn, form, successMessage;
    let lastActiveElement;
    
    // Инициализация при загрузке DOM
    document.addEventListener('DOMContentLoaded', function() {
        initializeModal();
        registerEventHandlers();
        checkUrlForModalTrigger();
    });
    
    /**
     * Инициализация модального окна
     */
    function initializeModal() {
        // Создаем модальное окно, если его еще нет
        if (!document.getElementById(CONFIG.modalId)) {
    createSimpleModal();
        }
        
        // Получаем ссылки на DOM-элементы
        modal = document.getElementById(CONFIG.modalId);
        closeBtn = modal.querySelector('.modal-close');
        form = modal.querySelector('form');
        successMessage = modal.querySelector('#success-message');
        
        // Добавляем маску для телефона
        setupPhoneMask();
        
        // Настраиваем валидацию формы
        setupFormValidation();
    }
    
    /**
     * Регистрация обработчиков событий
     */
    function registerEventHandlers() {
        // Обработка кликов по кнопкам открытия модального окна
        const openButtons = document.querySelectorAll('a[href="feedback.html"], .feedback-link, .banner-action .btn-primary, .contact-btn');
        openButtons.forEach(button => {
            button.addEventListener('click', function(e) {
            e.preventDefault();
            openFeedbackModal();
        });
    });

        // Обработчики закрытия модального окна
        if (closeBtn) {
            closeBtn.addEventListener('click', closeFeedbackModal);
        }
        
        // Закрытие по клику на фон
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeFeedbackModal();
            }
        });
        
        // Закрытие по Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeFeedbackModal();
            }
        });
        
        // Обработка отправки формы
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }
        
        // Обработка фокуса внутри модального окна (для доступности)
        modal.addEventListener('keydown', trapFocus);
    }
    
    /**
     * Проверка URL на наличие параметра для открытия модального окна
     */
    function checkUrlForModalTrigger() {
    if (window.location.search.includes('openModal=feedback')) {
        openFeedbackModal();
            // Очищаем URL от параметров
            const cleanUrl = window.location.pathname;
            history.replaceState({}, document.title, cleanUrl);
        }
    }

    /**
     * Создание модального окна
     */
function createSimpleModal() {
        console.log('Создание модального окна обратной связи');
    // Проверяем, существует ли уже модальное окно
        if (document.getElementById(CONFIG.modalId)) {
        return;
    }

    // Создаем элемент модального окна
    const modal = document.createElement('div');
        modal.id = CONFIG.modalId;
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Обратная связь</h2>
            <form id="simple-feedback-form">
                <div class="form-group">
                    <label for="simple-name">Ваше имя *</label>
                    <input type="text" id="simple-name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="simple-surname">Фамилия *</label>
                    <input type="text" id="simple-surname" name="surname" required>
                </div>
                <div class="form-group">
                    <label for="simple-patronymic">Отчество</label>
                    <input type="text" id="simple-patronymic" name="patronymic">
                </div>
                <div class="form-group">
                    <label for="simple-email">Email *</label>
                    <input type="email" id="simple-email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="simple-phone">Телефон *</label>
                    <input type="tel" id="simple-phone" name="phone" placeholder="+7 (___) ___-__-__" required>
                </div>
                <div class="form-group">
                    <label for="simple-address">Адрес</label>
                    <input type="text" id="simple-address" name="address" placeholder="Город, улица, дом, квартира">
                </div>
                <div class="form-group">
                    <label for="simple-subject">Тема обращения *</label>
                    <select id="simple-subject" name="subject" required>
                        <option value="">Выберите тему</option>
                        <option value="question">Вопрос о услугах</option>
                        <option value="feedback">Отзыв о работе центра</option>
                        <option value="complaint">Жалоба</option>
                        <option value="suggestion">Предложение</option>
                        <option value="other">Другое</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="simple-message">Текст обращения *</label>
                    <textarea id="simple-message" name="message" rows="5" required></textarea>
                </div>
                <div class="form-group">
                    <label for="simple-file">Прикрепить файл</label>
                    <input type="file" id="simple-file" name="attachment">
                    <small>Максимальный размер файла: 5 МБ. Разрешенные форматы: pdf, doc, docx, jpg, png.</small>
                </div>
                <div class="form-group privacy-checkbox">
                    <input type="checkbox" id="simple-privacy" name="privacy" required>
                    <label for="simple-privacy">Я согласен на обработку персональных данных в соответствии с <a href="privacy.html" target="_blank">Политикой конфиденциальности</a> *</label>
                </div>
                <div class="form-group privacy-checkbox">
                    <input type="checkbox" id="simple-terms" name="terms" required>
                    <label for="simple-terms">Я ознакомлен и согласен с <a href="#" target="_blank">Правилами подачи обращений</a> *</label>
                </div>
                <p class="form-note"><small>Поля, отмеченные * обязательны для заполнения</small></p>
                <button type="submit" class="btn btn-primary">Отправить обращение</button>
            </form>
        </div>
    `;

    // Добавляем окно в документ
    document.body.appendChild(modal);

    // Добавляем обработчик закрытия при клике вне окна
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeFeedbackModal();
        }
    });

    // Добавляем обработчик для закрытия по ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeFeedbackModal();
        }
    });

    // Обработчик для кнопки закрытия
    modal.querySelector('.close-modal').addEventListener('click', closeFeedbackModal);

    // Добавляем обработчик отправки формы
    const form = document.getElementById('simple-feedback-form');
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        setTimeout(function () {
            alert('Ваше обращение успешно отправлено! Мы свяжемся с вами в ближайшее время.');
            closeFeedbackModal();
            form.reset();
        }, 500);
    });
}

    /**
     * Открытие модального окна
     */
function openFeedbackModal() {
        // Сохраняем последний активный элемент для восстановления фокуса при закрытии
        lastActiveElement = document.activeElement;
        
        // Отображаем модальное окно
    modal.style.display = 'flex';
        document.body.classList.add('modal-open');
        
        // Сбрасываем форму и скрываем сообщение об успехе
        if (form && successMessage) {
            form.style.display = 'block';
            form.reset();
            successMessage.style.display = 'none';
            
            // Очищаем ошибки валидации
            const errorMessages = form.querySelectorAll('.error.visible');
            errorMessages.forEach(error => error.classList.remove('visible'));
        }
        
        // Устанавливаем фокус на первый элемент формы для доступности
        setTimeout(() => {
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) {
                firstInput.focus();
            } else {
                closeBtn.focus();
            }
        }, 50);
        
        // Добавляем класс для анимации
        setTimeout(() => {
            modal.classList.add('modal-visible');
        }, 10);
    }
    
    /**
     * Закрытие модального окна
     */
function closeFeedbackModal() {
        // Анимация закрытия
        modal.classList.remove('modal-visible');
        
        // Задержка для завершения анимации
        setTimeout(() => {
    modal.style.display = 'none';
            document.body.classList.remove('modal-open');
            
            // Восстанавливаем фокус
            if (lastActiveElement) {
                lastActiveElement.focus();
            }
        }, CONFIG.animationDuration);
    }
    
    /**
     * Обработка отправки формы
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return false;
        }
        
        // Блокируем кнопку отправки
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = 'Отправка...';
        
        // Собираем данные формы
        const formData = new FormData(form);
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });
        
        // Добавляем CSRF-токен
        formObject.csrf_token = "<?php echo $_SESSION['csrf_token']; ?>";
        
        // Отправка данных на сервер
        fetch('process_form.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formObject)
        })
        .then(response => response.json())
        .then(data => {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Отправить';
            
            if (data.success) {
                // Показываем сообщение об успехе
                form.style.display = 'none';
                successMessage.style.display = 'block';
                
                // Заполняем информацию о заявке
                document.getElementById('request-number').textContent = data.requestNumber;
                document.getElementById('request-date').textContent = data.requestDate;
                
                // Закрываем модальное окно через заданное время
                setTimeout(() => {
                    closeFeedbackModal();
                }, CONFIG.autoCloseSuccessTimeout);
            } else {
                // Показываем ошибки
                if (data.errors) {
                    Object.keys(data.errors).forEach(field => {
                        const input = form.querySelector(`[name="${field}"]`);
                        if (input) {
                            const errorElement = input.parentNode.querySelector('.error');
                            if (errorElement) {
                                errorElement.textContent = data.errors[field];
                                errorElement.classList.add('visible');
                            }
                        }
                    });
                } else {
                    alert('Произошла ошибка при отправке формы. Пожалуйста, попробуйте позднее.');
                }
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            submitButton.disabled = false;
            submitButton.innerHTML = 'Отправить';
            alert('Произошла ошибка при отправке формы. Пожалуйста, попробуйте позднее.');
        });
    }
    
    /**
     * Настройка маски для телефона
     */
    function setupPhoneMask() {
        const phoneInput = document.getElementById('simple-phone');
        if (!phoneInput) return;
        
        const phoneMask = '+7 (___) ___-__-__';
        
        phoneInput.addEventListener('focus', function() {
            if (!this.value) {
                this.value = '+7 (';
            }
        });
        
        phoneInput.addEventListener('input', function(e) {
            const val = this.value.replace(/\D/g, '');
            let newVal = '';
            
            if (val.length > 0) {
                newVal = '+' + val.substring(0, 1) + ' ';
            }
            if (val.length > 1) {
                newVal += '(' + val.substring(1, 4);
            }
            if (val.length > 4) {
                newVal += ') ' + val.substring(4, 7);
            }
            if (val.length > 7) {
                newVal += '-' + val.substring(7, 9);
            }
            if (val.length > 9) {
                newVal += '-' + val.substring(9, 11);
            }
            
            this.value = newVal;
        });
    }
    
    /**
     * Настройка валидации формы
     */
    function setupFormValidation() {
        if (!form) return;
        
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateInput(this);
            });
            
            input.addEventListener('input', function() {
                // Если поле было с ошибкой, проверяем при вводе
                const errorElement = this.parentNode.querySelector('.error');
                if (errorElement && errorElement.classList.contains('visible')) {
                    validateInput(this);
                }
            });
        });
    }
    
    /**
     * Валидация одного поля ввода
     */
    function validateInput(input) {
        const errorElement = input.parentNode.querySelector('.error');
        if (!errorElement) return true;
        
        let isValid = true;
        
        // Проверка заполненности обязательных полей
        if (input.required && !input.value.trim()) {
            isValid = false;
        }
        
        // Валидация email
        if (input.type === 'email' && input.value.trim()) {
            const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            if (!emailPattern.test(input.value)) {
                isValid = false;
            }
        }
        
        // Валидация телефона
        if (input.id === 'simple-phone' && input.value.trim()) {
            const phoneDigits = input.value.replace(/\D/g, '');
            if (phoneDigits.length < 11) {
                isValid = false;
            }
        }
        
        // Отображение/скрытие сообщения об ошибке
        if (!isValid) {
            errorElement.classList.add('visible');
        } else {
            errorElement.classList.remove('visible');
        }
        
        return isValid;
    }
    
    /**
     * Валидация всей формы
     */
    function validateForm() {
        const inputs = form.querySelectorAll('input, textarea, select');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    /**
     * Удержание фокуса внутри модального окна (для доступности)
     */
    function trapFocus(e) {
        // Проверяем, что модальное окно видимо
        if (modal.style.display !== 'flex') return;
        
        // Обработка нажатия Tab для циклического перехода
        if (e.key === 'Tab') {
            const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey) {
                // Shift + Tab: если фокус на первом элементе, переходим к последнему
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab: если фокус на последнем элементе, переходим к первому
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    }
    
    // Экспортируем функции для внешнего использования
    window.openFeedbackModal = openFeedbackModal;
    window.closeFeedbackModal = closeFeedbackModal;
})();