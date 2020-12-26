import Board from "./board";
import { ConsolePrinter } from "./proceedingListener";
import { BasicCardType, basicCardTypes, cardNumbers } from "./card";
import { Computer, Player, PlayerAction } from "./player";
import Settings from "./settings";
import * as utility from "./utility";

const HTMLElements = {
	players: document.getElementById("shichinarabe-players"),
	passButton: document.getElementById("shichinarabe-pass"),
	cardTable: document.getElementById("shichinarabe-cards"),
};

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

type PlayerHTMLElement = { img: HTMLElement };
type CardHTMLElement = { td: HTMLElement, img: HTMLElement };

class GameProceedingHandler extends ConsolePrinter {

	readonly PLAYER_TABLE: Map<number, PlayerHTMLElement>;
	readonly getPlayerHTMLElement = (n: number) => this.PLAYER_TABLE.get(n);

	readonly CARD_TABLE: Map<BasicCardType, CardHTMLElement[]>;
	readonly getCardHTMLElement = (type: BasicCardType, index: number) => this.CARD_TABLE.get(type)[index];

	constructor(board: Board) {
		super(board);

		this.PLAYER_TABLE = new Map();
		this.board.getPlayers().forEach((p, i) => {
			const div = document.createElement("div");
			const img = document.createElement("img");
			if (p instanceof Human)
				img.setAttribute("src", "img/player/human.png");
			else if (p instanceof Computer)
				img.setAttribute("src", "img/player/computer.png");
			img.dataset["highlight"] = "false";
			div.appendChild(img);
			this.PLAYER_TABLE.set(i, { img: img });
			HTMLElements.players.appendChild(div);
		})

		this.CARD_TABLE = new Map();
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
			this.CARD_TABLE.set(t, els);
			HTMLElements.cardTable.appendChild(tr);
		}
	}

	onGameStarted() {
		super.onGameStarted();
		this.renderPlayers();
		this.renderCards();
	}

	onBoardChanged() {
		super.onBoardChanged();
		this.renderCards();
	}

	onTurnEnded() {
		super.onTurnEnded();
		this.renderPlayers();
	}
	
	renderPlayers() {
		this.board.getPlayers().forEach((_, i) =>
			this.getPlayerHTMLElement(i).img.dataset["highlight"] = `${(i === this.board.getCurrentTurnNumber())}`);
	}

	renderCards() {
		for (const t of basicCardTypes) {
			for (const n of cardNumbers) {
				const el = this.getCardHTMLElement(t, n);
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
	minComputerThinkingTime: 500,
	humanClassConstructor: (board: Board) => new Human(board),
	gameProceedingListenerConstructor: (board: Board) => new GameProceedingHandler(board)
}));

board.start();
