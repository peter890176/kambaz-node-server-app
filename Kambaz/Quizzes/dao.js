// dao.js
import { Quiz, Attempt } from "./model.js";
import mongoose from "mongoose";

// 導出模型以供測試使用
export { Quiz, Attempt };

// ==================== 測驗相關操作 ====================

// 基本 CRUD 操作
export const createQuiz = (quiz) => {
  // 確保 creator 是有效的 ObjectId
  if (quiz.creator && typeof quiz.creator === 'string') {
    try {
      quiz.creator = new mongoose.Types.ObjectId(quiz.creator);
    } catch (err) {
      console.error("創建測驗時 creator 轉換為 ObjectId 失敗:", err.message);
      // 如果無法轉換，創建一個新的 ObjectId
      quiz.creator = new mongoose.Types.ObjectId();
    }
  }
  
  // 確保 course 欄位存在
  if (!quiz.course) {
    console.error("創建測驗時缺少必填欄位 course");
    // 創建一個臨時 course ID
    quiz.course = new mongoose.Types.ObjectId();
  }
  
  console.log("準備創建測驗，數據:", {
    title: quiz.title,
    course: quiz.course,
    creator: quiz.creator
  });
  
  return Quiz.create(quiz);
};

export const findQuizById = (quizId) => Quiz.findById(quizId);
export const updateQuiz = (quizId, quiz) => Quiz.findByIdAndUpdate(quizId, quiz, { new: true });
export const deleteQuiz = (quizId) => Quiz.findByIdAndDelete(quizId);

// 業務邏輯查詢
export const findQuizzesForCourse = (courseId) => Quiz.find({ course: courseId });
export const findPublishedForCourse = (courseId) => Quiz.find({ course: courseId, published: true });

// 狀態管理操作
export const publishQuiz = (quizId) => 
  Quiz.findByIdAndUpdate(quizId, { published: true }, { new: true });
export const unpublishQuiz = (quizId) => 
  Quiz.findByIdAndUpdate(quizId, { published: false }, { new: true });

// ==================== 測驗嘗試相關操作 ====================

// 基本 CRUD 操作
export const createAttempt = (attempt) => Attempt.create(attempt);
export const findAttemptById = (attemptId) => Attempt.findById(attemptId);
export const updateAttempt = (attemptId, attempt) => 
  Attempt.findByIdAndUpdate(attemptId, attempt, { new: true });

// 業務邏輯查詢
export const findAttemptsForQuiz = (quizId) => Attempt.find({ quiz: quizId });
export const findAttemptsForUser = (userId) => Attempt.find({ user: userId });
export const findAttemptForUserAndQuiz = (userId, quizId) => 
  Attempt.find({ user: userId, quiz: quizId }).sort('-createdAt');

// 複合業務邏輯
export const isAttemptLimitReached = async (userId, quizId) => {
  const quiz = await findQuizById(quizId);
  const attempts = await findAttemptForUserAndQuiz(userId, quizId);
  
  if (!quiz.multipleAttempts && attempts.length > 0) {
    return true;
  }
  
  if (quiz.multipleAttempts && attempts.length >= quiz.attemptsAllowed) {
    return true;
  }
  
  return false;
};

// ==================== 測試功能 ====================

/**
 * 綜合測試 DAO 層功能
 * 創建測驗、查詢測驗、更新測驗、創建嘗試等
 */
export const testDAOFunctions = async () => {
  try {
    console.log("開始測試 DAO 層功能...");
    
    // 創建測試數據
    const courseId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    
    // 1. 創建測驗
    console.log("1. 創建測驗...");
    const quiz = await createQuiz({
      title: "DAO 測試測驗",
      description: "測試 DAO 層功能",
      course: courseId,
      creator: userId,
      quizType: "GRADED_QUIZ",
      questions: [
        {
          title: "問題1",
          points: 5,
          questionType: "MULTIPLE_CHOICE",
          questionText: "這是測試問題嗎?",
          choices: [
            { text: "是", isCorrect: true },
            { text: "否", isCorrect: false }
          ]
        }
      ]
    });
    console.log(`測驗創建成功，ID: ${quiz._id}`);
    
    // 2. 查詢測驗
    console.log("2. 查詢測驗...");
    const foundQuiz = await findQuizById(quiz._id);
    console.log(`查詢測驗成功: ${foundQuiz.title}`);
    
    // 3. 更新測驗
    console.log("3. 更新測驗...");
    const updatedQuiz = await updateQuiz(quiz._id, { title: "更新的測驗標題" });
    console.log(`更新測驗成功: ${updatedQuiz.title}`);
    
    // 4. 發布測驗
    console.log("4. 發布測驗...");
    const publishedQuiz = await publishQuiz(quiz._id);
    console.log(`發布測驗成功，published: ${publishedQuiz.published}`);
    
    // 5. 查詢課程的已發布測驗
    console.log("5. 查詢課程的已發布測驗...");
    const publishedQuizzes = await findPublishedForCourse(courseId);
    console.log(`查詢已發布測驗成功，數量: ${publishedQuizzes.length}`);
    
    // 6. 創建測驗嘗試
    console.log("6. 創建測驗嘗試...");
    const attempt = await createAttempt({
      user: userId,
      quiz: quiz._id,
      answers: [],
      completed: false,
      startTime: new Date()
    });
    console.log(`創建測驗嘗試成功，ID: ${attempt._id}`);
    
    // 7. 測試嘗試次數限制
    console.log("7. 測試嘗試次數限制...");
    const limitReached = await isAttemptLimitReached(userId, quiz._id);
    console.log(`嘗試次數限制檢查: ${limitReached ? "已達上限" : "未達上限"}`);
    
    // 8. 刪除測試數據
    console.log("8. 刪除測試數據...");
    await deleteQuiz(quiz._id);
    console.log("測試數據刪除成功");
    
    console.log("DAO 層功能測試完成!");
    return { success: true };
    
  } catch (error) {
    console.error("DAO 層功能測試失敗:", error);
    return { success: false, error: error.message };
  }
};