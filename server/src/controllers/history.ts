import { RequestHandler } from "express";
import History, { historyType } from "#/models/history";
import { paginationQuery } from "#/@types/misc";

/*
    Aggregation in MongoDB is a framework that enables you to process and transform documents from a collection in a variety of ways.

    Aggregation pipelines

    And the entire thing that we have here, this is called aggregation pipeline and why pipeline?

    And the reason for that is the input for the next stage is going to be the output of the previous stage.

    And it's up to you on every stage you want to modify the previous data or the previous input, or you

    just want to pass that out to the next stage.

    You can do all these things inside MongoDB now all the time.

    So aggregation is a framework that enables us to process and transform documents that already explained.

    And this entire thing that we have here is called pipeline.

    the output of the previous stage is going to be the input of this new stage.

    And inside this pipeline we'll have the different stages where we can perform different tasks.

    And at the end we are going to get the result that we want.
 */
export const updateHistory: RequestHandler = async (req, res) => {
  const oldHistory = await History.findOne({ owner: req.user.id });

  const { audio, progress, date } = req.body;

  const history: historyType = {
    audio,
    progress,
    date,
  };
  if (!oldHistory) {
    //create new history
    await History.create({
      owner: req.user.id,
      last: history,
      all: [history],
    });

    return res.json({ success: true });
  }

  const today = new Date();

  const startOfDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const endOfDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );
  const histories = await History.aggregate([
    {
      //find owner from req.
      $match: {
        owner: req.user.id,
      },
    },
    { $unwind: "$all" },
    //get history of same date
    {
      $match: {
        "all.date": {
          $gte: startOfDate,
          $lt: endOfDate,
        },
      },
    },
    {
      $project: {
        _id: 0,
        audioId: "$all.audio",
      },
    },
  ]);

  // const sameDayHistory = histories.find((item) => {
  //   if (item.audioId.toString() === audio) {
  //     return item;
  //   }
  // });

  const sameDayHistory = histories.find(
    ({ audioId }) => audioId.toString() === audio
  );

  //update progress
  if (sameDayHistory) {
    await History.findOneAndUpdate(
      { owner: req.user.id, "all.audio": audio },
      {
        $set: {
          "all.$.progress": progress,
          "all.$.date": date,
        },
      }
    );
  } else {
    await History.findByIdAndUpdate(oldHistory._id, {
      $push: { all: { $each: [history], $position: 0 } },

      $set: { last: history },
    });
  }
  // res.json(histories);
  res.json({ success: true });
};

export const removeHistory: RequestHandler = async (req, res) => {
  //"hisory/historyies?=["123", "1234"]&all?=yes"

  const removeAll = req.query.all === "yes";

  if (removeAll) {
    //remove all history
    await History.findOneAndDelete({ owner: req.user.id });

    return res.json({ success: true });
  }

  const histories = req.query.histories as string;
  const idS = JSON.parse(histories) as string[];
  await History.findOneAndUpdate(
    { owner: req.user.id },
    {
      $pull: {
        all: {
          _id: idS,
        },
      },
    }
  );

  res.json({ success: true });
};

export const getHistories: RequestHandler = async (req, res) => {
  const { pageNo = "0", limit = "20" } = req.query as paginationQuery;

  /**
   * Data Format for Front-end : 

    2024-02-02
      Podcast 1
      Podcast 2
      Podcast 3

    2024-01-02
      Podcast 4
      Podcast 5
      Podcast 6

   */
  const histories = await History.aggregate([
    {
      $match: { owner: req.user.id },
    },
    {
      $project: {
        all: {
          $slice: ["$all", parseInt(limit) * parseInt(pageNo), parseInt(limit)],
        },
      },
    },
    {
      $unwind: "$all",
    },
    {
      $lookup: {
        from: "audios",
        localField: "all.audio",
        foreignField: "_id",
        as: "audioInfo",
      },
    },
    {
      $unwind: "$audioInfo",
    },
    {
      $project: {
        _id: 0,
        // id => history id, audioId => id of the audio
        id: "$all._id",
        audioId: "$audioInfo._id",
        date: "$all.date",
        title: "$audioInfo.title",
      },
    },
    //format according to date
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$date",
          },
        },
        //push rest of data in audio
        audios: {
          $push: "$$ROOT",
        },
      },
    },
    //covert name from _id to date
    {
      $project: {
        _id: 0,
        id: "$id",
        date: "$_id",
        audios: "$$ROOT.audios",
      },
    },
    //unwind changes the indexing so we need to add sort
    {
      $sort: {
        date: -1,
      },
    },
  ]);
  res.json(histories);
};

export const getRecentlyPlayed: RequestHandler = async (req, res) => {
  const match = {
    $match: {
      owner: req.user.id,
    },
  };

  const sliceMatch = {
    $project: {
      //we will send only 10 datas
      myHistory: { $slice: ["$all", 10] },
    },
  };

  const dateSort = {
    $project: {
      histories: {
        $sortArray: {
          input: "$myHistory",
          sortBy: { date: -1 },
        },
      },
    },
  };

  const unwindWithIndex = {
    $unwind: { path: "histories", includeArrayIndex: "index" },
  };

  const audioLookup = {
    $lookup: {
      from: "audios",
      localField: "histories.audio",
      foreignField: "_id",
      as: "audioInfo",
    },
  };

  const unwindAudioInfo = { $unwind: "$audioInfo" };

  const userLookup = {
    $lookup: {
      from: "users",
      localField: "audioInfo.owner",
      foreignField: "_id",
      as: "owner",
    },
  };

  const unwindUser = {
    $unwind: "$owner",
  };

  const projectResult = {
    $project: {
      _id: 0,
      id: "$audioInfo._id",
      title: "$audioInfo.title",
      about: "$audioInfo.about",
      poster: "$audioInfo.poster.url",
      file: "$audioInfo.file.url",
      category: "$audioInfo.category",
      owner: {
        name: "$owner.name",
        id: "$owner._id",
      },
      date: "$histories.date",
      progress: "$histories.progress",
      index: "$index ",
    },
  };

  const audios = await History.aggregate([
    match,
    sliceMatch,
    dateSort,
    unwindWithIndex,
    audioLookup,
    unwindAudioInfo,
    userLookup,
    unwindUser,
    projectResult,
  ]);

  res.json(audios);
};
