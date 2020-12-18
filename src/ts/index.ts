import Board from "./board";
import { BasicCardType, CardNumber, Card } from "./card";
import InputHandler from "./inputHandler";
import Settings from "./settings";
import * as utility from "./utility";

class InputHandlerImpl implements InputHandler {
    awaitPass(): Promise<boolean> {
        return new Promise(resolve => utility.listenEventOnceAsync(document.getElementById("shicinarabe-pass"), "click").then(e => {
            resolve(true);
        }));
    }
    awaitPlaceCard(): Promise<{ type: BasicCardType, index: CardNumber, card: Card }> {
        return new Promise(resolve => {});
        // throw new Error("Method not implemented.");
    }
}

const board = new Board(new Settings({
    human: true,
    humanInputHandler: new InputHandlerImpl()
}));
console.log(board);

board.start();
