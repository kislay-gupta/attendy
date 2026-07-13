import mongoose, { Schema } from "mongoose";

const leaveSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["Privilege", "Sick", "Casual", "Outdoor Duty"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

leaveSchema.index({ user: 1, createdAt: -1 });
leaveSchema.index({ organization: 1, createdAt: -1 });

export const Leave = mongoose.model("Leave", leaveSchema);
