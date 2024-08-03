"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Dimensiones del tablero
const BOARD_X = 10;
const BOARD_Y = 20;

// Definición de las formas posibles
const SHAPES: number[][][] = [
  [[1, 1, 1, 1]], // Forma de línea
  [
    [1, 1],
    [1, 1],
  ], // Forma de cuadrado
  [
    [1, 1, 1],
    [0, 1, 0],
  ], // Forma de T
];

// Tipos para la pieza y las opciones de movimiento
interface Piece {
  x: number;
  y: number;
  shape: number[][];
}

interface MoveOptions {
  dx?: number;
  dy?: number;
  rotate?: boolean;
  shape?: number[][];
}

interface PlaceOptions {
  remove?: boolean;
  stick?: boolean;
}

// Define the interface for the score data
interface Score {
  name: string;
  score: number;
}

// Clase Tetris que maneja la lógica del juego
class Tetris {
  board: number[][];
  piece: Piece | undefined;
  gameOver: boolean;
  score: number;

  constructor() {
    // Inicializa el tablero con ceros (celdas vacías)
    this.board = Array.from({ length: BOARD_Y }, () => Array(BOARD_X).fill(0));
    // Genera la primera pieza
    this.generatePiece();
    // Bandera para determinar si el juego ha terminado
    this.gameOver = false;
    // Inicializa la puntuación
    this.score = 0;
  }

  // Genera una nueva pieza aleatoria
  generatePiece() {
    // Selecciona una forma aleatoria de la lista de formas
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    // Inicializa la pieza con su posición y forma
    this.piece = {
      x: Math.floor(BOARD_X / 2) - Math.floor(shape[0].length / 2),
      y: 0,
      shape,
    };
    // Verifica si la pieza puede ser colocada en el tablero
    if (!this.check()) {
      this.gameOver = true; // Termina el juego si no se puede colocar
    } else {
      this.place(); // Coloca la pieza en el tablero
    }
  }

  // Coloca la pieza en el tablero
  place({ remove = false, stick = false }: PlaceOptions = {}) {
    const { shape } = this.piece!;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[0].length; x++) {
        if (shape[y][x]) {
          const newY = this.piece!.y + y;
          const newX = this.piece!.x + x;
          // Actualiza el tablero dependiendo de si la pieza se está colocando o removiendo
          this.board[newY][newX] = remove ? 0 : stick ? 2 : shape[y][x];
        }
      }
    }
  }

  // Verifica si la pieza puede ser movida a una nueva posición
  check({
    dx = 0,
    dy = 0,
    shape = this.piece!.shape,
  }: MoveOptions = {}): boolean {
    shape = shape || this.piece!.shape;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[0].length; x++) {
        const newY = this.piece!.y + y + dy!;
        const newX = this.piece!.x + x + dx!;

        if (shape[y][x]) {
          // Verifica los límites del tablero
          if (newX < 0 || newX >= BOARD_X || newY >= BOARD_Y) {
            return false;
          }
          // Verifica colisiones con otras piezas fijas
          if (newY >= 0 && this.board[newY][newX] === 2) {
            return false;
          }
        }
      }
    }
    return true;
  }

  // Limpia las líneas completas del tablero
  clearLines() {
    this.board.forEach((row, i) => {
      if (row.every((cell) => cell === 2)) {
        this.board.splice(i, 1); // Elimina la fila completa
        this.board.unshift(Array(BOARD_X).fill(0)); // Añade una nueva fila vacía en la parte superior
        this.score += 100; // Incrementa la puntuación por cada línea eliminada
      }
    });
  }

  // Genera una nueva forma rotada
  rotatedShape(): number[][] {
    const { shape } = this.piece!;
    const rotatedShape = Array.from({ length: shape[0].length }, () =>
      Array(shape.length).fill(0)
    );
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[0].length; x++) {
        if (shape[y][x]) {
          rotatedShape[x][shape.length - y - 1] = shape[y][x];
        }
      }
    }
    return rotatedShape;
  }

  // Mueve la pieza en el tablero
  move({ dx = 0, dy = 0, rotate = false }: MoveOptions = {}) {
    const shape = rotate ? this.rotatedShape() : this.piece!.shape;
    const valid = this.check({ dx, dy, shape });

    if (!valid && dy) {
      this.place({ stick: true }); // Fija la pieza en el tablero
      this.clearLines(); // Limpia las líneas completas
      this.generatePiece(); // Genera una nueva pieza
      return;
    }

    if (!valid) {
      return;
    }

    this.place({ remove: true }); // Remueve la pieza de su posición actual
    this.piece!.x += dx!; // Actualiza la posición horizontal
    this.piece!.y += dy!; // Actualiza la posición vertical
    this.piece!.shape = shape; // Actualiza la forma de la pieza
    this.place(); // Coloca la pieza en la nueva posición
  }
}

// Inicializa una instancia del juego Tetris
let tetris = new Tetris();

// Estilos para las celdas del tablero usando Tailwind CSS
const cellStyles = (cell: number) => {
  let bgColor = "bg-black"; // Por defecto, el color de fondo es negro
  if (cell === 1) {
    bgColor = "bg-gray-400"; // Celdas en movimiento (color plata)
  } else if (cell === 2) {
    bgColor = "bg-red-500"; // Celdas fijas (color rojo)
  }
  return `w-10 h-10 border border-white ${bgColor}`; // Clase de Tailwind CSS para las celdas
};

// Componente principal del juego Tetris
export default function TetrisGame() {
  const [board, setBoard] = useState<number[][]>(tetris.board); // Estado del tablero
  const [gameOver, setGameOver] = useState<boolean>(false); // Estado del juego
  const [score, setScore] = useState<number>(0); // Estado de la puntuación
  const [playerName, setPlayerName] = useState<string>(""); // Estado de la puntuación
  const [loading, setLoading] = useState<boolean>(false); // Estado de la puntuación
  const [scores, setScores] = useState<Score[]>([]); // Use Score[] instead of [Score] | undefined

  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      // Maneja las pulsaciones de teclas
      if (e.key === "ArrowDown") {
        tetris.move({ dy: 1 });
      } else if (e.key === "ArrowLeft") {
        tetris.move({ dx: -1 });
      } else if (e.key === "ArrowRight") {
        tetris.move({ dx: 1 });
      } else if (e.key === "ArrowUp") {
        tetris.move({ rotate: true });
      }
      setBoard([...tetris.board]); // Actualiza el tablero
      setScore(tetris.score); // Actualiza la puntuación
      if (tetris.gameOver) setGameOver(true); // Verifica si el juego ha terminado
    };

    document.addEventListener("keydown", keyDownHandler); // Añade el evento de teclado
    return () => document.removeEventListener("keydown", keyDownHandler); // Limpia el evento de teclado
  }, []);

  const fetchScores = async (): Promise<Score[]> => {
    const { data, error } = await supabase
      .from("score")
      .select("name, score")
      .order("score", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching data:", error);
      return []; // Return an empty array on error
    }

    return data ?? []; // Return an empty array if data is null
  };

  useEffect(() => {
    const fetchAndSetScores = async () => {
      const fetchedScores = await fetchScores();
      setScores(fetchedScores); // Now this matches the type of state
    };

    fetchAndSetScores();
  }, []);

  useEffect(() => {
    // const fetchScores = async (): Promise<Score[]> => {
    //   const { data, } = await supabase
    //     .from("score")
    //     .select("name, score")
    //     .order("score", { ascending: false })
    //     .limit(10);
    //   console.log(data);

    //   setScores(data);
    // };

    // fetchScores();

    const interval = setInterval(() => {
      tetris.move({ dy: 1 }); // Mueve la pieza hacia abajo cada 500ms
      setBoard([...tetris.board]); // Actualiza el tablero
      setScore(tetris.score); // Actualiza la puntuación
      if (tetris.gameOver) setGameOver(true); // Verifica si el juego ha terminado
    }, 500);

    return () => clearInterval(interval); // Limpia el intervalo
  }, []);

  const restartGame = () => {
    tetris = new Tetris();
    setBoard(tetris.board);
    setGameOver(false);
    setScore(0);
  };

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <h1 className="text-8xl font-bold mb-4">Game Over</h1>
        <h2 className="text-4xl mb-32">Final Score: {score}</h2>{" "}
        {/* Muestra la puntuación final */}
        {score > 1000 && (
          <>
            <input
              className="text-6xl mb-4 px-4 py-10 text-black text-center"
              type="text"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
              }}
              placeholder="Player Name"
            />
            <button
              className="text-3xl px-20 py-12 my-10 bg-red-500 text-white rounded mb-10 flex"
              disabled={loading}
              onClick={async () => {
                console.log("Guardar score");

                if (score < 1000) {
                  return;
                }
                setLoading(true);

                const { data, error } = await supabase
                  .from("score")
                  .insert({ score: score, name: playerName })
                  .select();
                console.log(error);
                console.log(data);
                setPlayerName("");
                setLoading(false);
                restartGame();
              }}
            >
              {loading ? (
                <>
                  <svg
                    width="30"
                    height="30"
                    fill="currentColor"
                    className="mr-2 animate-spin"
                    viewBox="0 0 1792 1792"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M526 1394q0 53-37.5 90.5t-90.5 37.5q-52 0-90-38t-38-90q0-53 37.5-90.5t90.5-37.5 90.5 37.5 37.5 90.5zm498 206q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-704-704q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm1202 498q0 52-38 90t-90 38q-53 0-90.5-37.5t-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-964-996q0 66-47 113t-113 47-113-47-47-113 47-113 113-47 113 47 47 113zm1170 498q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-640-704q0 80-56 136t-136 56-136-56-56-136 56-136 136-56 136 56 56 136zm530 206q0 93-66 158.5t-158 65.5q-93 0-158.5-65.5t-65.5-158.5q0-92 65.5-158t158.5-66q92 0 158 66t66 158z"></path>
                  </svg>
                  {"Saving..."}
                </>
              ) : (
                "Save Score"
              )}
            </button>
          </>
        )}
        <button
          onClick={restartGame}
          className="text-3xl px-20 py-12 bg-gray-400 text-white rounded"
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-row items-start justify-center h-screen bg-gray-900 text-white">
      <div className="p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Tetris</h1>
        <h2 className="text-2xl mb-4">Score: {score}</h2>
        {/* Muestra la puntuación actual */}
        <div>
          {board.map((row, i) => (
            <div key={i} className="flex">
              {row.map((cell, j) => (
                <div key={j} className={cellStyles(cell)}></div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 w-96 mt-24">
        <h2 className="text-2xl mb-4 text-center">Top Scores</h2>
        {/* Muestra las mejores puntuaciones */}
        {scores && scores.length > 0 ? (
          <table className="table-auto w-full border-collapse border border-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 border border-gray-700">Name</th>
                <th className="px-4 py-2 border border-gray-700">Score</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((item, index) => (
                <tr key={index} className="odd:bg-gray-800 even:bg-gray-700">
                  <td className="px-4 py-2 border border-gray-700">
                    {item.name}
                  </td>
                  <td className="px-4 py-2 border border-gray-700">
                    {item.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="table-auto w-full border-collapse border border-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 border border-gray-700">Name</th>
                <th className="px-4 py-2 border border-gray-700">Score</th>
              </tr>
            </thead>
            <tbody>
              {Array(10)
                .fill(0)
                .map((_, index) => (
                  <tr key={index} className="odd:bg-gray-800 even:bg-gray-700">
                    <td className="px-4 py-2 border border-gray-700 text-transparent">
                      {"pieLdelaVa84234"}
                    </td>
                    <td className="px-4 py-2 border border-gray-700 text-transparent">
                      {"***"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
