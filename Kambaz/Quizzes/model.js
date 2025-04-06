import mongoose from "mongoose";
import { QuizSchema, AttemptSchema } from "./schema.js";

// 為 QuizSchema 添加實例方法 (計算總分)
QuizSchema.methods.calculateTotalPoints = function () {
  if (!this.questions) return 0;
  return this.questions.reduce((sum, q) => sum + (q.points || 0), 0);
};

// 在保存前自動計算 totalPoints
QuizSchema.pre("save", function (next) {
  this.totalPoints = this.calculateTotalPoints();
  next();
});

// 為 AttemptSchema 添加計算分數的方法
AttemptSchema.methods.calculateScore = function () {
  if (!this.answers) return 0;
  return this.answers.reduce((sum, answer) => {
    return sum + (answer.isCorrect ? (answer.points || 0) : 0);
  }, 0);
};

// 分別創建並匯出 Model
export const Quiz = mongoose.model("Quiz", QuizSchema);
export const Attempt = mongoose.model("Attempt", AttemptSchema);
