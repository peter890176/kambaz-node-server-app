import * as dao from "./dao.js";
import mongoose from "mongoose";

export default function QuizRoutes(app) {
  // Query quizzes for a course
  const findQuizzesForCourse = async (req, res) => {
    const { courseId } = req.params;
    const currentUser = req.session["currentUser"];

    console.log(`Attempting to get quizzes for course ${courseId}, current user:`, currentUser ? currentUser._id : "Not logged in");

    if (!currentUser) {
      return res.status(401).json({ message: "Not logged in" });
    }

    try {
      let quizzes;
      // Students only see published quizzes
      if (currentUser.role === "STUDENT") {
        console.log(`Student role: ${currentUser._id} querying published quizzes for course ${courseId}`);
        quizzes = await dao.findPublishedForCourse(courseId);
      } else {
        console.log(`Faculty role: ${currentUser._id} querying all quizzes for course ${courseId}`);
        quizzes = await dao.findQuizzesForCourse(courseId);
      }
      console.log(`Successfully retrieved ${quizzes.length} quizzes`);
      res.json(quizzes);
    } catch (err) {
      console.error(`Error querying quizzes for course ${courseId}:`, err);
      res.status(500).json({ message: "Failed to query quizzes", error: err.message, stack: err.stack });
    }
  };

  // Create quiz
  const createQuiz = async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        return res.status(401).json({ message: "Not logged in" });
      }
      if (currentUser.role !== "FACULTY") {
        return res.status(403).json({ message: "No permission to create quiz" });
      }

      const { courseId } = req.params;
      console.log(`Attempting to create quiz for course ${courseId}, user:`, currentUser._id);

      // Handle based on whether courseId is ObjectId format
      let courseField;
      if (mongoose.isValidObjectId(courseId)) {
        courseField = { course: courseId };
      } else {
        // If it's a course code like RS101, only use courseCode
        courseField = { courseCode: courseId };
      }

      // Only take the string part of currentUser._id to avoid ObjectId conversion issues
      const creatorId = currentUser._id.toString();

      const quiz = {
        ...req.body,
        ...courseField,  // Only includes one field: course or courseCode
        creatorId: creatorId,  // Use creatorId instead of creator
      };
      
      console.log("Preparing to create quiz:", JSON.stringify(quiz));
      const newQuiz = await dao.createQuiz(quiz);
      console.log("Quiz created successfully:", newQuiz._id);
      res.json(newQuiz);
    } catch (error) {
      console.error("Failed to create quiz:", error);
      res.status(500).json({ message: "Failed to create quiz", error: error.message, stack: error.stack });
    }
  };

  // Query single quiz
  const findQuizById = async (req, res) => {
    const { quizId } = req.params;
    try {
      const quiz = await dao.findQuizById(quizId);
      res.json(quiz);
    } catch (err) {
      res.status(500).json({ message: "Failed to query quiz", error: err.message });
    }
  };

  // Update quiz
  const updateQuiz = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      return res.status(401).json({ message: "Not logged in" });
    }
    if (currentUser.role !== "FACULTY") {
      return res.status(403).json({ message: "No permission to update quiz" });
    }

    try {
      const quiz = await dao.updateQuiz(quizId, req.body);
      res.json(quiz);
    } catch (err) {
      res.status(500).json({ message: "Failed to update quiz", error: err.message });
    }
  };

  // Delete quiz
  const deleteQuiz = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];

    if (!currentUser) {
      return res.status(401).json({ message: "Not logged in" });
    }
    if (currentUser.role !== "FACULTY") {
      return res.status(403).json({ message: "No permission to delete quiz" });
    }

    try {
      const status = await dao.deleteQuiz(quizId);
      res.json(status);
    } catch (err) {
      res.status(500).json({ message: "Failed to delete quiz", error: err.message });
    }
  };

  // Publish quiz
  const publishQuiz = async (req, res) => {
    const { quizId } = req.params;
    try {
      const quiz = await dao.publishQuiz(quizId);
      res.json(quiz);
    } catch (err) {
      res.status(500).json({ message: "Failed to publish quiz", error: err.message });
    }
  };

  // Unpublish quiz
  const unpublishQuiz = async (req, res) => {
    const { quizId } = req.params;
    try {
      const quiz = await dao.unpublishQuiz(quizId);
      res.json(quiz);
    } catch (err) {
      res.status(500).json({ message: "Failed to unpublish quiz", error: err.message });
    }
  };

  // Create quiz attempt
  const createAttempt = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];
    
    console.log("Create quiz attempt request:", {
      quizId,
      currentUser: currentUser ? { 
        _id: currentUser._id, 
        username: currentUser.username,
        role: currentUser.role
      } : null
    });
    
    if (!currentUser) {
      return res.status(401).json({ message: "Not logged in" });
    }
    
    if (!quizId) {
      return res.status(400).json({ message: "Missing quiz ID parameter" });
    }
    
    try {
      // Check if quiz exists
      const quiz = await dao.findQuizById(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      console.log(`Checking if user ${currentUser._id} has reached attempt limit for quiz ${quizId}`);
      const limitReached = await dao.isAttemptLimitReached(currentUser._id, quizId);
      if (limitReached) {
        return res.status(400).json({ message: "Attempt limit reached" });
      }
      
      console.log("Preparing to create attempt record:", {
        user: currentUser._id,
        userType: typeof currentUser._id,
        quiz: quizId,
        quizType: typeof quizId
      });
      
      const attempt = await dao.createAttempt({
        user: currentUser._id,
        quiz: quizId,
        answers: [],
        completed: false,
        startTime: new Date(),
      });
      
      console.log("Attempt record created successfully:", attempt._id);
      res.json(attempt);
    } catch (err) {
      console.error("Failed to create quiz attempt:", err);
      // More detailed error response
      res.status(500).json({ 
        message: "Failed to create quiz attempt", 
        error: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        context: {
          quizId,
          userId: currentUser ? currentUser._id : null
        }
      });
    }
  };

  // Submit quiz answers
  const submitAttempt = async (req, res) => {
    const { attemptId } = req.params;
    let { answers } = req.body;
    const currentUser = req.session["currentUser"];
    
    if (!currentUser) {
      return res.status(401).json({ message: "Not logged in" });
    }
    
    try {
      console.log(`Submitting attempt answers: attemptId=${attemptId}`);
      
      const attempt = await dao.findAttemptById(attemptId);
      if (!attempt) {
        return res.status(404).json({ message: "Attempt record not found" });
      }
      
      // Check if current user is the creator of the attempt
      if (attempt.user.toString() !== currentUser._id.toString()) {
        return res.status(403).json({ message: "No permission to submit another user's quiz" });
      }
      
      const quiz = await dao.findQuizById(attempt.quiz);
      if (!quiz) {
        return res.status(404).json({ message: "Related quiz not found" });
      }
      
      // Clean up answer data, handle null values and type conversion issues
      answers = answers.map(answer => {
        // Handle answerChoice field
        if (!answer.answerChoice || answer.answerChoice === '') {
          delete answer.answerChoice;
        }
        
        // Ensure boolean values are correctly set
        if (answer.answerBoolean === null || answer.answerBoolean === undefined) {
          delete answer.answerBoolean;
        }
        
        // Ensure text values are valid
        if (answer.answerText === null || answer.answerText === '') {
          delete answer.answerText;
        }
        
        return answer;
      });
      
      console.log("Processed answer data:", JSON.stringify(answers));
      
      let score = 0;

      // Calculate if answers are correct based on question type
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

      // Update attempt record
      const updatedAttempt = await dao.updateAttempt(attemptId, {
        answers: processedAnswers,
        score,
        completed: true,
        endTime: new Date(),
      });

      console.log(`Attempt ${attemptId} submitted successfully, score: ${score}/${quiz.totalPoints}`);
      res.json(updatedAttempt);
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      res.status(500).json({ 
        message: "Failed to submit quiz", 
        error: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
      });
    }
  };

  // Query attempts for user and quiz
  const findAttemptsForUserAndQuiz = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session["currentUser"];
    
    console.log(`Getting attempts for user ${currentUser ? currentUser._id : 'Not logged in'} on quiz ${quizId}`);
    
    if (!currentUser) {
      return res.status(401).json({ message: "Not logged in" });
    }
    
    try {
      console.log(`Executing query: user=${currentUser._id}, quiz=${quizId}`);
      const attempts = await dao.findAttemptForUserAndQuiz(currentUser._id, quizId);
      
      // Sort retrieved attempts by creation time in descending order
      const sortedAttempts = attempts.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      console.log(`Found ${sortedAttempts.length} attempt records`);
      res.json(sortedAttempts);
    } catch (err) {
      console.error(`Query attempt failed: ${err.message}`, err);
      res.status(500).json({ 
        message: "Failed to query attempts", 
        error: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
      });
    }
  };

  // Test DAO
  const testDAO = async (req, res) => {
    try {
      const result = await dao.testDAOFunctions();
      res.json({
        message: result.success ? "DAO test successful" : "DAO test failed",
        result,
      });
    } catch (error) {
      res.status(500).json({ message: "DAO test failed", error: error.message });
    }
  };

  // Model method tests (example)
  const testModelMethods = async (req, res) => {
    try {
      // Import needed models
      const { Quiz, Attempt } = dao;
      
      // Create temporary Quiz and Attempt to test
      const tempQuiz = new Quiz({
        title: "Model Method Test",
        course: new mongoose.Types.ObjectId(),
        creator: new mongoose.Types.ObjectId(),
        questions: [
          { title: "Q1", points: 3, questionType: "MULTIPLE_CHOICE", questionText: "Test?" },
          { title: "Q2", points: 2, questionType: "TRUE_FALSE", questionText: "Test2?" },
        ],
      });
      const calculatedPoints = tempQuiz.calculateTotalPoints(); // Expected = 5

      const tempAttempt = new Attempt({
        user: new mongoose.Types.ObjectId(),
        quiz: new mongoose.Types.ObjectId(),
        answers: [
          { isCorrect: true, points: 3 },
          { isCorrect: false, points: 2 },
        ],
      });
      const calculatedScore = tempAttempt.calculateScore(); // Expected = 3

      res.json({
        message: "Model layer method tests completed",
        quizPoints: calculatedPoints,
        attemptScore: calculatedScore,
      });
    } catch (error) {
      console.error("Model test failed:", error);
      res.status(500).json({ message: "Model test failed", error: error.message, stack: error.stack });
    }
  };

  // Test route (create quiz + publish)
  const testQuiz = async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = new mongoose.Types.ObjectId();
      
      console.log(`Test: Attempting to create quiz for course ${courseId}`);

      // Handle based on whether courseId is ObjectId format
      let courseField;
      if (mongoose.isValidObjectId(courseId)) {
        courseField = { course: courseId };
        console.log("Test: Using ObjectId format course ID");
      } else {
        // If it's a course code like RS101
        courseField = { courseCode: courseId };
        console.log("Test: Using course code format course ID");
      }

      const testQuizData = {
        title: "Test Quiz",
        ...courseField,
        creator: userId,
        quizType: "GRADED_QUIZ",
        questions: [],
      };
      
      console.log("Test: Quiz data:", JSON.stringify(testQuizData));
      const testQuiz = await dao.createQuiz(testQuizData);
      console.log("Test: Quiz created successfully, ID:", testQuiz._id);
      
      const publishedQuiz = await dao.publishQuiz(testQuiz._id);
      console.log("Test: Quiz published successfully");

      res.json({
        message: "Test successful",
        quiz: publishedQuiz,
      });
    } catch (error) {
      console.error("Test failed:", error);
      res.status(500).json({ 
        message: "Test failed", 
        error: error.message,
        stack: error.stack,
        code: error.code
      });
    }
  };

  // =============== Route Registration ===============
  // Test routes
  app.get("/api/quizzes/test-dao", testDAO);
  app.get("/api/quizzes/test-model", testModelMethods);
  app.get("/api/courses/:courseId/quizzes/test", testQuiz);

  // General functionality routes
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
