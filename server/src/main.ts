import cors from "cors";
import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import * as dotenv from "dotenv";
import { serverEmitEvent, serverOnEvent, User } from "shared";
import registerGameHandler from "./event-handlers/gameWorkerHandler";
import registerRoomHandler from "./event-handlers/roomHandler";
import { RoomManager } from "./RoomManager";
import indexRouter from "./routes/index";

dotenv.config();

const app = express();
const server = http.createServer(app);
const { WEB_ORIGIN } = process.env;

const sockets = new Map<User, WebSocket>();

const roomManager = new RoomManager((users) => {
  for (const user of users) {
    const socket = sockets.get(user);
    if (!socket) throw new Error();
    serverEmitEvent(socket, { event: "game:start" });
  }
});

app.use(cors({ origin: [WEB_ORIGIN as string] }));

app.use(express.json());

const wss = new WebSocketServer({ server });

const onConnection = (socket: WebSocket) => {
  serverOnEvent(socket, "message", (data) => {
    // 初回のイベントはconnectionである必要がある
    if (data.event === "connection") {
      const user = data.userConnecting;
      sockets.set(user, socket);
      switch (user.status) {
        case "lobby": {
          registerRoomHandler(socket, roomManager, user, () => {
            sockets.delete(user);
          });
          break;
        }
        case "game": {
          const gameWorker = roomManager.getGameWorkerByUserId(user.id);
          if (!gameWorker) throw new Error();
          registerGameHandler(socket, gameWorker, user.id, () => {
            sockets.delete(user);
          });
          break;
        }
        default:
          throw new Error(`Unexpected user status: ${user.status}`);
      }
    }
  });
};

wss.on("connection", onConnection);

app.use("/", indexRouter);

server.listen(5000, () => {
  // eslint-disable-next-line no-console
  console.log("listening");
});
