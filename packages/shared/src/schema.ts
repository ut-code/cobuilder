import {
  User,
  PlayerStatus,
  BulletStatus,
  ObstacleStatus,
  RoomData,
} from "./gameModels";

// websocket message types

// client -> server

export const createPlayer = "player:create";
export type NewUserData = User;

export const updateKeyboardInputs = "keyboard-inputs:update";
export type TypistData = User;
export type KeyboardInputs = string;

export const createRoom = "room:create";

export const joinRoom = "room:join";

export const leaveRoom = "room:leave";

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
