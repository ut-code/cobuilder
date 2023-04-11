import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: ["http://localhost:8000"] }));

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:8000"],
  },
});

io.on("connection", () => {
  // eslint-disable-next-line no-console
  console.log("connection succeeded");
});

app.get("/", (request, response) => {
  response.send("connection");
});

server.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log("listening");
});
