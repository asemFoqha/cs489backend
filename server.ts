import cors from "cors";
import "dotenv/config";
import express from "express";
import morgan from "morgan";

import path from "path";
import { fileURLToPath } from "url";
import groupsRouter from "./groups/groups.router";
import dbConnect from "./helpers/db_connect";
import { errorHandler, noRouteHandler } from "./helpers/handlers";
import verifyTokenHandler from "./usersModule/users.middleware";
import userRouter from "./usersModule/users.router";

const app = express();
dbConnect();

app.use(morgan("dev"));
app.use(cors());

//routes

app.use("/users", userRouter);
app.use("/groups", verifyTokenHandler, groupsRouter);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/receipts", express.static(path.join(__dirname, "uploads")));

app.use(
  "/images",
  express.static(
    path.join(path.dirname(fileURLToPath(import.meta.url)), "user-images")
  )
);

app.all("*", noRouteHandler);
app.use(errorHandler);

app.listen(3000);
