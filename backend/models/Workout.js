
const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      default: null,
    },

    workoutName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Strength",
        "Cardio",
        "Weight Loss",
        "Muscle Building",
        "Flexibility",
        "General Fitness",
      ],
      default: "General Fitness",
    },

    exercise: {
      type: String,
      required: true,
      trim: true,
    },

    sets: {
      type: Number,
      default: 3,
      min: 1,
    },

    reps: {
      type: Number,
      default: 12,
      min: 1,
    },

    weight: {
      type: Number,
      default: 0,
      min: 0,
    },

    duration: {
      type: Number,
      default: 30,
      min: 1,
    },

    workoutDate: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workout", workoutSchema);
