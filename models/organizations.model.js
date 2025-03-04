import mongoose, { Schema } from "mongoose";

const organizationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
    },
    logo: {
      type: String,
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
      address: {
        type: String,
      },
    },

    users: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
    morningAttendanceDeadline: {
      type: String,
      default: "09:30",
    },
    eveningAttendanceStartTime: {
      type: String,
      default: "17:00",
    },
    workingDays: {
      type: [String],
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: true,
    },
    holidays: {
      type: [Date],
      default: [],
    },
  },
  { timestamps: true }
);

export const Organization = mongoose.model("Organization", organizationSchema);
