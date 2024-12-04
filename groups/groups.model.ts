import mongoose, { InferSchemaType, Schema, model } from "mongoose";

const membersSchema = new Schema({
  user_id: mongoose.Types.ObjectId,
  fullname: String,
  email: String,
  image: { filename: { type: String }, originalname: { type: String } },
  pending: { type: Boolean, default: true },
});

const transactionSchema = new Schema({
  title: String,
  description: String,
  paid_by: { user_id: mongoose.Types.ObjectId, fullname: String },
  category: String,
  amount: Number,
  date: Number,
  receipt: { filename: String, originalname: String },
});

const schema = new Schema({
  title: { type: String, require: true },
  members: [membersSchema],
  transactions: [transactionSchema],
});

export type Group = InferSchemaType<typeof schema>;
export type Member = InferSchemaType<typeof membersSchema>;
export type Transaction = InferSchemaType<typeof transactionSchema>;

const GroupsModule = model<Group>("group", schema);

export default GroupsModule;
