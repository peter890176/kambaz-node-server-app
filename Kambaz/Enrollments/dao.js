{/*Generated bu AI */}
/*import Database from "../Database/index.js";
import { v4 as uuidv4 } from "uuid";*/
import model from "./model.js";

export async function findCoursesForUser(userId) {
  const enrollments = await model.find({ user: userId }).populate("course");
  return enrollments.map((enrollment) => enrollment.course);
 }
 export async function findUsersForCourse(courseId) {
  const enrollments = await model.find({ course: courseId }).populate("user");
  return enrollments.map((enrollment) => enrollment.user);
 }
 export function enrollUserInCourse(user, course) {
  return model.create({ user, course, _id: `${user}-${course}` });
 }
 export function unenrollUserFromCourse(user, course) {
  return model.deleteOne({ user, course });
 }

 const enrollUserInCourse = async (req, res) => {
  let { uid, cid } = req.params;
  if (uid === "current") {
    const currentUser = req.session["currentUser"];
    uid = currentUser._id;
  }
  const status = await enrollmentsDao.enrollUserInCourse(uid, cid);
  res.send(status);
};
const unenrollUserFromCourse = async (req, res) => {
  let { uid, cid } = req.params;
  if (uid === "current") {
    const currentUser = req.session["currentUser"];
    uid = currentUser._id;
  }
  const status = await enrollmentsDao.unenrollUserFromCourse(uid, cid);
  res.send(status);
};

 /*
export function findAllEnrollments() {
  return Database.enrollments;
}

export function findEnrollmentsByUser(userId) {
  return Database.enrollments.filter(enrollment => enrollment.user === userId);
}

export function findEnrollmentsByCourse(courseId) {
  return Database.enrollments.filter(enrollment => enrollment.course === courseId);
}

export function enrollUserInCourse(userId, courseId) {
  const enrollment = {
    _id: uuidv4(),
    user: userId,
    course: courseId
  };
  Database.enrollments.push(enrollment);
  return enrollment;
}

export function unenrollUserFromCourse(userId, courseId) {
  const index = Database.enrollments.findIndex(
    e => e.user === userId && e.course === courseId
  );
  if (index === -1) return false;
  Database.enrollments.splice(index, 1);
  return true;
}

export function isUserEnrolledInCourse(userId, courseId) {
  return Database.enrollments.some(
    e => e.user === userId && e.course === courseId
  );
}
*/