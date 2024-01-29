import { categories, categoriesTypes } from "#/utils/audio_category";
import mongoose, { Model, ObjectId, Schema, model, models } from "mongoose";

//T takes any type dynamic which comes from document
export interface AudioDocument<T = ObjectId> {
  _id: ObjectId;
  title: string;
  about: string;
  // owner: ObjectId;
  owner: T;
  file: {
    url: string;
    publicId: string;
  };
  poster?: {
    url: string;
    publicId: string;
  };
  likes: ObjectId[];
  category: categoriesTypes;
}

const audioSchema = new Schema<AudioDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    file: {
      type: Object,
      url: String,
      publicId: String,
      required: true,
    },
    poster: {
      type: Object,
      url: String,
      publicId: String,
    },
    likes: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    category: {
      type: String,
      enum: categories,
      default: "Others",
    },
  },
  {
    timestamps: true,
  }
);

// const Audio = models.Audio || model("Audio", audioSchema);

// export default Audio as Model<AudioDocument>;

export default model("Audio", audioSchema) as Model<AudioDocument>;
