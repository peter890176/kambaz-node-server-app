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

export default function AssignmentRoutes(app) {

  app.get("/api/assignments", (req, res) => {
    const assignments = findAllAssignments();
    res.send(assignments);
  });


  app.get("/api/courses/:courseId/assignments", (req, res) => {
    const { courseId } = req.params;
    const assignments = findAssignmentsForCourse(courseId);
    res.json(assignments);
  });


  app.post("/api/courses/:courseId/assignments", (req, res) => {
    const { courseId } = req.params;
    const assignment = {
      ...req.body,
      course: courseId,
    };
    const newAssignment = createAssignment(assignment);
    res.json(newAssignment);
  });


  app.put("/api/assignments/:assignmentId", (req, res) => {
    const { assignmentId } = req.params;
    const status = updateAssignment(assignmentId, req.body);
    res.send(status);
  });


  app.delete("/api/assignments/:assignmentId", (req, res) => {
    const { assignmentId } = req.params;
    const status = deleteAssignment(assignmentId);
    res.send(status);
  });
}