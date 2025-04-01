import model from "./model.js";

import { v4 as uuidv4 } from "uuid";
export function createModule(module) {
  const newModule = { ...module, _id: uuidv4() };
  return model.create(newModule);
}

export function findModulesForCourse(courseId) {
  return model.find({ course: courseId });
}
export function deleteModule(moduleId) {
  return model.findByIdAndDelete(moduleId);
}

export function updateModule(moduleId, moduleUpdates) {
  return model.findByIdAndUpdate(moduleId, moduleUpdates);
}
  