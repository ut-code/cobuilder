import { serverEmitEvent, serverOnEvent } from "shared";
import { WebSocket } from "ws";
import Game from "../game/game";
import { Player } from "../game/model";

export default function gameHandler(
  socket: WebSocket,
  game: Game,
  userId: number
) {
  setInterval(() => {
    serverEmitEvent(socket, {
      event: "game-data:update",
      gameData: {
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
      },
    });
  }, 10);
  serverOnEvent(socket, "message", (data) => {
    switch (data.event) {
      case "player:create": {
        game.setPlayer(
          new Player(data.newUserData.id, game.findEmptySpace(), {
            x: 0,
            y: 0,
            z: 0,
          })
        );
        break;
      }
      case "keyboard-inputs:update": {
        const inputs = JSON.parse(data.keyboardInputs);
        game.setUserInputs(data.typistData.id, inputs);
        break;
      }
      default: {
        throw new Error();
      }
    }
  });
  serverOnEvent(socket, "close", () => {
    const userPlayer = game.getPlayer(Number(userId));
    if (!userPlayer) throw new Error();
    game.removePlayer(userPlayer);
  });
}
