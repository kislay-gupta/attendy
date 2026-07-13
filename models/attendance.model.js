import mongoose, { Schema } from "mongoose";

const attendanceSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
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
    checkInTime: Date,
    checkOutTime: Date,
    checkInPhoto: String,
    checkOutPhoto: String,
    checkInLocation: {
      latitude: Number,
      longitude: Number,
    },
    checkOutLocation: {
      latitude: Number,
      longitude: Number,
    },
    status: {
      type: String,
      enum: ["PRESENT", "LATE", "ABSENT"],
      default: "PRESENT",
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });
attendanceSchema.index({ organization: 1, date: -1 });

export const Attendance = mongoose.model("Attendance", attendanceSchema);
