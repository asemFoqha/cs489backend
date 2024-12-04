import { Router, json } from "express";
import multer from "multer";
import {
  add_group,
  add_member,
  add_transaction,
  get_groups,
  get_group_by_id,
  get_members,
  get_transaction_by_id,
  get_transactions,
  update_member_pending_status_by_id,
} from "./groups.handlers";
import verifyTokenHandler from "../usersModule/users.middleware";

const groupsRouter = Router();

groupsRouter.post("/", json(), add_group);
groupsRouter.get("/", get_groups);

groupsRouter.get("/:group_id", get_group_by_id);
groupsRouter.post("/:group_id/members", json(), add_member);
groupsRouter.get("/:group_id/members/", get_members);
groupsRouter.get("/:group_id/members/:member_id", update_member_pending_status_by_id);

groupsRouter.post(
  "/:group_id/transactions",
  multer({ dest: "uploads/" }).single("receipt"),
  verifyTokenHandler,
  add_transaction
);
groupsRouter.get("/:group_id/transactions", get_transactions);
groupsRouter.get("/:group_id/transactions/:transaction_id", get_transaction_by_id);

export default groupsRouter;
