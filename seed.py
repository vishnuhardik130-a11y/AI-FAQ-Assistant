from app import create_app
from app.db import get_db
from werkzeug.security import generate_password_hash
from datetime import datetime

app = create_app()

sample_faqs = [
    {
        "question": "How do I reset my password?",
        "answer": "Open the login page, choose Forgot Password, and follow the instructions. In this demo, contact the administrator if password recovery is required.",
        "category": "Account",
        "keywords": ["password", "reset", "forgot", "login"]
    },
    {
        "question": "How do I create an account?",
        "answer": "Click Register, enter your name, email and password, then submit the form.",
        "category": "Account",
        "keywords": ["register", "signup", "account", "create"]
    },
    {
        "question": "What is the AI FAQ Assistant?",
        "answer": "It is a web application that understands a user's question and retrieves the most relevant answer from the FAQ knowledge base.",
        "category": "General",
        "keywords": ["ai", "faq", "assistant", "application"]
    },
    {
        "question": "How can I contact support?",
        "answer": "Use the support/contact information provided by your organization or contact the system administrator.",
        "category": "Support",
        "keywords": ["support", "contact", "help"]
    },
    {
        "question": "How does the FAQ search work?",
        "answer": "The built-in engine converts FAQ text into TF-IDF vectors and compares the user's question using cosine similarity.",
        "category": "Technical",
        "keywords": ["search", "tfidf", "similarity", "faq"]
    },
    {
        "question": "Can an administrator add a new FAQ?",
        "answer": "Yes. An administrator can add, edit and delete FAQ records from the Admin Dashboard.",
        "category": "Admin",
        "keywords": ["admin", "add", "faq", "manage"]
    }
]

with app.app_context():
    db = get_db()
    db.users.update_one(
        {"email": "admin@aifaq.com"},
        {"$set": {
            "name": "System Admin",
            "email": "admin@aifaq.com",
            "password": generate_password_hash("Admin@123"),
            "role": "admin",
            "created_at": datetime.utcnow()
        }},
        upsert=True
    )
    for faq in sample_faqs:
        db.faqs.update_one(
            {"question": faq["question"]},
            {"$set": {**faq, "updated_at": datetime.utcnow()},
             "$setOnInsert": {"created_at": datetime.utcnow()}},
            upsert=True
        )
    print("Seed completed.")
