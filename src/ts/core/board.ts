import { BasicCardType, basicCardTypes, CardNumber, Card, CardContainer, cardNumbers } from "./card";
import Row from "./row";
import { Player, Computer } from "./player";
import GameProceedingListener from "./proceedingListener";
import Settings from "./settings";
import * as utility from "./utility";

export type Rank = number | undefined;

export default class Board {

    private readonly settings: Settings;
    private readonly cardContainer: CardContainer;

    private readonly proceedingListener: GameProceedingListener;

    private readonly rows: Map<BasicCardType, Row>;

    private readonly players: Player[];
    
    private turn: number | undefined;
    private ranks: Rank[];
    private lastRank: number;

    constructor(settings: Settings) {
        this.settings = settings;
        this.cardContainer = new CardContainer(this);

        this.rows = new Map(basicCardTypes.map((t) => [t, new Row(t)]));

        this.players = utility.newArray(this.getSettings().computers, _ => new Computer(this));
        const hcc = this.getSettings().humanClassConstructor;
        if (hcc)
            this.players = [hcc(this), ...this.players];
        
        this.turn = 0;
        this.ranks = utility.newArray(this.players.length, () => undefined);
        this.lastRank = 0;

        // 手札を配布
        const stocks = utility.shuffleArray([...this.cardContainer.getAllCards()]
            .filter(c => !this.getSettings().initialCards.some(d => this.cardContainer.getBasicCard(d.type, d.index) === c)));
        for (let i = 0; i < stocks.length; i++)
            this.getPlayer(i % this.players.length).addCardIntoHands(stocks[i]);
        
        // 初期カードの配置
        for (const e of this.getSettings().initialCards)
            this.placeCard(e.type, e.index, this.cardContainer.getBasicCard(e.type, e.index), false);
        
        this.proceedingListener = this.getSettings().gameProceedingListenerConstructor(this);
    }

    start() {
        this.proceedGame();
        this.proceedingListener.onGameStarted();
    }

    end(): void {
        this.turn = undefined;
        this.proceedingListener.onGameEnded();
    }
    
    async proceedGame(): Promise<void> {
        const player = this.getCurrentTurnPlayer();
        const action = await player.getNextAction();

        if (action !== "PASS" && this.canPlace(action.type, action.index, action.card)) {
            const prev = this.placeCard(action.type, action.index, action.card);
            if (prev && this.getSettings().giveBackJoker)
                player.addCardIntoHands(prev);
            player.removeCardFromHands(action.card);
        }
        
        this.proceedingListener.onBoardChanged();
        
        /*
         * 手札がなくなった場合、勝ち抜け
         * カードを持っている人が 1 人しかいない場合、最下位としてゲーム終了
         * 手札がジョーカーだけの人しかいない場合、最下位としてゲーム終了
         */

        if (player.isHandEmpty())
            this.setRank(this.turn!, this.lastRank++);

        const reminders = this.players.map((p, i) => ({p: p, i: i})).filter(r => !this.hasWon(r.i)).filter(r => !r.p.isHandEmpty());
        if (reminders.length === 1) {
            this.setRank(reminders[0].i, this.lastRank++);
            return this.end();
        }
        if (!reminders.some(r => r.p.hasBasicCard())) {
            reminders.forEach(r => this.setRank(r.i, this.lastRank));
            this.lastRank++;
            return this.end();
        }

        this.turn = this.getNextTurnNumber();
        if (this.turn === undefined) {
            this.setRank(this.turn!, this.lastRank++);
            return this.end();
        }

        this.proceedingListener.onTurnEnded();

        return this.proceedGame();
    }

    getCurrentTurnNumber = () => this.turn;

    getNextTurnNumber = () => [...new Array(this.players.length - 1).keys()]
            .map(i => i + this.turn! + 1)
            .map(i => i % this.players.length)
            .find((v, _) => this.ranks[v] === undefined);

    isEnded = () => this.turn === undefined;

    getCurrentTurnPlayer = () => this.getPlayer(this.turn!);

    getSettings = () => this.settings;

    getCardContainer = () => this.cardContainer;

    getProceedingListener = () => this.proceedingListener;

    getRow = (type: BasicCardType) => this.rows.get(type)!;

    allCells = () => basicCardTypes.flatMap(t => cardNumbers.map(n => ({ t: t, n: n })));

    canPlace = (type: BasicCardType, index: CardNumber, card?: Card) => card && this.getRow(type).canPlace(index, card);

    placeCard = (type: BasicCardType, index: CardNumber, card: Card, needValidation: boolean = true) =>
        this.getRow(type).placeCard(index, card, needValidation);

    getPlayer = (index: number) => this.players[index];

    getPlayers = () => this.players;

    hasWon = (player: number) => this.ranks[player] !== undefined;

    getRanks = () => this.ranks;

    getRank = (index: number) => this.ranks[index];

    setRank(player: number, rank: Rank) {
        this.ranks[player] = rank;
        this.getProceedingListener().onPlayerWon(player, rank);
    }

    getLastRank = () => this.lastRank;
    
}
