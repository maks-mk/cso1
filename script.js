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

    // Обработка выпадающих меню на мобильных устройствах
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        
        if (window.innerWidth <= 768) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            });
        }
    });

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
                document.documentElement.style.setProperty('--bg-color', '#000');
                document.documentElement.style.setProperty('--text-color', '#fff');
                document.documentElement.style.setProperty('--text-light', '#ddd');
                document.documentElement.style.setProperty('--light-color', '#222');
                document.documentElement.style.setProperty('--primary-color', '#ffcc00');
                document.documentElement.style.setProperty('--secondary-color', '#ff9900');
                highContrast.style.backgroundColor = 'var(--primary-color)';
                highContrast.style.color = 'black';
            } else {
                document.documentElement.style.setProperty('--bg-color', '');
                document.documentElement.style.setProperty('--text-color', '');
                document.documentElement.style.setProperty('--text-light', '');
                document.documentElement.style.setProperty('--light-color', '');
                document.documentElement.style.setProperty('--primary-color', '');
                document.documentElement.style.setProperty('--secondary-color', '');
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
}); 