import Board from "./board";
import * as config from "./config";

const board = new Board(config.humans, config.computers);
console.log(board);

board.start();
