const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT =  5000;

// Middleware
// app.use(cors({
//     origin: ["https://quiz-client-ten.vercel.app"], // Include the protocol
//     methods: ["POST", "GET"],
//     credentials: true
// }));

app.use(express.json()); // Use built-in body parser
app.use(express.urlencoded({ extended: true }));

// const mongoose = require('mongoose');
// require('dotenv').config(); // Make sure to install dotenv with `npm install dotenv`

const mongoURI =  "mongodb+srv://sunilkug20cse:okDVikoMRaItbKej@cluster0.hh4a6bj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  tlsAllowInvalidCertificates: true // Only for development, not recommended for production
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB Atlas');
});

// Quiz Schema
const quizSchema = new mongoose.Schema({
  title: { type: String, uppercase: true }, // Ensure title is uppercase
  questions: [
    {
      questionText: String,
      options: [String],
      correctAnswer: String,
    },
  ],
});

const Quiz = mongoose.model('Quiz', quizSchema);

// Routes
app.post('/api/quizzes', async (req, res) => {
  try {
    const { title, questions } = req.body;
    if (title.length != 0 && questions.length != 0) {

      let quiz = await Quiz.findOne({ title });

      if (quiz) {
        // Quiz already exists, add new questions to it
        quiz.questions = [...quiz.questions, ...questions];
      } else {
        // Create a new quiz
        quiz = new Quiz({ title, questions });
      }

      await quiz.save();
      res.status(201).json(quiz);
    } else {
      res.status(400).json({ error: 'Title or questions cannot be empty' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find({}, '_id title');
    res.json(quizzes);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/', async (req, res) => {
  console.log("Hello");
});

app.get('/api/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
