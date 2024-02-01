import mongoose, { Model, ObjectId, Schema, model, models } from "mongoose";

export type historyType = {
  audio: ObjectId;
  progress: Number;
  date: Date;
};

export interface HistoryDocument {
  owner: ObjectId;
  last: historyType;
  all: historyType[];
}

const historySchema = new Schema(
  {
    owner: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    last: {
      audio: {
        type: mongoose.Types.ObjectId,
        ref: "Audio",
      },
      progress: Number,
      date: {
        type: Date,
        required: true,
      },
    },
    all: [
      {
        audio: {
          type: mongoose.Types.ObjectId,
          ref: "Audio",
        },
        progress: Number,
        date: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const History = models.History || model("History", historySchema);

export default History as Model<HistoryDocument>;
