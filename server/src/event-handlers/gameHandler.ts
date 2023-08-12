import { Socket } from "socket.io";
import Game from "../game/game";
import { Player } from "../game/common/model";

export default function gameHandler(
  socket: Socket,
  game: Game,
  userId: number
) {
  setInterval(() => {
    socket.emit("gameData", {
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
    });
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
