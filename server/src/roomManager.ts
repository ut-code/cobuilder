export class UserInLobby {
  id: number;

  isWaiting = false;

  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}

export class Room {
  id: number;

  name: string;

  users: UserInLobby[] = [];

  constructor(id: number, name: string, user: UserInLobby) {
    this.id = id;
    this.name = name;
    this.users.push(user);
  }
}

export class RoomManager {
  usersInLobby: UserInLobby[] = [];

  rooms: Room[] = [];

  getUser(userId: number) {
    return this.usersInLobby.find((one) => one.id === userId);
  }

  addUser(user: UserInLobby) {
    this.usersInLobby.push(user);
  }

  removeUser(userId: number) {
    const user = this.usersInLobby.find((one) => one.id === userId);
    if (!user) throw new Error();
    this.usersInLobby.splice(this.usersInLobby.indexOf(user), 1);
  }

  createRoom(name: string, user: UserInLobby) {
    const room = new Room(Math.random(), name, user);
    this.rooms.push(room);
    return room;
  }

  joinRoom(roomId: number, user: UserInLobby) {
    const room = this.rooms.find((one) => one.id === roomId);
    if (!room) throw new Error();
    room.users.push(user);
    return room;
  }

  deleteRoom(roomId: number) {
    const room = this.rooms.find((one) => one.id === roomId);
    if (!room) throw new Error();
    this.rooms.splice(this.rooms.indexOf(room), 1);
  }
}
