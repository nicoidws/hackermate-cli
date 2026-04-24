#!/usr/bin/env node

import { Chess } from "chess.js";
import readline from "readline";
import { spawn } from "child_process";

const engine = spawn("stockfish");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const chess = new Chess();
let playerColor: "w" | "b" = "w";

function send(cmd: string) {
  engine.stdin.write(cmd + "\n");
}

function getBestMove(fen: string): Promise<string> {
  return new Promise((resolve) => {
    const handler = (data: any) => {
      const lines = data.toString().split("\n");

      for (let line of lines) {
        if (line.startsWith("bestmove")) {
          engine.stdout.off("data", handler);
          resolve(line.split(" ")[1]);
        }
      }
    };

    engine.stdout.on("data", handler);

    send(`position fen ${fen}`);
    send("go depth 10");
  });
}

function printBoard() {
  console.clear();
  console.log("=== HACKERMATE CLI ===");
  console.log(chess.ascii());
  console.log("Turno:", chess.turn() === "w" ? "Blancas" : "Negras");
}

function askColor(): Promise<void> {
  return new Promise((resolve) => {
    rl.question("Elige color (w/b): ", (answer) => {
      if (answer !== "w" && answer !== "b") {
        console.log("❌ Opción inválida");
        return askColor().then(resolve);
      }
      playerColor = answer;
      resolve();
    });
  });
}

async function gameLoop(): Promise<void> {
  printBoard();

  if (chess.turn() !== playerColor) {
    console.log("🤖 Pensando...");
    const bestMove = await getBestMove(chess.fen());
    chess.move(bestMove);
    console.log("🤖 Motor juega:", bestMove);
    printBoard();
  }

  rl.question("Tu movimiento: ", async (input) => {
    if (input === "exit") {
      rl.close();
      engine.kill();
      process.exit(0);
    }

    if (input === "undo") {
      chess.undo();
      chess.undo();
      return gameLoop();
    }

    try {
      chess.move(input);
    } catch (err) {
      console.log("❌ Movimiento inválido");
      return gameLoop();
    }

    gameLoop();
  });
}

async function main() {
  console.log("🔥 Hackermate CLI");
  send("uci");
  await askColor();
  gameLoop();
}

main();
