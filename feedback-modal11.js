// Простой скрипт для работы с модальным окном обратной связи
document.addEventListener('DOMContentLoaded', function() {
    createFeedbackModal();
    setupFeedbackLinks();
});

// Создаем модальное окно
function createFeedbackModal() {
    // Проверяем, существует ли уже окно
    if (document.getElementById('feedback-modal')) {
        return;
    }
    
    const modalHTML = `
        <div id="feedback-modal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Обратная связь</h2>
                <form id="feedback-form">
                    <div class="form-group">
                        <label for="name">Ваше имя *</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email *</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="phone">Телефон</label>
                        <input type="tel" id="phone" name="phone" placeholder="+7 (___) ___-__-__">
                    </div>
                    <div class="form-group">
                        <label for="message">Сообщение *</label>
                        <textarea id="message" name="message" rows="5" required></textarea>
                    </div>
                    <div class="form-group privacy-checkbox">
                        <input type="checkbox" id="privacy" name="privacy" required>
                        <label for="privacy">Я согласен на обработку персональных данных *</label>
                    </div>
                    <button type="submit" class="btn btn-primary">Отправить</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupModalEvents();
}

// Настройка событий модального окна
function setupModalEvents() {
    const modal = document.getElementById('feedback-modal');
    const closeBtn = modal.querySelector('.close-modal');
    const form = document.getElementById('feedback-form');
    
    // Закрытие по кнопке
    closeBtn.addEventListener('click', function() {
        closeModal();
    });
    
    // Закрытие по клику вне окна
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });
    
    // Отправка формы
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Ваше сообщение успешно отправлено!');
        closeModal();
        form.reset();
    });
}

// Настройка ссылок для открытия модального окна
function setupFeedbackLinks() {
    // Находим все ссылки, ведущие на feedback.html
    const feedbackLinks = document.querySelectorAll('a[href="feedback.html"]');
    
    // Находим кнопки с определенными классами
    const feedbackButtons = document.querySelectorAll('.feedback-link, .contact-btn');
    
    // Находим кнопки в баннере
    const bannerButtons = document.querySelectorAll('.banner-action .btn-primary');
    
    // Объединяем все элементы в один массив
    const allFeedbackElements = [...feedbackLinks, ...feedbackButtons, ...bannerButtons];
    
    // Добавляем обработчики на все элементы
    allFeedbackElements.forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            openModal();
        });
    });
    
    // Проверяем URL на наличие параметра
    if (window.location.search.includes('openModal=feedback')) {
        openModal();
        if (history.pushState) {
            history.pushState('', document.title, window.location.pathname);
        }
    }
}

// Открытие модального окна
function openModal() {
    const modal = document.getElementById('feedback-modal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Закрытие модального окна
function closeModal() {
    const modal = document.getElementById('feedback-modal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
} 