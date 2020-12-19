/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is not neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/ts/board.ts":
/*!*************************!*\
  !*** ./src/ts/board.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst card_1 = __webpack_require__(/*! ./card */ \"./src/ts/card.ts\");\nconst row_1 = __webpack_require__(/*! ./row */ \"./src/ts/row.ts\");\nconst player_1 = __webpack_require__(/*! ./player */ \"./src/ts/player.ts\");\nconst utility = __webpack_require__(/*! ./utility */ \"./src/ts/utility.ts\");\nclass Board {\n    constructor(settings) {\n        this.getNextTurnNumber = () => [...new Array(this.players.length - 1).keys()]\n            .map(i => i + this.turn + 1)\n            .map(i => i % this.players.length)\n            .find((v, _) => this.ranks[v] === undefined);\n        this.isEnded = () => this.turn === undefined;\n        this.getCurrentTurnPlayer = () => this.getPlayer(this.turn);\n        this.getSettings = () => this.settings;\n        this.getRow = (type) => this.rows.get(type);\n        this.canPlace = (type, index, card) => this.getRow(type).canPlace(index, card);\n        this.placeCard = (type, index, card, needValidation = true) => this.getRow(type).placeCard(index, card, needValidation);\n        this.getPlayer = (index) => this.players[index];\n        this.getPlayers = () => this.players;\n        this.hasWon = (player) => this.ranks[player] !== undefined;\n        this.getRanks = () => this.ranks;\n        this.getRank = (index) => this.ranks[index];\n        this.getLastRank = () => this.lastRank;\n        this.settings = settings;\n        this.cardContainer = new card_1.CardContainer(this);\n        this.proceedingListener = this.getSettings().gameProceedingListenerConstructor(this);\n        this.rows = new Map(card_1.basicCardTypes.map((t) => [t, new row_1.default(t)]));\n        this.players = utility.newArray(this.getSettings().computers, _ => new player_1.Computer(this));\n        if (this.getSettings().humanClassConstructor !== undefined)\n            this.players = [this.getSettings().humanClassConstructor(this), ...this.players];\n        this.turn = 0;\n        this.ranks = new Array(this.players.length).fill(undefined);\n        this.lastRank = 0;\n        // 手札を配布\n        const stocks = utility.shuffleArray([...this.cardContainer.getAllCards()]\n            .filter(c => !this.getSettings().initialCards.some(d => this.cardContainer.getBasicCard(d.type, d.index) === c)));\n        for (let i = 0; i < stocks.length; i++)\n            this.getPlayer(i % this.players.length).addCardIntoHands(stocks[i]);\n        // 初期カードの配置\n        for (const e of this.getSettings().initialCards)\n            this.placeCard(e.type, e.index, this.cardContainer.getBasicCard(e.type, e.index), false);\n    }\n    start() {\n        this.proceedGame();\n        this.proceedingListener.onGameStarted();\n    }\n    end() {\n        this.turn = undefined;\n        this.proceedingListener.onGameEnded();\n    }\n    async proceedGame() {\n        const player = this.getCurrentTurnPlayer();\n        const action = await player.getNextAction();\n        if (action !== \"PASS\" && this.canPlace(action.type, action.index, action.card)) {\n            const prev = this.placeCard(action.type, action.index, action.card);\n            if (prev && this.getSettings().giveBackJoker)\n                player.addCardIntoHands(prev);\n            player.removeCardFromHands(action.card);\n        }\n        this.proceedingListener.onBoardChanged();\n        /*\n         * 手札がなくなった場合、勝ち抜け\n         * カードを持っている人が 1 人しかいない場合、最下位としてゲーム終了\n         * 手札がジョーカーだけの人しかいない場合、最下位としてゲーム終了\n         */\n        if (player.isHandEmpty())\n            this.setRank(this.turn, this.lastRank++);\n        const reminders = this.players.map((p, i) => ({ p: p, i: i })).filter(r => !this.hasWon(r.i)).filter(r => !r.p.isHandEmpty());\n        if (reminders.length === 1) {\n            this.setRank(reminders[0].i, this.lastRank++);\n            return this.end();\n        }\n        if (!reminders.some(r => r.p.hasBasicCard())) {\n            reminders.forEach(r => this.setRank(r.i, this.lastRank));\n            this.lastRank++;\n            return this.end();\n        }\n        this.turn = this.getNextTurnNumber();\n        if (this.turn === undefined) {\n            this.setRank(this.turn, this.lastRank++);\n            return this.end();\n        }\n        this.proceedingListener.onTurnEnded();\n        return this.proceedGame();\n    }\n    setRank(player, rank) {\n        this.ranks[player] = rank;\n        console.log(`**** Won ${player} in #${rank} ****`);\n    }\n}\nexports.default = Board;\n\n\n//# sourceURL=webpack://shichinarabe/./src/ts/board.ts?");

/***/ }),

/***/ "./src/ts/card.ts":
/*!************************!*\
  !*** ./src/ts/card.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.CardContainer = exports.BasicCard = exports.Joker = exports.Card = exports.isCardNumber = exports.cardNumbers = exports.basicCardTypes = void 0;\nconst utility = __webpack_require__(/*! ./utility */ \"./src/ts/utility.ts\");\nexports.basicCardTypes = [\"DIAMOND\", \"HEART\", \"SPADE\", \"CLUB\"];\nexports.cardNumbers = [...new Array(13).keys()];\nconst isCardNumber = (n) => 0 <= n && n < exports.cardNumbers.length;\nexports.isCardNumber = isCardNumber;\nclass Card {\n    constructor(displayName, shortName, imagePath) {\n        this.getDisplayName = () => this.displayName;\n        this.getShortName = () => this.shortName;\n        this.getImagePath = () => this.imagePath;\n        this.displayName = displayName;\n        this.shortName = shortName;\n        this.imagePath = imagePath;\n    }\n}\nexports.Card = Card;\nclass Joker extends Card {\n    constructor() {\n        super(\"JOKER\", \"J\", \"img/joker.png\");\n    }\n}\nexports.Joker = Joker;\nclass BasicCard extends Card {\n    constructor(type, number) {\n        super(type + \"$\" + number, type.charAt(0) + number, `img/${type.toLowerCase()}/p${number + 1}.png`);\n        this.getType = () => this.type;\n        this.getNumber = () => this.number;\n        this.type = type;\n        this.number = number;\n    }\n}\nexports.BasicCard = BasicCard;\nclass CardContainer {\n    constructor(board) {\n        this.getBasicCard = (type, number) => this.basicCards.get(type)[number];\n        this.getAllCards = () => this.cards;\n        this.jokers = utility.newArray(board.getSettings().jorkers, _ => new Joker());\n        this.basicCards = new Map(exports.basicCardTypes.map(t => [t, exports.cardNumbers.map((i) => new BasicCard(t, i))]));\n        this.cards = [...this.jokers, ...Array.from(this.basicCards.values()).flat()];\n    }\n}\nexports.CardContainer = CardContainer;\n\n\n//# sourceURL=webpack://shichinarabe/./src/ts/card.ts?");

/***/ }),

/***/ "./src/ts/index.ts":
/*!*************************!*\
  !*** ./src/ts/index.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst board_1 = __webpack_require__(/*! ./board */ \"./src/ts/board.ts\");\nconst proceedingListener_1 = __webpack_require__(/*! ./proceedingListener */ \"./src/ts/proceedingListener.ts\");\nconst card_1 = __webpack_require__(/*! ./card */ \"./src/ts/card.ts\");\nconst player_1 = __webpack_require__(/*! ./player */ \"./src/ts/player.ts\");\nconst settings_1 = __webpack_require__(/*! ./settings */ \"./src/ts/settings.ts\");\nconst utility = __webpack_require__(/*! ./utility */ \"./src/ts/utility.ts\");\nconst HTMLElements = {\n    passButton: document.getElementById(\"shichinarabe-pass\"),\n    cardTable: document.getElementById(\"shichinarabe-cards\"),\n    card: undefined\n};\nconst CARD_TABLE = (() => {\n    const result = new Map();\n    for (const t of card_1.basicCardTypes) {\n        const tr = document.createElement(\"tr\");\n        const els = [];\n        for (const n of card_1.cardNumbers) {\n            const td = document.createElement(\"td\");\n            const img = document.createElement(\"img\");\n            img.setAttribute(\"src\", \"img/joker.png\");\n            td.appendChild(img);\n            td.dataset[\"show\"] = \"false\";\n            tr.appendChild(td);\n            els.push({ td: td, img: img });\n        }\n        result.set(t, els);\n        HTMLElements.cardTable.appendChild(tr);\n    }\n    return result;\n})();\nHTMLElements.card = (type, index) => CARD_TABLE.get(type)[index];\nclass Human extends player_1.Player {\n    constructor(board) {\n        super(board);\n    }\n    async getNextAction() {\n        if (this.isHandEmpty())\n            throw new Error(\"$hand is empty\");\n        return Promise.any([\n            new Promise(resolve => utility.listenEventOnceAsync(HTMLElements.passButton, \"click\")\n                .then(e => resolve()))\n                .then(_ => \"PASS\")\n        ]);\n    }\n}\nclass GameProceedingHandler extends proceedingListener_1.ConsolePrinter {\n    constructor(board) {\n        super(board);\n    }\n    onGameStarted() {\n        super.onGameStarted();\n        this.renderCards();\n    }\n    onBoardChanged() {\n        super.onBoardChanged();\n        this.renderCards();\n    }\n    renderCards() {\n        for (const t of card_1.basicCardTypes) {\n            for (const n of card_1.cardNumbers) {\n                const el = HTMLElements.card(t, n);\n                el.td.dataset[\"show\"] = \"false\";\n                const card = board.getRow(t).getCard(n);\n                if (card) {\n                    el.img.setAttribute(\"src\", card.getImagePath());\n                    el.td.dataset[\"show\"] = \"true\";\n                }\n            }\n        }\n    }\n}\nconst board = new board_1.default(new settings_1.default({\n    minComputerThinkingTime: 100,\n    humanClassConstructor: (board) => new Human(board),\n    gameProceedingListenerConstructor: (board) => new GameProceedingHandler(board)\n}));\nboard.start();\n\n\n//# sourceURL=webpack://shichinarabe/./src/ts/index.ts?");

/***/ }),

/***/ "./src/ts/player.ts":
/*!**************************!*\
  !*** ./src/ts/player.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Computer = exports.Player = void 0;\nconst card_1 = __webpack_require__(/*! ./card */ \"./src/ts/card.ts\");\nconst utility = __webpack_require__(/*! ./utility */ \"./src/ts/utility.ts\");\nclass Player {\n    constructor(board) {\n        this.isHandEmpty = () => this.hands.length === 0;\n        this.hasBasicCard = () => this.hands.some(c => c instanceof card_1.BasicCard);\n        this.addCardIntoHands = (card) => {\n            if (card === undefined)\n                throw new Error();\n            this.hands.push(card);\n        };\n        this.removeCardFromHands = (card) => this.hands = this.hands.filter(c => c != card);\n        this.toString = () => this.hands.reduce((acc, v) => acc + \" \" + v.getShortName(), \"(\" + this.hands.length + \")\");\n        this.board = board;\n        this.hands = [];\n    }\n    getCandidatePoints() {\n        const result = [];\n        for (const t of card_1.basicCardTypes)\n            for (const n of card_1.cardNumbers) {\n                for (const h of this.hands) {\n                    if (this.board.canPlace(t, n, h))\n                        result.push({ type: t, index: n, card: h });\n                }\n            }\n        return result;\n    }\n}\nexports.Player = Player;\nclass Computer extends Player {\n    constructor(board) {\n        super(board);\n    }\n    async getNextAction() {\n        if (this.isHandEmpty())\n            throw new Error(\"$hand is empty\");\n        await utility.awaitSleep(this.board.getSettings().minComputerThinkingTime);\n        const candidates = utility.shuffleArray(this.getCandidatePoints());\n        return candidates.length == 0 ? \"PASS\" : candidates[0];\n    }\n}\nexports.Computer = Computer;\n\n\n//# sourceURL=webpack://shichinarabe/./src/ts/player.ts?");

/***/ }),

/***/ "./src/ts/proceedingListener.ts":
/*!**************************************!*\
  !*** ./src/ts/proceedingListener.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.ConsolePrinter = void 0;\nconst card_1 = __webpack_require__(/*! ./card */ \"./src/ts/card.ts\");\nconst player_1 = __webpack_require__(/*! ./player */ \"./src/ts/player.ts\");\nclass GameProceedingListener {\n    constructor(board) {\n        this.board = board;\n    }\n}\nexports.default = GameProceedingListener;\nclass ConsolePrinter extends GameProceedingListener {\n    getBoard() {\n        return this.board;\n    }\n    onGameStarted() {\n        console.log(\"**** Game Start ****\");\n    }\n    onGameEnded() {\n        console.log(\"**** Game Set ****\");\n        this.printRanks();\n    }\n    onBoardChanged() {\n        this.printRows();\n        this.printPlayerHands();\n    }\n    ;\n    onTurnEnded() {\n        // do nothing.\n    }\n    printRows() {\n        let str = \"====[Board]====\";\n        for (const t of card_1.basicCardTypes) {\n            str += `\\n[${t.charAt(0)}]`;\n            for (const n of card_1.cardNumbers) {\n                const c = this.board.getRow(t).getCard(n);\n                str += \" \";\n                if (c instanceof card_1.BasicCard)\n                    str += \"B\";\n                else if (c instanceof card_1.Joker)\n                    str += \"J\";\n                else\n                    str += \"_\";\n            }\n        }\n        console.log(str);\n    }\n    printPlayerHands() {\n        let str = \"====[Player Hands]====\";\n        if (this.board.getSettings().humanClassConstructor !== undefined)\n            str += \"\\nHM: \" + this.board.getPlayer(0).toString();\n        console.log(this.board.getPlayers().filter(p => p instanceof player_1.Computer)\n            .reduce((acc, v, i) => `${acc}\\nC${i}: ${v.toString()}`, str));\n    }\n    printRanks() {\n        console.log(this.board.getRanks());\n        let ranking = new Map();\n        for (let i = 0; i < this.board.getPlayers().length; i++) {\n            const r = this.board.getRank(i);\n            if (!ranking.has(r))\n                ranking.set(r, [i]);\n            else\n                ranking.get(r).push(i);\n        }\n        let str = \"====[Ranking]====\";\n        for (let i = 0; i < this.board.getLastRank(); i++)\n            str += `\\n${i}: ${ranking.get(i)}`;\n        console.log(str);\n    }\n}\nexports.ConsolePrinter = ConsolePrinter;\n\n\n//# sourceURL=webpack://shichinarabe/./src/ts/proceedingListener.ts?");

/***/ }),

/***/ "./src/ts/row.ts":
/*!***********************!*\
  !*** ./src/ts/row.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst card_1 = __webpack_require__(/*! ./card */ \"./src/ts/card.ts\");\nclass Row {\n    constructor(type) {\n        this.getCard = (index) => this.elements[index];\n        this.isPlaced = (index) => this.getCard(index) !== null;\n        this.type = type;\n        this.elements = new Array(13).fill(null);\n    }\n    canPlace(index, card) {\n        if (card instanceof card_1.BasicCard && (card.type !== this.type || card.getNumber() != index))\n            return false;\n        if (this.isPlaced(index) && !(this.getCard(index) instanceof card_1.Joker))\n            return false;\n        let isPlacedWeakly = (n) => card_1.isCardNumber(n) && this.isPlaced(n);\n        if (!isPlacedWeakly(index - 1) && !isPlacedWeakly(index + 1))\n            return false;\n        return true;\n    }\n    placeCard(index, card, needValidation = true) {\n        if (card === undefined)\n            throw new Error(\"illegal $card\");\n        if (needValidation && !this.canPlace(index, card))\n            throw new Error(\"illegal status\");\n        const tmp = this.elements[index];\n        this.elements[index] = card;\n        return tmp;\n    }\n}\nexports.default = Row;\n\n\n//# sourceURL=webpack://shichinarabe/./src/ts/row.ts?");

/***/ }),

/***/ "./src/ts/settings.ts":
/*!****************************!*\
  !*** ./src/ts/settings.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst card_1 = __webpack_require__(/*! ./card */ \"./src/ts/card.ts\");\nclass Settings {\n    constructor(init) {\n        // ジョーカーの枚数\n        this.jorkers = 2;\n        // ジョーカーに通常カードを重ねたとき、ジョーカーをそのプレイヤーの手札に返すか\n        this.giveBackJoker = true;\n        // ゲームのはじめに場に設置されるカード\n        this.initialCards = [...card_1.basicCardTypes].map(t => ({ type: t, index: 6 }));\n        // ゲームに参加する人間\n        this.humanClassConstructor = undefined;\n        // ゲームに参加するコンピュータの数\n        this.computers = 3;\n        // コンピュータの最小思考時間 [ms]\n        this.minComputerThinkingTime = 100;\n        // 進行イベントを取るリスナー\n        this.gameProceedingListenerConstructor = undefined;\n        if (init)\n            Object.assign(this, init);\n    }\n}\nexports.default = Settings;\n\n\n//# sourceURL=webpack://shichinarabe/./src/ts/settings.ts?");

/***/ }),

/***/ "./src/ts/utility.ts":
/*!***************************!*\
  !*** ./src/ts/utility.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.awaitSleep = exports.awaitEvent = exports.listenEventOnceAsync = exports.newArray = exports.shuffleArray = void 0;\nconst shuffleArray = (array) => {\n    const result = [...array];\n    for (let i = result.length - 1; i > 0; i--) {\n        const j = Math.floor(Math.random() * (i + 1));\n        const tmp = result[i];\n        result[i] = result[j];\n        result[j] = tmp;\n    }\n    return result;\n};\nexports.shuffleArray = shuffleArray;\nconst newArray = (size, elementCreator) => {\n    return new Array(size).fill(null).map((v, i) => elementCreator(i));\n};\nexports.newArray = newArray;\nconst listenEventOnceAsync = async (target, type) => {\n    return new Promise(resolve => target.addEventListener(type, ev => {\n        resolve(ev);\n        return ev;\n    }, { once: true }));\n};\nexports.listenEventOnceAsync = listenEventOnceAsync;\nconst awaitEvent = async (target, type, filter) => {\n    while (true) {\n        if (await exports.listenEventOnceAsync(target, type).then(ev => filter(target, ev)))\n            break;\n    }\n};\nexports.awaitEvent = awaitEvent;\nconst awaitSleep = async (ms) => new Promise(resolve => setTimeout(() => resolve(), ms));\nexports.awaitSleep = awaitSleep;\n\n\n//# sourceURL=webpack://shichinarabe/./src/ts/utility.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	__webpack_require__("./src/ts/index.ts");
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;