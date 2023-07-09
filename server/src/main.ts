import cors from "cors";
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import * as dotenv from "dotenv";
import Game from "./game/game";
import registerGameHandler from "./event-handlers/gameHandler";
import registerRoomHandler from "./event-handlers/roomHandler";
import { RoomManager } from "./roomManager";

dotenv.config();

const app = express();
const server = http.createServer(app);
const { WEB_ORIGIN } = process.env;

const roomManager = new RoomManager();
const game = new Game();

app.use(cors({ origin: [WEB_ORIGIN as string] }));

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: [WEB_ORIGIN as string],
  },
});

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

const onConnection = (socket: Socket) => {
  let userId: number;
  registerGameHandler(socket, io, game);
  registerRoomHandler(socket, io, roomManager);
  socket.on("disconnect", () => {
    const userPlayer = game.getPlayer(userId);
    if (!userPlayer) throw new Error();
    game.removePlayer(userPlayer);
  });
};

io.on("connection", onConnection);

app.get("/", (request, response) => {
  response.send("connection");
});

server.listen(5000, () => {
  // eslint-disable-next-line no-console
  console.log("listening");
});
