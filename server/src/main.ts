import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);
const { WEB_ORIGIN } = process.env;

app.use(cors({ origin: [WEB_ORIGIN || "http://localhost:8000"] }));

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: [WEB_ORIGIN || "http://localhost:8000"],
  },
});

io.on("connection", () => {
  // eslint-disable-next-line no-console
  console.log("connection succeeded");
});

app.get("/", (request, response) => {
  response.send("connection");
});

server.listen(8002, () => {
  // eslint-disable-next-line no-console
  console.log("listening");
});
