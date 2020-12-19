import Board, { GameProceedingListener } from "./board";
import { BasicCardType, BasicCard, CardNumber, Card, basicCardTypes, cardNumbers, Joker } from "./card";
import { Player, PlayerAction } from "./player";
import Settings from "./settings";
import * as utility from "./utility";

const HTMLElements: { passButton: HTMLElement, cardTable: HTMLElement, card: (type: BasicCardType, index: number) => HTMLElement } = {
    passButton: document.getElementById("shichinarabe-pass"),
    cardTable: document.getElementById("shichinarabe-cards"),
    card: undefined
};

const CARD_TABLE: Map<BasicCardType, HTMLElement[]> = (() => {
    const result = new Map();
    for (const t of basicCardTypes) {
        const els = [];
        const tr = document.createElement("tr");
        for (const n of cardNumbers) {
            const td = document.createElement("td");
            const img = document.createElement("img");
            img.setAttribute("src", "img/joker.png");
            img.dataset["show"] = "false";
            td.appendChild(img);
            tr.appendChild(td);
            els.push(img);
        }
        result.set(t, els);
        HTMLElements.cardTable.appendChild(tr);
    }
    return result;
})();
HTMLElements.card = (type: BasicCardType, index: number) => CARD_TABLE.get(type)[index];

class Human extends Player {
    constructor(board: Board) {
        super(board);
    }

    async getNextAction(): Promise<PlayerAction> {
        if (this.isHandEmpty())
            throw new Error("$hand is empty");
        return Promise.any([
            new Promise<void>(resolve => utility.listenEventOnceAsync(HTMLElements.passButton, "click")
                .then(e => resolve()))
                .then(_ => "PASS")
        ]);
    }
}

class GameProceedingHandler extends GameProceedingListener {
    constructor(board: Board) {
        super(board);
    }

    onBoardChanged() {
        super.onBoardChanged();
        this.renderCards();
    }

    renderCards() {
        for (const t of basicCardTypes) {
            for (const n of cardNumbers) {
                const el = HTMLElements.card(t, n);
                const card = board.getRow(t).getCard(n);
                
                if (card === null)
                    el.dataset["show"] = "false";
                
                else {
                    el.setAttribute("src", card instanceof BasicCard ? `img/${t.toLowerCase()}/p${n + 1}.png` : "img/joker.png");
                    el.dataset["show"] = "true";
                }
            }
        }
    }
}

const board = new Board(new Settings({
    humanClassConstructor: undefined,//(board: Board) => new Human(board),
    gameProceedingListenerConstructor: (board: Board) => new GameProceedingHandler(board)
}));

board.start();
