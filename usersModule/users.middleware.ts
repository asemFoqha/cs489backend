import { RequestHandler } from "express";
import { ErrorWithStatus, Token } from "../helpers/types";
import { verify } from "jsonwebtoken";

const verifyTokenHandler: RequestHandler = (req, res, next) => {
  try {
    const auth = req.headers["authorization"];
    if (!auth) throw new ErrorWithStatus("JWT is required", 400);

    const jwt = auth.split(" ")[1];
    if (!jwt) throw new ErrorWithStatus("JWT is required", 400);

    if (!process.env.PRIVATE_KEY) throw new Error("no private key");
    const valid = verify(jwt, process.env.PRIVATE_KEY) as Token;

    req.token = valid;
    next();
  } catch (error) {
    next(error);
  }
};

export default verifyTokenHandler;
