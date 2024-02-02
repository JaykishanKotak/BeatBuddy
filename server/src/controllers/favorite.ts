import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import Audio, { AudioDocument } from "#/models/audio";
import Favourite from "#/models/favorite";
import { PopulatedFavList } from "#/@types/audio";
import { paginationQuery } from "#/@types/misc";

export const toggleFavorite: RequestHandler = async (req, res) => {
  /**
   * case 1 : audio is alredy in fav list, remove it
   * case 2 : user is try to create fav new list
   * case 3 : user try to add new audio in fav old list
   */

  const audioId = req.query.audioId as string;

  let status: "added" | "removed";

  if (!isValidObjectId(audioId)) {
    return res.status(422).json({ error: "audio Id is not valid!" });
  }
  const audio = await Audio.findById(audioId);

  if (!audio) {
    return res.status(404).json({ error: "Resources not found!" });
  }

  const alreadyExists = await Favourite.findOne({
    owner: req.user.id,
    items: audioId,
  });

  //case 1 - remove from list if already exists
  if (alreadyExists) {
    await Favourite.updateOne(
      {
        owner: req.user.id,
      },
      {
        $pull: { items: audioId },
      }
    );
    status = "removed";
  } else {
    //add new audio
    const favorite = await Favourite.findOne({
      owner: req.user.id,
    });
    if (favorite) {
      //case - 3 user try to add new audio in fav old list
      await Favourite.updateOne(
        { owner: req.user.id },
        //set is js inbuild type which does not allow duplicate entries
        { $addToSet: { items: [audioId] } }
      );
    } else {
      //case - 2 user is try to create fav new list
      await Favourite.create({ owner: req.user.id, items: [audioId] });
    }
    status = "added";
  }

  //add likes
  if (status === "added") {
    await Audio.findByIdAndUpdate(audioId, {
      $addToSet: { likes: req.user.id },
    });
  }

  //remove
  if (status === "removed") {
    await Audio.findByIdAndUpdate(audioId, {
      $pull: { likes: req.user.id },
    });
  }
  res.json({ status });
};

export const getFavourites: RequestHandler = async (req, res) => {
  const userId = req.user.id;

  const { pageNo = "0", limit = "20" } = req.query as paginationQuery;
  const favorite = await Favourite.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $project: {
        audioIds: {
          $slice: [
            "$items",
            parseInt(pageNo) * parseInt(limit),
            parseInt(limit),
          ],
        },
      },
    },
    {
      $unwind: "$audioIds",
    },
    {
      $lookup: {
        from: "audios",
        localField: "audioIds",
        foreignField: "_id",
        as: "audioInfo",
      },
    },
    {
      $unwind: "$audioInfo",
    },
    {
      $lookup: {
        from: "users",
        localField: "audioInfo.owner",
        foreignField: "_id",
        as: "ownerInfo",
      },
    },
    {
      $unwind: "$ownerInfo",
    },
    {
      $project: {
        _id: 0,
        id: "$audioInfo._id",
        title: "$audioInfo.title",
        about: "$audioInfo.about",
        category: "$audioInfo.category",
        file: "$audioInfo.file.url",
        poster: "$audioInfo.poster.url",
        owner: {
          name: "$ownerInfo.name",
          id: "$ownerInfo._id",
        },
      },
    },
  ]);

  return res.json(favorite);
};

export const getFavouritesOld: RequestHandler = async (req, res) => {
  const userId = req.user.id;

  /**
   * add name of field that need to popluate, it fetchs from the ref path of model
   * First it populates items and then owner which is inside items
   */
  const favorite = await Favourite.findOne({ owner: userId }).populate<{
    items: PopulatedFavList[];
  }>({
    path: "items",
    populate: {
      path: "owner",
    },
  });

  if (!favorite) return res.json({ audios: [] });

  //ts considersd item as object id becuse it does not know about populate
  const audios = favorite.items.map((item) => {
    return {
      id: item._id,
      title: item.title,
      category: item.category,
      file: item.file.url,
      poster: item.poster?.url,
      owner: {
        name: item.owner.name,
        id: item.owner._id,
      },
    };
  });

  res.json({ audios });
};

//To check if favorite list is exists or not and render ui according to it
export const getIsFavorite: RequestHandler = async (req, res) => {
  const audioId = req.query.audioId as string;

  if (!isValidObjectId(audioId)) {
    return res.status(422).json({ error: "audio Id is not valid!" });
  }

  const favorite = await Favourite.findOne({
    owner: req.user.id,
    items: audioId,
  });

  res.json({ result: favorite ? true : false });
};
