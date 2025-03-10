const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Настройка транспорта для отправки писем
const transporter = nodemailer.createTransport({
    host: 'smtp.вашпочта.ru',
    port: 587,
    secure: false, // true для 465, false для других портов
    auth: {
        user: 'ваш_логин@вашпочта.ru',
        pass: 'ваш_пароль'
    }
});

// Функция для сохранения запроса в файл
async function saveRequest(request) {
    const dbPath = path.join(__dirname, 'data', 'requests.json');
    try {
        // Создаем директорию, если она не существует
        await fs.mkdir(path.dirname(dbPath), { recursive: true });
        
        let requests = [];
        try {
            const data = await fs.readFile(dbPath, 'utf8');
            requests = JSON.parse(data);
        } catch (err) {
            // Файл не существует или пуст, используем пустой массив
        }
        
        // Добавляем новый запрос
        requests.push(request);
        
        // Записываем обновленный список запросов
        await fs.writeFile(dbPath, JSON.stringify(requests, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Ошибка при сохранении запроса:', err);
        return false;
    }
}

// Маршрут для обработки запросов формы
app.post('/api/feedback', async (req, res) => {
    try {
        const { fullname, phone, email, topic, message, consent } = req.body;
        
        // Валидация
        const errors = {};
        if (!fullname) errors.fullname = 'Необходимо указать ФИО';
        if (!phone) errors.phone = 'Необходимо указать телефон';
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Некорректный email';
        if (!message) errors.message = 'Необходимо написать сообщение';
        if (!consent) errors.consent = 'Необходимо согласие на обработку данных';
        
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ success: false, errors });
        }
        
        // Генерация номера и даты запроса
        const requestNumber = `ЦСО-${Math.floor(1000 + Math.random() * 9000)}/${new Date().getFullYear()}`;
        const requestDate = new Date().toLocaleDateString('ru-RU');
        
        // Сохранение запроса
        const newRequest = {
            id: uuidv4(),
            number: requestNumber,
            date: requestDate,
            fullname,
            phone,
            email: email || '',
            topic: topic || 'Другое',
            message,
            status: 'new',
            created_at: new Date().toISOString()
        };
        
        await saveRequest(newRequest);
        
        // Отправка email уведомления
        const mailOptions = {
            from: '"Центр социального обслуживания" <noreply@вашсайт.ru>',
            to: 'cso-1@mail.ru',
            subject: `Новое обращение №${requestNumber}`,
            text: `
                Поступило новое обращение №${requestNumber} от ${requestDate}
                
                ФИО: ${fullname}
                Телефон: ${phone}
                ${email ? `Email: ${email}` : ''}
                Тема: ${topic || 'Другое'}
                
                Сообщение:
                ${message}
            `,
            html: `
                <h2>Поступило новое обращение №${requestNumber} от ${requestDate}</h2>
                <p><strong>ФИО:</strong> ${fullname}</p>
                <p><strong>Телефон:</strong> ${phone}</p>
                ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
                <p><strong>Тема:</strong> ${topic || 'Другое'}</p>
                <h3>Сообщение:</h3>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `
        };
        
        await transporter.sendMail(mailOptions);
        
        // Отправка ответа
        res.json({
            success: true,
            message: 'Обращение успешно отправлено',
            requestNumber,
            requestDate
        });
        
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
}); 