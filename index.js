import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import "dotenv/config";

// === Route Imports ===
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModuleRoutes from "./Kambaz/Modules/routes.js";
import AssignmentRoutes from "./Kambaz/Assignments/routes.js";
import EnrollmentRoutes from "./Kambaz/Enrollments/routes.js";
import QuizRoutes from "./Kambaz/Quizzes/routes.js";

// === MongoDB Connection ===
const CONNECTION_STRING =
  process.env.MONGO_CONNECTION_STRING || "mongodb://127.0.0.1:27017/kambaz";

mongoose
  .connect(CONNECTION_STRING)
  .then(() => console.log("MongoDB connection successful"))
  .catch((err) => console.error("MongoDB connection failed:", err));

const app = express();

// === CORS Configuration ===
app.use(
  cors({
    credentials: true,
    origin: process.env.NETLIFY_URL || "http://localhost:5173",
  })
);

// === Session Configuration ===
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false,
  saveUninitialized: false,
};

if (process.env.NODE_ENV !== "development") {
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
    domain: process.env.NODE_SERVER_DOMAIN,
  };
}
app.use(session(sessionOptions));

// === Parse JSON ===
app.use(express.json());

// === Routes ===
UserRoutes(app);
CourseRoutes(app);
ModuleRoutes(app);
AssignmentRoutes(app);
EnrollmentRoutes(app);
QuizRoutes(app);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server started, listening on port: ${PORT}`);
});
