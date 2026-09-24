// AI FAQ Assistant - complete backend in ONE file
// Endpoints:
//   1. POST /api/auth/register        (Public)
//   2. POST /api/auth/login           (Public)
//   3. POST /api/faqs                 (Private - Bearer token)
//   4. GET  /api/faqs/search?q=...    (Public)
//   5. POST /api/ai/generate-faq      (Private - Bearer token)

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

/* ------------------------------------------------------------------ */
/* Database connection                                                 */
/* ------------------------------------------------------------------ */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

/* ------------------------------------------------------------------ */
/* Models                                                              */
/* ------------------------------------------------------------------ */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
  },
  { timestamps: true }
);

// Hash the password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

// 'Configuration' is included because the task's sample payload uses it
const CATEGORIES = [
  'Technology',
  'Education',
  'Health',
  'Banking',
  'General',
  'Configuration',
];

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: `{VALUE} is not a valid category. Choose from ${CATEGORIES.join(', ')}`,
      },
      default: 'General',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user reference is required'],
    },
  },
  { timestamps: true }
);

const FAQ = mongoose.model('FAQ', faqSchema);

/* ------------------------------------------------------------------ */
/* Helpers & middleware                                                */
/* ------------------------------------------------------------------ */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const handleError = (res, err) => {
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)[0].message;
    return res.status(400).json({ success: false, message });
  }
  if (err.code === 11000) {
    return res
      .status(400)
      .json({ success: false, message: 'Email is already registered' });
  }
  console.error(err);
  return res
    .status(500)
    .json({ success: false, message: err.message || 'Server error' });
};

// Protects private routes: Authorization: Bearer <JWT Token>
const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, token missing' });
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Not authorized, user not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, token invalid' });
  }
};

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */
app.get('/', (req, res) => {
  res.send('AI FAQ Assistant API is running');
});

// 1. Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    handleError(res, err);
  }
});

// 2. Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    handleError(res, err);
  }
});

// 3. Create FAQ (Private)
app.post('/api/faqs', protect, async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    const faq = await FAQ.create({
      question,
      answer,
      category,
      createdBy: req.user._id,
    });
    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: faq,
    });
  } catch (err) {
    handleError(res, err);
  }
});

// Get all FAQs (Public)
app.get('/api/faqs', async (req, res) => {
  try {
    const faqs = await FAQ.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'FAQs retrieved successfully',
      count: faqs.length,
      data: faqs,
    });
  } catch (err) {
    handleError(res, err);
  }
});

// 4. Search FAQs by keyword (Public)
app.get('/api/faqs/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      return res
        .status(400)
        .json({ success: false, message: 'Search query (q) is required' });
    }
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(safe, 'i');
    const faqs = await FAQ.find({
      $or: [{ question: regex }, { answer: regex }, { category: regex }],
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'FAQs retrieved successfully',
      count: faqs.length,
      data: faqs,
    });
  } catch (err) {
    handleError(res, err);
  }
});

// 5. AI - Generate FAQ pair from a topic (Private)
app.post('/api/ai/generate-faq', protect, async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res
        .status(400)
        .json({ success: false, message: 'Topic is required' });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res
        .status(500)
        .json({ success: false, message: 'GEMINI_API_KEY is not configured' });
    }

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const prompt =
      `Generate one helpful FAQ (a question and a clear, short answer) about this topic: "${topic}". ` +
      `Respond ONLY with JSON in this exact shape: ` +
      `{"question": "...", "answer": "...", "category": "..."} ` +
      `where category is one of: ${CATEGORIES.join(', ')}.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    if (!response.ok) {
      const details = await response.text();
      console.error('Gemini error:', details);
      return res
        .status(502)
        .json({ success: false, message: 'AI service request failed' });
    }

    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const generated = JSON.parse(text.replace(/```json|```/g, '').trim());

    res.status(200).json({
      success: true,
      message: 'FAQ generated successfully',
      data: {
        question: generated.question,
        answer: generated.answer,
        category: CATEGORIES.includes(generated.category)
          ? generated.category
          : 'General',
      },
    });
  } catch (err) {
    handleError(res, err);
  }
});

// Unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

/* ------------------------------------------------------------------ */
/* Start server                                                        */
/* ------------------------------------------------------------------ */
const PORT = process.env.PORT || 8000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
