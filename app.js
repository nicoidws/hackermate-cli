import { Chess } from "chess.js";
import * as readline from "readline";
import chalk from "chalk";
const stockfish = require("stockfish");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const chess = new Chess();
const engine = stockfish();

let playerColor: "w" | "b";

// estado del engine
let currentEval: string = "";

engine.postMessage("uci");

// escuchar output del motor
engine.onmessage = (event: any) => {
  const line = event.data || event;

  if (line.includes("score cp")) {
    const match = line.match(/score cp (-?\d+)/);
    if (match) {
      const evalCp = parseInt(match[1], 10) / 100;
      currentEval = `${evalCp > 0 ? "+" : ""}${evalCp.toFixed(2)}`;
    }
  }

  if (line.includes("score mate")) {
    const mate = line.match(/score mate (-?\d+)/);
    if (mate) {
      currentEval = `#${mate[1]}`;
    }
  }
};

function getBestMove(fen: string): Promise<string> {
  return new Promise((resolve) => {
    const handler = (event: any) => {
      const line = event.data || event;

      if (line.startsWith("bestmove")) {
        engine.onmessage = globalHandler;
        resolve(line.split(" ")[1]);
      }
    };

    const globalHandler = engine.onmessage;
    engine.onmessage = handler;

    engine.postMessage(`position fen ${fen}`);
    engine.postMessage("go depth 12");
  });
}

function printBoard() {
  console.clear();
  console.log(chalk.green("=== HACKERMATE CLI ==="));
  console.log(chalk.gray("Eval:"), chalk.yellow(currentEval || "..."));
  console.log(chess.ascii());
}

function askColor(): Promise<void> {
  return new Promise((resolve) => {
    rl.question(chalk.cyan("Elige color (w/b): "), (answer) => {
      if (answer !== "w" && answer !== "b") {
        console.log(chalk.red("Opción inválida"));
        return askColor().then(resolve);
      }
      playerColor = answer;
      resolve();
    });
  });
}

async function engineMove() {
  console.log(chalk.gray(">> thinking..."));

  const move = await getBestMove(chess.fen());

  chess.move(move, { sloppy: true });

  console.log(chalk.magenta("🤖 Motor:"), move);
}

async function gameLoop() {
  printBoard();

  // turno del motor
  if (chess.turn() !== playerColor) {
    await engineMove();
    printBoard();
  }

  rl.question(chalk.cyan(">> move: "), async (input) => {
    if (input === "exit") {
      rl.close();
      process.exit(0);
    }

    if (input === "undo") {
      chess.undo();
      chess.undo();
      return gameLoop();
    }

    const move = chess.move(input);

    if (!move) {
      console.log(chalk.red("Movimiento inválido"));
      return gameLoop();
    }

    await engineMove();
    gameLoop();
  });
}

async function main() {
  console.log(chalk.green("Initializing engine..."));
  await askColor();
  await gameLoop();
}

main();
