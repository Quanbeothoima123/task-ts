import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import * as database from "./config/database";
import mainV1Routes from "./api/v1/routes/index.route";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
dotenv.config();
database.connect();
const app: Express = express();
app.use(bodyParser.json());
app.use(cookieParser(""));
app.use(cors());
const port: number | string = process.env.PORT || 3000;
// Route để lấy danh sách tasks
mainV1Routes(app);
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
