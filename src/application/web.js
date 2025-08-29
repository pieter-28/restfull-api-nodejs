import express from "express";
import {publicRouter} from "../route/public-api.js";
import {errorMiddleware} from "../middleware/error-middleware.js";
import {userRouter} from "../route/api.js";

export const web = express();
web.use(express.json());
web.use(publicRouter); // public api
web.use(userRouter); // private api
web.use(errorMiddleware); // error middleware