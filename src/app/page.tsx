'use client'

import { useEffect, useState } from "react";

// Dimensiones del tablero
const BOARD_X = 10;
const BOARD_Y = 20;

// Definición de las formas posibles
const SHAPES: number[][][] = [
  [[1, 1, 1, 1]], // Forma de línea
  [
    [1, 1],
    [1, 1]
  ], // Forma de cuadrado
  [
    [1, 1, 1],
    [0, 1, 0]
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
}

interface PlaceOptions {
  remove?: boolean;
  stick?: boolean;
}

// Clase Tetris que maneja la lógica del juego
class Tetris {
  board: number[][];
  piece: Piece | undefined;
  gameOver: boolean;
  score: number;

  constructor() {
    // Inicializa el tablero con ceros (celdas vacías)
    this.board = Array(BOARD_Y).fill("").map(() => Array(BOARD_X).fill(0));
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
      shape
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
  check({ dx = 0, dy = 0, shape = this.piece!.shape }: MoveOptions = {}): boolean {
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
      if (row.every(cell => cell === 2)) {
        this.board.splice(i, 1); // Elimina la fila completa
        this.board.unshift(Array(BOARD_X).fill(0)); // Añade una nueva fila vacía en la parte superior
        this.score += 100; // Incrementa la puntuación por cada línea eliminada
      }
    });
  }

  // Genera una nueva forma rotada
  rotatedShape(): number[][] {
    const { shape } = this.piece!;
    const rotatedShape = Array(shape[0].length).fill("").map(() => Array(shape.length).fill(0));
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

  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      // Maneja las pulsaciones de teclas
      if (e.key === 'ArrowDown') {
        tetris.move({ dy: 1 });
      } else if (e.key === 'ArrowLeft') {
        tetris.move({ dx: -1 });
      } else if (e.key === 'ArrowRight') {
        tetris.move({ dx: 1 });
      } else if (e.key === 'ArrowUp') {
        tetris.move({ rotate: true });
      }
      setBoard([...tetris.board]); // Actualiza el tablero
      setScore(tetris.score); // Actualiza la puntuación
      if (tetris.gameOver) setGameOver(true); // Verifica si el juego ha terminado
    };

    document.addEventListener('keydown', keyDownHandler); // Añade el evento de teclado
    return () => document.removeEventListener('keydown', keyDownHandler); // Limpia el evento de teclado
  }, []);

  useEffect(() => {
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
        <h1 className="text-4xl font-bold mb-4">Game Over</h1>
        <h2 className="text-2xl mb-4">Final Score: {score}</h2> {/* Muestra la puntuación final */}
        <button onClick={restartGame} className="px-4 py-2 bg-blue-500 text-white rounded">
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Tetris</h1>
      <h2 className="text-2xl mb-4">Score: {score}</h2> {/* Muestra la puntuación actual */}
      <div>
        {board.map((row, i) => (
          <div key={i} className="flex">
            {row.map((cell, j) => <div key={j} className={cellStyles(cell)}></div>)}
          </div>
        ))}
      </div>
    </div>
  );
}
