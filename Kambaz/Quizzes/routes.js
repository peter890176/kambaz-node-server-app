import * as dao from "./dao.js";
import mongoose from "mongoose";

export default function QuizRoutes(app) {
  // 查詢課程的測驗
  const findQuizzesForCourse = async (req, res) => {
    const { courseId } = req.params;
    const currentUser = req.session["currentUser"];

    console.log(`嘗試獲取課程 ${courseId} 的測驗列表，當前用戶:`, currentUser ? currentUser._id : "未登入");

    if (!currentUser) {
      return res.status(401).json({ message: "未登入" });
    }

    try {
      let quizzes;
      // 學生只看已發布的測驗
      if (currentUser.role === "STUDENT") {
        console.log(`學生角色: ${currentUser._id} 查詢課程 ${courseId} 的已發布測驗`);
        quizzes = await dao.findPublishedForCourse(courseId);
      } else {
        console.log(`教師角色: ${currentUser._id} 查詢課程 ${courseId} 的所有測驗`);
        quizzes = await dao.findQuizzesForCourse(courseId);
      }
      console.log(`成功獲取 ${quizzes.length} 個測驗`);
      res.json(quizzes);
    } catch (err) {
      console.error(`查詢課程 ${courseId} 測驗時出錯:`, err);
      res.status(500).json({ message: "查詢測驗失敗", error: err.message, stack: err.stack });
    }
  };

  // 創建測驗
  const createQuiz = async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        return res.status(401).json({ message: "未登入" });
      }
      if (currentUser.role !== "FACULTY") {
        return res.status(403).json({ message: "無權限創建測驗" });
      }

      const { courseId } = req.params;
      console.log(`嘗試為課程 ${courseId} 創建測驗，用戶:`, currentUser._id);

      // 根據課程ID是否為ObjectId格式處理
      let courseField;
      if (mongoose.isValidObjectId(courseId)) {
        courseField = { course: courseId };
      } else {
        // 如果是課程代碼如 RS101，只使用 courseCode
        courseField = { courseCode: courseId };
      }

      // 只取 currentUser._id 字符串的最後部分，避免 ObjectId 轉換問題
      const creatorId = currentUser._id.toString();

      const quiz = {
        ...req.body,
        ...courseField,  // 只包含一個字段：course 或 courseCode
        creatorId: creatorId,  // 使用 creatorId 代替 creator
      };
      
      console.log("準備創建測驗:", JSON.stringify(quiz));
      const newQuiz = await dao.createQuiz(quiz);
      console.log("測驗創建成功:", newQuiz._id);
      res.json(newQuiz);
    } catch (error) {
      console.error("創建測驗失敗:", error);
      res.status(500).json({ message: "創建測驗失敗", error: error.message, stack: error.stack });
    }
  };

  // 查詢單一測驗
  const findQuizById = async (req, res) => {
    const { quizId } = req.params;
    try {
      const quiz = await dao.findQuizById(quizId);
      res.json(quiz);
    } catch (err) {
      res.status(500).json({ message: "查詢測驗失敗", error: err.message });
    }
  };

  // 更新測驗
  const updateQuiz = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      return res.status(401).json({ message: "未登入" });
    }
    if (currentUser.role !== "FACULTY") {
      return res.status(403).json({ message: "無權限更新測驗" });
    }

    try {
      const quiz = await dao.updateQuiz(quizId, req.body);
      res.json(quiz);
    } catch (err) {
      res.status(500).json({ message: "更新測驗失敗", error: err.message });
    }
  };

  // 刪除測驗
  const deleteQuiz = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];

    if (!currentUser) {
      return res.status(401).json({ message: "未登入" });
    }
    if (currentUser.role !== "FACULTY") {
      return res.status(403).json({ message: "無權限刪除測驗" });
    }

    try {
      const status = await dao.deleteQuiz(quizId);
      res.json(status);
    } catch (err) {
      res.status(500).json({ message: "刪除測驗失敗", error: err.message });
    }
  };

  // 發布測驗
  const publishQuiz = async (req, res) => {
    const { quizId } = req.params;
    try {
      const quiz = await dao.publishQuiz(quizId);
      res.json(quiz);
    } catch (err) {
      res.status(500).json({ message: "發布測驗失敗", error: err.message });
    }
  };

  // 取消發布測驗
  const unpublishQuiz = async (req, res) => {
    const { quizId } = req.params;
    try {
      const quiz = await dao.unpublishQuiz(quizId);
      res.json(quiz);
    } catch (err) {
      res.status(500).json({ message: "取消發布測驗失敗", error: err.message });
    }
  };

  // 創建測驗嘗試
  const createAttempt = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      return res.status(401).json({ message: "未登入" });
    }
    try {
      const limitReached = await dao.isAttemptLimitReached(currentUser._id, quizId);
      if (limitReached) {
        return res.status(400).json({ message: "已達到嘗試次數上限" });
      }
      const attempt = await dao.createAttempt({
        user: currentUser._id,
        quiz: quizId,
        answers: [],
        completed: false,
        startTime: new Date(),
      });
      res.json(attempt);
    } catch (err) {
      res.status(500).json({ message: "創建測驗嘗試失敗", error: err.message });
    }
  };

  // 提交測驗答案
  const submitAttempt = async (req, res) => {
    const { attemptId } = req.params;
    const { answers } = req.body;
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      return res.status(401).json({ message: "未登入" });
    }
    try {
      const attempt = await dao.findAttemptById(attemptId);
      const quiz = await dao.findQuizById(attempt.quiz);
      let score = 0;

      // 根據題目類型計算答案是否正確
      const processedAnswers = answers.map((answer) => {
        let isCorrect = false;
        const question = quiz.questions.id(answer.question);
        if (!question) return { ...answer, isCorrect: false };

        if (question.questionType === "MULTIPLE_CHOICE") {
          const choice = question.choices.id(answer.answerChoice);
          isCorrect = choice && choice.isCorrect;
        } else if (question.questionType === "TRUE_FALSE") {
          isCorrect = answer.answerBoolean === question.correctAnswer;
        } else if (question.questionType === "FILL_BLANK") {
          const userAnswer = (answer.answerText || "").toLowerCase().trim();
          isCorrect = question.correctAnswers.some(
            (ca) => ca.toLowerCase().trim() === userAnswer
          );
        }
        if (isCorrect) {
          score += question.points;
        }
        return { ...answer, isCorrect };
      });

      // 更新嘗試紀錄
      const updatedAttempt = await dao.updateAttempt(attemptId, {
        answers: processedAnswers,
        score,
        completed: true,
        endTime: new Date(),
      });

      res.json(updatedAttempt);
    } catch (err) {
      res.status(500).json({ message: "提交測驗失敗", error: err.message });
    }
  };

  // 查詢用戶在某個測驗的嘗試紀錄
  const findAttemptsForUserAndQuiz = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      return res.status(401).json({ message: "未登入" });
    }
    try {
      const attempts = await dao.findAttemptForUserAndQuiz(currentUser._id, quizId);
      res.json(attempts);
    } catch (err) {
      res.status(500).json({ message: "查詢嘗試失敗", error: err.message });
    }
  };

  // 測試 DAO
  const testDAO = async (req, res) => {
    try {
      const result = await dao.testDAOFunctions();
      res.json({
        message: result.success ? "DAO 測試成功" : "DAO 測試失敗",
        result,
      });
    } catch (error) {
      res.status(500).json({ message: "DAO 測試失敗", error: error.message });
    }
  };

  // Model 方法測試 (範例)
  const testModelMethods = async (req, res) => {
    try {
      // 導入需要的模型
      const { Quiz, Attempt } = dao;
      
      // 建立臨時 Quiz 與 Attempt 來測試
      const tempQuiz = new Quiz({
        title: "模型方法測試",
        course: new mongoose.Types.ObjectId(),
        creator: new mongoose.Types.ObjectId(),
        questions: [
          { title: "Q1", points: 3, questionType: "MULTIPLE_CHOICE", questionText: "Test?" },
          { title: "Q2", points: 2, questionType: "TRUE_FALSE", questionText: "Test2?" },
        ],
      });
      const calculatedPoints = tempQuiz.calculateTotalPoints(); // 預期 = 5

      const tempAttempt = new Attempt({
        user: new mongoose.Types.ObjectId(),
        quiz: new mongoose.Types.ObjectId(),
        answers: [
          { isCorrect: true, points: 3 },
          { isCorrect: false, points: 2 },
        ],
      });
      const calculatedScore = tempAttempt.calculateScore(); // 預期 = 3

      res.json({
        message: "Model 層方法測試完成",
        quizPoints: calculatedPoints,
        attemptScore: calculatedScore,
      });
    } catch (error) {
      console.error("Model 測試失敗:", error);
      res.status(500).json({ message: "Model 測試失敗", error: error.message, stack: error.stack });
    }
  };

  // 測試路由 (建立測驗 + 發布)
  const testQuiz = async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = new mongoose.Types.ObjectId();
      
      console.log(`測試: 嘗試為課程 ${courseId} 創建測驗`);

      // 根據課程ID是否為ObjectId格式處理
      let courseField;
      if (mongoose.isValidObjectId(courseId)) {
        courseField = { course: courseId };
        console.log("測試: 使用ObjectId形式的課程ID");
      } else {
        // 如果是課程代碼如 RS101
        courseField = { courseCode: courseId };
        console.log("測試: 使用課程代碼形式的課程ID");
      }

      const testQuizData = {
        title: "測試測驗",
        ...courseField,
        creator: userId,
        quizType: "GRADED_QUIZ",
        questions: [],
      };
      
      console.log("測試: 測驗數據:", JSON.stringify(testQuizData));
      const testQuiz = await dao.createQuiz(testQuizData);
      console.log("測試: 測驗創建成功, ID:", testQuiz._id);
      
      const publishedQuiz = await dao.publishQuiz(testQuiz._id);
      console.log("測試: 測驗發布成功");

      res.json({
        message: "測試成功",
        quiz: publishedQuiz,
      });
    } catch (error) {
      console.error("測試失敗:", error);
      res.status(500).json({ 
        message: "測試失敗", 
        error: error.message,
        stack: error.stack,
        code: error.code
      });
    }
  };

  // =============== 路由註冊 ===============
  // 測試路由
  app.get("/api/quizzes/test-dao", testDAO);
  app.get("/api/quizzes/test-model", testModelMethods);
  app.get("/api/courses/:courseId/quizzes/test", testQuiz);

  // 一般功能路由
  app.get("/api/courses/:courseId/quizzes", findQuizzesForCourse);
  app.post("/api/courses/:courseId/quizzes", createQuiz);
  app.get("/api/quizzes/:quizId", findQuizById);
  app.put("/api/quizzes/:quizId", updateQuiz);
  app.delete("/api/quizzes/:quizId", deleteQuiz);
  app.put("/api/quizzes/:quizId/publish", publishQuiz);
  app.put("/api/quizzes/:quizId/unpublish", unpublishQuiz);
  app.post("/api/quizzes/:quizId/attempts", createAttempt);
  app.put("/api/attempts/:attemptId", submitAttempt);
  app.get("/api/quizzes/:quizId/attempts", findAttemptsForUserAndQuiz);
}
