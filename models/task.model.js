import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "ASSIGNED",
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
    checkInPhoto: {
      type: String,
    },
    checkOutPhoto: {
      type: String,
    },
    completionNotes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

taskSchema.index({ assignedTo: 1, createdAt: -1 });
taskSchema.index({ organization: 1, createdAt: -1 });

export const Task = mongoose.model("Task", taskSchema);
