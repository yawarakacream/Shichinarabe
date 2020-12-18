import { BasicCardType, basicCardTypes, CardNumber, Card, BasicCard } from "./card";

// ジョーカーの枚数
export const jorkers: number = 2;

// ジョーカーに通常カードを重ねたとき、ジョーカーをそのプレイヤーの手札に返すか
export const giveBackJoker: boolean = true;

// ゲームのはじめに場に設置されるカード
export const initialCards: { type: BasicCardType, index: CardNumber }[] = [...basicCardTypes].map(t => ({ type: t, index: 6 }));

// ゲームに参加する人間の数
export const humans: number = 0;

// ゲームに参加するコンピュータの数
export const computers: number = 3;

// コンピュータの最小思考時間 [ms]
export const minComputerThinkingTime = 100;
