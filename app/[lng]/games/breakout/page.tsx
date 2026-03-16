"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useGameConfig } from "@/hooks/useGamesConfig";
import { useSaveScore } from "@/hooks/useSaveScore";
import Button from "@/components/Button";
import { useLng } from "@/hooks/useLng";

const WIDTH = 600;
const HEIGHT = 450;
const PADDLE_W = 80;
const PADDLE_H = 12;
const BALL_R = 6;
const BRICK_ROWS = 5;
const BRICK_COLS = 10;
const BRICK_W = 54;
const BRICK_H = 18;
const BRICK_PAD = 4;
const BRICK_OFFSET_X = 15;
const BRICK_OFFSET_Y = 40;

const COLORS = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#38bdf8"];

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Brick {
  x: number;
  y: number;
  alive: boolean;
  color: string;
}

interface BreakoutGameState {
  paddle: number;
  ball: Ball;
  bricks: Brick[];
  score: number;
  lives: number;
  running: boolean;
  animId: number | null;
}

export default function BreakoutGame() {
  const { user, profile } = useAuth();
  const configQuery = useGameConfig("breakout");
  const saveScoreMutation = useSaveScore();
  const lng = useLng();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const loading = configQuery.isLoading;
  const gameConfig = configQuery.data;

  useEffect(() => {
    if (loading || !gameConfig) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    function makeBricks(): Brick[] {
      const bricks: Brick[] = [];
      for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
          bricks.push({
            x: BRICK_OFFSET_X + c * (BRICK_W + BRICK_PAD),
            y: BRICK_OFFSET_Y + r * (BRICK_H + BRICK_PAD),
            alive: true,
            color: COLORS[r],
          });
        }
      }
      return bricks;
    }

    const game: BreakoutGameState = {
      paddle: WIDTH / 2 - PADDLE_W / 2,
      ball: { x: WIDTH / 2, y: HEIGHT - 40, vx: 3, vy: -3 },
      bricks: makeBricks(),
      score: 0,
      lives: 3,
      running: true,
      animId: null,
    };

    function resetBall() {
      game.ball = { x: WIDTH / 2, y: HEIGHT - 40, vx: 3, vy: -3 };
    }

    function draw() {
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // bricks
      game.bricks.forEach((b) => {
        if (!b.alive) return;
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, BRICK_W, BRICK_H);
      });

      // paddle
      ctx.fillStyle = "#a78bfa";
      ctx.fillRect(game.paddle, HEIGHT - 20, PADDLE_W, PADDLE_H);

      // ball
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(game.ball.x, game.ball.y, BALL_R, 0, Math.PI * 2);
      ctx.fill();

      // lives
      ctx.fillStyle = "#f87171";
      ctx.font = "14px Arial";
      ctx.textAlign = "left";
      ctx.fillText("\u2665".repeat(game.lives), 10, 20);
    }

    function update() {
      if (!game.running) return;

      game.ball.x += game.ball.vx;
      game.ball.y += game.ball.vy;

      // wall bounce
      if (game.ball.x - BALL_R <= 0 || game.ball.x + BALL_R >= WIDTH) {
        game.ball.vx *= -1;
      }
      if (game.ball.y - BALL_R <= 0) {
        game.ball.vy *= -1;
      }

      // paddle bounce
      if (
        game.ball.y + BALL_R >= HEIGHT - 20 &&
        game.ball.x >= game.paddle &&
        game.ball.x <= game.paddle + PADDLE_W &&
        game.ball.vy > 0
      ) {
        game.ball.vy *= -1;
        const hit = (game.ball.x - game.paddle - PADDLE_W / 2) / (PADDLE_W / 2);
        game.ball.vx = hit * 5;
      }

      // fall off bottom
      if (game.ball.y > HEIGHT) {
        game.lives--;
        setLives(game.lives);
        if (game.lives <= 0) {
          game.running = false;
          setGameOver(true);
          return;
        }
        resetBall();
      }

      // brick collision
      game.bricks.forEach((b) => {
        if (!b.alive) return;
        if (
          game.ball.x + BALL_R > b.x &&
          game.ball.x - BALL_R < b.x + BRICK_W &&
          game.ball.y + BALL_R > b.y &&
          game.ball.y - BALL_R < b.y + BRICK_H
        ) {
          b.alive = false;
          game.ball.vy *= -1;
          game.score += 10;
          setScore(game.score);
        }
      });

      // win check
      if (game.bricks.every((b) => !b.alive)) {
        game.running = false;
        setWon(true);
        setGameOver(true);
      }

      draw();
      game.animId = requestAnimationFrame(update);
    }

    function handleMouse(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      game.paddle = e.clientX - rect.left - PADDLE_W / 2;
      game.paddle = Math.max(0, Math.min(WIDTH - PADDLE_W, game.paddle));
    }

    canvas.addEventListener("mousemove", handleMouse);
    game.animId = requestAnimationFrame(update);

    return () => {
      canvas.removeEventListener("mousemove", handleMouse);
      cancelAnimationFrame(game.animId!);
    };
  }, [loading, gameConfig]);

  function restart() {
    window.location.reload();
  }

  async function saveScore() {
    if (saveScoreMutation.isPending) return;

    if (user && profile) {
      await saveScoreMutation.mutateAsync({
        game: "breakout",
        score,
        playerName: profile.display_name,
        userId: user.id,
      });
      alert("Score saved!");
    } else {
      const name = prompt("Enter your name:");
      if (!name) return;
      await saveScoreMutation.mutateAsync({
        game: "breakout",
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
        <Link href={`/${lng}/games`} className="text-accent hover:underline">
          ← Back to Games
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col px-6 py-4 mx-auto max-w-6xl w-full">
      <div className="mb-2 flex items-center justify-between shrink-0">
        <Link href={`/${lng}/games`} className="text-sm text-gray-500 hover:text-gray-900">
          ← Back
        </Link>
        <h1 className="text-xl font-bold text-accent-secondary">
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
          className="rounded-lg border border-white/10 cursor-none max-h-full"
          style={{ maxHeight: "calc(100vh - 140px)" }}
        />
        <p className="text-xs text-foreground/50 shrink-0">
          Move your mouse to control the paddle. Break all the bricks!
        </p>

        {gameOver && (
          <div className="flex items-center gap-3 shrink-0">
            <p className="text-sm font-bold" style={{ color: won ? "#4ade80" : "#f87171" }}>
              {won ? "You Win!" : "Game Over"}
            </p>
            <Button
              onClick={saveScore}
              disabled={saveScoreMutation.isPending}
            >
              {saveScoreMutation.isPending ? "Saving..." : user ? "Save Score" : "Save as Guest"}
            </Button>
            {!user && (
              <Link href="/login" className="text-xs text-accent hover:underline">
                Login to save with your account
              </Link>
            )}
            <Button onClick={restart} variant="secondary">
              Play Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
