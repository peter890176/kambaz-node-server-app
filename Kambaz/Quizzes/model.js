import mongoose from "mongoose";
import { QuizSchema, AttemptSchema } from "./schema.js";

// 在創建模型前添加方法到 Schema

// 注意：移除了 findPublishedForCourse 靜態方法，改為在 dao.js 中實現

// 添加實例方法
QuizSchema.methods.calculateTotalPoints = function() {
  let totalPoints = 0;
  if (this.questions && this.questions.length > 0) {
    totalPoints = this.questions.reduce((sum, q) => sum + (q.points || 0), 0);
  }
  return totalPoints;
};

// 添加中間件以在保存前自動計算總分
QuizSchema.pre("save", function(next) {
  this.totalPoints = this.calculateTotalPoints();
  next();
});

// 為 Attempt 添加計算分數的方法
AttemptSchema.methods.calculateScore = function() {
  let score = 0;
  if (this.answers && this.answers.length > 0) {
    score = this.answers.reduce((sum, answer) => {
      return sum + (answer.isCorrect ? answer.points || 0 : 0);
    }, 0);
  }
  return score;
};

// 創建並導出模型
export const Quiz = mongoose.model("Quiz", QuizSchema);
export const Attempt = mongoose.model("Attempt", AttemptSchema);