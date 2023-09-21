import {
  User,
  PlayerStatus,
  BulletStatus,
  ObstacleStatus,
  RoomData,
} from "./gameModels";

// websocket message types

// client -> server
export const connection = "connection";
export type NetworkManagerName = string;
export type UserConnecting = User;

export const createPlayer = "player:create";
export type NewUserData = User;

export const updateKeyboardInputs = "keyboard-inputs:update";
export type TypistData = User;
export type KeyboardInputs = string;

export const createRoom = "room:create";

export const joinRoom = "room:join";

export const leaveRoom = "room:leave";

// client -> server data-types
export type ConnectionEventData = {
  event: typeof connection;
  networkManagerName: NetworkManagerName;
  userConnecting: UserConnecting;
};
export type CreateUserEventData = {
  event: typeof createPlayer;
  newUserData: NewUserData;
};
export type KeyboardInputsEventData = {
  event: typeof updateKeyboardInputs;
  typistData: TypistData;
  keyboardInputs: KeyboardInputs;
};
export type CreateRoomEventData = {
  event: typeof createRoom;
};
export type JoinRoomEventData = {
  event: typeof joinRoom;
};
export type LeaveRoomEventData = {
  event: typeof leaveRoom;
};

export type ClientEventData =
  | CreateUserEventData
  | KeyboardInputsEventData
  | CreateRoomEventData
  | JoinRoomEventData
  | LeaveRoomEventData
  | ConnectionEventData;

// server -> client

export const updateGameData = "game-data:update";
export type GameData = {
  playerStatuses: PlayerStatus[];
  bulletStatuses: BulletStatus[];
  obstacleStatuses: ObstacleStatus[];
};

export const updateLobbyData = "lobby-data:update";
export type LobbyData = {
  rooms: RoomData[];
};

// server -> client data-types
export type UpdateGameDataEventData = {
  event: typeof updateGameData;
  gameData: GameData;
};
export type UpdateLobbyDataEventData = {
  event: typeof updateLobbyData;
  lobbyData: LobbyData;
};

export type ServerEventName = typeof updateGameData | typeof updateLobbyData;

export type ServerEventData =
  | UpdateGameDataEventData
  | UpdateLobbyDataEventData;
