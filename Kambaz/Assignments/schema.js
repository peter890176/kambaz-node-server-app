import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: String, required: true },
  description: { type: String, required: true },
  points: { type: Number, required: true },
  due: { type: Date, required: true },
  availableFrom: { type: Date, required: true },
  availableUntil: { type: Date, required: true },
  type: { 
    type: String, 
    enum: ['Assignments', 'Projects', 'Quizzes', 'Exams'],
    required: true 
  },
  gradeDisplay: { 
    type: String, 
    enum: ['Percentage', 'Letter'],
    required: true 
  }
}, {
  timestamps: true
});

export default assignmentSchema;
