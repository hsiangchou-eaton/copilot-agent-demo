'use client';

import { useEffect, useRef, useState } from 'react';

export default function SnakeGame() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const gameStateRef = useRef({
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    score: 0,
    gameOver: false,
  });

  const GRID_SIZE = 20;
  const CELL_SIZE = 20;
  const GAME_SPEED = 100;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const gameState = gameStateRef.current;

    // Generate random food position
    const generateFood = () => {
      let newFood;
      do {
        newFood = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
        };
      } while (
        gameState.snake.some(
          (segment) => segment.x === newFood.x && segment.y === newFood.y
        )
      );
      return newFood;
    };

    // Draw game
    const draw = () => {
      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw snake
      ctx.fillStyle = '#0f0';
      gameState.snake.forEach((segment, index) => {
        if (index === 0) {
          ctx.fillStyle = '#0f0';
        } else {
          ctx.fillStyle = '#0a0';
        }
        ctx.fillRect(
          segment.x * CELL_SIZE,
          segment.y * CELL_SIZE,
          CELL_SIZE - 1,
          CELL_SIZE - 1
        );
      });

      // Draw food
      ctx.fillStyle = '#f00';
      ctx.fillRect(
        gameState.food.x * CELL_SIZE,
        gameState.food.y * CELL_SIZE,
        CELL_SIZE - 1,
        CELL_SIZE - 1
      );

      // Draw game over message
      if (gameState.gameOver) {
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '20px Arial';
        ctx.fillText(
          'Press Space to Restart',
          canvas.width / 2,
          canvas.height / 2 + 20
        );
      }
    };

    // Game loop
    const gameLoop = () => {
      if (gameState.gameOver) {
        draw();
        return;
      }

      // Update direction
      gameState.direction = gameState.nextDirection;

      // Calculate new head position
      const head = gameState.snake[0];
      const newHead = {
        x: head.x + gameState.direction.x,
        y: head.y + gameState.direction.y,
      };

      // Check wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        gameState.gameOver = true;
        setGameOver(true);
        draw();
        return;
      }

      // Check self collision
      if (
        gameState.snake.some(
          (segment) => segment.x === newHead.x && segment.y === newHead.y
        )
      ) {
        gameState.gameOver = true;
        setGameOver(true);
        draw();
        return;
      }

      // Add new head
      gameState.snake.unshift(newHead);

      // Check if food is eaten
      if (newHead.x === gameState.food.x && newHead.y === gameState.food.y) {
        gameState.score++;
        setScore(gameState.score);
        gameState.food = generateFood();
      } else {
        // Remove tail if no food eaten
        gameState.snake.pop();
      }

      draw();
    };

    // Handle keyboard input
    const handleKeyDown = (e) => {
      const key = e.key;

      if (gameState.gameOver && key === ' ') {
        // Restart game
        gameState.snake = [{ x: 10, y: 10 }];
        gameState.food = generateFood();
        gameState.direction = { x: 1, y: 0 };
        gameState.nextDirection = { x: 1, y: 0 };
        gameState.score = 0;
        gameState.gameOver = false;
        setScore(0);
        setGameOver(false);
        e.preventDefault();
        return;
      }

      if (gameState.gameOver) return;

      // Prevent opposite direction
      if (key === 'ArrowUp' && gameState.direction.y === 0) {
        gameState.nextDirection = { x: 0, y: -1 };
        e.preventDefault();
      } else if (key === 'ArrowDown' && gameState.direction.y === 0) {
        gameState.nextDirection = { x: 0, y: 1 };
        e.preventDefault();
      } else if (key === 'ArrowLeft' && gameState.direction.x === 0) {
        gameState.nextDirection = { x: -1, y: 0 };
        e.preventDefault();
      } else if (key === 'ArrowRight' && gameState.direction.x === 0) {
        gameState.nextDirection = { x: 1, y: 0 };
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Start game loop
    const intervalId = setInterval(gameLoop, GAME_SPEED);

    // Initial draw
    draw();

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#111',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1 style={{ marginBottom: '20px' }}>Snake Game</h1>
      <div style={{ marginBottom: '10px', fontSize: '20px' }}>
        Score: {score}
      </div>
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        style={{
          border: '2px solid #fff',
          backgroundColor: '#000',
        }}
      />
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>Use arrow keys to move</p>
        {gameOver && <p>Press Space to restart</p>}
      </div>
    </div>
  );
}