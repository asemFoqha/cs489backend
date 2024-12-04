import { Types } from "mongoose";
import { ErrorWithStatus, StanderdResponse } from "../helpers/types";
import usersModel from "../usersModule/users.model";
import GroupsModule, { Group, Member, Transaction } from "./groups.model";
import { RequestHandler } from "express";

export const add_group: RequestHandler<unknown, StanderdResponse<Group>, Group, unknown> = async (req, res, next) => {
  try {
    const { _id, fullname, email } = req.token;
    const new_group = req.body;
    const results = await GroupsModule.create({
      ...new_group,
      members: [
        {
          user_id: _id,
          fullname: fullname,
          email: email,
          pending: false,
        },
      ],
    });
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};
export const get_groups: RequestHandler<unknown, StanderdResponse<Group[]>, unknown, { pending: boolean }> = async (
  req,
  res,
  next
) => {
  try {
    const { _id } = req.token;
    const pending = req.query?.pending ? true : false;

    const results = await GroupsModule.find(
      { members: { $elemMatch: { user_id: _id, pending } } },
      { transactions: 0, members: 0 }
    );
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

export const get_group_by_id: RequestHandler<{ group_id: string }, StanderdResponse<Group>, unknown, unknown> = async (
  req,
  res,
  next
) => {
  try {
    const { _id } = req.token;
    const { group_id } = req.params;

    const results = await GroupsModule.findOne({
      _id: group_id,
      members: { $elemMatch: { user_id: _id, pending: false } },
    });
    res.json({ success: true, data: results ? results : ({} as Group) });
  } catch (error) {
    next(error);
  }
};

export const update_member_pending_status_by_id: RequestHandler<
  { group_id: string; member_id: string },
  StanderdResponse<boolean>,
  unknown,
  unknown
> = async (req, res, next) => {
  try {
    const { group_id, member_id } = req.params;
    const { _id } = req.token;
    if (member_id !== _id) throw new ErrorWithStatus("User must change the status of their own account", 404);

    const results = await GroupsModule.updateOne(
      { _id: group_id, members: { $elemMatch: { user_id: member_id, pending: true } } },
      { $set: { "members.$.pending": false } }
    );
    res.json({ success: true, data: results.modifiedCount ? true : false });
  } catch (error) {
    next(error);
  }
};

export const add_member: RequestHandler<
  { group_id: string },
  StanderdResponse<boolean>,
  { email: string },
  unknown
> = async (req, res, next) => {
  try {
    const { group_id } = req.params;
    const { _id } = req.token;
    const { email } = req.body;
    const member_to_add = await usersModel.findOne({ email }).lean();
    if (!member_to_add) throw new ErrorWithStatus("User not found", 404);

    const group = await GroupsModule.findOne({
      _id: group_id,
    }).lean();

    const hasMember = group?.members.some((member: Member) => member.email === member_to_add.email);
    if (hasMember) throw new ErrorWithStatus("User is already a member of the group", 400);

    const results = await GroupsModule.updateOne(
      { _id: group_id, members: { $elemMatch: { user_id: _id, pending: false } } },
      {
        $addToSet: {
          members: {
            user_id: member_to_add._id,
            fullname: member_to_add.fullname,
            email: member_to_add.email,
            pending: true,
            image: { ...member_to_add.image },
          },
        },
      }
    );
    res.json({ success: true, data: results.modifiedCount ? true : false });
  } catch (error) {
    next(error);
  }
};

export const get_members: RequestHandler<{ group_id: string }, StanderdResponse<Member[]>, unknown, unknown> = async (
  req,
  res,
  next
) => {
  try {
    const { _id } = req.token;
    const { group_id } = req.params;

    const results = await GroupsModule.findOne(
      { _id: group_id, members: { $elemMatch: { user_id: _id, pending: false } } },
      { transactions: 0 }
    ).lean();
    results && res.json({ success: true, data: results.members });
  } catch (error) {
    next(error);
  }
};

export const add_transaction: RequestHandler<
  { group_id: string },
  StanderdResponse<boolean>,
  Transaction,
  unknown
> = async (req, res, next) => {
  try {
    const { group_id } = req.params;
    const { title, description, category, amount, date } = req.body;

    const { _id: user_id, fullname } = req.token;

    const results = await GroupsModule.updateOne(
      { _id: group_id, members: { $elemMatch: { user_id: user_id, pending: false } } },
      {
        $push: {
          transactions: {
            title,
            description,
            paid_by: { user_id, fullname },
            category,
            amount,
            date,
            receipt: { ...req.file },
          },
        },
      }
    );
    res.json({ success: true, data: results.modifiedCount ? true : false });
  } catch (error) {
    next(error);
  }
};
export const get_transactions: RequestHandler<
  { group_id: string },
  StanderdResponse<Transaction[]>,
  unknown,
  unknown
> = async (req, res, next) => {
  try {
    const { group_id } = req.params;
    const { _id } = req.token;
    const results = await GroupsModule.findOne(
      { _id: group_id, members: { $elemMatch: { user_id: _id, pending: false } } },
      { transactions: 1 }
    ).lean();
    results && res.json({ success: true, data: results.transactions });
  } catch (error) {
    next(error);
  }
};
export const get_transaction_by_id: RequestHandler<
  { group_id: string; transaction_id: string },
  StanderdResponse<Transaction>,
  unknown,
  unknown
> = async (req, res, next) => {
  try {
    const { group_id, transaction_id } = req.params;
    const { _id } = req.token;
    const results = await GroupsModule.aggregate([
      { $match: { _id: new Types.ObjectId(group_id) } },
      { $unwind: "$members" },
      { $match: { "members.user_id": new Types.ObjectId(_id) } },
      { $project: { transactions: "$transactions", _id: 0 } },
      { $unwind: "$transactions" },
      { $match: { "transactions._id": new Types.ObjectId(transaction_id) } },
    ]);
    res.json({ success: true, data: results[0].transactions });
  } catch (error) {
    next(error);
  }
};
