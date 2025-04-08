import mongoose from "mongoose";
import { QuizSchema, AttemptSchema } from "./schema.js";

// Add instance method to QuizSchema (calculate total points)
QuizSchema.methods.calculateTotalPoints = function () {
  if (!this.questions) return 0;
  return this.questions.reduce((sum, q) => sum + (q.points || 0), 0);
};

// Automatically calculate totalPoints before saving
QuizSchema.pre("save", function (next) {
  this.totalPoints = this.calculateTotalPoints();
  next();
});

// Add score calculation method to AttemptSchema
AttemptSchema.methods.calculateScore = function () {
  if (!this.answers) return 0;
  return this.answers.reduce((sum, answer) => {
    return sum + (answer.isCorrect ? (answer.points || 0) : 0);
  }, 0);
};

// Create and export Models separately
export const Quiz = mongoose.model("Quiz", QuizSchema);
export const Attempt = mongoose.model("Attempt", AttemptSchema);
