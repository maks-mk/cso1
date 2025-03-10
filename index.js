const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const { Firestore } = require('@google-cloud/firestore');

// Инициализация Firestore
const firestore = new Firestore();
const requestsCollection = firestore.collection('feedback_requests');

// Настройка транспорта для отправки писем
const transporter = nodemailer.createTransport({
    host: 'smtp.вашпочта.ru',
    port: 587,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 * Обработчик для Cloud Function
 */
exports.processFeedback = async (req, res) => {
    // Включаем CORS
    res.set('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
        // Предполетный запрос CORS
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
        return;
    }
    
    // Проверяем, что запрос POST
    if (req.method !== 'POST') {
        res.status(405).send({ success: false, message: 'Метод не поддерживается' });
        return;
    }
    
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
            res.status(400).send({ success: false, errors });
            return;
        }
        
        // Генерация номера и даты запроса
        const requestNumber = `ЦСО-${Math.floor(1000 + Math.random() * 9000)}/${new Date().getFullYear()}`;
        const requestDate = new Date().toLocaleDateString('ru-RU');
        
        // Сохранение в Firestore
        const requestData = {
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
        
        await requestsCollection.doc(requestData.id).set(requestData);
        
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
        res.status(200).send({
            success: true,
            message: 'Обращение успешно отправлено',
            requestNumber,
            requestDate
        });
        
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).send({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
}; 