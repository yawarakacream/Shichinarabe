import Board, { Rank } from "./board";
import { basicCardTypes, cardNumbers, Joker } from "./card";
import { Computer } from "./player";
import * as utility from "./utility";

export default abstract class GameProceedingListener {

    protected readonly board: Board;

    constructor(board: Board) {
        this.board = board;
    }

    abstract onGameStarted(): void;
    abstract onGameEnded(): void;
    abstract onBoardChanged(): void;
    abstract onTurnEnded(): void;
    abstract onPlayerWon(player: number, rank: Rank): void;
    abstract onHumanSelectedNextCard(): void;

}

export class ConsolePrinter extends GameProceedingListener {

    protected readonly board: Board;

    onGameStarted(): void {
        console.log("**** Game Start ****");
    }

    onGameEnded(): void {
        console.log("**** Game Set ****");
        this.printRanks();
    }

    onBoardChanged(): void {
        this.printRows();
        this.printPlayerHands();
    };
    
    onTurnEnded(): void {
        // do nothing.
    }

    onPlayerWon(player: number, rank: number): void {
        console.log(`**** Won ${player} in #${rank} ****`)
    }

    onHumanSelectedNextCard(): void {
        // do nothing.
    }

    private printRows(): void {
        let str = "====[Board]====";
        for (const t of basicCardTypes) {
            str += `\n[${t.charAt(0)}]`
            for (const n of cardNumbers) {
                const c = this.board.getRow(t).getCard(n);
                str += " " + (c === null ? "_" : c instanceof Joker ? "J" : "B");
            }
        }
        console.log(str);
    }
    
    private printPlayerHands(): void {
        let str = "====[Player Hands]====";
        if (this.board.settings.humanClassConstructor !== undefined)
            str += "\nHM: " + this.board.getPlayer(0).toString();
        console.log(this.board.getPlayers().filter(p => p instanceof Computer)
            .reduce((acc, v, i) => `${acc}\nC${i}: ${v.toString()}`, str));
    }

    private printRanks(): void {
        console.log(this.board.getRanks());
        let ranking: Map<Rank, number[]> = utility.swapKV(utility.toMap(this.board.getRanks()));
        
        let str = "====[Ranking]====";
        for (let i = 0; i < this.board.getLastRank(); i++)
            str += `\n${i}: ${ranking.get(i)}`;
        
        console.log(str);
    }
    
}
