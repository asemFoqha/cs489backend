import { RequestHandler } from "express";
import { ErrorWithStatus, StanderdResponse } from "../helpers/types";

import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import UserModule, { User } from "./users.model";
import GroupsModule from "../groups/groups.model";

export const signin_handler: RequestHandler<
  unknown,
  StanderdResponse<string>,
  { email: string; password: string },
  unknown
> = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await UserModule.findOne({ email });
    if (!user) throw new ErrorWithStatus("User Not Found", 404);

    const match = await compare(password, user.password);
    if (!match) throw new ErrorWithStatus("Wrong Password", 401);

    //generate the jwt

    if (!process.env.PRIVATE_KEY) throw new ErrorWithStatus("No Private Key", 404);

    const { _id, email: userEmail, fullname } = user;
    const jwt = sign(
      {
        _id: _id,
        email: userEmail,
        fullname,
      },
      process.env.PRIVATE_KEY
    );

    res.status(200).json({ success: true, data: jwt });
  } catch (error) {
    next(error);
  }
};

export const signup_handler: RequestHandler<unknown, StanderdResponse<string>, User, unknown> = async (
  req,
  res,
  next
) => {
  try {
    const new_user = req.body;

    const userExist = await UserModule.findOne({ email: new_user.email });
    if (userExist?._id) throw new ErrorWithStatus("Email already exsit", 409);

    const hashed_password = await hash(new_user.password, 10);

    const result = await UserModule.create({
      ...new_user,
      password: hashed_password,
    });

    if (!process.env.PRIVATE_KEY) throw new ErrorWithStatus("No Private Key", 404);
    const { _id, fullname, email: userEmail } = result;
    const jwt = sign(
      {
        _id,
        email: userEmail,
        fullname,
      },
      process.env.PRIVATE_KEY
    );

    res.status(200).json({ success: true, data: jwt });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers: RequestHandler<unknown, StanderdResponse<User[]>, unknown, unknown> = async (
  req,
  res,
  next
) => {
  try {
    const { _id } = req.token;

    const result = await UserModule.find({ _id: { $ne: _id } }, { _id: 0, email: 1, fullname: 1 });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const putUser: RequestHandler<unknown, StanderdResponse<number>, User, unknown> = async (req, res, next) => {
  try {
    const { _id } = req.token;
    const updated_user = req.body;

    console.log(updated_user.fullname);
    const result = await UserModule.updateOne(
      { _id },
      {
        $set: {
          email: updated_user.email,
          fullname: updated_user.fullname,
          image: { ...req.file },
        },
      }
    );
    let num = 0;
    if (result.modifiedCount > 0) {
      const groupResult = await GroupsModule.updateMany(
        { "members.user_id": _id },
        {
          $set: {
            "members.$.email": updated_user.email,
            "members.$.fullname": updated_user.fullname,
            "members.$.image": { ...req.file },
          },
        }
      );
      num = groupResult.modifiedCount;
    }

    res.status(200).json({
      success: true,
      data: num,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser: RequestHandler<{ email: string }, StanderdResponse<User>, unknown, unknown> = async (
  req,
  res,
  next
) => {
  try {
    const { email } = req.params;
    const result = await UserModule.findOne({ email });
    res.status(200).json({
      success: true,
      data: result ? result : ({} as User),
    });
  } catch (error) {
    next(error);
  }
};
