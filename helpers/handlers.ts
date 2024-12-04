import { ErrorRequestHandler, RequestHandler } from "express";
import { ErrorWithStatus, StanderdResponse } from "./types";

export const noRouteHandler: RequestHandler = async (req, res, next) => {
  next(new ErrorWithStatus("No Route Found", 404));
};

export const errorHandler: ErrorRequestHandler<
  unknown,
  StanderdResponse<string>,
  unknown,
  unknown
> = (error, req, res, next) => {
  if (error instanceof ErrorWithStatus) {
    res.status(error.statusCode).json({ success: false, data: error.message });
  } else if (error instanceof Error) {
    res.status(500).json({ success: false, data: error.message });
  } else {
    res.status(500).json({ success: false, data: "somthing went wrong" });
  }
};
