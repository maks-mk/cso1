// Ультра-простая версия модального окна
(function() {
    // Создаем модальное окно при загрузке страницы
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM загружен, создаем модальное окно');
        createBasicModal();
        setupBasicModalLinks();
    });
    
    // Функция создания простого модального окна
    function createBasicModal() {
        // Удаляем старое модальное окно, если оно существует
        var oldModal = document.getElementById('basic-modal');
        if (oldModal) {
            oldModal.parentNode.removeChild(oldModal);
        }
        
        // Создаем новое модальное окно
        var modalElement = document.createElement('div');
        modalElement.id = 'basic-modal';
        modalElement.style.display = 'none';
        modalElement.style.position = 'fixed';
        modalElement.style.zIndex = '99999';
        modalElement.style.left = '0';
        modalElement.style.top = '0';
        modalElement.style.width = '100%';
        modalElement.style.height = '100%';
        modalElement.style.backgroundColor = 'rgba(0,0,0,0.6)';
        modalElement.style.padding = '20px';
        modalElement.style.boxSizing = 'border-box';
        modalElement.style.display = 'none';
        
        // Создаем контент модального окна
        var modalContent = document.createElement('div');
        modalContent.style.backgroundColor = '#ffffff';
        modalContent.style.margin = 'auto';
        modalContent.style.padding = '20px';
        modalContent.style.border = '1px solid #888';
        modalContent.style.width = '90%';
        modalContent.style.maxWidth = '500px';
        modalContent.style.maxHeight = '90vh';
        modalContent.style.overflowY = 'auto';
        modalContent.style.position = 'relative';
        modalContent.style.boxShadow = '0 4px 8px 0 rgba(0,0,0,0.2)';
        modalContent.style.borderRadius = '5px';
        
        // Содержимое модального окна
        modalContent.innerHTML = `
            <span id="basic-modal-close" style="position: absolute; top: 10px; right: 15px; color: #aaa; font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
            <h2 style="margin-top: 0; color: #333; text-align: center;">Обратная связь</h2>
            <form id="basic-feedback-form">
                <div style="margin-bottom: 15px;">
                    <label for="basic-name" style="display: block; margin-bottom: 5px; font-weight: bold;">Ваше имя *</label>
                    <input type="text" id="basic-name" name="name" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label for="basic-email" style="display: block; margin-bottom: 5px; font-weight: bold;">Email *</label>
                    <input type="email" id="basic-email" name="email" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label for="basic-phone" style="display: block; margin-bottom: 5px; font-weight: bold;">Телефон</label>
                    <input type="tel" id="basic-phone" name="phone" placeholder="+7 (___) ___-__-__" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label for="basic-message" style="display: block; margin-bottom: 5px; font-weight: bold;">Сообщение *</label>
                    <textarea id="basic-message" name="message" rows="5" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;"></textarea>
                </div>
                <div style="margin-bottom: 15px; display: flex; align-items: flex-start;">
                    <input type="checkbox" id="basic-privacy" name="privacy" required style="margin-right: 10px; margin-top: 3px;">
                    <label for="basic-privacy">Я согласен на обработку персональных данных *</label>
                </div>
                <button type="submit" style="width: 100%; padding: 10px; background-color: #1e88e5; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Отправить</button>
            </form>
        `;
        
        // Добавляем содержимое в модальное окно
        modalElement.appendChild(modalContent);
        
        // Добавляем модальное окно в документ
        document.body.appendChild(modalElement);
        
        // Добавляем обработчики событий
        document.getElementById('basic-modal-close').addEventListener('click', function() {
            document.getElementById('basic-modal').style.display = 'none';
            document.body.style.overflow = '';
        });
        
        document.getElementById('basic-feedback-form').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Ваше сообщение успешно отправлено!');
            document.getElementById('basic-modal').style.display = 'none';
            document.body.style.overflow = '';
            this.reset();
        });
        
        // Закрытие при клике вне модального окна
        modalElement.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
        
        // Адаптация для черно-белого режима
        function updateModalForGrayscale() {
            console.log('Обновляем модальное окно для черно-белого режима');
            var isGrayscale = document.body.classList.contains('grayscale-mode');
            
            if (isGrayscale) {
                modalElement.style.backgroundColor = 'rgba(0,0,0,0.8)';
                modalContent.style.border = '2px solid #000';
                
                // Обновляем все текстовые элементы
                var textElements = modalContent.querySelectorAll('h2, label');
                for (var i = 0; i < textElements.length; i++) {
                    textElements[i].style.color = '#000';
                }
                
                // Обновляем кнопку
                var button = modalContent.querySelector('button');
                if (button) {
                    button.style.backgroundColor = '#000';
                    button.style.color = '#fff';
                }
                
                // Обновляем закрывающий крестик
                var closeBtn = document.getElementById('basic-modal-close');
                if (closeBtn) {
                    closeBtn.style.color = '#000';
                }
            } else {
                modalElement.style.backgroundColor = 'rgba(0,0,0,0.6)';
                modalContent.style.border = '1px solid #888';
                
                // Сбрасываем стили текстовых элементов
                var textElements = modalContent.querySelectorAll('h2, label');
                for (var i = 0; i < textElements.length; i++) {
                    textElements[i].style.color = '';
                }
                
                // Сбрасываем стиль кнопки
                var button = modalContent.querySelector('button');
                if (button) {
                    button.style.backgroundColor = '#1e88e5';
                    button.style.color = '#fff';
                }
                
                // Сбрасываем стиль закрывающего крестика
                var closeBtn = document.getElementById('basic-modal-close');
                if (closeBtn) {
                    closeBtn.style.color = '#aaa';
                }
            }
        }
        
        // Обновляем стили при открытии
        window.openBasicModal = function() {
            console.log('Открываем модальное окно');
            updateModalForGrayscale();
            
            // Применяем стили для центрирования
            modalElement.style.display = 'flex';
            modalElement.style.alignItems = 'center';
            modalElement.style.justifyContent = 'center';
            
            // Блокируем прокрутку
            document.body.style.overflow = 'hidden';
        };
        
        // Добавляем слушатель для кнопки переключения режима
        var contrastButton = document.getElementById('high-contrast');
        if (contrastButton) {
            contrastButton.addEventListener('click', function() {
                console.log('Кнопка контраста нажата');
                
                // Если модальное окно открыто, обновляем его стили
                if (modalElement.style.display === 'flex') {
                    // Добавляем таймаут, чтобы дать время для переключения класса
                    setTimeout(updateModalForGrayscale, 50);
                }
            });
        }
        
        // Обработка клавиши ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modalElement.style.display === 'flex') {
                modalElement.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }
    
    // Настройка ссылок для открытия модального окна
    function setupBasicModalLinks() {
        var links = document.querySelectorAll('a[href="feedback.html"], .feedback-link, .banner-action .btn-primary');
        
        console.log('Найдено ссылок для модального окна:', links.length);
        
        links.forEach(function(link) {
            link.addEventListener('click', function(e) {
                console.log('Клик по ссылке на модальное окно');
                e.preventDefault();
                window.openBasicModal();
            });
        });
        
        // Проверка URL параметров
        if (window.location.search.includes('openModal=feedback')) {
            console.log('Обнаружен параметр для открытия модального окна');
            window.openBasicModal();
            history.replaceState({}, document.title, window.location.pathname);
        }
    }
})(); 