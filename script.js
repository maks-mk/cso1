// Функционал навигации для мобильных устройств
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('.nav-list');
    const dropdowns = document.querySelectorAll('.dropdown');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navList.classList.toggle('active');
        });
    }

    // Улучшенная обработка выпадающих меню на мобильных устройствах
    if (window.innerWidth <= 768) {
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('a');
            link.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                    
                    // Закрываем все другие открытые выпадающие меню
                    dropdowns.forEach(otherDropdown => {
                        if (otherDropdown !== dropdown && otherDropdown.classList.contains('active')) {
                            otherDropdown.classList.remove('active');
                        }
                    });
                }
            });
        });
    }

    // Функционал панели доступности
    const fontSizeIncrease = document.getElementById('font-size-increase');
    const highContrast = document.getElementById('high-contrast');
    const readAloud = document.getElementById('read-aloud');
    
    let fontSizeIncreased = false;
    let highContrastEnabled = false;
    let synth = window.speechSynthesis;
    let utterance = null;

    if (fontSizeIncrease) {
        fontSizeIncrease.addEventListener('click', function() {
            fontSizeIncreased = !fontSizeIncreased;
            
            if (fontSizeIncreased) {
                document.body.style.fontSize = '120%';
                fontSizeIncrease.style.backgroundColor = 'var(--primary-color)';
                fontSizeIncrease.style.color = 'white';
            } else {
                document.body.style.fontSize = '';
                fontSizeIncrease.style.backgroundColor = '';
                fontSizeIncrease.style.color = '';
            }
        });
    }

    if (highContrast) {
        highContrast.addEventListener('click', function() {
            highContrastEnabled = !highContrastEnabled;
            
            if (highContrastEnabled) {
                // Применяем черно-белый режим
                document.body.classList.add('grayscale-mode');
                highContrast.style.backgroundColor = 'var(--primary-color)';
                highContrast.style.color = 'white';
            } else {
                // Возвращаем обычный цветной режим
                document.body.classList.remove('grayscale-mode');
                highContrast.style.backgroundColor = '';
                highContrast.style.color = '';
            }
        });
    }

    if (readAloud) {
        readAloud.addEventListener('click', function() {
            if (synth.speaking) {
                synth.cancel();
                readAloud.style.backgroundColor = '';
                readAloud.style.color = '';
                return;
            }
            
            // Собираем текст со страницы для чтения
            const pageSections = document.querySelectorAll('h1, h2, h3, p:not(.copyright p)');
            let textToRead = '';
            
            pageSections.forEach(section => {
                textToRead += section.textContent + '. ';
            });
            
            utterance = new SpeechSynthesisUtterance(textToRead);
            utterance.lang = 'ru-RU';
            
            utterance.onend = function() {
                readAloud.style.backgroundColor = '';
                readAloud.style.color = '';
            };
            
            readAloud.style.backgroundColor = 'var(--primary-color)';
            readAloud.style.color = 'white';
            
            synth.speak(utterance);
        });
    }
    
    // Плавная прокрутка для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            if (href !== '#') {
                e.preventDefault();
                
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Анимация появления элементов при прокрутке
    const animateElements = document.querySelectorAll('.service-card, .news-card, .about-image, .about-text, .contacts-info, .contacts-map');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    animateElements.forEach(element => {
        element.classList.add('animate-on-scroll');
        observer.observe(element);
    });
    
    // Обновление года в копирайте
    const copyrightYear = document.querySelector('.copyright p');
    if (copyrightYear) {
        const currentYear = new Date().getFullYear();
        copyrightYear.innerHTML = copyrightYear.innerHTML.replace('2023', currentYear);
    }

    // Добавление стилей для анимаций
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = `
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .animated {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(styleSheet);

    // Код для работы с формой обратной связи, если она есть на странице
    const requestForm = document.getElementById('requestForm');
    if (requestForm) {
        const fileInput = document.getElementById('attach');
        if (fileInput) {
            fileInput.addEventListener('change', function(e) {
                const formGroup = fileInput.closest('.form-group');
                formGroup.classList.remove('has-error');
                
                if (fileInput.files[0]) {
                    // Проверяем размер файла (5 МБ = 5 * 1024 * 1024 байт)
                    if (fileInput.files[0].size > 5 * 1024 * 1024) {
                        formGroup.classList.add('has-error');
                        e.preventDefault();
                    }
                }
            });
        }
        
        // Очистка ошибок при вводе
        const formInputs = requestForm.querySelectorAll('input, textarea, select');
        formInputs.forEach(input => {
            input.addEventListener('input', function() {
                const formGroup = input.closest('.form-group');
                formGroup.classList.remove('has-error');
            });
        });
    }

    // Модальное окно обращений
    const feedbackLinks = document.querySelectorAll('a[href="feedback.html"], .feedback-link, .contact-feedback a');
    const feedbackModal = document.getElementById('feedback-modal');
    
    if (feedbackModal) {
        const closeButton = feedbackModal.querySelector('.modal-close');
        
        // Открытие модального окна по клику на ссылки обратной связи
        feedbackLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                feedbackModal.style.display = 'flex';
                document.body.style.overflow = 'hidden'; // Блокируем прокрутку страницы
            });
        });
        
        // Закрытие модального окна
        closeButton.addEventListener('click', function() {
            feedbackModal.style.display = 'none';
            document.body.style.overflow = ''; // Возвращаем прокрутку
        });
        
        // Закрытие модального окна при клике вне его
        feedbackModal.addEventListener('click', function(e) {
            if (e.target === feedbackModal) {
                feedbackModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
        
        // Обработка формы обращений
        const form = document.getElementById('requestForm');
        const formContainer = document.getElementById('feedback-form');
        const successMessage = document.getElementById('success-message');
        const requestNumber = document.getElementById('request-number');
        const requestDate = document.getElementById('request-date');
        
        // Маска для телефона
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 0) {
                    if (value[0] === '7' || value[0] === '8') {
                        value = value.substring(1);
                    }
                    if (value.length > 0) {
                        value = '7' + value;
                    }
                }
                
                let formattedValue = '';
                if (value.length > 0) {
                    formattedValue = '+' + value[0];
                }
                if (value.length > 1) {
                    formattedValue += ' (' + value.substring(1, 4);
                }
                if (value.length > 4) {
                    formattedValue += ') ' + value.substring(4, 7);
                }
                if (value.length > 7) {
                    formattedValue += '-' + value.substring(7, 9);
                }
                if (value.length > 9) {
                    formattedValue += '-' + value.substring(9, 11);
                }
                
                e.target.value = formattedValue;
            });
        }
        
        // Валидация формы
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                let isValid = true;
                const requiredFields = form.querySelectorAll('[required]');
                
                requiredFields.forEach(field => {
                    const formGroup = field.closest('.form-group');
                    formGroup.classList.remove('has-error');
                    
                    if (field.type === 'checkbox' && !field.checked) {
                        formGroup.classList.add('has-error');
                        isValid = false;
                    } else if (field.value.trim() === '') {
                        formGroup.classList.add('has-error');
                        isValid = false;
                    } else if (field.type === 'email' && field.value.trim() !== '' && !validateEmail(field.value)) {
                        formGroup.classList.add('has-error');
                        isValid = false;
                    } else if (field.id === 'phone' && !validatePhone(field.value)) {
                        formGroup.classList.add('has-error');
                        isValid = false;
                    }
                });
                
                if (isValid) {
                    // Генерируем случайный номер обращения
                    const randomNum = Math.floor(Math.random() * 10000) + 1;
                    requestNumber.textContent = 'ЦСО-' + randomNum + '/' + new Date().getFullYear();
                    
                    // Форматируем текущую дату
                    const currentDate = new Date();
                    const day = String(currentDate.getDate()).padStart(2, '0');
                    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const year = currentDate.getFullYear();
                    requestDate.textContent = day + '.' + month + '.' + year;
                    
                    // Показываем сообщение об успешной отправке
                    formContainer.style.display = 'none';
                    successMessage.style.display = 'block';
                    
                    // Прокручиваем модальное окно к началу
                    const modalBody = feedbackModal.querySelector('.modal-body');
                    if (modalBody) {
                        modalBody.scrollTop = 0;
                    }
                    
                    // Сброс формы через 5 секунд после закрытия модального окна
                    const resetForm = function() {
                        form.reset();
                        formContainer.style.display = 'block';
                        successMessage.style.display = 'none';
                        feedbackModal.removeEventListener('transitionend', resetForm);
                    };
                    
                    // Добавляем обработчик для сброса формы при закрытии
                    feedbackModal.addEventListener('click', function handler(e) {
                        if (e.target === feedbackModal || e.target === closeButton) {
                            setTimeout(resetForm, 300);
                            feedbackModal.removeEventListener('click', handler);
                        }
                    });
                }
            });
        }
        
        // Функция валидации email
        function validateEmail(email) {
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }
        
        // Функция валидации телефона
        function validatePhone(phone) {
            // Проверяем, что в номере не менее 17 символов (включая +7, скобки, пробелы и дефисы)
            return phone.length >= 17;
        }
    }
});

// Добавьте этот код для обработки изменения размера окна
window.addEventListener('resize', function() {
    // Перепроверка ширины окна и обновление логики поведения меню
    const dropdowns = document.querySelectorAll('.dropdown');
    
    if (window.innerWidth <= 768) {
        // Мобильная логика
        dropdowns.forEach(setupMobileDropdown);
    } else {
        // Десктопная логика
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }
});

// Функция настройки выпадающего меню для мобильных устройств
function setupMobileDropdown(dropdown) {
    const link = dropdown.querySelector('a');
    
    // Удаляем старые обработчики, если они есть
    const newLink = link.cloneNode(true);
    link.parentNode.replaceChild(newLink, link);
    
    newLink.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            dropdown.classList.toggle('active');
            
            // Закрываем другие открытые меню
            document.querySelectorAll('.dropdown.active').forEach(otherDropdown => {
                if (otherDropdown !== dropdown) {
                    otherDropdown.classList.remove('active');
                }
            });
        }
    });
} 