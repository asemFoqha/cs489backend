import { Schema, model, InferSchemaType } from "mongoose";

const userSchema = new Schema({
  fullname: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  image: { filename: String, originalname: String },
});

export type User = InferSchemaType<typeof userSchema>;

const UserModule = model<User>("Users", userSchema);

export default UserModule;
