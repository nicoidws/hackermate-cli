#!/usr/bin/env node

const { Chess } = require("chess.js");
const { spawn } = require("child_process");
const readline = require("readline");

const engine = spawn("stockfish");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const chess = new Chess();
let color = "w";

function send(cmd) {
  engine.stdin.write(cmd + "\n");
}

function bestMove(fen) {
  return new Promise((resolve) => {
    let linesBuffer = "";

    const moves = [];

    const onData = (data) => {
      linesBuffer += data.toString();
      const lines = linesBuffer.split("\n");

      for (const line of lines) {
        const match = line.match(/multipv (\d+) .* pv ([a-h1-8]+)/);

        if (match) {
          const pv = line.split(" pv ")[1]?.split(" ")[0];
          const id = match[1];

          if (pv) {
            moves.push({ rank: Number(id), move: pv });
          }
        }

        if (line.startsWith("bestmove")) {
          engine.stdout.off("data", onData);

          const sorted = moves
            .sort((a, b) => a.rank - b.rank)
            .slice(0, 3)
            .map((m) => m.move);

          resolve(sorted);
        }
      }
    };

    engine.stdout.on("data", onData);

    send(`position fen ${fen}`);
    send("go depth 12");
  });
}

function print() {
  console.clear();
  console.log(chess.ascii());
  console.log("Turno:", chess.turn());
}

function askColor(cb) {
  rl.question("Color (w/b): ", (c) => {
    color = c;
    cb();
  });
}

async function loop() {
  print();

  if (chess.turn() === color) {
    const move = await bestMove(chess.fen());
    console.log("💡 Sugerencia:", move);
  } else {
    const move = await bestMove(chess.fen());
    console.log("💡 Sugerencia:", move);
  }

  rl.question("move: ", (m) => {
    try {
      chess.move(m);
    } catch {
      console.log("❌ inválido");
    }
    loop();
  });
}

askColor(loop);
