/*Generated bu AI */
import Assignment from "./model.js";

export const findAllAssignments = () => Assignment.find();

export const findAssignmentsForCourse = (courseId) => 
  Assignment.find({ course: courseId });

export const createAssignment = (assignment) => 
  Assignment.create(assignment);

export const updateAssignment = (assignmentId, assignment) =>
  Assignment.findByIdAndUpdate(assignmentId, assignment, { new: true });

export const deleteAssignment = (assignmentId) =>
  Assignment.findByIdAndDelete(assignmentId);

export const findAssignmentById = (assignmentId) =>
  Assignment.findById(assignmentId);