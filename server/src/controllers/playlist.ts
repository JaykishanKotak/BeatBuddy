import {
  CreatePlaylistRequest,
  PopulatedFavList,
  UpdatePlaylistRequest,
} from "#/@types/audio";
import { RequestHandler } from "express";
import Audio, { AudioDocument } from "#/models/audio";
import Favourite from "#/models/favorite";
import User from "#/models/user";
import Playlist from "#/models/playlist";
import { Types, isValidObjectId } from "mongoose";

export const createPlaylist: RequestHandler = async (
  req: CreatePlaylistRequest,
  res
) => {
  const { title, resId, visibility } = req.body;

  const ownerId = req.user.id;

  /**
   * While create playlist - there can be request with
   * 1. with new playlist name and the audio that user wants to store inside the playlist.
   * 2. or user just want to create an emptyy playlist.
   */

  //create new playlist
  if (resId) {
    const audio = await Audio.findById(resId);

    if (!audio) {
      return res.status(404).json({ error: "Could not found the audio !" });
    }
  }

  const newPlaylist = new Playlist({
    title,
    owner: ownerId,
    visibility,
  });

  //   const newId = new Types.ObjectId(resId);
  if (resId) {
    newPlaylist.items = [resId as any];
  }

  await newPlaylist.save();

  res.status(201).json({
    playlist: {
      id: newPlaylist._id,
      title: newPlaylist.title,
      visibility: newPlaylist.visibility,
    },
  });
};

export const updatePlaylist: RequestHandler = async (
  req: UpdatePlaylistRequest,
  res
) => {
  const { title, id, item, visibility } = req.body;

  const ownerId = req.user.id;

  const playlist = await Playlist.findOneAndUpdate(
    {
      _id: id,
      owner: req.user.id,
    },
    {
      title,
      visibility,
    },
    { new: true }
  );

  if (!playlist) return res.status(404).json({ error: "Playlist not found !" });

  //add audio inside playlist
  if (item) {
    const audio = await Audio.findById(item);
    if (!audio) return res.status(404).json({ error: "Audio not found !" });
    // playlist.items.push(audio._id);
    // await playlist.save();
    await Playlist.findByIdAndUpdate(playlist._id, {
      $addToSet: { items: item },
    });
  }
  res.json({
    playlist: {
      id: playlist._id,
      title: playlist.title,
      visibility: playlist.visibility,
    },
  });
};

export const removePlaylist: RequestHandler = async (req, res) => {
  //playlist?playlistId=123&resId=123&all=yes
  const { playlistId, resId, all } = req.query;

  if (!isValidObjectId(playlistId)) {
    return res.status(422).json({ error: "Invalid playlist id !" });
  }

  if (all === "yes") {
    //remove entier playlist
    const playlist = await Playlist.findOneAndDelete({
      _id: playlistId,
      owner: req.user.id,
    });
    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found !" });
    }
  }

  if (resId) {
    if (!isValidObjectId(resId)) {
      return res.status(422).json({ error: "Invalid audio id !" });
    }

    //single audio remove
    const playlist = await Playlist.findOneAndUpdate(
      {
        _id: playlistId,
        owner: req.user.id,
      },
      {
        $pull: { items: resId },
      }
    );

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found !" });
    }
  }

  res.json({ success: true });
};

export const getPlaylistByProfile: RequestHandler = async (req, res) => {
  const { pageNo = "0", limit = "20" } = req.query as {
    pageNo: string;
    limit: string;
  };

  //we will not remove playlist which is auto genreted
  const data = await Playlist.find({
    owner: req.user.id,
    visibility: { $ne: "auto" },
  })
    .skip(parseInt(pageNo) * parseInt(limit))
    .limit(parseInt(limit))
    .sort("-createdAt");

  const playlist = data.map((item) => {
    return {
      id: item._id,
      title: item.title,
      itemsCount: item.items.length,
      visibility: item.visibility,
    };
  });

  res.json({ playlist });
};

export const getAudios: RequestHandler = async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    return res.status(422).json({ error: "Invalid playlist id !" });
  }

  const playlist = await Playlist.findOne({
    owner: req.user.id,
    _id: playlistId,
  }).populate<{ items: PopulatedFavList[] }>({
    path: "items",
    populate: {
      path: "owner",
      select: "name",
    },
  });
  if (!playlist) {
    return res.status(404).json({ error: "Playlist not found !" });
  }

  const audios = playlist.items.map((item) => {
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
  res.json({
    playlist: {
      id: playlist._id,
      title: playlist.title,
      audios,
    },
  });
};
