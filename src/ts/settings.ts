import { BasicCardType, basicCardTypes, CardNumber } from "./card";
import InputHandler from "./inputHandler";

export default class Settings {
    // ジョーカーの枚数
    readonly jorkers: number = 2;

    // ジョーカーに通常カードを重ねたとき、ジョーカーをそのプレイヤーの手札に返すか
    readonly giveBackJoker: boolean = true;

    // ゲームのはじめに場に設置されるカード
    readonly initialCards: { type: BasicCardType, index: CardNumber }[] = [...basicCardTypes].map(t => ({ type: t, index: 6 }));

    // ゲームに人間が参加するか
    readonly human: boolean = false;

    // 人間の入力を受け取るインスタンス
    readonly humanInputHandler: InputHandler;

    // ゲームに参加するコンピュータの数
    readonly computers: number = 3;

    // コンピュータの最小思考時間 [ms]
    readonly minComputerThinkingTime = 100;

    constructor(init?: Partial<Settings>) {
        if (init)
            Object.assign(this, init);
        if (this.human && !this.humanInputHandler)
            throw new Error("InputHandler is missing");
    }
}
