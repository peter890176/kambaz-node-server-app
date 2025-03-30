{/*Generated bu AI */}
import Database from "../Database/index.js";
import { v4 as uuidv4 } from "uuid";

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
