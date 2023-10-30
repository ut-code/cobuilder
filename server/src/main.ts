import cors from "cors";
import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import * as dotenv from "dotenv";
import { serverOnEvent, User } from "shared";
import { RoomManager } from "./RoomManager";
import indexRouter from "./routes/index";
import userRouter from "./routes/user";
import NetworkManager from "./NetworkManager";

dotenv.config();

const app = express();
const server = http.createServer(app);
const { WEB_ORIGIN } = process.env;

const netWorkManagers = new Map<User, NetworkManager>();

const roomManager = new RoomManager((users) => {
  for (const user of users) {
    const networkManager = netWorkManagers.get(user);
    if (!networkManager) throw new Error();
    networkManager.sendGameStart();
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
      const networkManager = new NetworkManager(
        socket,
        () => {
          if (user.status === "lobby") {
            roomManager.addRoom("new room", user);
            user.status = "waiting";
          }
        },
        (roomId) => {
          roomManager.joinRoom(roomId, user);
        },
        () => {
          roomManager.addFighter(user);
        },
        (keyboardInputs) => {
          roomManager.updateKeyboardInputs(user, JSON.parse(keyboardInputs));
        },
        () => {
          console.log("close");
        }
      );
      netWorkManagers.set(user, networkManager);
      setInterval(() => {
        if (user.status === "lobby") {
          networkManager.sendLobbyDataUpdate(roomManager.rooms);
        }
        if (user.status === "game") {
          networkManager.sendGameDataUpdate(roomManager.getGameData(user));
        }
      }, 10);
    }
  });
};

wss.on("connection", onConnection);

app.use("/", indexRouter);
app.use("/user", userRouter);

server.listen(5000, () => {
  // eslint-disable-next-line no-console
  console.log("listening");
});
