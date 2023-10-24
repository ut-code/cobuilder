import {
  CreateUserEventData,
  KeyboardInputsEventData,
  UpdateGameDataEventData,
} from "shared";
import { parentPort } from "node:worker_threads";
import Game from "./game";
import { Player } from "./model";

const game = new Game();

export type WorkerEvent =
  | UpdateGameDataEventData
  | CreateUserEventData
  | KeyboardInputsEventData;

parentPort?.on("message", (value: WorkerEvent) => {
  switch (value.event) {
    case "player:create": {
      game.setPlayer(
        new Player(value.newUserData.id, game.findEmptySpace(), {
          x: 0,
          y: 0,
          z: 0,
        })
      );
      break;
    }
    case "keyboard-inputs:update": {
      const inputs = JSON.parse(value.keyboardInputs);
      game.setUserInputs(value.typistData.id, inputs);
      break;
    }
    default: {
      throw new Error();
    }
  }
});

setInterval(() => {
  parentPort?.postMessage({
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
