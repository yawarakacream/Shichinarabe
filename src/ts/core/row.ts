import { BasicCardType, CardNumber, isCardNumber, Card, BasicCard, Joker } from "./card";

export default class Row {
    private readonly type: BasicCardType;
    private readonly elements: Card[];

    constructor(type: BasicCardType) {
        this.type = type;
        this.elements = new Array(13).fill(null);
    }

    canPlace(index: CardNumber, card: Card): boolean {
        if (!card)
            return false;
        
        if (card instanceof BasicCard && (card.type !== this.type || card.getNumber() != index))
            return false;

        if (this.isPlaced(index) && !(this.getCard(index) instanceof Joker))
            return false;
        
        let isPlacedWeakly = (n: number) => isCardNumber(n) && this.isPlaced(n);
        if (!isPlacedWeakly(index - 1) && !isPlacedWeakly(index + 1))
            return false;
        
        return true;
    }

    placeCard(index: CardNumber, card: Card, needValidation: boolean = true): Card {
        if (card === undefined)
            throw new Error("illegal $card");
        if (needValidation && !this.canPlace(index, card))
            throw new Error("illegal status");
        
        const tmp = this.elements[index];
        this.elements[index] = card;
        return tmp;
    }

    getCard = (index: CardNumber) => this.elements[index];

    isPlaced = (index: CardNumber) => this.getCard(index) !== null;
}
