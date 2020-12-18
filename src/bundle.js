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

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst card_1 = __webpack_require__(/*! ./card */ \"./src/ts/card.ts\");\nconst row_1 = __webpack_require__(/*! ./row */ \"./src/ts/row.ts\");\nconst player_1 = __webpack_require__(/*! ./player */ \"./src/ts/player.ts\");\nconst config = __webpack_require__(/*! ./config */ \"./src/ts/config.ts\");\nconst utility = __webpack_require__(/*! ./utility */ \"./src/ts/utility.ts\");\nclass Board {\n    constructor(humans, computers) {\n        this.stocks = utility.shuffleArray([...card_1.cards].filter(c => !config.initialCards.some(d => card_1.BasicCard.get(d.type, d.index) === c)));\n        this.rows = new Map(card_1.basicCardTypes.map((t) => [t, new row_1.default(t)]));\n        this.players = [...utility.newArray(humans, _ => new player_1.Human(this)), ...utility.newArray(computers, _ => new player_1.Computer(this))];\n        this.turn = 0;\n        this.ranks = new Array(this.players.length).fill(undefined);\n        this.lastRank = 0;\n        for (let i = 0; i < this.stocks.length; i++)\n            this.getPlayer(i % this.players.length).addCardIntoHands(this.stocks[i]);\n        for (const e of config.initialCards)\n            this.placeCard(e.type, e.index, card_1.BasicCard.get(e.type, e.index), false);\n    }\n    async start() {\n        console.log(\"**** Game Start ****\");\n        while (true) {\n            // ステップ実行\n            // await utility.awaitEvent(document, \"click\", () => true);\n            const player = this.getCurrentTurnPlayer();\n            const action = await player.getNextAction();\n            if (player instanceof player_1.Computer)\n                await utility.awaitSleep(config.minComputerThinkingTime);\n            if (action !== \"PASS\" && this.canPlace(action.type, action.index, action.card)) {\n                const prev = this.placeCard(action.type, action.index, action.card);\n                if (prev !== null && config.giveBackJoker)\n                    player.addCardIntoHands(prev);\n                player.removeCardFromHands(action.card);\n            }\n            this.printRows();\n            this.players.forEach(p => p.printHands());\n            if (player.isHandEmpty())\n                this.setRank(this.turn, this.lastRank++);\n            if (!this.players.some((p, i) => !this.hasWon(i) && p.hasBasicCard())) {\n                for (let i = 0; i < this.players.length; i++) {\n                    if (!this.hasWon(i))\n                        this.setRank(i, this.lastRank);\n                }\n                this.lastRank++;\n                break;\n            }\n            if (this.proceedNextTurn() === undefined) {\n                this.setRank(this.turn, this.lastRank++);\n                break;\n            }\n        }\n        this.end();\n    }\n    end() {\n        console.log(\"**** Game Set ****\");\n        this.printRanks();\n    }\n    getRow(type) {\n        return this.rows.get(type);\n    }\n    canPlace(type, index, card) {\n        return this.getRow(type).canPlace(index, card);\n    }\n    placeCard(type, index, card, needValidation = true) {\n        return this.getRow(type).placeCard(index, card, needValidation);\n    }\n    getPlayer(index) {\n        return this.players[index];\n    }\n    getCurrentTurnPlayer() {\n        return this.getPlayer(this.turn);\n    }\n    proceedNextTurn() {\n        for (let i = 1; i < this.players.length; i++) {\n            const j = (this.turn + i) % this.players.length;\n            if (this.ranks[j] === undefined) {\n                this.turn = j;\n                return j;\n            }\n        }\n        return undefined;\n    }\n    hasWon(player) {\n        return this.ranks[player] !== undefined;\n    }\n    setRank(player, rank) {\n        this.ranks[player] = rank;\n        console.log(`**** Won ${player} in #${rank} ****`);\n    }\n    printRows() {\n        let str = \"===[Board]===\";\n        for (const t of card_1.basicCardTypes) {\n            str += \"\\n[\" + t.charAt(0) + \"]\";\n            for (const n of card_1.cardNumbers) {\n                const c = this.getRow(t).getCard(n);\n                str += \" \";\n                if (c instanceof card_1.BasicCard)\n                    str += \"B\";\n                else if (c instanceof card_1.Joker)\n                    str += \"J\";\n                else\n                    str += \"_\";\n            }\n        }\n        console.log(str);\n    }\n    printRanks() {\n        console.log(this.ranks);\n        let ranking = new Map();\n        for (let i = 0; i < this.players.length; i++) {\n            const r = this.ranks[i];\n            if (!ranking.has(r))\n                ranking.set(r, [i]);\n            else\n                ranking.get(r).push(i);\n        }\n        let str = \"====[Ranking]====\";\n        for (let i = 0; i < this.lastRank; i++) {\n            str += \"\\n\" + i + \": \" + ranking.get(i);\n        }\n        console.log(str);\n    }\n}\nexports.default = Board;\n\n\n//# sourceURL=webpack://shichinarabe/./src/ts/board.ts?");

/***/ }),

/***/ "./src/ts/card.ts":
/*!************************!*\
  !*** ./src/ts/card.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.cards = exports.BasicCard = exports.Joker = exports.Card = exports.isCardNumber = exports.cardNumbers = exports.basicCardTypes = void 0;\nexports.basicCardTypes = [\"DIAMOND\", \"HEART\", \"SPADE\", \"CLUB\"];\nexports.cardNumbers = [...Array(13).keys()];\nconst isCardNumber = (n) => 0 <= n && n < 13;\nexports.isCardNumber = isCardNumber;\nclass Card {\n    constructor(displayName, shortName) {\n        this.displayName = displayName;\n        this.shortName = shortName;\n    }\n    getDisplayName() {\n        return this.displayName;\n    }\n    getShortName() {\n        return this.shortName;\n    }\n}\nexports.Card = Card;\nclass Joker extends Card {\n    constructor() {\n        super(\"JOKER\", \"J\");\n    }\n}\nexports.Joker = Joker;\nclass BasicCard extends Card {\n    constructor(type, number) {\n        super(type + \"$\" + number, type.charAt(0) + number);\n        this.type = type;\n        this.number = number;\n    }\n    getType() {\n        return this.type;\n    }\n    getNumber() {\n        return this.number;\n    }\n    static newAll() {\n        return new Map(exports.basicCardTypes.map(t => [t, exports.cardNumbers.map((i) => new BasicCard(t, i))]));\n    }\n    static get(type, number) {\n        return basicCards.get(type)[number];\n    }\n}\nexports.BasicCard = BasicCard;\nconst utility = __webpack_require__(/*! ./utility */ \"./src/ts/utility.ts\");\nconst config = __webpack_require__(/*! ./config */ \"./src/ts/config.ts\");\nconst joker = utility.newArray(config.jorkers, _ => new Joker());\nconst basicCards = BasicCard.newAll();\nexports.cards = [...joker, ...Array.from(basicCards.values()).flat()];\n\n\n//# sourceURL=webpack://shichinarabe/./src/ts/card.ts?");

/***/ }),

/***/ "./src/ts/config.ts":
/*!**************************!*\
  !*** ./src/ts/config.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.minComputerThinkingTime = exports.computers = exports.humans = exports.initialCards = exports.giveBackJoker = exports.jorkers = void 0;\nconst card_1 = __webpack_require__(/*! ./card */ \"./src/ts/card.ts\");\n// ジョーカーの枚数\nexports.jorkers = 2;\n// ジョーカーに通常カードを重ねたとき、ジョーカーをそのプレイヤーの手札に返すか\nexports.giveBackJoker = true;\n// ゲームのはじめに場に設置されるカード\nexports.initialCards = [...card_1.basicCardTypes].map(t => ({ type: t, index: 6 }));\n// ゲームに参加する人間の数\nexports.humans = 0;\n// ゲームに参加するコンピュータの数\nexports.computers = 3;\n// コンピュータの最小思考時間 [ms]\nexports.minComputerThinkingTime = 100;\n\n\n//# sourceURL=webpack://shichinarabe/./src/ts/config.ts?");

/***/ }),

/***/ "./src/ts/index.ts":
/*!*************************!*\
  !*** ./src/ts/index.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst board_1 = __webpack_require__(/*! ./board */ \"./src/ts/board.ts\");\nconst config = __webpack_require__(/*! ./config */ \"./src/ts/config.ts\");\nconst board = new board_1.default(config.humans, config.computers);\nconsole.log(board);\nboard.start();\n\n\n//# sourceURL=webpack://shichinarabe/./src/ts/index.ts?");

/***/ }),

/***/ "./src/ts/player.ts":
/*!**************************!*\
  !*** ./src/ts/player.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Human = exports.Computer = exports.Player = void 0;\nconst card_1 = __webpack_require__(/*! ./card */ \"./src/ts/card.ts\");\nconst utility = __webpack_require__(/*! ./utility */ \"./src/ts/utility.ts\");\nclass Player {\n    constructor(board) {\n        this.board = board;\n        this.hands = [];\n    }\n    getCandidatePoints() {\n        const result = [];\n        for (const t of card_1.basicCardTypes)\n            for (const n of card_1.cardNumbers) {\n                for (const h of this.hands) {\n                    if (this.board.canPlace(t, n, h))\n                        result.push({ type: t, index: n, card: h });\n                }\n            }\n        return result;\n    }\n    isHandEmpty() {\n        return this.hands.length === 0;\n    }\n    hasBasicCard() {\n        return this.hands.some(c => c instanceof card_1.BasicCard);\n    }\n    addCardIntoHands(card) {\n        this.hands.push(card);\n    }\n    removeCardFromHands(card) {\n        this.hands = this.hands.filter(c => c != card);\n    }\n    printHands() {\n        console.log(this.hands.reduce((acc, v) => acc + \" \" + v.getShortName(), \"====[Hands]====\\n(\" + this.hands.length + \")\"));\n    }\n}\nexports.Player = Player;\nclass Computer extends Player {\n    constructor(board) {\n        super(board);\n    }\n    async getNextAction() {\n        if (this.isHandEmpty())\n            throw new Error(\"$hand is empty\");\n        const candidates = utility.shuffleArray(this.getCandidatePoints());\n        return candidates.length == 0 ? \"PASS\" : candidates[0];\n    }\n}\nexports.Computer = Computer;\nclass Human extends Player {\n    constructor(board) {\n        super(board);\n    }\n    async getNextAction() {\n        if (this.isHandEmpty())\n            throw new Error(\"$hand is empty\");\n        return utility.shuffleArray(this.getCandidatePoints())[0];\n    }\n}\nexports.Human = Human;\n\n\n//# sourceURL=webpack://shichinarabe/./src/ts/player.ts?");

/***/ }),

/***/ "./src/ts/row.ts":
/*!***********************!*\
  !*** ./src/ts/row.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst card_1 = __webpack_require__(/*! ./card */ \"./src/ts/card.ts\");\nclass Row {\n    constructor(type) {\n        this.type = type;\n        this.elements = new Array(13).fill(null);\n    }\n    canPlace(index, card) {\n        if (card instanceof card_1.BasicCard && (card.type !== this.type || card.getNumber() != index))\n            return false;\n        if (this.isPlaced(index) && !(this.getCard(index) instanceof card_1.Joker))\n            return false;\n        let isPlacedWeakly = (n) => card_1.isCardNumber(n) && this.isPlaced(n);\n        if (!isPlacedWeakly(index - 1) && !isPlacedWeakly(index + 1))\n            return false;\n        return true;\n    }\n    placeCard(index, card, needValidation = true) {\n        if (needValidation && !this.canPlace(index, card))\n            return null;\n        const tmp = this.elements[index];\n        this.elements[index] = card;\n        return tmp;\n    }\n    getCard(index) {\n        return this.elements[index];\n    }\n    isPlaced(index) {\n        return this.getCard(index) != null;\n    }\n}\nexports.default = Row;\n\n\n//# sourceURL=webpack://shichinarabe/./src/ts/row.ts?");

/***/ }),

/***/ "./src/ts/utility.ts":
/*!***************************!*\
  !*** ./src/ts/utility.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.awaitSleep = exports.awaitEvent = exports.listenEventAsync = exports.newArray = exports.shuffleArray = void 0;\nconst shuffleArray = (array) => {\n    const result = [...array];\n    for (let i = result.length - 1; i > 0; i--) {\n        const j = Math.floor(Math.random() * (i + 1));\n        const tmp = result[i];\n        result[i] = result[j];\n        result[j] = tmp;\n    }\n    return result;\n};\nexports.shuffleArray = shuffleArray;\nconst newArray = (size, elementCreator) => {\n    return new Array(size).fill(null).map((v, i) => elementCreator(i));\n};\nexports.newArray = newArray;\nconst listenEventAsync = async (target, type, listener) => {\n    return new Promise(resolve => target.addEventListener(type, ev => {\n        listener(target, ev);\n        resolve(ev);\n    }, { once: true }));\n};\nexports.listenEventAsync = listenEventAsync;\nconst awaitEvent = async (target, type, filter) => {\n    while (true) {\n        if (await exports.listenEventAsync(target, type, (_, ev) => filter(target, ev)))\n            break;\n    }\n};\nexports.awaitEvent = awaitEvent;\nconst awaitSleep = async (ms) => new Promise(resolve => setTimeout(() => resolve(), ms));\nexports.awaitSleep = awaitSleep;\n\n\n//# sourceURL=webpack://shichinarabe/./src/ts/utility.ts?");

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