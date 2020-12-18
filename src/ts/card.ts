export const basicCardTypes = ["DIAMOND", "HEART", "SPADE", "CLUB"] as const;
export type BasicCardType = typeof basicCardTypes[number];

export const cardNumbers = [...Array(13).keys()];
export type CardNumber = typeof cardNumbers[number];
export const isCardNumber = (n: number): n is CardNumber => 0 <= n && n < 13;

export abstract class Card {
	private readonly displayName: string;
	private readonly shortName: string;

	constructor(displayName: string, shortName: string) {
		this.displayName = displayName;
		this.shortName = shortName;
	}

	getDisplayName(): string {
		return this.displayName;
	}

	getShortName(): string {
		return this.shortName;
	}
}

export class Joker extends Card {
	constructor() {
		super("JOKER", "J");
	}
}

export class BasicCard extends Card {
	readonly type: BasicCardType;
	readonly number: CardNumber;

	private constructor(type: BasicCardType, number: CardNumber) {
		super(type + "$" + number, type.charAt(0) + number);
		this.type = type;
		this.number = number;
	}

	getType(): BasicCardType {
		return this.type;
	}

	getNumber(): CardNumber {
		return this.number;
	}

	static newAll(): Map<BasicCardType, BasicCard[]> {
		return new Map(basicCardTypes.map(t => [t, cardNumbers.map((i) => new BasicCard(t, i))]));
	}

	static get(type: BasicCardType, number: number): BasicCard {
		return basicCards.get(type)[number];
	}
}

import * as utility from "./utility";
import * as config from "./config";

const joker = utility.newArray(config.jorkers, _ => new Joker());
const basicCards = BasicCard.newAll();
export const cards = [...joker, ...Array.from(basicCards.values()).flat()];
