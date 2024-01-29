import mongoose, { Model, ObjectId, Schema, model, models } from "mongoose";

interface FavouriteDocumnet {
  owner: ObjectId;
  items: ObjectId[];
}

const favoriteSchema = new Schema<FavouriteDocumnet>(
  {
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    items: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Audio",
      },
    ],
  },
  {
    timestamps: true,
  }
);

//if we have models.Favourite => use or create new one
const Favorite = models.Favorite || model("Favorite", favoriteSchema);

export default Favorite as Model<FavouriteDocumnet>;
