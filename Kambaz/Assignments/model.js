import mongoose from "mongoose";
import assignmentSchema from "./schema.js";

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment; 