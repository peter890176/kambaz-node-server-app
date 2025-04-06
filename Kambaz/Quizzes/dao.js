import { Quiz, Attempt } from "./model.js";
import mongoose from "mongoose";

// 導出模型供路由使用
export { Quiz, Attempt };

// 輔助函數：將字串ID轉換為ObjectId
const toObjectId = (id) => {
  if (!id || !mongoose.isValidObjectId(id)) return id;
  return typeof id === "string" ? new mongoose.Types.ObjectId(id) : id;
};

// ==================== 測驗相關操作 ====================

// 創建測驗
export const createQuiz = async (quiz) => {
  if (!quiz) {
    throw new Error("缺少測驗數據");
  }
  
  console.log("創建測驗，原始數據:", JSON.stringify(quiz));
  
  // 確保 creator 與 course 如果是字串就轉 ObjectId
  if (quiz.creator && typeof quiz.creator === "string" && mongoose.isValidObjectId(quiz.creator)) {
    quiz.creator = toObjectId(quiz.creator);
  }
  
  if (quiz.course && typeof quiz.course === "string" && mongoose.isValidObjectId(quiz.course)) {
    quiz.course = toObjectId(quiz.course);
  }
  
  // 檢查必要的字段
  if (!quiz.course && !quiz.courseCode) {
    throw new Error("缺少課程信息：需要 course 或 courseCode");
  }
  
  if (!quiz.creator && !quiz.creatorId) {
    throw new Error("缺少創建者信息：需要 creator 或 creatorId");
  }
  
  // 確保在創建前移除同名但無效的字段
  if (quiz.course && !mongoose.isValidObjectId(quiz.course) && typeof quiz.course === "string") {
    console.log(`課程ID ${quiz.course} 不是有效的ObjectId，移除該字段並使用courseCode`);
    quiz.courseCode = quiz.course;
    delete quiz.course;
  }
  
  return Quiz.create(quiz);
};

export const findQuizById = (quizId) => {
  return Quiz.findById(quizId);
};

export const updateQuiz = (quizId, quiz) => {
  return Quiz.findByIdAndUpdate(quizId, quiz, { new: true });
};

export const deleteQuiz = (quizId) => {
  return Quiz.findByIdAndDelete(quizId);
};

export const findQuizzesForCourse = async (courseId) => {
  try {
    // 檢查是否為MongoDB ObjectId格式
    let query = {};
    if (mongoose.isValidObjectId(courseId)) {
      query.course = toObjectId(courseId);
      console.log(`使用ObjectId查詢課程測驗: ${courseId}`);
    } else {
      // 假設是課程代碼，如 "RS101"
      query.courseCode = courseId;
      console.log(`使用課程代碼查詢測驗: ${courseId}`);
    }
    
    // 執行查詢並打印結果，幫助調試
    const quizzes = await Quiz.find(query);
    console.log(`找到 ${quizzes.length} 個測驗，查詢條件:`, JSON.stringify(query));
    return quizzes;
  } catch (error) {
    console.error(`查詢課程 ${courseId} 測驗列表失敗:`, error);
    throw error;
  }
};

export const findPublishedForCourse = async (courseId) => {
  try {
    let query = { published: true };
    if (mongoose.isValidObjectId(courseId)) {
      query.course = toObjectId(courseId);
      console.log(`使用ObjectId查詢已發佈測驗: ${courseId}`);
    } else {
      // 假設是課程代碼
      query.courseCode = courseId;
      console.log(`使用課程代碼查詢已發佈測驗: ${courseId}`);
    }
    
    // 執行查詢並打印結果，幫助調試
    const quizzes = await Quiz.find(query);
    console.log(`找到 ${quizzes.length} 個已發佈測驗，查詢條件:`, JSON.stringify(query));
    return quizzes;
  } catch (error) {
    console.error(`查詢課程 ${courseId} 已發佈測驗列表失敗:`, error);
    throw error;
  }
};    

export const publishQuiz = (quizId) => {
  return Quiz.findByIdAndUpdate(quizId, { published: true }, { new: true });
};

export const unpublishQuiz = (quizId) => {
  return Quiz.findByIdAndUpdate(quizId, { published: false }, { new: true });
};

// ==================== 測驗嘗試相關操作 ====================

export const createAttempt = async (attempt) => {
  return Attempt.create(attempt);
};

export const findAttemptById = (attemptId) => {
  return Attempt.findById(attemptId);
};

export const updateAttempt = (attemptId, attempt) => {
  return Attempt.findByIdAndUpdate(attemptId, attempt, { new: true });
};

export const findAttemptsForQuiz = (quizId) => {
  return Attempt.find({ quiz: quizId });
};

export const findAttemptsForUser = (userId) => {
  return Attempt.find({ user: userId });
};

export const findAttemptForUserAndQuiz = (userId, quizId) => {
  return Attempt.find({ user: userId, quiz: quizId }).sort("-createdAt");
};

// 檢查是否超過嘗試次數
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

// ==================== 測試功能(選擇性) ====================

export const testDAOFunctions = async () => {
  try {
    console.log("開始測試 DAO 層功能...");
    const courseId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    // 1. 創建測驗
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
            { text: "否", isCorrect: false },
          ],
        },
      ],
    });

    // 2. 查詢、更新、發布、等等...
    const foundQuiz = await findQuizById(quiz._id);
    const updatedQuiz = await updateQuiz(quiz._id, { title: "更新的測驗標題" });
    const publishedQuiz = await publishQuiz(quiz._id);

    // 3. 創建測驗嘗試
    const attempt = await createAttempt({
      user: userId,
      quiz: quiz._id,
      answers: [],
      completed: false,
      startTime: new Date(),
    });

    // 4. 檢查嘗試次數
    const limitReached = await isAttemptLimitReached(userId, quiz._id);

    // 5. 刪除測驗
    await deleteQuiz(quiz._id);

    console.log("DAO 層功能測試完成!");
    return { success: true, limitReached };
  } catch (error) {
    console.error("DAO 層功能測試失敗:", error);
    return { success: false, error: error.message };
  }
};
