# AI FAQ Assistant

A complete Flask + MongoDB web application for an AI-powered FAQ assistant.

## Main Features
- User registration and login
- User dashboard
- AI FAQ chat interface
- Local NLP FAQ matching using TF-IDF and cosine similarity
- Category-based FAQ browsing
- Chat history
- Admin dashboard
- Add, edit and delete FAQs
- User and FAQ statistics
- Responsive modern UI
- MongoDB database

## Technology
- Frontend: HTML5, CSS3, JavaScript
- Backend: Python Flask
- Database: MongoDB
- AI/NLP: scikit-learn TF-IDF + cosine similarity
- IDE: VS Code

## Quick Start

### 1. Install Python
Use Python 3.11+.

### 2. Install MongoDB
Start MongoDB locally on the default port 27017.

### 3. Create virtual environment
```bash
python -m venv venv
```

Windows:
```bash
venv\Scripts\activate
```

### 4. Install packages
```bash
pip install -r requirements.txt
```

### 5. Configure environment
Copy `.env.example` to `.env` and update the values if needed.

### 6. Seed sample data
```bash
python seed.py
```

### 7. Run
```bash
python run.py
```

Open:
http://127.0.0.1:5000

## Default Admin
Email: admin@aifaq.com
Password: Admin@123

Change this password before real deployment.

## Project Flow
User -> Login/Register -> Dashboard -> Ask Question -> AI FAQ Engine -> MongoDB FAQ Knowledge Base -> Answer -> Chat History

Admin -> Login -> Admin Dashboard -> Manage FAQs/Categories -> Analytics

## Important
The built-in AI engine works without a paid API. It uses TF-IDF and cosine similarity to match a user's question with stored FAQs. The architecture can later be connected to an external LLM provider through the optional provider layer.
