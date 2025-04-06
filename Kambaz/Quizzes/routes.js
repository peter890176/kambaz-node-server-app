// routes.js
import * as dao from "./dao.js";
import mongoose from "mongoose";

export default function QuizRoutes(app) {
  // 獲取課程的所有測驗
  const findQuizzesForCourse = async (req, res) => {
    const { courseId } = req.params;
    const currentUser = req.session["currentUser"];
    
    if (!currentUser) {
      res.status(401).json({ message: "未登入" });
      return;
    }
    
    let quizzes;
    // 使用最新的 DAO 方法 - 學生只看已發布的測驗
    if (currentUser.role === "STUDENT") {
      quizzes = await dao.findPublishedForCourse(courseId);
    } else {
      quizzes = await dao.findQuizzesForCourse(courseId);
    }
    
    res.json(quizzes);
  };
  
  // 創建新測驗
  const createQuiz = async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.status(401).json({ message: "未登入" });
      return;
    }
    
    if (currentUser.role !== "FACULTY") {
      res.status(403).json({ message: "無權限創建測驗" });
      return;
    }
    
    const quiz = {
      ...req.body,
      creator: currentUser._id
    };
    
    const newQuiz = await dao.createQuiz(quiz);
    res.json(newQuiz);
  };
  
  // 獲取測驗詳情
  const findQuizById = async (req, res) => {
    const { quizId } = req.params;
    const quiz = await dao.findQuizById(quizId);
    res.json(quiz);
  };
  
  // 更新測驗
  const updateQuiz = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];
    
    if (!currentUser) {
      res.status(401).json({ message: "未登入" });
      return;
    }
    
    if (currentUser.role !== "FACULTY") {
      res.status(403).json({ message: "無權限更新測驗" });
      return;
    }
    
    const quiz = await dao.updateQuiz(quizId, req.body);
    res.json(quiz);
  };
  
  // 刪除測驗
  const deleteQuiz = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];
    
    if (!currentUser) {
      res.status(401).json({ message: "未登入" });
      return;
    }
    
    if (currentUser.role !== "FACULTY") {
      res.status(403).json({ message: "無權限刪除測驗" });
      return;
    }
    
    const status = await dao.deleteQuiz(quizId);
    res.json(status);
  };
  
  // 發布測驗
  const publishQuiz = async (req, res) => {
    const { quizId } = req.params;
    const quiz = await dao.publishQuiz(quizId);
    res.json(quiz);
  };
  
  // 取消發布測驗
  const unpublishQuiz = async (req, res) => {
    const { quizId } = req.params;
    const quiz = await dao.unpublishQuiz(quizId);
    res.json(quiz);
  };
  
  // 創建測驗嘗試
  const createAttempt = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];
    
    if (!currentUser) {
      res.status(401).json({ message: "未登入" });
      return;
    }
    
    // 使用 DAO 方法檢查是否已達到嘗試次數上限
    const limitReached = await dao.isAttemptLimitReached(currentUser._id, quizId);
    if (limitReached) {
      res.status(400).json({ message: "已達到嘗試次數上限" });
      return;
    }
    
    const attempt = await dao.createAttempt({
      user: currentUser._id,
      quiz: quizId,
      answers: [],
      completed: false,
      startTime: new Date(),
    });
    
    res.json(attempt);
  };
  
  // 提交測驗答案
  const submitAttempt = async (req, res) => {
    const { attemptId } = req.params;
    const answers = req.body.answers;
    const currentUser = req.session["currentUser"];
    
    if (!currentUser) {
      res.status(401).json({ message: "未登入" });
      return;
    }
    
    // 計算得分
    const attempt = await dao.findAttemptById(attemptId);
    const quiz = await dao.findQuizById(attempt.quiz);
    
    let score = 0;
    const processedAnswers = answers.map(answer => {
      let isCorrect = false;
      const question = quiz.questions.id(answer.question);
      
      if (question.questionType === "MULTIPLE_CHOICE") {
        const choice = question.choices.id(answer.answerChoice);
        isCorrect = choice && choice.isCorrect;
      } else if (question.questionType === "TRUE_FALSE") {
        isCorrect = answer.answerBoolean === question.correctAnswer;
      } else if (question.questionType === "FILL_BLANK") {
        // 檢查填空題答案 (不區分大小寫)
        const userAnswer = answer.answerText.toLowerCase().trim();
        isCorrect = question.correctAnswers.some(
          correctAnswer => correctAnswer.toLowerCase().trim() === userAnswer
        );
      }
      
      if (isCorrect) {
        score += question.points;
      }
      
      return {
        ...answer,
        isCorrect
      };
    });
    
    const updatedAttempt = await dao.updateAttempt(attemptId, {
      answers: processedAnswers,
      score,
      completed: true,
      endTime: new Date()
    });
    
    res.json(updatedAttempt);
  };
  
  // 獲取用戶的測驗嘗試
  const findAttemptsForUserAndQuiz = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];
    
    if (!currentUser) {
      res.status(401).json({ message: "未登入" });
      return;
    }
    
    const attempts = await dao.findAttemptForUserAndQuiz(currentUser._id, quizId);
    res.json(attempts);
  };
  
  // DAO 測試路由
  const testDAO = async (req, res) => {
    try {
      console.log("執行 DAO 測試...");
      const result = await dao.testDAOFunctions();
      res.json({
        message: result.success ? "DAO 測試成功" : "DAO 測試失敗",
        result
      });
    } catch (error) {
      console.error("DAO 測試路由錯誤:", error);
      res.status(500).json({ 
        message: "DAO 測試失敗",
        error: error.message
      });
    }
  };
  
  // Model 層方法測試
  const testModelMethods = async (req, res) => {
    try {
      console.log("執行 Model 層方法測試...");
      
      // 創建臨時測驗實例來測試 calculateTotalPoints 方法
      const tempQuiz = new dao.Quiz({
        title: "模型方法測試",
        description: "測試計算總分方法",
        course: new mongoose.Types.ObjectId(),
        creator: new mongoose.Types.ObjectId(),
        questions: [
          {
            title: "問題1",
            points: 2,
            questionType: "MULTIPLE_CHOICE",
            questionText: "測試問題1?",
            choices: [{ text: "選項1", isCorrect: true }]
          },
          {
            title: "問題2",
            points: 3,
            questionType: "TRUE_FALSE",
            questionText: "測試問題2?",
            correctAnswer: true
          },
          {
            title: "問題3",
            points: 5,
            questionType: "FILL_BLANK",
            questionText: "測試問題3?",
            correctAnswers: ["答案"]
          }
        ]
      });
      
      // 測試計算總分方法
      const calculatedPoints = tempQuiz.calculateTotalPoints();
      const expectedPoints = 10; // 2 + 3 + 5
      
      // 測試嘗試分數計算方法
      const tempAttempt = new dao.Attempt({
        user: new mongoose.Types.ObjectId(),
        quiz: new mongoose.Types.ObjectId(),
        answers: [
          { isCorrect: true, points: 2 },
          { isCorrect: false, points: 3 },
          { isCorrect: true, points: 5 }
        ]
      });
      
      const calculatedScore = tempAttempt.calculateScore();
      const expectedScore = 7; // 2 + 0 + 5 (只計算正確答案)
      
      res.json({
        message: "Model 層方法測試完成",
        results: {
          calculateTotalPoints: {
            calculated: calculatedPoints,
            expected: expectedPoints,
            passed: calculatedPoints === expectedPoints
          },
          calculateScore: {
            calculated: calculatedScore,
            expected: expectedScore,
            passed: calculatedScore === expectedScore
          }
        }
      });
      
    } catch (error) {
      console.error("Model 層方法測試失敗:", error);
      res.status(500).json({ 
        message: "Model 層方法測試失敗",
        error: error.message
      });
    }
  };
  
  // 測試路由 - 用於驗證API功能
  const testQuiz = async (req, res) => {
    try {
      const { courseId } = req.params;
      const currentUser = req.session["currentUser"];
      
      // 使用mongoose建立有效的ObjectId
      const mongooseObjectId = mongoose.Types.ObjectId;
      
      // 建立一個新的有效ObjectId用於creator欄位
      const userId = new mongooseObjectId();
      
      console.log("測試路由 - 創建測驗使用的參數:");
      console.log("課程ID:", courseId);
      console.log("用戶ID:", userId);
      
      // 確保course欄位有值，如果courseId為空，則使用備用ID
      const courseObjectId = courseId ? 
        (mongoose.isValidObjectId(courseId) ? courseId : new mongooseObjectId()) : 
        new mongooseObjectId();
      
      // 創建一個測試測驗
      const testQuiz = await dao.createQuiz({
        title: "測試測驗",
        description: "此測驗僅用於測試API",
        course: courseObjectId, // 確保使用有效的course值
        creator: userId, // 使用有效的ObjectId
        quizType: "GRADED_QUIZ",
        totalPoints: 10,
        questions: [
          {
            title: "測試問題1",
            points: 5,
            questionType: "MULTIPLE_CHOICE",
            questionText: "這是一個測試問題嗎？",
            choices: [
              { text: "是", isCorrect: true },
              { text: "否", isCorrect: false }
            ]
          },
          {
            title: "測試問題2",
            points: 5,
            questionType: "TRUE_FALSE",
            questionText: "這個測試API是有效的",
            correctAnswer: true
          }
        ]
      });
      
      // 發布測驗
      const publishedQuiz = await dao.publishQuiz(testQuiz._id);
      
      res.json({
        message: "測試成功",
        quiz: publishedQuiz
      });
    } catch (error) {
      console.error("測試錯誤:", error);
      res.status(500).json({ 
        message: "測試失敗",
        error: error.message,
        stack: error.stack
      });
    }
  };
  
  // 重要：先註冊測試路由，再註冊通用路由
  // 註冊測試路由
  app.get("/api/quizzes/test-dao", testDAO);
  app.get("/api/quizzes/test-model", testModelMethods);
  app.get("/api/courses/:courseId/quizzes/test", testQuiz);
  
  // 註冊通用路由
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

