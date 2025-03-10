// Функционал навигации для мобильных устройств
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('.nav-list');
    const dropdowns = document.querySelectorAll('.dropdown');

    if (mobileMenuToggle && navList) {
        mobileMenuToggle.addEventListener('click', function() {
            navList.classList.toggle('active');
            console.log('Меню переключено: ' + navList.classList.contains('active'));
        });
    }

    // Фикс для возможной проблемы с всплытием событий
    document.addEventListener('click', function(e) {
        // Закрываем меню при клике вне меню
        if (mobileMenuToggle && navList && navList.classList.contains('active')) {
            if (!navList.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                navList.classList.remove('active');
            }
        }
    });

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

    // Дополнительная проверка состояния меню
    function checkMenuState() {
        const navList = document.querySelector('.nav-list');
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        
        if (!navList || !menuToggle) {
            console.error("Элементы меню не найдены!");
            return;
        }
        
        console.log("Текущее состояние меню:");
        console.log("- Видимость: " + (window.getComputedStyle(navList).display !== 'none' ? 'видимо' : 'скрыто'));
        console.log("- Класс active: " + navList.classList.contains('active'));
        console.log("- z-index: " + window.getComputedStyle(navList).zIndex);
        console.log("- position: " + window.getComputedStyle(navList).position);
    }

    // Запуск проверки при загрузке страницы
    checkMenuState();
    
    // Запускаем проверку при каждом клике на кнопку меню
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            setTimeout(checkMenuState, 100); // Небольшая задержка для обновления DOM
        });
    }
    
    // Явное тестирование мобильного меню
    if (window.innerWidth <= 768) {
        console.log("Мобильный режим активен");
    }
}); 