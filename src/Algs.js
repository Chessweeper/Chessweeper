import { Random } from "./Random";

export function getMoves(piece, cells, size, x, y) {
  const data = cells.map((cell) => {
    if (typeof cell.known === "string") {
      return cell.known;
    } else if (typeof cell.value === "string") {
      // strip hidden pieces from data, so they do not block calculations
      return 0;
    }

    return cell.value;
  });

  const moves = parseNotation(pieceMovesCheck[piece], data, size, x, y);
  return moves;
}

function isValid(data, size, x, y) {
  return (
    x >= 0 &&
    x < size &&
    y >= 0 &&
    y < size &&
    Number.isInteger(data[y * size + x])
  );
}

function parseMove(dx, dy, length, constraints, data, size, x, y) {
  const moves = [];
  const orientation = [];
  const directions = [
    [-dx, -dy], // Forward
    [dx, dy], // Backward
    [-dy, dx], // Right
    [dy, -dx], // Left
  ];
  for (const d of [-1, 1]) {
    // For pieces like knights, we need to reverse the X for each direction
    for (const rd in directions) {
      if ((constraints & (2 ** rd)) === 0) {
        continue;
      }
      const nrd = [directions[rd][0], directions[rd][1] * d];
      if (orientation.every((x) => x[0] !== nrd[0] || x[1] !== nrd[1]))
        orientation.push(nrd);
    }
  }
  for (const [yi, xi] of orientation) {
    for (let i = 1; i <= length; i++) {
      if (isValid(data, size, x + i * xi, y + i * yi))
        moves.push((y + i * yi) * size + (x + i * xi));
      else break;
    }
  }
  return moves;
}

function parseDirection(letter) {
  switch (letter) {
    case "W":
      return [1, 0];
    case "F":
      return [1, 1];
    case "D":
      return [2, 0];
    case "N":
      return [2, 1];
    case "A":
      return [2, 2];
    case "H":
      return [3, 0];
    case "C":
      return [3, 1];
    case "Z":
      return [3, 2];
    case "G":
      return [3, 3];
  }
}

export function parseNotation(notation, data, size, x, y) {
  let str = "";
  for (let i = 0; i < notation.length; i++) {
    const s = notation[i];
    if (s === "m") {
      // For "move" only, we discard them
      i++;
    } else if (s === "c") {
      // For "capture" only, the ones we want to keep for the game
    } else {
      str += s;
    }
  }
  notation = str;

  let d = []; // Direction we are going
  let dir = null; // Letter indicating that direction
  let length = 1; // Length we are doing
  let moves = [];
  let constraints = 15;
  for (const s of notation) {
    if (s === s.toLowerCase()) {
      if (dir !== null) {
        moves = moves.concat(
          parseMove(d[0], d[1], length, constraints, data, size, x, y)
        );
        dir = null;
        length = 1;
        constraints = 15;
      }
      switch (s) {
        case "f":
          constraints = 1;
          break;
        case "b":
          constraints = 2;
          break;
        case "l":
          constraints = 8;
          break;
        case "r":
          constraints = 4;
          break;
        case "v":
          constraints = 3;
          break;
        case "s":
          constraints = 12;
          break;
      }
    } else if (dir === null) {
      d = parseDirection(s);
      dir = s;
    } else if (!isNaN(s)) {
      length = parseInt(s);
    } else if (s === dir) {
      moves = moves.concat(
        parseMove(d[0], d[1], Infinity, constraints, data, size, x, y)
      );
      dir = null;
      length = 1;
      constraints = 15;
    } else {
      moves = moves.concat(
        parseMove(d[0], d[1], length, constraints, data, size, x, y)
      );
      d = parseDirection(s);
      dir = s;
      length = 1;
      constraints = 15;
    }
  }
  if (dir !== null) {
    moves = moves.concat(
      parseMove(d[0], d[1], length, constraints, data, size, x, y)
    );
  }
  return moves;
}

// https://en.wikipedia.org/wiki/Betza%27s_funny_notation
const pieceMovesCheck = {
  R: "WW",
  B: "FF",
  Q: "WWFF",
  N: "N",
  K: "WF",
  P: "fmWfcF",
  D: "bmWbcF",
  O: "WWN",
  飛: "WW",
  角: "FF",
  桂: "ffN",
  歩: "fW",
  玉: "WF",
  香: "fWW",
  銀: "FfW",
  金: "WfF",
};

export function fillPositions(data) {
  const size = Math.sqrt(data.length); // Boards are always squared

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const value = data[y * size + x];
      if (!Number.isInteger(value)) {
        const moves = parseNotation(pieceMovesCheck[value], data, size, x, y);
        for (const move of moves) {
          data[move]++;
        }
      }
    }
  }

  return data;
}

export function generateBoard(random, id, pieces, size, count) {
  const piecesMdf = {};
  for (const key in pieces) {
    piecesMdf[key] = pieces[key];
  }

  const data = Array(size * size).fill(0);
  let i = count;
  while (i > 0) {
    const rand = Math.floor(random.next() * (size * size));
    if (rand !== id && Number.isInteger(data[rand])) {
      const value = Math.floor(random.next() * Object.keys(piecesMdf).length);
      const piece = Object.keys(piecesMdf)[value];

      if (piecesMdf[piece] === 0) {
        // We reached the amount of time we could spawn that piece
        continue;
      }

      if (
        (piece === "P" || piece === "桂" || piece === "歩" || piece === "香") &&
        rand < size
      ) {
        // Pawns shouldn't be able to spawn on the top line
        continue;
      }
      if (piece === "D" && rand >= size * (size - 1)) {
        // Pawns shouldn't be able to spawn on the top line
        continue;
      }

      data[rand] = piece;
      piecesMdf[piece]--;
      i--;
    }
  }
  return data;
}

function validateBoard(data, discovered, pieces, size) {
  const thinkData = Array(size * size).fill(0);

  // For each tile...
  for (let i = 0; i < data.length; i++) {
    if (discovered[i] || thinkData[i] !== 0) {
      // We only want the ones we don't know about and the one we didn't validate yet
      continue;
    }

    let str = "";
    for (const piece of Object.keys(pieces)) {
      // Check all pieces
      // List of all moves for the current piece
      const moves = parseNotation(
        pieceMovesCheck[piece],
        thinkData,
        size,
        i % size,
        Math.floor(i / size)
      );

      // If the piece have a move that is impossible, it means it can't be this one
      let isValid = true;
      for (const move of moves) {
        if (discovered[move] && data[move] === 0) {
          isValid = false;
          break;
        }
      }
      if (isValid) {
        str += piece;
      }
    }
    if (str !== "") {
      // We added a piece, need to revalidate the whole board
      thinkData[i] = str;
      i = -1;
    }
  }

  // Check if we are sure that only one position is possible
  let isSolved = true;
  for (let i = 0; i < data.length; i++) {
    if (
      !discovered[i] &&
      ((Number.isInteger(data[i]) && thinkData[i] !== 0) ||
        (!Number.isInteger(data[i]) && thinkData[i] !== data[i]))
    ) {
      isSolved = false;
      break;
    }
  }

  return {
    isSolved: isSolved,
    thinkData: thinkData,
  };
}

export function generatePuzzleBoard(seed, pieces, size, count, difficulty) {
  let data;
  let discovered;
  let error;

  const random = new Random(seed);

  let c = 0;
  const maxIt = 300;
  for (; c < maxIt; c++) {
    data = fillPositions(generateBoard(random, -1, pieces, size, count));
    discovered = Array(size * size).fill(false);

    let thinkData = null;
    let isSolved = false;
    let giveup = false;
    while (!isSolved && !giveup) {
      // Get a random position that is not a piece and wasn't already taken
      const possibilities = [];
      for (const i in data) {
        if (
          !discovered[i] &&
          Number.isInteger(data[i]) &&
          (thinkData === null || thinkData[i] !== 0)
        ) {
          possibilities.push(i);
        }
      }
      if (possibilities.length > 0) {
        const randPos = Math.floor(random.next() * possibilities.length);
        discovered[possibilities[randPos]] = true;
      } else {
        giveup = true; // Algorithm failed with this generation, we give up
        continue;
      }

      const validation = validateBoard(data, discovered, pieces, size);
      isSolved = validation["isSolved"];
      thinkData = validation["thinkData"];
    }

    if (!isSolved) {
      console.log("Skipping unsolvabled puzzle");
    } else {
      for (let i = 0; i < data.length; i++) {
        if (!discovered[i]) {
          continue;
        }

        discovered[i] = false;
        const validation = validateBoard(data, discovered, pieces, size);
        if (!validation["isSolved"]) {
          discovered[i] = true;
        }
      }

      const emptyCasesAfter = discovered.filter((x) => x === false).length;

      if (difficulty !== -1 && difficulty > emptyCasesAfter) {
        console.log(`Skipping puzzle with ${emptyCasesAfter} empty tiles`);
      } else {
        if (difficulty !== -1) {
          // Set tiles to adjust difficulty

          const possibleTarget = [];
          for (let i = 0; i < data.length; i++) {
            if (!discovered[i] && Number.isInteger(data[i])) {
              possibleTarget.push(i);
            }
          }
          for (let i = emptyCasesAfter; i > difficulty; i--) {
            const rand = Math.floor(random.next() * possibleTarget.length);
            discovered[possibleTarget[rand]] = true;
            possibleTarget.splice(rand, 1).indexOf(rand);
          }
        }
        console.log(
          `Generated solved puzzle with ${
            discovered.filter((x) => x === false).length
          } empty tiles`
        );
        break;
      }
    }
  }

  let cells;
  if (c === maxIt) {
    error = "Failed to generate puzzle";
  } else {
    cells = data.map((item) => ({
      value: item,
      known: false,
      attackedValue: 0,
    }));

    for (const i in discovered) {
      if (discovered[i]) {
        cells[i].known = true;
      }
    }
  }

  return { cells, error };
}
