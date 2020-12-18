import Board from "./board";
import { BasicCardType, basicCardTypes, CardNumber, Card, cardNumbers, Joker, BasicCard } from "./card";
import * as utility from "./utility";

export abstract class Player {
    private board: Board;
    private hands: Card[];

    constructor(board: Board) {
        this.board = board;
        this.hands = [];
    }
    
    getCandidatePoints(): { type: BasicCardType, index: CardNumber, card: Card }[] {
        const result = [];
        for (const t of basicCardTypes) for (const n of cardNumbers) {
            for (const h of this.hands) {
                if (this.board.canPlace(t, n, h))
                    result.push({ type: t, index: n, card: h });
            }
        }
        return result;
    }

    isHandEmpty(): boolean {
        return this.hands.length === 0;
    }

    hasBasicCard(): boolean {
        return this.hands.some(c => c instanceof BasicCard);
    }

    addCardIntoHands(card: Card): void {
        this.hands.push(card);
    }

    removeCardFromHands(card: Card): void {
        this.hands = this.hands.filter(c => c != card);
    }

    printHands(): void {
        console.log(this.hands.reduce((acc, v) => acc + " " + v.getShortName(), "====[Hands]====\n(" + this.hands.length + ")"));
    }

    abstract getNextAction(): Promise<{ type: BasicCardType, index: CardNumber, card: Card } | "PASS">;
}

export class Computer extends Player {
    constructor(board: Board) {
        super(board);
    }
    async getNextAction(): Promise<{ type: BasicCardType, index: CardNumber, card: Card } | "PASS"> {
        if (this.isHandEmpty())
            throw new Error("$hand is empty");
        const candidates = utility.shuffleArray(this.getCandidatePoints());
        return candidates.length == 0 ? "PASS" : candidates[0];
    }
}

export class Human extends Player {
    constructor(board: Board) {
        super(board);
    }
    async getNextAction(): Promise<{ type: BasicCardType, index: CardNumber, card: Card } | "PASS"> {
        if (this.isHandEmpty())
            throw new Error("$hand is empty");
        return utility.shuffleArray(this.getCandidatePoints())[0];
    }
}
