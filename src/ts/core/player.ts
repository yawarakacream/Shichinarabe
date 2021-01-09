import Board from "./board";
import { BasicCardType, basicCardTypes, CardNumber, Card, cardNumbers, BasicCard } from "./card";
import * as utility from "./utility";

export type PlayerAction = { type: BasicCardType, index: CardNumber, card: Card } | "PASS";

export abstract class Player {

    protected board: Board;
    protected hands: Card[];

    constructor(board: Board) {
        this.board = board;
        this.hands = [];
    }

    getHands = () => this.hands;
    
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

    isHandEmpty = () => this.hands.length === 0;

    hasBasicCard = () => this.hands.some(c => c instanceof BasicCard);

    addCardIntoHands = (card: Card) => {
        if (card===undefined) throw new Error();
        this.hands.push(card);
    }

    removeCardFromHands = (card: Card) => this.hands = this.hands.filter(c => c !== card);

    toString = () => this.hands.reduce((acc, v) => acc + " " + v.getShortName(), "(" + this.hands.length + ")");

    abstract getNextAction(): Promise<PlayerAction>;

}

export class Computer extends Player {

    constructor(board: Board) {
        super(board);
    }

    async getNextAction(): Promise<PlayerAction> {
        if (this.isHandEmpty())
            throw new Error("$hand is empty");

        await utility.awaitSleep(this.board.getSettings().minComputerThinkingTime);
        
        const candidates = utility.shuffleArray(this.getCandidatePoints());
        return candidates.length == 0 ? "PASS" : candidates[0];
    }
    
}
