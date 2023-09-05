import { GameData } from "shared";
import { WebSocket } from "ws";
import Game from "../game/game";
import { Player } from "../game/model";

export default function gameHandler(
  socket: WebSocket,
  game: Game,
  userId: number
) {
  setInterval(() => {
    const gameData: GameData = {
      playerStatuses: game.players.map((player) => {
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
      bulletStatuses: game.bullets.map((bullet) => {
        const { id, position, rotation } = bullet;
        return { id, position, rotation };
      }),
      obstacleStatuses: game.obstacles.map((obstacle) => {
        const { id, position, rotation } = obstacle;
        return { id, position, rotation };
      }),
    };
    socket.emit("gameData", gameData);
  }, 10);
  socket.on("createPlayer", (playerId: number) => {
    game.setPlayer(
      new Player(playerId, game.findEmptySpace(), { x: 0, y: 0, z: 0 })
    );
  });
  socket.on("userKeyboardInputs", (playerId: number, data: string) => {
    const inputs = JSON.parse(data);
    game.setUserInputs(playerId, inputs);
  });
  socket.on("disconnect", () => {
    const userPlayer = game.getPlayer(Number(userId));
    if (!userPlayer) throw new Error();
    game.removePlayer(userPlayer);
  });
}
