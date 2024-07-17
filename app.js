const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/quizDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Quiz schema
const quizSchema = new mongoose.Schema({
    title: String,
    description: String,
    questions: [{
        text: String,
        options: [String],
        correctAnswer: String
    }]
});

const Quiz = mongoose.model('Quiz', quizSchema);

// User schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    quizzesTaken: [mongoose.Schema.Types.ObjectId]
});

const User = mongoose.model('User', userSchema);

// Routes
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.send({ message: 'User registered successfully' });
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
        res.send({ message: 'Login successful', user });
    } else {
        res.status(401).send({ message: 'Invalid credentials' });
    }
});

app.post('/api/quizzes', async (req, res) => {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.send({ message: 'Quiz created successfully', quiz });
});

app.get('/api/quizzes', async (req, res) => {
    const quizzes = await Quiz.find();
    res.send(quizzes);
});

app.post('/api/quiz-take', async (req, res) => {
    const { quizId, answers } = req.body;
    const quiz = await Quiz.findById(quizId);
    let score = 0;

    quiz.questions.forEach((question, index) => {
        if (question.correctAnswer === answers[index]) {
            score++;
        }
    });

    res.send({ score, correctAnswers: quiz.questions.map(q => q.correctAnswer) });
});

// Start server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
