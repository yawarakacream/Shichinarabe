import { BasicCardType, CardNumber, Card } from "./card";

export default interface InputHandler {
    awaitPass(): Promise<boolean>;
    awaitPlaceCard(): Promise<{ type: BasicCardType, index: CardNumber, card: Card }>;
}
