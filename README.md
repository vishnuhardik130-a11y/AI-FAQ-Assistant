# AI FAQ Assistant - MVC Pattern

This project demonstrates a simple Model-View-Controller (MVC) architecture.

## Architecture

- **Model**: `models/` - MongoDB/Mongoose data models.
- **View**: `views/` - HTML, CSS and browser JavaScript.
- **Controller**: `controllers/` - application/business logic.
- **Routes**: `routes/` - maps HTTP requests to controllers.
- **Database**: `config/db.js` - MongoDB connection.

Flow:

Browser/View -> Routes -> Controller -> Model -> MongoDB
                         |
                         -> JSON response -> View

## Folder Structure

MVC_Pattern_AI_FAQ_Assistant/
├── config/
│   └── db.js
├── controllers/
│   └── faqController.js
├── models/
│   ├── Admin.js
│   ├── FAQ.js
│   └── User.js
├── routes/
│   └── faqRoutes.js
├── views/
│   ├── app.js
│   ├── index.html
│   └── style.css
├── .env.example
├── package.json
├── README.md
└── server.js

## Run

1. Install Node.js and MongoDB.
2. Open this folder in VS Code.
3. Run `npm install`.
4. Copy `.env.example` to `.env` if needed.
5. Start MongoDB.
6. Run `npm start`.
7. Open `http://localhost:5000`.

## API

GET `/api/faqs` - list FAQs

GET `/api/faqs/:id` - get one FAQ

POST `/api/faqs` - create FAQ

Example JSON:
{
  "question": "What is MVC?",
  "answer": "MVC separates the Model, View and Controller responsibilities.",
  "category": "Architecture"
}

DELETE `/api/faqs/:id` - delete an FAQ
