import { useEffect, useRef } from "react";
import "./snake.css";

//const canvas = document.querySelector('canvas') as HTMLCanvasElement;

//const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector('canvas');
//canvas.width = 500;
//canvas.height = 500;
//const ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext('2d');
//const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

enum Direction {
  Right = 0,
  Left = 1,
  Down = 2,
  Up = 3,
}

enum CellType {
  Empty = 0,
  Snake = 1,
  Food = 2,
}

interface Coordinates {
  x: number;
  y: number;
}

interface Cell {
  type: CellType;
  age?: number;
}

// export const SnakeGame: React.FC = () => {
// const canvas = document.querySelector('canvas') as HTMLCanvasElement;
// const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

class Snake {
  private cellSize: number;
  private board: Cell[][] = [];
  private rows = 50;
  private cols = 50;
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private directionQueue: Direction[] = [];
  private lastAttemptedDirection: { direction: Direction; age: number } | null =
    null;
  private food: Coordinates = { x: 0, y: 0 };
  private snake: Coordinates[] = [];
  private head: Coordinates = { x: 0, y: 0 };
  private direction: Direction = Direction.Right;
  private score = 0;
  public gameOver = false;
  private willEat = false;
  private animationFrameId?: number;
  private gameLoop?: ReturnType<typeof setTimeout>;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.cellSize = Math.min(
      canvas.width / this.cols,
      canvas.height / this.rows
    );

    this.init();
  }

  initBoard(): void {
    this.board = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, () => ({ type: CellType.Empty }))
    );
  }

  init(): void {
    this.ctx.font = "25px Times New Roman";
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = "center";

    this.initBoard();

    this.snake = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
    ];

    this.updateSnake();

    this.directionQueue = [];
    this.direction = Direction.Right;
    this.score = 0;
    this.gameOver = false;
    this.willEat = false;
  }

  private updateSnake(): void {
    // Clear previous snake positions
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.board[y][x].type === CellType.Snake) {
          this.board[y][x].type = CellType.Empty;
        }
      }
    }

    // Add new snake positions
    this.snake.forEach((segment, index) => {
      if (
        segment.x >= 0 &&
        segment.x < this.cols &&
        segment.y >= 0 &&
        segment.y < this.rows
      ) {
        // Last segment is the head
        if (index === this.snake.length - 1) {
          this.head = { x: segment.x, y: segment.y };
        }
        this.board[segment.y][segment.x].type = CellType.Snake;
        this.board[segment.y][segment.x].age = index;
      }
    });
  }

  startGame(): void {
    this.init();
    this.move();
    this.foodGenerator();
  }

  stopGame(): void {
    if (this.gameLoop) {
      clearTimeout(this.gameLoop);
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  validateDirection(direction1: Direction, direction2: Direction): boolean {
    return !(
      (direction1 === Direction.Right && direction2 === Direction.Left) ||
      (direction1 === Direction.Left && direction2 === Direction.Right) ||
      (direction1 === Direction.Up && direction2 === Direction.Down) ||
      (direction1 === Direction.Down && direction2 === Direction.Up) ||
      direction1 === direction2
    );
  }

  setDirection(direction: Direction): void {
    // Get the direction to check against (last in queue or current direction)
    const checkAgainst =
      this.directionQueue.length > 0
        ? this.directionQueue[this.directionQueue.length - 1]
        : this.direction;

    // Prevent the snake from reversing direction
    if (!this.validateDirection(direction, checkAgainst)) {
      this.lastAttemptedDirection = { direction, age: 0 };
      return;
    }

    if (this.directionQueue.length < 3) {
      this.directionQueue.push(direction);
    }

    if (
      this.lastAttemptedDirection !== null &&
      this.validateDirection(direction, this.lastAttemptedDirection.direction)
    ) {
      this.directionQueue.push(this.lastAttemptedDirection.direction);
      this.lastAttemptedDirection = null;
    }
  }

  draw(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // draw score
    this.ctx.fillStyle = "#fff";
    this.ctx.globalAlpha = 0.5;
    this.ctx.fillText("Score : " + this.score, 70, 30);
    this.ctx.globalAlpha = 1;

    // Render the board
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const cell = this.board[y][x];
        if (cell.type === CellType.Snake) {
          this.ctx.fillStyle = cell.age! % 2 === 1 ? "#A1CCA5" : "#415D43";
          this.ctx.fillRect(
            x * this.cellSize,
            y * this.cellSize,
            this.cellSize,
            this.cellSize
          );
        } else if (cell.type === CellType.Food) {
          this.ctx.fillStyle = "#4B8D48";
          this.ctx.fillRect(
            x * this.cellSize,
            y * this.cellSize,
            this.cellSize,
            this.cellSize
          );
        }
      }
    }

    this.isDead();

    this.eatFood();
  }

  move(): void {
    this.direction = this.directionQueue.shift() ?? this.direction;
    // remove the last attempted direction if it is older than 5 frames
    // this is to prevent old moves being used unexpectedly
    if (this.lastAttemptedDirection !== null) {
      if (this.lastAttemptedDirection.age < 5) {
        this.lastAttemptedDirection.age += 1;
      } else {
        this.lastAttemptedDirection = null;
      }
    }
    const newHead = { ...this.snake[this.snake.length - 1] };

    switch (this.direction) {
      case Direction.Right:
        newHead.x = (this.head.x + 1) % this.cols;
        break;
      case Direction.Left:
        newHead.x = (this.head.x - 1 + this.cols) % this.cols;
        break;
      case Direction.Down:
        newHead.y = (this.head.y + 1) % this.rows;
        break;
      case Direction.Up:
        newHead.y = (this.head.y - 1 + this.rows) % this.rows;
        break;
    }

    if (!this.willEat) {
      const coords = this.snake.shift();
      this.board[coords!.y][coords!.x].type = CellType.Empty;
    } else {
      this.willEat = false;
    }

    this.head = newHead;
    this.snake.push(newHead);
    for (const segment of this.snake) {
      this.board[segment.y][segment.x] = {
        type: CellType.Snake,
        age: this.snake.length - this.snake.indexOf(segment),
      };
    }

    this.draw();
    this.gameLoop = setTimeout(
      () => {
        if (!this.gameOver) {
          this.animationFrameId = window.requestAnimationFrame(() =>
            this.move()
          );
        } else {
          this.ctx.fillStyle = "#fff";
          this.ctx.globalAlpha = 1;
          this.ctx.fillText(
            "Game Over",
            this.canvas.width / 2,
            this.canvas.height / 2
          );
          this.ctx.fillText(
            "Press Enter to Restart",
            this.canvas.width / 2,
            this.canvas.height / 2 + 30
          );
        }
      },
      Math.max(1000 / (10 + this.score), 25)
    );
  }

  isDead(): void {
    const head = this.snake[this.snake.length - 1];

    // Check collision with body (all segments except the head)
    for (let i = 0; i < this.snake.length - 1; i++) {
      const segment = this.snake[i];
      if (head.x === segment.x && head.y === segment.y) {
        this.gameOver = true;
        return;
      }
    }
  }

  foodGenerator(): void {
    const emptyCells: Coordinates[] = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.board[y][x].type === CellType.Empty) {
          emptyCells.push({ x, y });
        }
      }
    }

    if (emptyCells.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    this.food = emptyCells[randomIndex];
    this.board[this.food.y][this.food.x].type = CellType.Food;
  }

  eatFood(): void {
    if (this.head.x === this.food.x && this.head.y === this.food.y) {
      this.willEat = true;
      this.score += 1;
      this.foodGenerator();
    }
  }

  resetGame(): void {
    if (this.gameOver) {
      this.startGame();
    }
  }
}

export const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<Snake | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;

    canvas.width = 500;
    canvas.height = 500;

    gameRef.current = new Snake(canvas);
    gameRef.current?.startGame();

    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowRight":
          gameRef.current?.setDirection(Direction.Right);
          break;
        case "ArrowLeft":
          gameRef.current?.setDirection(Direction.Left);
          break;
        case "ArrowDown":
          gameRef.current?.setDirection(Direction.Down);
          break;
        case "ArrowUp":
          gameRef.current?.setDirection(Direction.Up);
          break;
        case "Enter":
          if (gameRef.current?.gameOver) {
            gameRef.current?.startGame();
          }
          break;
      }
    };
    window.addEventListener("keyup", handleKeyPress);

    return () => {
      window.removeEventListener("keyup", handleKeyPress);
      gameRef.current?.stopGame();
      gameRef.current = null;
    };
  }, []); // use effect

  //return <canvas ref={canvasRef} className="snake-canvas" />;
  return <canvas ref={canvasRef} className="snake-canvas" />;
  // return <canvas ref={canvasRef} />;
};
