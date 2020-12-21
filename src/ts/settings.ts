import Board from "./board";
import { BasicCardType, basicCardTypes, CardNumber } from "./card";
import { Player } from "./player";
import GameProceedingListener from "./proceedingListener";

export default class Settings {
	// ジョーカーの枚数
	readonly jorkers: number = 2;

	// ジョーカーに通常カードを重ねたとき、ジョーカーをそのプレイヤーの手札に返すか
	readonly giveBackJoker: boolean = true;

	// ゲームのはじめに場に設置されるカード
	readonly initialCards: { type: BasicCardType, index: CardNumber }[] = [...basicCardTypes].map(t => ({ type: t, index: 6 }));

	// ゲームに参加する人間
	readonly humanClassConstructor: (board: Board) => Player = undefined;

	// ゲームに参加するコンピュータの数
	readonly computers: number = 3;

	// コンピュータの最小思考時間 [ms]
	readonly minComputerThinkingTime: number = 100;

	// 進行イベントを取るリスナー
	readonly gameProceedingListenerConstructor: (board: Board) => GameProceedingListener = undefined;

	constructor(init?: Partial<Settings>) {
		if (init)
			Object.assign(this, init);
	}
}
