import History from "#/models/history";
import { UserDocument } from "#/models/user";
import { Request } from "express";
import moment from "moment";

export const genrateOTPToken = (length: number = 6) => {
  let otp = "";
  for (let i = 0; i < length; i++) {
    const digit = Math.floor(Math.random() * 10);
    otp += digit;
  }
  return otp;
};

export const formatProfile = (user: UserDocument) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    verified: user.verified,
    avatar: user.avatar?.url,
    followers: user.followers.length,
    followings: user.followings.length,
  };
};

export const getUsersPreviousHistory = async (
  req: Request
): Promise<string[]> => {
  const [result] = await History.aggregate([
    {
      $match: {
        owner: req.user.id,
      },
    },
    {
      $unwind: "$all",
    },
    {
      $match: {
        "all.date": {
          //match only histories those who do not old then 30 days
          $gte: moment().subtract(30, "days").toDate(),
        },
      },
    },
    {
      $group: {
        _id: "$all.audio",
      },
    },
    {
      $lookup: {
        from: "audios",
        localField: "_id",
        foreignField: "_id",
        as: "audioData",
      },
    },
    {
      $unwind: "$audioData",
    },
    //_id nill groups everytihng at one place
    {
      $group: {
        _id: null,
        //get all category but no duplicate
        category: {
          $addToSet: "$audioData.category",
        },
      },
    },
  ]);

  if (result) return result.category;

  return [];
};
