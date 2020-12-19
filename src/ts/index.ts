import Board from "./board";
import { ConsolePrinter } from "./proceedingListener";
import { BasicCardType, basicCardTypes, cardNumbers } from "./card";
import { Player, PlayerAction } from "./player";
import Settings from "./settings";
import * as utility from "./utility";

const HTMLElements: { passButton: HTMLElement, cardTable: HTMLElement, card: (type: BasicCardType, index: number) => CardHTMLElement } = {
    passButton: document.getElementById("shichinarabe-pass"),
    cardTable: document.getElementById("shichinarabe-cards"),
    card: undefined
};

type CardHTMLElement = { td: HTMLElement, img: HTMLElement };
const CARD_TABLE: Map<BasicCardType, CardHTMLElement[]> = (() => {
    const result = new Map<BasicCardType, CardHTMLElement[]>();
    for (const t of basicCardTypes) {
        const tr = document.createElement("tr");
        const els = [];
        for (const n of cardNumbers) {
            const td = document.createElement("td");
            const img = document.createElement("img");
            img.setAttribute("src", "img/joker.png");
            td.appendChild(img);
            td.dataset["show"] = "false";
            tr.appendChild(td);
            els.push({ td: td, img: img });
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

class GameProceedingHandler extends ConsolePrinter {
    constructor(board: Board) {
        super(board);
    }

    onGameStarted() {
        super.onGameStarted();
        this.renderCards();
    }

    onBoardChanged() {
        super.onBoardChanged();
        this.renderCards();
    }

    renderCards() {
        for (const t of basicCardTypes) {
            for (const n of cardNumbers) {
                const el = HTMLElements.card(t, n);
                el.td.dataset["show"] = "false";
                
                const card = board.getRow(t).getCard(n);
                if (card) {
                    el.img.setAttribute("src", card.getImagePath());
                    el.td.dataset["show"] = "true";
                }
            }
        }
    }
}

const board = new Board(new Settings({
    minComputerThinkingTime: 100,
    humanClassConstructor: (board: Board) => new Human(board),
    gameProceedingListenerConstructor: (board: Board) => new GameProceedingHandler(board)
}));

board.start();
