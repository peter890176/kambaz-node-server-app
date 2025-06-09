/*Generated bu AI */
import * as dao from "./dao.js";
export default function EnrollmentRoutes(app) {


  
const enrollUserInCourse = async (req, res) => {
  try {
    let { uid, cid } = req.params;
    if (uid === "current") {
      const currentUser = req.session["currentUser"];
      uid = currentUser._id;
    }
    const status = await dao.enrollUserInCourse(uid, cid);
    res.json(status);
  } catch (error) {
    console.error("Error enrolling user:", error);
    res.status(500).json({ error: error.message });
  }
};
const unenrollUserFromCourse = async (req, res) => {
  try {
    let { uid, cid } = req.params;
    if (uid === "current") {
      const currentUser = req.session["currentUser"];
      uid = currentUser._id;
    }
    const status = await dao.unenrollUserFromCourse(uid, cid);
    res.json(status);
  } catch (error) {
    console.error("Error unenrolling user:", error);
    res.status(500).json({ error: error.message });
  }
};

  app.get("/api/enrollments", async (req, res) => {
    try {
      const enrollments = await dao.findAllEnrollments();
      res.json(enrollments || []);
    } catch (error) {
      console.error("Error fetching all enrollments:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users/:userId/enrollments", async (req, res) => {
    try {
      const { userId } = req.params;
      const enrollments = await dao.findEnrollmentsByUser(userId);
      res.json(enrollments || []);
    } catch (error) {
      console.error(`Error fetching enrollments for user ${req.params.userId}:`, error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/courses/:courseId/enrollments", (req, res) => {
    const { courseId } = req.params;
    const enrollments = dao.findEnrollmentsByCourse(courseId);
    res.json(enrollments);
  });

  app.post("/api/users/:userId/courses/:courseId/enroll", (req, res) => {
    const { userId, courseId } = req.params;
    const enrollment = dao.enrollUserInCourse(userId, courseId);
    res.json(enrollment);
  });

  app.delete("/api/users/:userId/courses/:courseId/unenroll", (req, res) => {
    const { userId, courseId } = req.params;
    const status = dao.unenrollUserFromCourse(userId, courseId);
    res.json(status);
  });

  app.get("/api/users/:userId/courses/:courseId/enrolled", (req, res) => {
    const { userId, courseId } = req.params;
    const isEnrolled = dao.isUserEnrolledInCourse(userId, courseId);
    res.json(isEnrolled);
  });

  app.post("/api/users/:uid/courses/:cid", enrollUserInCourse);
  app.delete("/api/users/:uid/courses/:cid", unenrollUserFromCourse);


} 
