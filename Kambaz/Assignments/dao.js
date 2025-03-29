/*Generated bu AI */
import Database from "../Database/index.js";
import { v4 as uuidv4 } from "uuid";

export function findAllAssignments() {
  return Database.assignments;
}

export function findAssignmentsForModule(moduleId) {
  return Database.assignments.filter(assignment => assignment.module === moduleId);
}

export function createAssignment(assignment) {
  const newAssignment = {
    _id: uuidv4(),
    ...assignment
  };
  Database.assignments.push(newAssignment);
  return newAssignment;
}

export function updateAssignment(assignmentId, assignment) {
  const index = Database.assignments.findIndex(a => a._id === assignmentId);
  if (index === -1) return false;
  Database.assignments[index] = { ...Database.assignments[index], ...assignment };
  return true;
}

export function deleteAssignment(assignmentId) {
  const index = Database.assignments.findIndex(a => a._id === assignmentId);
  if (index === -1) return false;
  Database.assignments.splice(index, 1);
  return true;
}

export default function AssignmentRoutes(app) {

  app.get("/api/assignments", (req, res) => {
    const assignments = findAllAssignments();
    res.send(assignments);
  });


  app.get("/api/modules/:moduleId/assignments", (req, res) => {
    const { moduleId } = req.params;
    const assignments = findAssignmentsForModule(moduleId);
    res.json(assignments);
  });


  app.post("/api/modules/:moduleId/assignments", (req, res) => {
    const { moduleId } = req.params;
    const assignment = {
      ...req.body,
      module: moduleId,
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