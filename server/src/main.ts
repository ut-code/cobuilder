import cors from "cors";
import express from "express";
import http from "http";
import url from "url";
import { WebSocketServer, WebSocket } from "ws";
import * as dotenv from "dotenv";
import Game from "./game/game";
import registerGameHandler from "./event-handlers/gameHandler";
import registerRoomHandler from "./event-handlers/roomHandler";
import { RoomManager, UserInLobby } from "./roomManager";

dotenv.config();

const app = express();
const server = http.createServer(app);
const { WEB_ORIGIN } = process.env;

const roomManager = new RoomManager();
const game = new Game();

app.use(cors({ origin: [WEB_ORIGIN as string] }));

app.use(express.json());

const wss = new WebSocketServer({ server, path: WEB_ORIGIN as string });

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

const onConnection = (ws: WebSocket, request: http.IncomingMessage) => {
  const queryParameters = url.parse(request.url as string, true).query;
  const { networkManagerName, user } = queryParameters;
  const userObject = JSON.parse(user as string) as User;
  switch (networkManagerName) {
    case "LobbySceneNetworkManager": {
      registerRoomHandler(
        ws,
        roomManager,
        new UserInLobby(userObject.id, userObject.name)
      );
      break;
    }
    case "MainSceneNetworkManager": {
      registerGameHandler(ws, game, userObject.id);
      break;
    }
    default:
      throw new Error(`Unexpected name: ${networkManagerName}`);
  }
};

wss.on("connection", onConnection);

app.get("/", (request, response) => {
  response.send("connection");
});

server.listen(5000, () => {
  // eslint-disable-next-line no-console
  console.log("listening");
});
