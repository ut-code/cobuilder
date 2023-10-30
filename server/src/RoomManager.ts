import { Worker, isMainThread } from "node:worker_threads";
import { User } from "shared";
import path from "path";

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
  usersInLobby: User[] = [];

  rooms: Room[] = [];

  // key: roomId, value: gameWorker
  gameWorkers: Map<number, Worker> = new Map();

  onGameStart: (users: User[]) => void;

  constructor(onGameStart: (users: User[]) => void) {
    this.onGameStart = onGameStart;
  }

  getUser(userId: number) {
    return this.usersInLobby.find((one) => one.id === userId);
  }

  addUser(user: User) {
    this.usersInLobby.push(user);
  }

  removeUser(userId: number) {
    const user = this.getUser(userId);
    if (!user) throw new Error();
    this.usersInLobby.splice(this.usersInLobby.indexOf(user), 1);
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
      this.createGameWorker(roomId);
      room.isPlaying = true;
      this.onGameStart(room.users);
    }
  }

  removeRoom(roomId: number) {
    const room = this.getRoom(roomId);
    if (!room) throw new Error();
    this.rooms.splice(this.rooms.indexOf(room), 1);
  }

  createGameWorker(roomId: number) {
    const room = this.getRoom(roomId);
    if (!room) throw new Error();
    for (const user of room.users) {
      this.removeUser(user.id);
    }
    if (isMainThread) {
      const worker = new Worker(path.resolve(__dirname, "./game/worker.ts"));
      this.gameWorkers.set(roomId, worker);
    }
  }

  deleteRoom(roomId: number) {
    const room = this.getRoom(roomId);
    if (!room) throw new Error();
    this.rooms.splice(this.rooms.indexOf(room), 1);
    this.gameWorkers.get(roomId)?.terminate();
    this.gameWorkers.delete(roomId);
  }

  getGameWorkerByUserId(userId: number) {
    const room = this.rooms.find((one) =>
      one.users.some((user) => user.id === userId)
    );
    if (!room) throw new Error();
    return this.gameWorkers.get(room.id);
  }
}
