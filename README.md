# AI FAQ Assistant API - Server Setup

Training project folder created according to the SERVER SETUP task.

## Commands

npm init -y

npm install express mongoose dotenv cors jsonwebtoken bcrypt @google/genai

## Structure

ai-faq-assistant-api/
├── .env
├── package.json
└── src/
    ├── app.js
    ├── server.js
    ├── config/
    │   └── db.js
    ├── controllers/
    │   ├── authController.js
    │   └── faqController.js
    ├── models/
    │   ├── User.js
    │   └── FAQ.js
    ├── routes/
    │   ├── authRoutes.js
    │   └── faqRoutes.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── errorMiddleware.js
    └── utils/
        ├── tokenUtils.js
        └── aiHelper.js

This is a training/server-setup project. The files provide the requested structure and starter placeholders.
