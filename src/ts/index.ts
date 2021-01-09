import Board from "./core/board";
import { ConsolePrinter } from "./core/proceedingListener";
import { BasicCardType, basicCardTypes, cardNumbers, Card } from "./core/card";
import { Computer, Player, PlayerAction } from "./core/player";
import Settings from "./core/settings";
import * as utility from "./core/utility";

/*
 * HTML
 */
namespace HTMLContainer {
    export type CardHTMLElement = { td: HTMLElement, img: HTMLElement };
    export type HumanHandHTMLElement = { img: HTMLElement, card: Card };

    export const ranking = document.getElementById("shichinarabe-ranking")!;

    export const computers = document.getElementById("shichinarabe-computers")!;
    export const cards = document.getElementById("shichinarabe-cards")!;
    export const human = document.getElementById("shichinarabe-human")!;
    export const humanIcon = document.getElementById("shichinarabe-human-icon-container")!;
    export const humanHandsContainer = document.getElementById("shichinarabe-human-hands-container")!;
    export const pass = document.getElementById("shichinarabe-human-pass-container")!;

    export let getCardElement: (type: BasicCardType, index: number) => CardHTMLElement;
    export let playerIcons: HTMLElement[];
    export let computerHandsContainer: HTMLElement[];
    export let humanHands: HumanHandHTMLElement[];
}

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
            registerListener(HTMLContainer.pass, "click", _ => resolve("PASS"));

            registerListener(HTMLContainer.humanHandsContainer, "click", ev => {
                const el = HTMLContainer.humanHands.find(e => e.img === ev.target);
                if (el && this.aboutToPlace !== el.card) {
                    this.aboutToPlace = el.card;
                    this.board.getProceedingListener().onHumanSelectedNextCard();
                }
            });

            registerListener(HTMLContainer.cards, "click", ev => {
                if (!this.aboutToPlace)
                    return;
                const el = ev.target as HTMLElement;
                for (const t of basicCardTypes) {
                    for (const n of cardNumbers) {
                        if (el === HTMLContainer.getCardElement(t, n).img) {
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

    readonly CARD_TABLE: Map<BasicCardType, HTMLContainer.CardHTMLElement[]>;

    constructor(board: Board) {
        super(board);

        HTMLContainer.getCardElement = (type: BasicCardType, index: number) => this.CARD_TABLE.get(type)![index];

        HTMLContainer.playerIcons = [];
        HTMLContainer.computerHandsContainer = [];

        // human
        if (this.board.getSettings().humanClassConstructor) {
            const div = document.createElement("div");
            div.classList.add("shichinarabe-player-icon-container");

            const iconImg = document.createElement("img");
            iconImg.setAttribute("src", "img/player/human.png");
            div.appendChild(iconImg);

            HTMLContainer.humanIcon.appendChild(div);
            HTMLContainer.playerIcons.push(div);

            const passImg = document.createElement("img");
            passImg.setAttribute("src", "img/player/human_pass.png");
            HTMLContainer.pass.appendChild(passImg);
        }

        // computers
        HTMLContainer.computers.innerHTML = "";
        
        this.board.getPlayers().filter(p => p instanceof Computer).forEach((c, i) => {
            const div = document.createElement("div");
            div.classList.add("shichinarabe-computer");
            HTMLContainer.computers.appendChild(div);
            
            const icdiv = document.createElement("div");
            icdiv.classList.add("shichinarabe-player-icon-container");
            div.appendChild(icdiv);

            const img = document.createElement("img");
            img.setAttribute("src", "img/player/computer.png");
            img.dataset["highlight"] = "false";
            icdiv.appendChild(img);

            const hcDiv = document.createElement("div");
            hcDiv.classList.add("shichinarabe-computer-hands-container");
            div.appendChild(hcDiv);

            HTMLContainer.computerHandsContainer.push(hcDiv);
            HTMLContainer.playerIcons.push(icdiv);
        });

        // cards in board
        HTMLContainer.cards.innerHTML = "";
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
            HTMLContainer.cards.appendChild(tr);
        }
    }

    onGameStarted() {
        super.onGameStarted();
        this.renderPlayers();
        this.renderCards();
        this.renderComputerHands();
        this.renderHumanHands();
    }

    onBoardChanged() {
        super.onBoardChanged();
        this.renderCards();
    }

    onTurnEnded() {
        super.onTurnEnded();
        this.renderPlayers();
        this.renderComputerHands();
        this.renderHumanHands();
    }

    onPlayerWon(player: number, rank: number): void {
        super.onPlayerWon(player, rank);
        this.renderPlayers();
        this.renderRanking();
    }

    onHumanSelectedNextCard() {
        this.renderCards();
        this.renderHumanHands();
    }
    
    renderPlayers() {
        HTMLContainer.playerIcons.forEach((e, i) => e.dataset["highlight"] = `${(i === this.board.getCurrentTurnNumber())}`);
    }

    renderCards() {
        this.board.allCells().forEach(v => {
            const el = HTMLContainer.getCardElement(v.t, v.n);

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

    renderComputerHands() {
        this.board.getPlayers().filter(p => p instanceof Computer).forEach((c, i) => {
            const container = HTMLContainer.computerHandsContainer[i];
            container.innerHTML = "";
            c.getHands().map((_, j) => {
                const el = document.createElement("img");
                el.setAttribute("src", "img/card/back.png");
                el.style.setProperty("--index", j.toString());
                container.appendChild(el);
            });
        });
    }

    renderHumanHands() {
        if (this.board.getSettings().humanClassConstructor === undefined)
            return;
        
        const human = this.board.getPlayer(0) as Human;
        HTMLContainer.humanHandsContainer.innerHTML = "";
        HTMLContainer.humanHands = [];
        for (const h of human.getHands().sort(Card.comparator)) {
            const img = document.createElement("img");
            img.setAttribute("src", h.getImagePath());
            if (!this.board.allCells().some(v => this.board.canPlace(v.t, v.n, h)))
                img.dataset["status"] = "disabled";
            else if (human.getCardAboutToPlace() === h)
                img.dataset["status"] = "selected";
            else
                img.dataset["status"] = "unselected";
            HTMLContainer.humanHandsContainer.appendChild(img);
            HTMLContainer.humanHands.push({ img: img, card: h });
        }
    }

    renderRanking() {
        const container = HTMLContainer.ranking;
        container.innerHTML = "";

        new Map([...utility.swapKV(utility.toMap(this.board.getRanks())).entries()].sort()).forEach((v, k) => {
            if (k == undefined)
                return;

            v.forEach(p => {
                const tr = document.createElement("tr");
                container.appendChild(tr);
                
                const numberTd = document.createElement("td");
                tr.appendChild(numberTd);
                const numberImg = document.createElement("img");
                numberImg.setAttribute("src", `./img/ranking/${k + 1}.png`);
                numberTd.appendChild(numberImg);
                
                const playerTd = document.createElement("td");
                tr.appendChild(playerTd);
                const playerImg = document.createElement("img");
                playerImg.setAttribute("src", `./img/player/${this.board.getPlayer(p) instanceof Computer ? "computer" : "human"}.png`);
                playerTd.appendChild(playerImg);
            });
        });
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
