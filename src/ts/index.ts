import Board from "./board";
import { BasicCardType, CardNumber, Card, basicCardTypes, cardNumbers } from "./card";
import { Player, PlayerAction } from "./player";
import Settings from "./settings";
import * as utility from "./utility";

const HTMLElements = {
    PASS_BUTTON: document.getElementById("shicinarabe-pass"),
    CARDS: document.getElementById("shicinarabe-cards")
};

class Human extends Player {
    constructor(board: Board) {
        super(board);
    }

    async getNextAction(): Promise<PlayerAction> {
        if (this.isHandEmpty())
            throw new Error("$hand is empty");
        
        return Promise.any([
            new Promise<void>(resolve => utility.listenEventOnceAsync(HTMLElements.PASS_BUTTON, "click")
                .then(e => resolve()))
                .then(_ => "PASS")
        ]);
    }
}

const board = new Board(new Settings({
    humanClassConstructor: (board: Board) => new Human(board)
}));
console.log(board);

board.start();
