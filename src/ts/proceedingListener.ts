import Board from "./board";
import { BasicCard, basicCardTypes, cardNumbers, Joker } from "./card";
import { Computer } from "./player";

export default abstract class GameProceedingListener {
	protected readonly board: Board;

	constructor(board: Board) {
		this.board = board;
	}

	abstract onGameStarted(): void;
	abstract onGameEnded(): void;
	abstract onBoardChanged(): void;
	abstract onTurnEnded(): void;
}

export class ConsolePrinter extends GameProceedingListener {
	protected board: Board;
	
	getBoard(): Board {
		return this.board;
	}

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

	private printRows(): void {
		let str = "====[Board]====";
		for (const t of basicCardTypes) {
			str += `\n[${t.charAt(0)}]`
			for (const n of cardNumbers) {
				const c = this.board.getRow(t).getCard(n);
				str += " ";
				if (c instanceof BasicCard)
					str += "B";
				else if (c instanceof Joker)
					str += "J";
				else
					str += "_";
			}
		}
		console.log(str);
    }
    
    private printPlayerHands(): void {
		let str = "====[Player Hands]====";
		if (this.board.getSettings().humanClassConstructor !== undefined)
			str += "\nHM: " + this.board.getPlayer(0).toString();
		console.log(this.board.getPlayers().filter(p => p instanceof Computer)
			.reduce((acc, v, i) => `${acc}\nC${i}: ${v.toString()}`, str));
    }

	private printRanks(): void {
		console.log(this.board.getRanks());
		let ranking: Map<number, number[]> = new Map();
		for (let i = 0; i < this.board.getPlayers().length; i++) {
			const r = this.board.getRank(i);
			if (!ranking.has(r))
				ranking.set(r, [i]);
			else
				ranking.get(r).push(i);
		}

		let str = "====[Ranking]====";
		for (let i = 0; i < this.board.getLastRank(); i++)
			str += `\n${i}: ${ranking.get(i)}`;
		
		console.log(str);
	}
}