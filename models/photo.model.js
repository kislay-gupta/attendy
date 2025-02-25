import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const photoSchema = new Schema(
  {
    img: {
      type: String,
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
    timestamp: {
      type: Date,
      default: Date.now,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    deviceInfo: {
      type: {
        deviceModel: String,
        osVersion: String,
      },
      required: false
    }
  },
  { timestamps: true }
);

photoSchema.plugin(mongooseAggregatePaginate);

export const Photo = mongoose.model("Photo", photoSchema);
