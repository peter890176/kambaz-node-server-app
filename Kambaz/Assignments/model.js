import mongoose from "mongoose";
import assignmentSchema from "./schema.js";

const Assignment = mongoose.model("assignments", assignmentSchema);
export default Assignment; 