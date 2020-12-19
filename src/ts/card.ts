import Board from "./board";
import * as utility from "./utility";

export const basicCardTypes = ["DIAMOND", "HEART", "SPADE", "CLUB"] as const;
export type BasicCardType = typeof basicCardTypes[number];

export const cardNumbers = [...new Array(13).keys()];
export type CardNumber = typeof cardNumbers[number];
export const isCardNumber = (n: number): n is CardNumber => 0 <= n && n < cardNumbers.length;

export abstract class Card {
	private readonly displayName: string;
	private readonly shortName: string;
	private readonly imagePath: string;

	constructor(displayName: string, shortName: string, imagePath: string) {
		this.displayName = displayName;
		this.shortName = shortName;
		this.imagePath = imagePath;
	}

	getDisplayName = () => this.displayName;
	getShortName = () => this.shortName;
	getImagePath = () => this.imagePath;
}

export class Joker extends Card {
	constructor() {
		super("JOKER", "J", "img/joker.png");
	}
}

export class BasicCard extends Card {
	readonly type: BasicCardType;
	readonly number: CardNumber;

	constructor(type: BasicCardType, number: CardNumber) {
		super(type + "$" + number, type.charAt(0) + number, `img/${type.toLowerCase()}/p${number + 1}.png`);
		this.type = type;
		this.number = number;
	}

	getType = () => this.type;
	getNumber = () => this.number;
}

export class CardContainer {
	private readonly jokers: Joker[];
	private readonly basicCards: Map<BasicCardType, BasicCard[]>;
	private readonly cards: Card[];

	constructor(board: Board) {
		this.jokers = utility.newArray(board.getSettings().jorkers, _ => new Joker());
		this.basicCards = new Map(basicCardTypes.map(t => [t, cardNumbers.map((i) => new BasicCard(t, i))]));
		this.cards = [...this.jokers, ...Array.from(this.basicCards.values()).flat()]
	}

	getBasicCard = (type: BasicCardType, number: number) => this.basicCards.get(type)[number];
	getAllCards = () => this.cards;
}
