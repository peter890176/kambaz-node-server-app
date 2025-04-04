import mongoose from "mongoose";
import assignmentSchema from "./schema.js";

const Assignment = mongoose.model("assignment", assignmentSchema);
export default Assignment; 