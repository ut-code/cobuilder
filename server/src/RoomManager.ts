import { GameData, User } from "shared";
import Game from "./game/game";

export class Room {
  id: number;

  name: string;

  users: User[] = [];

  limit = 2;

  isPlaying = false;

  constructor(id: number, name: string, user: User) {
    this.id = id;
    this.name = name;
    this.users.push(user);
  }
}

export class RoomManager {
  rooms: Room[] = [];

  // key: roomId, value: gameWorker
  games: Map<number, Game> = new Map();

  onGameStart: (users: User[]) => void;

  constructor(onGameStart: (users: User[]) => void) {
    this.onGameStart = onGameStart;
  }

  getRoom(roomId: number) {
    return this.rooms.find((one) => one.id === roomId);
  }

  addRoom(name: string, user: User) {
    const room = new Room(Math.random(), name, user);
    this.rooms.push(room);
  }

  joinRoom(roomId: number, user: User) {
    const room = this.getRoom(roomId);
    if (!room) throw new Error();
    if (room.isPlaying) return;
    room.users.push(user);
    if (room.users.length === room.limit) {
      this.createGame(roomId);
      room.isPlaying = true;
      for (const userInRoom of room.users) {
        userInRoom.status = "game";
      }
      this.onGameStart(room.users);
    }
  }

  removeRoom(roomId: number) {
    const room = this.getRoom(roomId);
    if (!room) throw new Error();
    this.rooms.splice(this.rooms.indexOf(room), 1);
  }

  createGame(roomId: number) {
    const room = this.getRoom(roomId);
    if (!room) throw new Error();
    const game = new Game();
    this.games.set(roomId, game);
  }

  deleteRoom(roomId: number) {
    const room = this.getRoom(roomId);
    if (!room) throw new Error();
    this.rooms.splice(this.rooms.indexOf(room), 1);
    this.games.delete(roomId);
  }

  addFighter(user: User) {
    const roomId = this.rooms.find((room) => room.users.includes(user))?.id;
    if (!roomId) throw new Error();
    const game = this.games.get(roomId);
    if (!game) throw new Error();
    game.createFighterFromUser(user);
  }

  updateKeyboardInputs(user: User, keyboardInputs: Record<string, boolean>) {
    const roomId = this.rooms.find((room) => room.users.includes(user))?.id;
    if (!roomId) throw new Error();
    const game = this.games.get(roomId);
    if (!game) throw new Error();
    game.setUserInputs(user.id, keyboardInputs);
  }

  getGameData(user: User): GameData {
    const roomId = this.rooms.find((room) => room.users.includes(user))?.id;
    if (!roomId) throw new Error();
    const game = this.games.get(roomId);
    if (!game) throw new Error();
    return {
      fighterStatuses: game.fighters.map((fighter) => {
        return {
          id: fighter.id,
          position: fighter.position,
          rotation: fighter.rotation,
          HP: fighter.HP,
          isDead: fighter.isDead,
          currentAction: fighter.currentAction,
          score: fighter.score,
        };
      }),
      bulletStatuses: game.bullets.map((bullet) => {
        return {
          id: bullet.id,
          position: bullet.position,
          rotation: bullet.rotation,
        };
      }),
      obstacleStatuses: game.obstacles.map((obstacle) => {
        return {
          id: obstacle.id,
          position: obstacle.position,
          rotation: obstacle.rotation,
        };
      }),
    };
  }
}
