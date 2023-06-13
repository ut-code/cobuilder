import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import * as dotenv from "dotenv";
import Game from "./game";
import { Player } from "./common/model";

dotenv.config();

const app = express();
const server = http.createServer(app);
const { WEB_ORIGIN } = process.env;

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

io.on("connection", (socket) => {
  let userId: number;
  setInterval(() => {
    socket.emit(
      "gameData",
      game.players.map((player) => {
        const { id, HP, score, position, rotation, isDead } = player;
        return {
          id,
          HP,
          score,
          position,
          rotation,
          isDead,
        };
      }),
      game.bullets.map((bullet) => {
        const { id, position, rotation } = bullet;
        return { id, position, rotation };
      }),
      game.obstacles.map((obstacle) => {
        const { id, position, rotation } = obstacle;
        return { id, position, rotation };
      })
    );
  }, 10);
  socket.on("createPlayer", (playerId: number) => {
    userId = playerId;
    game.setPlayer(
      new Player(playerId, game.findEmptySpace(), { x: 0, y: 0, z: 0 })
    );
  });
  socket.on("userKeyboardInputs", (playerId: number, data: string) => {
    const inputs = JSON.parse(data);
    game.setUserInputs(playerId, inputs);
  });
  socket.on("disconnect", () => {
    const userPlayer = game.getPlayer(userId);
    if (!userPlayer) throw new Error();
    game.removePlayer(userPlayer);
  });
});

app.get("/", (request, response) => {
  response.send("connection");
});

server.listen(5000, () => {
  // eslint-disable-next-line no-console
  console.log("listening");
});
