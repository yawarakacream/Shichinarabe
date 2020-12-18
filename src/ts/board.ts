import { BasicCardType, basicCardTypes, CardNumber, cardNumbers, Card, BasicCard, Joker, cards } from "./card";
import Row from "./row";
import { Player, Human, Computer} from "./player";
import * as config from "./config";
import * as utility from "./utility";

export default class Board {
	private readonly stocks: Card[];
	private readonly rows: Map<BasicCardType, Row>;

	private readonly players: Player[];

	private turn: number;
	private ranks: (number | undefined)[];
	private lastRank: number;

	constructor(humans: number, computers: number) {
		this.stocks = utility.shuffleArray([...cards].filter(c => !config.initialCards.some(d => BasicCard.get(d.type, d.index) === c)));
		this.rows = new Map(basicCardTypes.map((t) => [t, new Row(t)]));

		this.players = [...utility.newArray(humans, _ => new Human(this)), ...utility.newArray(computers, _ => new Computer(this))];

		this.turn = 0;
		this.ranks = new Array(this.players.length).fill(undefined);
		this.lastRank = 0;

		for (let i = 0; i < this.stocks.length; i++)
			this.getPlayer(i % this.players.length).addCardIntoHands(this.stocks[i]);
		
		for (const e of config.initialCards)
			this.placeCard(e.type, e.index, BasicCard.get(e.type, e.index), false);
	}

	async start() {
		console.log("**** Game Start ****");
		while (true) {

			// ステップ実行
			// await utility.awaitEvent(document, "click", () => true);

			const player = this.getCurrentTurnPlayer();
			const action = await player.getNextAction();

			if (player instanceof Computer)
				await utility.awaitSleep(config.minComputerThinkingTime);

			if (action !== "PASS" && this.canPlace(action.type, action.index, action.card)) {
				const prev = this.placeCard(action.type, action.index, action.card);
				if (prev !== null && config.giveBackJoker)
					player.addCardIntoHands(prev);
				player.removeCardFromHands(action.card);
			}
			
			this.printRows();
			this.players.forEach(p => p.printHands());
			
			if (player.isHandEmpty())
				this.setRank(this.turn, this.lastRank++);

			if (!this.players.some((p, i) => !this.hasWon(i) && p.hasBasicCard())) {
				for (let i = 0; i < this.players.length; i++) {
					if (!this.hasWon(i))
						this.setRank(i, this.lastRank);
				}
				this.lastRank++;
				break;
			}

			if (this.proceedNextTurn() === undefined) {
				this.setRank(this.turn, this.lastRank++);
				break;
			}
		}

		this.end();
	}

	end(): void {
		console.log("**** Game Set ****");
		this.printRanks();
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

	getCurrentTurnPlayer(): Player {
		return this.getPlayer(this.turn);
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
			str += "\n[" + t.charAt(0) + "]"
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
		for (let i = 0; i < this.lastRank; i++) {
			str += "\n" + i + ": " + ranking.get(i);
		}
		
		console.log(str);
	}
}
