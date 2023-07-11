export class User {
  id: number;

  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}

export class Room {
  id: number;

  users: User[] = [];

  constructor(id: number, user: User) {
    this.id = id;
    this.users.push(user);
  }
}

export class RoomManager {
  rooms: Room[] = [];

  createRoom(user: User) {
    const room = new Room(Math.random(), user);
    this.rooms.push(room);
    return room;
  }

  joinRoom(roomId: number, user: User) {
    const room = this.rooms.find(one => one.id === roomId);
    if (!room) throw new Error();
    room.users.push(user);
    return room;
  }

  deleteRoom(roomId: number) {
    const room = this.rooms.find(one => one.id === roomId);
    if (!room) throw new Error();
    this.rooms.splice(this.rooms.indexOf(room), 1);
  }
}
