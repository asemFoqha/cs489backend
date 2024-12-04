import { Router, json } from "express";
import {
  getAllUsers,
  getUser,
  putUser,
  signin_handler,
  signup_handler,
} from "./users.handlers";
import verifyTokenHandler from "./users.middleware";
import multer from "multer";

const userRouter = Router();

userRouter.post("/signin", json(), signin_handler);
userRouter.post("/signup", json(), signup_handler);
userRouter.get("/users-list", verifyTokenHandler, getAllUsers);
userRouter.get("/:email/", verifyTokenHandler, getUser);
userRouter.put(
  "/",
  json(),
  multer({ dest: "user-images/" }).single("image"),
  verifyTokenHandler,
  putUser
);

export default userRouter;
