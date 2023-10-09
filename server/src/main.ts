import cors from "cors";
import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import * as dotenv from "dotenv";
import { serverOnEvent } from "shared";
import Game from "./game/game";
import registerGameHandler from "./event-handlers/gameHandler";
import registerRoomHandler from "./event-handlers/roomHandler";
import { RoomManager, UserInLobby } from "./roomManager";
import indexRouter from "./routes/index";
import userRouter from "./routes/user";

dotenv.config();

const app = express();
const server = http.createServer(app);
const { WEB_ORIGIN } = process.env;

const roomManager = new RoomManager();
const game = new Game();

app.use(cors({ origin: [WEB_ORIGIN as string] }));

app.use(express.json());

const wss = new WebSocketServer({ server });

export interface User {
  id: number;
  name: string;
}

let currentTime = Date.now();
setInterval(() => {
  const previousTime = currentTime;
  currentTime = Date.now();
  game.createPlayerActions();
  game.runPlayerActions(currentTime - previousTime);
  game.moveBullets();
  game.detectCollision();
  game.updatePlayersIsDead();
}, 10);

const onConnection = (socket: WebSocket) => {
  serverOnEvent(socket, "message", (data) => {
    // 初回のイベントはconnectionである必要がある
    if (data.event === "connection") {
      const user = data.userConnecting;
      switch (data.networkManagerName) {
        case "LobbySceneNetworkManager": {
          registerRoomHandler(
            socket,
            roomManager,
            new UserInLobby(user.id, user.name)
          );
          break;
        }
        case "MainSceneNetworkManager": {
          registerGameHandler(socket, game, user.id);
          break;
        }
        default:
          throw new Error(`Unexpected name: ${data.networkManagerName}`);
      }
    }
  });
};

wss.on("connection", onConnection);

app.use("/", indexRouter);
app.use("/user", userRouter);

server.listen(8001, () => {
  // eslint-disable-next-line no-console
  console.log("listening");
});
