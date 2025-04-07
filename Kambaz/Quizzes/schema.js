import mongoose from "mongoose";

const ChoiceSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
});

const QuestionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    points: { type: Number, default: 1 },
    questionType: {
      type: String,
      enum: ["MULTIPLE_CHOICE", "TRUE_FALSE", "FILL_BLANK"],
      required: true,
    },
    questionText: { type: String, required: true },
    choices: [ChoiceSchema],
    correctAnswer: { type: Boolean },
    correctAnswers: [{ type: String }],
  },
  { timestamps: true }
);

const AttemptSchema = new mongoose.Schema(
  {
    user: { 
      type: String, 
      ref: "User", 
      required: true
    },
    quiz: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Quiz", 
      required: true,
      get: v => v ? v.toString() : v
    },
    answers: [
      {
        question: { 
          type: mongoose.Schema.Types.ObjectId,
          get: v => v ? v.toString() : v
        },
        answerChoice: { 
          type: mongoose.Schema.Types.ObjectId,
          get: v => v ? v.toString() : v,
          required: false
        },
        answerBoolean: { 
          type: Boolean,
          default: null
        },
        answerText: { 
          type: String,
          default: ""
        },
        isCorrect: { type: Boolean, default: false },
      },
    ],
    score: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
  },
  { 
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

const QuizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: function() { return !this.courseCode; }
    },
    courseCode: {
      type: String,
      required: function() { return !this.course; }
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function() { return !this.creatorId; }
    },
    creatorId: {
      type: String,
      required: function() { return !this.creator; }
    },
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
    timeLimit: { type: Number, default: 20 },
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
  },
  { timestamps: true }
);

// 若有需要虛擬屬性，可加上
// QuizSchema.virtual('courseId').get(function() {
//   return this.course.toString();
// });
// QuizSchema.virtual('creatorId').get(function() {
//   return this.creator.toString();
// });

// 讓 toJSON 包含 virtuals
QuizSchema.set("toJSON", { virtuals: true });

export { QuizSchema, AttemptSchema, QuestionSchema, ChoiceSchema };
