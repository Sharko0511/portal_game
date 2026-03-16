"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useGameConfig } from "@/hooks/useGamesConfig";
import { useSaveScore } from "@/hooks/useSaveScore";
import Button from "@/components/Button";
import { useLng } from "@/hooks/useLng";

const WIDTH = 600;
const HEIGHT = 400;
const PADDLE_W = 10;
const PADDLE_H = 80;
const BALL_R = 8;

interface Paddle {
  y: number;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface PongGameState {
  player: Paddle;
  ai: Paddle;
  ball: Ball;
  playerScore: number;
  aiScore: number;
  running: boolean;
  animId: number | null;
}

export default function PongGame() {
  const { user, profile } = useAuth();
  const configQuery = useGameConfig("pong");
  const saveScoreMutation = useSaveScore();
  const lng = useLng();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<PongGameState | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState("");

  const loading = configQuery.isLoading;
  const gameConfig = configQuery.data;

  useEffect(() => {
    if (loading || !gameConfig) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const game: PongGameState = {
      player: { y: HEIGHT / 2 - PADDLE_H / 2 },
      ai: { y: HEIGHT / 2 - PADDLE_H / 2 },
      ball: { x: WIDTH / 2, y: HEIGHT / 2, vx: 4, vy: 3 },
      playerScore: 0,
      aiScore: 0,
      running: true,
      animId: null,
    };
    gameRef.current = game;

    function resetBall(dir: number) {
      game.ball.x = WIDTH / 2;
      game.ball.y = HEIGHT / 2;
      game.ball.vx = 4 * dir;
      game.ball.vy = (Math.random() - 0.5) * 6;
    }

    function update() {
      if (!game.running) return;

      // ball movement
      game.ball.x += game.ball.vx;
      game.ball.y += game.ball.vy;

      // top/bottom bounce
      if (game.ball.y - BALL_R <= 0 || game.ball.y + BALL_R >= HEIGHT) {
        game.ball.vy *= -1;
      }

      // player paddle collision (left)
      if (
        game.ball.x - BALL_R <= PADDLE_W + 20 &&
        game.ball.y >= game.player.y &&
        game.ball.y <= game.player.y + PADDLE_H &&
        game.ball.vx < 0
      ) {
        game.ball.vx *= -1.05;
        const hit = (game.ball.y - game.player.y - PADDLE_H / 2) / (PADDLE_H / 2);
        game.ball.vy = hit * 5;
      }

      // AI paddle collision (right)
      if (
        game.ball.x + BALL_R >= WIDTH - PADDLE_W - 20 &&
        game.ball.y >= game.ai.y &&
        game.ball.y <= game.ai.y + PADDLE_H &&
        game.ball.vx > 0
      ) {
        game.ball.vx *= -1.05;
        const hit = (game.ball.y - game.ai.y - PADDLE_H / 2) / (PADDLE_H / 2);
        game.ball.vy = hit * 5;
      }

      // scoring
      if (game.ball.x < 0) {
        game.aiScore++;
        setAiScore(game.aiScore);
        if (game.aiScore >= 5) return endGame("AI");
        resetBall(1);
      }
      if (game.ball.x > WIDTH) {
        game.playerScore++;
        setPlayerScore(game.playerScore);
        if (game.playerScore >= 5) return endGame("You");
        resetBall(-1);
      }

      // AI movement
      const aiCenter = game.ai.y + PADDLE_H / 2;
      if (aiCenter < game.ball.y - 15) game.ai.y += 3;
      else if (aiCenter > game.ball.y + 15) game.ai.y -= 3;

      draw();
      game.animId = requestAnimationFrame(update);
    }

    function endGame(w: string) {
      game.running = false;
      setGameOver(true);
      setWinner(w);
    }

    function draw() {
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // center line
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2, 0);
      ctx.lineTo(WIDTH / 2, HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // paddles
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(20, game.player.y, PADDLE_W, PADDLE_H);
      ctx.fillStyle = "#f87171";
      ctx.fillRect(WIDTH - 20 - PADDLE_W, game.ai.y, PADDLE_W, PADDLE_H);

      // ball
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(game.ball.x, game.ball.y, BALL_R, 0, Math.PI * 2);
      ctx.fill();

      // scores
      ctx.font = "bold 48px Arial";
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.textAlign = "center";
      ctx.fillText(String(game.playerScore), WIDTH / 4, 60);
      ctx.fillText(String(game.aiScore), (WIDTH * 3) / 4, 60);
    }

    function handleMouse(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      game.player.y = e.clientY - rect.top - PADDLE_H / 2;
      game.player.y = Math.max(0, Math.min(HEIGHT - PADDLE_H, game.player.y));
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
        game: "pong",
        score: playerScore,
        playerName: profile.display_name,
        userId: user.id,
      });
      alert("Score saved!");
    } else {
      const name = prompt("Enter your name:");
      if (!name) return;
      await saveScoreMutation.mutateAsync({
        game: "pong",
        score: playerScore,
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
        <h1 className="text-xl font-bold text-accent">
          {gameConfig.icon} {gameConfig.display_name}
        </h1>
        <div className="text-lg font-mono font-bold text-accent">
          {playerScore} - {aiScore}
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
          Move your mouse to control the left paddle. First to 5 wins!
        </p>

        {gameOver && (
          <div className="flex items-center gap-3 shrink-0">
            <p className="text-sm font-bold" style={{ color: winner === "You" ? "#4ade80" : "#f87171" }}>
              {winner === "You" ? "You Win!" : "AI Wins!"}
            </p>
            {winner === "You" && (
              <>
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
              </>
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
