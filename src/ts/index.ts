import Board from "./core/board";
import { ConsolePrinter } from "./core/proceedingListener";
import { BasicCardType, basicCardTypes, cardNumbers, Card } from "./core/card";
import { Computer, Player, PlayerAction } from "./core/player";
import Settings from "./core/settings";

/*
 * HTML
 */
type PlayerHTMLElement = { img: HTMLElement };
type CardHTMLElement = { td: HTMLElement, img: HTMLElement };
type HumanHandHTMLElement = { img: HTMLElement, card: Card };

const HTMLElements = {
	players: document.getElementById("shichinarabe-players"),
	pass: document.getElementById("shichinarabe-pass"),
	humanHands: document.getElementById("shichinarabe-human-hands"),
	cards: document.getElementById("shichinarabe-cards")
} as const;
let getPlayerHTMLElement: (n: number) => PlayerHTMLElement = undefined;
let getCardHTMLElement: (type: BasicCardType, index: number) => CardHTMLElement = undefined;
let humanHandHTMLElements: HumanHandHTMLElement[] = undefined;

/*
 * Human
 */
class Human extends Player {

	private aboutToPlace?: Card = null;

	constructor(board: Board) {
		super(board);
	}

	getCardAboutToPlace = () => this.aboutToPlace;

	async getNextAction(): Promise<PlayerAction> {
		if (this.isHandEmpty())
			throw new Error("$hand is empty");

		const listeners: {target: HTMLElement, type: keyof HTMLElementEventMap, listener: (ev: Event) => any}[] = [];
		const registerListener = <K extends keyof HTMLElementEventMap>(target: HTMLElement, type: K,
			listener: (ev: HTMLElementEventMap[K]) => any): void => {
			target.addEventListener(type, listener);
			listeners.push({ target: target, type: type, listener: listener });
		}

		return new Promise<PlayerAction>(resolve => {
			registerListener(HTMLElements.pass, "click", _ => resolve("PASS"));

			registerListener(HTMLElements.humanHands, "click", ev => {
				const el = humanHandHTMLElements.find(e => e.img === ev.target);
				this.aboutToPlace = el.card;
				this.board.getProceedingListener().onHumanSelectedNextCard();
			});

			registerListener(HTMLElements.cards, "click", ev => {
				if (!this.aboutToPlace)
					return;
				const el = ev.target as HTMLElement;
				for (const t of basicCardTypes) {
					for (const n of cardNumbers) {
						if (el === getCardHTMLElement(t, n).img) {
							if (this.board.canPlace(t, n, this.aboutToPlace))
								resolve({ type: t, index: n, card: this.aboutToPlace });
						}
					}
				}
			});
		}).then(v => {
			this.aboutToPlace = null;
			listeners.forEach(e => e.target.removeEventListener(e.type, e.listener));
			return v;
		});
	}

}

/*
 * GameDisplayer
 */
class GameDisplayer extends ConsolePrinter {

	readonly PLAYER_TABLE: Map<number, PlayerHTMLElement>;

	readonly CARD_TABLE: Map<BasicCardType, CardHTMLElement[]>;

	constructor(board: Board) {
		super(board);

		getPlayerHTMLElement = (n: number) => this.PLAYER_TABLE.get(n);
		getCardHTMLElement = (type: BasicCardType, index: number) => this.CARD_TABLE.get(type)[index];

		// players
		HTMLElements.players.innerHTML = "";
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

		// cards in board
		HTMLElements.cards.innerHTML = "";
		this.CARD_TABLE = new Map();
		for (const t of basicCardTypes) {
			const tr = document.createElement("tr");
			const els = [];
			for (const n of cardNumbers) {
				const td = document.createElement("td");
				const img = document.createElement("img");
				img.setAttribute("src", this.board.getCardContainer().getBasicCard(t, n).getImagePath());
				td.appendChild(img);

				td.dataset["display"] = "none";
				tr.appendChild(td);
				els.push({ td: td, img: img });
			}
			this.CARD_TABLE.set(t, els);
			HTMLElements.cards.appendChild(tr);
		}
	}

	onGameStarted() {
		super.onGameStarted();
		this.renderPlayers();
		this.renderCards();
		this.renderHumanHands();
	}

	onBoardChanged() {
		super.onBoardChanged();
		this.renderCards();
	}

	onTurnEnded() {
		super.onTurnEnded();
		this.renderPlayers();
		this.renderHumanHands();
	}

	onHumanSelectedNextCard() {
		this.renderCards();
		this.renderHumanHands();
	}
	
	renderPlayers() {
		this.board.getPlayers().forEach((_, i) =>
			getPlayerHTMLElement(i).img.dataset["highlight"] = `${(i === this.board.getCurrentTurnNumber())}`);
	}

	renderCards() {
		this.board.allCells().forEach(v => {
			const el = getCardHTMLElement(v.t, v.n);

			el.td.dataset["display"] = "none";
			
			const currentPlayer = this.board.getCurrentTurnPlayer();
			if (currentPlayer instanceof Human && this.board.canPlace(v.t, v.n, currentPlayer.getCardAboutToPlace()))
				el.td.dataset["display"] = "translucent";
			
			else {
				const card = this.board.getRow(v.t).getCard(v.n);
				if (card) {
					el.img.setAttribute("src", card.getImagePath());
					el.td.dataset["display"] = "full";
				}
			}
		});
	}

	renderHumanHands() {
		if (this.board.getSettings().humanClassConstructor === undefined)
			return;
		
		const human = this.board.getPlayer(0) as Human;
		HTMLElements.humanHands.innerHTML = "";
		humanHandHTMLElements = [];
		for (const h of human.getHands().sort(Card.comparator)) {
			const img = document.createElement("img");
			img.setAttribute("src", h.getImagePath());
			if (!this.board.allCells().some(v => this.board.canPlace(v.t, v.n, h)))
				img.dataset["status"] = "disabled";
			else if (human.getCardAboutToPlace() === h)
				img.dataset["status"] = "selected";
			HTMLElements.humanHands.appendChild(img);
			humanHandHTMLElements.push({ img: img, card: h });
		}
	}
	
}

/*
 * Board
 */
const board = new Board(new Settings({
	minComputerThinkingTime: 500,
	humanClassConstructor: (board: Board) => new Human(board),
	gameProceedingListenerConstructor: (board: Board) => new GameDisplayer(board)
}));

board.start();
