import mongoose, { Schema } from "mongoose";

const locationLogSchema = new Schema(
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
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    batteryLevel: {
      type: Number,
    },
    timestamp: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

locationLogSchema.index({ user: 1, timestamp: 1 });

export const LocationLog = mongoose.model("LocationLog", locationLogSchema);
