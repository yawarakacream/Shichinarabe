import { BasicCardType, basicCardTypes, CardNumber, cardNumbers, Card, BasicCard, Joker, CardContainer } from "./card";
import Row from "./row";
import { Player, Computer } from "./player";
import Settings from "./settings";
import * as utility from "./utility";

export default class Board {
	private readonly settings: Settings;
	private readonly cardContainer: CardContainer;

	private readonly stocks: Card[];
	private readonly rows: Map<BasicCardType, Row>;

	private readonly players: Player[];
	
	private turn: number | undefined;
	private ranks: (number | undefined)[];
	private lastRank: number;

	constructor(settings: Settings) {
		this.settings = settings;
		this.cardContainer = new CardContainer(this);

		this.stocks = utility.shuffleArray([...this.cardContainer.getAllCards()].filter(c => !this.getSettings().initialCards.some(d => this.cardContainer.getBasicCard(d.type, d.index) === c)));
		this.rows = new Map(basicCardTypes.map((t) => [t, new Row(t)]));

		this.players = utility.newArray(this.getSettings().computers, _ => new Computer(this));
		if (this.getSettings().humanClassConstructor !== undefined)
			this.players = [this.getSettings().humanClassConstructor(this), ...this.players];

		this.turn = 0;
		this.ranks = new Array(this.players.length).fill(undefined);
		this.lastRank = 0;

		// 手札を配布
		for (let i = 0; i < this.stocks.length; i++)
			this.getPlayer(i % this.players.length).addCardIntoHands(this.stocks[i]);
		
		// 初期カードの配置
		for (const e of this.getSettings().initialCards)
			this.placeCard(e.type, e.index, this.cardContainer.getBasicCard(e.type, e.index), false);
	}

	async start() {
		console.log("**** Game Start ****");
		this.proceedGame();
	}

	end(): void {
		console.log("**** Game Set ****");
		this.turn = undefined;
		this.printRanks();
	}
	
	async proceedGame(): Promise<void> {
		const player = this.getCurrentTurnPlayer();
		const action = await player.getNextAction();

		if (action !== "PASS" && this.canPlace(action.type, action.index, action.card)) {
			const prev = this.placeCard(action.type, action.index, action.card);
			if (prev !== null && this.getSettings().giveBackJoker)
				player.addCardIntoHands(prev);
			player.removeCardFromHands(action.card);
		}
		
		this.printRows();
		this.printPlayerHands();
		
		/**
		 * 手札がなくなった場合、勝ち抜け
		 * 手札がジョーカーだけの人しかいない場合、最下位としてゲーム終了
		 * 全員出せる手がない場合、終了
		 */
		if (player.isHandEmpty())
			this.setRank(this.turn, this.lastRank++);

		if (!this.players.some((p, i) => !this.hasWon(i) && p.hasBasicCard())) {
			for (let i = 0; i < this.players.length; i++) {
				if (!this.hasWon(i))
					this.setRank(i, this.lastRank);
			}
			this.lastRank++;
			return this.end();
		}

		if (this.proceedNextTurn() === undefined) {
			this.setRank(this.turn, this.lastRank++);
			return this.end();
		}

		return this.proceedGame();
	}

	proceedNextTurn(): number | undefined {
		for (let i = 1; i < this.players.length; i++) {
			const j = (this.turn + i) % this.players.length;
			if (this.ranks[j] === undefined) {
				this.turn = j;
				return j;
			}
		}
		return undefined;
	}

	isEnded(): boolean {
		return this.turn === undefined;
	}

	getCurrentTurnPlayer(): Player {
		return this.getPlayer(this.turn);
	}

	getSettings(): Settings {
		return this.settings;
	}

	getRow(type: BasicCardType): Row {
		return this.rows.get(type);
	}

	canPlace(type: BasicCardType, index: CardNumber, card: Card): boolean {
		return this.getRow(type).canPlace(index, card);
	}

	placeCard(type: BasicCardType, index: CardNumber, card: Card, needValidation: boolean = true): Card {
		return this.getRow(type).placeCard(index, card, needValidation);
	}

	getPlayer(index: number): Player {
		return this.players[index];
	}

	hasWon(player: number): boolean {
		return this.ranks[player] !== undefined;
	}

	setRank(player: number, rank: number) {
		this.ranks[player] = rank;
		console.log(`**** Won ${player} in #${rank} ****`)
	}

	printRows(): void {
		let str = "===[Board]===";
		for (const t of basicCardTypes) {
			str += `\n[${t.charAt(0)}]`
			for (const n of cardNumbers) {
				const c = this.getRow(t).getCard(n);
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

	printRanks(): void {
		console.log(this.ranks);
		let ranking: Map<number, number[]> = new Map();
		for (let i = 0; i < this.players.length; i++) {
			const r = this.ranks[i];
			if (!ranking.has(r))
				ranking.set(r, [i]);
			else
				ranking.get(r).push(i);
		}

		let str = "====[Ranking]====";
		for (let i = 0; i < this.lastRank; i++)
			str += `\n${i}: ${ranking.get(i)}`;
		
		console.log(str);
	}

	printPlayerHands(): void {
		let str = "====[Player Hands]====";
		if (this.settings.humanClassConstructor !== undefined)
			str += "\nHM: " + this.players[0].toString();
		console.log(this.players.filter(p => p instanceof Computer)
			.reduce((acc, v, i) => `${acc}\nC${i}: ${v.toString()}`, str));
	}
}
