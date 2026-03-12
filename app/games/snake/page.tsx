"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useGameConfig } from "@/hooks/useGamesConfig";
import { useSaveScore } from "@/hooks/useSaveScore";
import Button from "@/components/Button";

const CELL = 20;
const COLS = 20;
const ROWS = 20;
const WIDTH = COLS * CELL;
const HEIGHT = ROWS * CELL;

interface Point {
  x: number;
  y: number;
}

interface SnakeGameState {
  snake: Point[];
  dir: Point;
  nextDir: Point;
  food: Point;
  score: number;
  running: boolean;
  interval: ReturnType<typeof setInterval> | null;
}

export default function SnakeGame() {
  const { user, profile } = useAuth();
  const configQuery = useGameConfig("snake");
  const saveScoreMutation = useSaveScore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<SnakeGameState | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  const loading = configQuery.isLoading;
  const gameConfig = configQuery.data;

  useEffect(() => {
    if (loading || !gameConfig) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const game: SnakeGameState = {
      snake: [{ x: 10, y: 10 }],
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      food: { x: 15, y: 10 },
      score: 0,
      running: false,
      interval: null,
    };
    gameRef.current = game;

    function spawnFood() {
      let pos: Point;
      do {
        pos = {
          x: Math.floor(Math.random() * COLS),
          y: Math.floor(Math.random() * ROWS),
        };
      } while (game.snake.some((s) => s.x === pos.x && s.y === pos.y));
      game.food = pos;
    }

    function draw() {
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // grid
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
          ctx.strokeRect(x * CELL, y * CELL, CELL, CELL);
        }
      }

      // food
      ctx.fillStyle = "#f87171";
      ctx.beginPath();
      ctx.arc(
        game.food.x * CELL + CELL / 2,
        game.food.y * CELL + CELL / 2,
        CELL / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // snake
      game.snake.forEach((seg, i) => {
        const t = i / game.snake.length;
        ctx.fillStyle = i === 0 ? "#4ade80" : `rgba(74,222,128,${1 - t * 0.6})`;
        ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
      });
    }

    function update() {
      game.dir = { ...game.nextDir };
      const head: Point = {
        x: game.snake[0].x + game.dir.x,
        y: game.snake[0].y + game.dir.y,
      };

      // wall collision
      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        endGame();
        return;
      }

      // self collision
      if (game.snake.some((s) => s.x === head.x && s.y === head.y)) {
        endGame();
        return;
      }

      game.snake.unshift(head);

      if (head.x === game.food.x && head.y === game.food.y) {
        game.score += 10;
        setScore(game.score);
        spawnFood();
      } else {
        game.snake.pop();
      }

      draw();
    }

    function endGame() {
      game.running = false;
      clearInterval(game.interval!);
      setGameOver(true);
      draw();

      // draw game over text
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = "#f87171";
      ctx.font = "bold 32px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Game Over", WIDTH / 2, HEIGHT / 2 - 10);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "16px Arial";
      ctx.fillText(`Score: ${game.score}`, WIDTH / 2, HEIGHT / 2 + 20);
    }

    function handleKey(e: KeyboardEvent) {
      const keyMap: Record<string, Point> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      };
      const newDir = keyMap[e.key];
      if (!newDir) return;
      e.preventDefault();

      // prevent reversing
      if (newDir.x !== -game.dir.x || newDir.y !== -game.dir.y) {
        game.nextDir = newDir;
      }

      if (!game.running) {
        startGame();
      }
    }

    function startGame() {
      game.snake = [{ x: 10, y: 10 }];
      game.dir = { x: 1, y: 0 };
      game.nextDir = { x: 1, y: 0 };
      game.score = 0;
      game.running = true;
      setScore(0);
      setGameOver(false);
      setStarted(true);
      spawnFood();
      game.interval = setInterval(update, 120);
    }

    draw();
    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      clearInterval(game.interval!);
    };
  }, [loading, gameConfig]);

  async function saveScore() {
    if (saveScoreMutation.isPending) return;

    if (user && profile) {
      await saveScoreMutation.mutateAsync({
        game: "snake",
        score,
        playerName: profile.display_name,
        userId: user.id,
      });
      alert("Score saved!");
    } else {
      const name = prompt("Enter your name:");
      if (!name) return;
      await saveScoreMutation.mutateAsync({
        game: "snake",
        score,
        playerName: name,
      });
      alert("Score saved!");
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!gameConfig) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="text-6xl">🚫</div>
        <h1 className="text-2xl font-bold text-red-600">Game Unavailable</h1>
        <p className="text-gray-500">This game is currently disabled.</p>
        <Link href="/" className="text-accent hover:underline">
          ← Back to Games
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center justify-between shrink-0">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back
        </Link>
        <h1 className="text-xl font-bold text-green-700">
          {gameConfig.icon} {gameConfig.display_name}
        </h1>
        <div className="text-lg font-mono font-bold text-accent">
          Score: {score}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-2 min-h-0">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="rounded-lg border border-white/10 max-h-full"
          style={{ maxHeight: "calc(100vh - 140px)" }}
        />

        {!started && (
          <p className="text-xs text-foreground/50 shrink-0">Press any arrow key to start</p>
        )}

        {gameOver && (
          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={saveScore}
              disabled={saveScoreMutation.isPending}
            >
              {saveScoreMutation.isPending ? "Saving..." : user ? "Save Score" : "Save as Guest"}
            </Button>
            {!user && (
              <Link
                href="/login"
                className="text-xs text-accent hover:underline"
              >
                Login to save with your account
              </Link>
            )}
            <p className="text-xs text-foreground/50">
              Press any arrow key to restart
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
