#!/usr/bin/env node

const { Chess } = require("chess.js");
const readline = require("readline");
const { spawn } = require("child_process");

// -------------------- ENGINE --------------------
const engine = spawn("stockfish");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const chess = new Chess();

let mode = "bot"; // bot | analyze
let difficulty = 10;
let analyzeColor = "w";

// -------------------- SEND TO ENGINE -----------------

function send(cmd) {
  engine.stdin.write(cmd + "\n");
}

// -------------------- INIT ENGINE --------------------

function initEngine() {
  send("uci");

  engine.stdout.on("data", (data) => {
    const msg = data.toString();

    if (msg.includes("uciok")) {
      send("isready");
    }

    if (msg.includes("readyok")) {
      send("setoption name MultiPV value 3");
    }
  });
}


async function showPlayerSuggestions() {
  const moves = await getTopMoves(chess.fen());

  if (!moves.length) return;

  console.log("\n💡 Tus sugerencias:\n");

  moves.forEach((m, i) => {
    console.log(`${i + 1}) ${m.move}`);
  });

  console.log("4) Jugar manual\n");

  const choice = await new Promise((resolve) => {
    rl.question("Elige (o ENTER para manual): ", resolve);
  });

  if (choice === "1") chess.move(moves[0].move, { sloppy: true });
  else if (choice === "2") chess.move(moves[1].move, { sloppy: true });
  else if (choice === "3") chess.move(moves[2].move, { sloppy: true });
}

// -------------------- GET TOP 3 MOVES --------------------

function getTopMoves(fen) {
  return new Promise((resolve) => {
    let buffer = "";
    const linesOut = [];
    const moves = [];

    const onData = (data) => {
      buffer += data.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {

        // 👇 Stockfish real multipv line
        const match = line.match(
          /multipv (\d+).* pv (.+)/i
        );

        if (match) {
          const rank = Number(match[1]);
          const pv = match[2].split(" ")[0];

          moves.push({ rank, move: pv });
        }

        if (line.startsWith("bestmove")) {
          engine.stdout.off("data", onData);

          const result = moves
            .sort((a, b) => a.rank - b.rank)
            .slice(0, 3);

          resolve(result);
        }
      }
    };

    engine.stdout.on("data", onData);

    // MUY IMPORTANTE
    send("stop");
    send(`position fen ${fen}`);
    send("go depth 12");
  });
}

// -------------------- UI --------------------
function printBoard() {
  console.clear();
  console.log("=== HACKERMATE CLI ===\n");

  const board = chess.board();

  const from = lastMove?.from;
  const to = lastMove?.to;

  for (let i = 0; i < 8; i++) {
    let row = `${8 - i} | `;

    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];

      const square =
        String.fromCharCode(97 + j) + (8 - i);

      let symbol = ".";

      if (piece) {
        symbol =
          piece.color === "w"
            ? piece.type.toUpperCase()
            : piece.type;
      }

      // HIGHLIGHT
      //\x1b[42m  verde
      //\x1b[41m  rojo
      //\x1b[44m  azul
      if (square === from || square === to) {
        symbol = `\x1b[42m${symbol}\x1b[0m`; // fondo verde
      }

      row += symbol + "  ";
    }

    console.log(row);
  }

  console.log("   a  b  c  d  e  f  g  h");
  console.log("\nTurno:", chess.turn());
}

// -------------------- SELECT MOVE --------------------
function askMoveChoice(moves) {
  return new Promise((resolve) => {
    console.log("\n💡 Sugerencias:\n");

    moves.forEach((m, i) => {
      console.log(`${i + 1}) ${m.move}`);
    });

    console.log("4) Manual\n");

    rl.question("Elige opción: ", (opt) => {
      if (opt === "1") return resolve(moves[0].move);
      if (opt === "2") return resolve(moves[1].move);
      if (opt === "3") return resolve(moves[2].move);
      resolve(null);
    });
  });
}

// -------------------- SETTINGS --------------------
function askSettings() {
  return new Promise((resolve) => {
    console.clear();
    console.log("=== HACKERMATE CLI ===\n");
    console.log("1) Jugar vs bot");
    console.log("2) Modo análisis\n");

    rl.question("Modo: ", (m) => {
      mode = m === "2" ? "analyze" : "bot";

      if (mode === "bot") {
        console.log("\nDificultad:");
        console.log("1) Fácil (5)");
        console.log("2) Medio (10)");
        console.log("3) Difícil (15)\n");

        rl.question("Nivel: ", (d) => {
          difficulty = d === "1" ? 5 : d === "3" ? 15 : 10;
          resolve();
        });
      } else {
        rl.question("\nColor a analizar (w/b): ", (c) => {
          analyzeColor = c || "w";
          resolve();
        });
      }
    });
  });
}

// -------------------- GAME LOOP --------------------
async function loop() {

const { Chess } = require("chess.js");
const readline = require("readline");
const { spawn } = require("child_process");

// -------------------- ENGINE --------------------
const engine = spawn("stockfish");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const chess = new Chess();

let mode = "bot"; // bot | analyze
let difficulty = 10;
let analyzeColor = "w";

// -------------------- SEND TO ENGINE --------------------
function send(cmd) {
  engine.stdin.write(cmd + "\n");
}

// -------------------- INIT ENGINE --------------------
function initEngine() {
  send("uci");

  engine.stdout.on("data", (data) => {
    const msg = data.toString();

    if (msg.includes("uciok")) {
      send("isready");
    }

    if (msg.includes("readyok")) {
      send("setoption name MultiPV value 3");
    }
  });
}


async function showPlayerSuggestions() {
  const moves = await getTopMoves(chess.fen());

  if (!moves.length) return;

  console.log("\n💡 Tus sugerencias:\n");

  moves.forEach((m, i) => {
    console.log(`${i + 1}) ${m.move}`);
  });

  console.log("4) Jugar manual\n");

  const choice = await new Promise((resolve) => {
    rl.question("Elige (o ENTER para manual): ", resolve);
  });

  if (choice === "1") chess.move(moves[0].move, { sloppy: true });
  else if (choice === "2") chess.move(moves[1].move, { sloppy: true });
  else if (choice === "3") chess.move(moves[2].move, { sloppy: true });
}
// -------------------- GET TOP 3 MOVES --------------------
function getTopMoves(fen) {
  return new Promise((resolve) => {
    let buffer = "";
    const linesOut = [];
    const moves = [];

    const onData = (data) => {
      buffer += data.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {

        // 👇 Stockfish real multipv line
        const match = line.match(
          /multipv (\d+).* pv (.+)/i
        );

        if (match) {
          const rank = Number(match[1]);
          const pv = match[2].split(" ")[0];

          moves.push({ rank, move: pv });
        }

        if (line.startsWith("bestmove")) {
          engine.stdout.off("data", onData);

          const result = moves
            .sort((a, b) => a.rank - b.rank)
            .slice(0, 3);

          resolve(result);
        }
      }
    };

    engine.stdout.on("data", onData);

    // 🔥 MUY IMPORTANTE
    send("stop");
    send(`position fen ${fen}`);
    send("go depth 12");
  });
}

// -------------------- UI --------------------
function printBoard() {
  console.clear();
  console.log("=== HACKERMATE CLI ===\n");
  console.log(chess.ascii());
  console.log("\nTurno:", chess.turn());
}

// -------------------- SELECT MOVE --------------------
function askMoveChoice(moves) {
  return new Promise((resolve) => {
    console.log("\n💡 Sugerencias:\n");

    moves.forEach((m, i) => {
      console.log(`${i + 1}) ${m.move}`);
    });

    console.log("4) Manual\n");

    rl.question("Elige opción: ", (opt) => {
      if (opt === "1") return resolve(moves[0].move);
      if (opt === "2") return resolve(moves[1].move);
      if (opt === "3") return resolve(moves[2].move);
      resolve(null);
    });
  });
}

// -------------------- SETTINGS --------------------
function askSettings() {
  return new Promise((resolve) => {
    console.clear();
    console.log("=== HACKERMATE CLI ===\n");
    console.log("1) Jugar vs bot");
    console.log("2) Modo análisis\n");

    rl.question("Modo: ", (m) => {
      mode = m === "2" ? "analyze" : "bot";

      if (mode === "bot") {
        console.log("\nDificultad:");
        console.log("1) Fácil (5)");
        console.log("2) Medio (10)");
        console.log("3) Difícil (15)\n");

        rl.question("Nivel: ", (d) => {
          difficulty = d === "1" ? 5 : d === "3" ? 15 : 10;
          resolve();
        });
      } else {
        rl.question("\nColor a analizar (w/b): ", (c) => {
          analyzeColor = c || "w";
          resolve();
        });
      }
    });
  });
}

// -------------------- GAME LOOP --------------------

async function loop() {
  printBoard();

  //  TURNO DEL JUGADOR
  if (mode === "analyze" || chess.turn() === analyzeColor) {
    await showPlayerSuggestions();

    rl.question("\nTu movimiento: ", async (input) => {
      if (input === "exit") {
        rl.close();
        engine.kill();
        process.exit(0);
      }

      try {
        chess.move(input, { sloppy: true });
      } catch {
        console.log("❌ Movimiento inválido");
        return loop();
      }

      return loop(); //  refresca tablero
    });

    return; // corte
  }

  // 🤖 TURNO DEL BOT
  if (mode === "bot" && chess.turn() !== analyzeColor) {
    const moves = await getTopMoves(chess.fen());

    if (!moves.length) {
      console.log("❌ Engine no respondió");
      return loop();
    }

    console.log("\n🤖 Sugerencias del bot:\n");

    moves.forEach((m, i) => {
      console.log(`${i + 1}) ${m.move}`);
    });

    console.log("4) Automático\n");

    const choice = await new Promise((resolve) => {
      rl.question("Elige jugada del bot: ", resolve);
    });

    let selectedMove;

    if (choice === "1") selectedMove = moves[0]?.move;
    else if (choice === "2") selectedMove = moves[1]?.move;
    else if (choice === "3") selectedMove = moves[2]?.move;
    else selectedMove = moves[0]?.move;

    if (selectedMove) {
      chess.move(selectedMove, { sloppy: true });
      console.log("\n🤖 Bot juega:", selectedMove);
    }

    return loop(); // refresca tablero
  }
}

// -------------------- START --------------------
async function main() {
  console.log("hackermate-cli by an0mia v1.0.0\n");

  initEngine();
  await askSettings();
  loop();
}

main();
  
  printBoard();

  // 🔥 SUGERENCIAS PARA TI
  await showPlayerSuggestions();
  // ANALYSIS MODE
  if (mode === "bot" && chess.turn() !== analyzeColor) {
  const moves = await getTopMoves(chess.fen());

  console.log("\n🤖 Sugerencias del bot:\n");

  moves.forEach((m, i) => {
    console.log(`${i + 1}) ${m.move}`);
  });

  console.log("4) Jugar automático (mejor jugada)\n");

  const choice = await new Promise((resolve) => {
    rl.question("Elige jugada del bot: ", resolve);
  });

  let selectedMove;

  if (choice === "1") selectedMove = moves[0]?.move;
  else if (choice === "2") selectedMove = moves[1]?.move;
  else if (choice === "3") selectedMove = moves[2]?.move;
  else selectedMove = moves[0]?.move; // automático

  if (selectedMove) {
    chess.move(selectedMove, { sloppy: true });
    console.log("\n🤖 Bot juega:", selectedMove);
  }
}

  rl.question("\nMovimiento: ", async (input) => {
    if (input === "exit") {
      rl.close();
      engine.kill();
      process.exit(0);
    }

    try {
      chess.move(input, { sloppy: true });
    } catch {
      console.log("❌ Movimiento inválido");
      return loop();
    }

    // BOT MOVE
    if (mode === "bot" && chess.turn() !== analyzeColor) {
      const moves = await getTopMoves(chess.fen());

      if (!moves.length) {
        console.log("❌ No hay sugerencias (engine no respondió)");
        return loop();
      }

      console.log("\n🤖 Sugerencias:\n");

      moves.forEach((m, i) => {
        console.log(`${i + 1}) ${m.move}`);
      });
    }
    loop();
  });
}

// -------------------- START --------------------
async function main() {
  console.log("hackermate-cli by an0mia v1.0.0\n");

  initEngine();
  await askSettings();
  loop();
}

main();