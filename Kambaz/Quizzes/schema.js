// schema.js
import mongoose from "mongoose";

// 選擇題選項結構
const ChoiceSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
});

// 問題基本結構
const QuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  points: { type: Number, default: 1 },
  questionType: {
    type: String, 
    enum: ["MULTIPLE_CHOICE", "TRUE_FALSE", "FILL_BLANK"],
    required: true,
  },
  questionText: { type: String, required: true },
  // 適用於選擇題
  choices: [ChoiceSchema],
  // 適用於是非題
  correctAnswer: { type: Boolean },
  // 適用於填空題
  correctAnswers: [{ type: String }],
}, { timestamps: true });

// 嘗試紀錄結構
const AttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  answers: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    answerChoice: mongoose.Schema.Types.ObjectId, // 選擇題答案
    answerBoolean: Boolean, // 是非題答案
    answerText: String, // 填空題答案
    isCorrect: { type: Boolean, default: false },
  }],
  score: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
}, { timestamps: true });

// 測驗結構
const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quizType: {
    type: String,
    enum: ["GRADED_QUIZ", "PRACTICE_QUIZ", "GRADED_SURVEY", "UNGRADED_SURVEY"],
    default: "GRADED_QUIZ",
  },
  totalPoints: { type: Number, default: 0 },
  assignmentGroup: {
    type: String, 
    enum: ["QUIZZES", "EXAMS", "ASSIGNMENTS", "PROJECT"],
    default: "QUIZZES",
  },
  shuffleAnswers: { type: Boolean, default: true },
  timeLimit: { type: Number, default: 20 }, // 分鐘
  multipleAttempts: { type: Boolean, default: false },
  attemptsAllowed: { type: Number, default: 1 },
  showCorrectAnswers: { type: Boolean, default: false },
  accessCode: { type: String, default: "" },
  oneQuestionAtTime: { type: Boolean, default: true },
  webcamRequired: { type: Boolean, default: false },
  lockQuestionsAfterAnswering: { type: Boolean, default: false },
  dueDate: { type: Date },
  availableDate: { type: Date },
  untilDate: { type: Date },
  published: { type: Boolean, default: false },
  questions: [QuestionSchema],
}, { timestamps: true });

// 只導出 Schema，不創建模型
export { QuizSchema, AttemptSchema, QuestionSchema, ChoiceSchema };