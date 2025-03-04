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
      required: true,
    },
    photoType: {
      type: String,
      enum: ["Punch In", "Punch Out", "Duty"],
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

photoSchema.plugin(mongooseAggregatePaginate);

export const Photo = mongoose.model("Photo", photoSchema);
