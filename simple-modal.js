document.addEventListener('DOMContentLoaded', function () {
    // Создаем модальное окно только один раз
    createSimpleModal();

    // Находим все кнопки для открытия модального окна
    const allOpenButtons = document.querySelectorAll('a[href="feedback.html"], .feedback-link, .banner-action .btn-primary, .contact-btn');

    // Добавляем обработчики клика
    allOpenButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            openFeedbackModal();
        });
    });

    // Проверяем URL параметры
    if (window.location.search.includes('openModal=feedback')) {
        openFeedbackModal();
        history.replaceState({}, document.title, window.location.pathname);
    }
});

// Функция создания простого модального окна
function createSimpleModal() {
    // Проверяем, существует ли уже модальное окно
    if (document.getElementById('simple-modal')) {
        return;
    }

    // Создаем элемент модального окна
    const modal = document.createElement('div');
    modal.id = 'simple-modal';
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

// Функция открытия модального окна
function openFeedbackModal() {
    const modal = document.getElementById('simple-modal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Функция закрытия модального окна
function closeFeedbackModal() {
    const modal = document.getElementById('simple-modal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

// Экспортируем функцию открытия модального окна
if (!window.openFeedbackModal) {
    window.openFeedbackModal = openFeedbackModal;
}