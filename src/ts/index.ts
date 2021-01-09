import Board from "./core/board";
import { ConsolePrinter } from "./core/proceedingListener";
import { BasicCardType, basicCardTypes, cardNumbers, Card } from "./core/card";
import { Computer, Player, PlayerAction } from "./core/player";
import Settings from "./core/settings";

/*
 * HTML
 */
type CardHTMLElement = { td: HTMLElement, img: HTMLElement };
type HumanHandHTMLElement = { img: HTMLElement, card: Card };

const HTMLElements = {
	computers: document.getElementById("shichinarabe-computers")!,
	cards: document.getElementById("shichinarabe-cards")!,
	human: document.getElementById("shichinarabe-human")!,
	humanIcon: document.getElementById("shichinarabe-human-icon-container")!,
	humanHands: document.getElementById("shichinarabe-human-hands-container")!,
	pass: document.getElementById("shichinarabe-human-pass-container")!,
} as const;
let getCardHTMLElement: (type: BasicCardType, index: number) => CardHTMLElement;
let playerIconHTMLElements: HTMLElement[];
let humanHandHTMLElements: HumanHandHTMLElement[];


/*
 * Human
 */
class Human extends Player {

	private aboutToPlace?: Card = undefined;

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
				if (el && this.aboutToPlace !== el.card) {
					this.aboutToPlace = el.card;
					this.board.getProceedingListener().onHumanSelectedNextCard();
				}
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
			this.aboutToPlace = undefined;
			listeners.forEach(e => e.target.removeEventListener(e.type, e.listener));
			return v;
		});
	}

}

/*
 * GameDisplayer
 */
class GameDisplayer extends ConsolePrinter {

	readonly CARD_TABLE: Map<BasicCardType, CardHTMLElement[]>;

	constructor(board: Board) {
		super(board);

		getCardHTMLElement = (type: BasicCardType, index: number) => this.CARD_TABLE.get(type)![index];

		playerIconHTMLElements = [];

		// human
		if (this.board.getSettings().humanClassConstructor) {
			const div = document.createElement("div");
			div.classList.add("shichinarabe-player-icon-container");

			const iconImg = document.createElement("img");
			iconImg.setAttribute("src", "img/player/human.png");
			div.appendChild(iconImg);

			HTMLElements.humanIcon.appendChild(div);
			playerIconHTMLElements.push(div);

			const passImg = document.createElement("img");
			passImg.setAttribute("src", "img/player/human_pass.png");
			HTMLElements.pass.appendChild(passImg);
		}

		// computers
		HTMLElements.computers.innerHTML = "";
		
		this.board.getPlayers().filter(p => p instanceof Computer).forEach((c, i) => {
			const div = document.createElement("div");
			div.classList.add("shichinarabe-computer");
			HTMLElements.computers.appendChild(div);
			
			const icdiv = document.createElement("div");
			icdiv.classList.add("shichinarabe-player-icon-container");
			div.appendChild(icdiv);

			const img = document.createElement("img");
			img.setAttribute("src", "img/player/computer.png");
			img.dataset["highlight"] = "false";
			icdiv.appendChild(img);
			
			const span = document.createElement("span");
			span.innerHTML = "test";
			div.appendChild(span);

			playerIconHTMLElements.push(icdiv);
		});

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

	onPlayerWon(player: number, rank: number): void {
		super.onPlayerWon(player, rank);
		this.renderPlayers();
	}

	onHumanSelectedNextCard() {
		this.renderCards();
		this.renderHumanHands();
	}
	
	renderPlayers() {
		playerIconHTMLElements.forEach((e, i) => e.dataset["highlight"] = `${(i === this.board.getCurrentTurnNumber())}`);
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
			else
				img.dataset["status"] = "unselected";
			HTMLElements.humanHands.appendChild(img);
			humanHandHTMLElements.push({ img: img, card: h });
		}
	}
	
}

/*
 * Board
 */
const board = new Board(new Settings({
	minComputerThinkingTime: 200,
	humanClassConstructor: (board: Board) => new Human(board),
	gameProceedingListenerConstructor: (board: Board) => new GameDisplayer(board)
}));

board.start();
