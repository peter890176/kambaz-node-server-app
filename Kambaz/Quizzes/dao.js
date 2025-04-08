import { Quiz, Attempt } from "./model.js";
import mongoose from "mongoose";

// Export models for routes to use
export { Quiz, Attempt };

// Helper function: Convert string ID to ObjectId
const toObjectId = (id) => {
  if (!id || !mongoose.isValidObjectId(id)) return id;
  return typeof id === "string" ? new mongoose.Types.ObjectId(id) : id;
};

// ==================== Quiz Operations ====================

// Create quiz
export const createQuiz = async (quiz) => {
  if (!quiz) {
    throw new Error("Missing quiz data");
  }
  
  console.log("Creating quiz, original data:", JSON.stringify(quiz));
  
  // Ensure creator and course are converted to ObjectId if they are strings
  if (quiz.creator && typeof quiz.creator === "string" && mongoose.isValidObjectId(quiz.creator)) {
    quiz.creator = toObjectId(quiz.creator);
  }
  
  if (quiz.course && typeof quiz.course === "string" && mongoose.isValidObjectId(quiz.course)) {
    quiz.course = toObjectId(quiz.course);
  }
  
  // Check required fields
  if (!quiz.course && !quiz.courseCode) {
    throw new Error("Missing course information: course or courseCode required");
  }
  
  if (!quiz.creator && !quiz.creatorId) {
    throw new Error("Missing creator information: creator or creatorId required");
  }
  
  // Ensure invalid fields with the same name are removed before creation
  if (quiz.course && !mongoose.isValidObjectId(quiz.course) && typeof quiz.course === "string") {
    console.log(`Course ID ${quiz.course} is not a valid ObjectId, removing this field and using courseCode`);
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
    // Check if it's a MongoDB ObjectId format
    let query = {};
    if (mongoose.isValidObjectId(courseId)) {
      query.course = toObjectId(courseId);
      console.log(`Using ObjectId to query course quizzes: ${courseId}`);
    } else {
      // Assume it's a course code like "RS101"
      query.courseCode = courseId;
      console.log(`Using course code to query quizzes: ${courseId}`);
    }
    
    // Execute query and print results for debugging
    const quizzes = await Quiz.find(query);
    console.log(`Found ${quizzes.length} quizzes, query conditions:`, JSON.stringify(query));
    return quizzes;
  } catch (error) {
    console.error(`Failed to query quiz list for course ${courseId}:`, error);
    throw error;
  }
};

export const findPublishedForCourse = async (courseId) => {
  try {
    let query = { published: true };
    if (mongoose.isValidObjectId(courseId)) {
      query.course = toObjectId(courseId);
      console.log(`Using ObjectId to query published quizzes: ${courseId}`);
    } else {
      // Assume it's a course code
      query.courseCode = courseId;
      console.log(`Using course code to query published quizzes: ${courseId}`);
    }
    
    // Execute query and print results for debugging
    const quizzes = await Quiz.find(query);
    console.log(`Found ${quizzes.length} published quizzes, query conditions:`, JSON.stringify(query));
    return quizzes;
  } catch (error) {
    console.error(`Failed to query published quiz list for course ${courseId}:`, error);
    throw error;
  }
};    

export const publishQuiz = (quizId) => {
  return Quiz.findByIdAndUpdate(quizId, { published: true }, { new: true });
};

export const unpublishQuiz = (quizId) => {
  return Quiz.findByIdAndUpdate(quizId, { published: false }, { new: true });
};

// ==================== Quiz Attempt Operations ====================

export const createAttempt = async (attempt) => {
  // For the quiz field, convert if it's a valid ObjectId string
  if (attempt.quiz && typeof attempt.quiz === "string" && mongoose.isValidObjectId(attempt.quiz)) {
    attempt.quiz = toObjectId(attempt.quiz);
  }
  
  // user field doesn't need conversion, as schema has been modified to accept string type
  
  console.log("Creating quiz attempt, processed data:", {
    user: attempt.user,
    userType: typeof attempt.user,
    quiz: attempt.quiz,
    quizType: typeof attempt.quiz
  });
  
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
  // Only convert valid ObjectId format strings
  if (typeof quizId === "string" && mongoose.isValidObjectId(quizId)) {
    quizId = toObjectId(quizId);
  }
  
  // userId might be a string, no need to convert
  console.log(`Querying attempts for user ${userId} on quiz ${quizId}`);
  return Attempt.find({ user: userId, quiz: quizId }).sort("-createdAt");
};

// Check if attempt limit has been reached
export const isAttemptLimitReached = async (userId, quizId) => {
  // Only convert valid ObjectId format strings
  if (typeof quizId === "string" && mongoose.isValidObjectId(quizId)) {
    quizId = toObjectId(quizId);
  }
  
  // userId might be a string, no need to convert
  
  const quiz = await findQuizById(quizId);
  if (!quiz) {
    throw new Error(`Quiz with ID ${quizId} not found`);
  }
  
  console.log(`Checking attempt limit for user ${userId} on quiz ${quizId}, multiple attempts allowed: ${quiz.multipleAttempts}, allowed attempts: ${quiz.attemptsAllowed}`);
  const attempts = await findAttemptForUserAndQuiz(userId, quizId);
  console.log(`User has ${attempts.length} attempts`);

  if (!quiz.multipleAttempts && attempts.length > 0) {
    return true;
  }
  if (quiz.multipleAttempts && attempts.length >= quiz.attemptsAllowed) {
    return true;
  }
  return false;
};

// ==================== Test Functions (Optional) ====================

export const testDAOFunctions = async () => {
  try {
    console.log("Starting DAO layer function tests...");
    const courseId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    // 1. Create quiz
    const quiz = await createQuiz({
      title: "DAO Test Quiz",
      description: "Testing DAO layer functionality",
      course: courseId,
      creator: userId,
      quizType: "GRADED_QUIZ",
      questions: [
        {
          title: "Question 1",
          points: 5,
          questionType: "MULTIPLE_CHOICE",
          questionText: "Is this a test question?",
          choices: [
            { text: "Yes", isCorrect: true },
            { text: "No", isCorrect: false },
          ],
        },
      ],
    });

    // 2. Query, update, publish, etc.
    const foundQuiz = await findQuizById(quiz._id);
    const updatedQuiz = await updateQuiz(quiz._id, { title: "Updated Quiz Title" });
    const publishedQuiz = await publishQuiz(quiz._id);

    // 3. Create quiz attempt
    const attempt = await createAttempt({
      user: userId,
      quiz: quiz._id,
      answers: [],
      completed: false,
      startTime: new Date(),
    });

    // 4. Check attempt limit
    const limitReached = await isAttemptLimitReached(userId, quiz._id);

    // 5. Delete quiz
    await deleteQuiz(quiz._id);

    console.log("DAO layer function tests completed!");
    return { success: true, limitReached };
  } catch (error) {
    console.error("DAO layer function tests failed:", error);
    return { success: false, error: error.message };
  }
};
