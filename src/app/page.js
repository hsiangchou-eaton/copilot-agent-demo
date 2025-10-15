'use client';

import { useEffect, useRef, useState } from 'react';

export default function SnakeGame() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [gameStarted, setGameStarted] = useState(false);
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
  
  // Difficulty level speeds (in milliseconds)
  const DIFFICULTY_SPEEDS = {
    easy: 150,
    medium: 100,
    hard: 50,
  };

  // Update high score if current score is higher
  const updateHighScore = (currentScore) => {
    if (currentScore > highScore) {
      setHighScore(currentScore);
      localStorage.setItem('snakeHighScore', currentScore.toString());
    }
  };

  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    gameStateRef.current = {
      snake: [{ x: 10, y: 10 }],
      food: { x: 15, y: 15 },
      direction: { x: 1, y: 0 },
      nextDirection: { x: 1, y: 0 },
      score: 0,
      gameOver: false,
    };
  };

  // Load high score from localStorage on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  useEffect(() => {
    if (!gameStarted) return;

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
        updateHighScore(gameState.score);
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
        updateHighScore(gameState.score);
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
        // Restart game - go back to difficulty selection
        setGameStarted(false);
        setGameOver(false);
        setScore(0);
        gameState.snake = [{ x: 10, y: 10 }];
        gameState.food = generateFood();
        gameState.direction = { x: 1, y: 0 };
        gameState.nextDirection = { x: 1, y: 0 };
        gameState.score = 0;
        gameState.gameOver = false;
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
    const intervalId = setInterval(gameLoop, DIFFICULTY_SPEEDS[difficulty]);

    // Initial draw
    draw();

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStarted, difficulty]);

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
      
      {!gameStarted ? (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '20px' }}>Select Difficulty</h2>
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => {
                setDifficulty('easy');
                startGame();
              }}
              style={{
                padding: '10px 20px',
                margin: '0 10px',
                fontSize: '16px',
                cursor: 'pointer',
                backgroundColor: difficulty === 'easy' ? '#0f0' : '#333',
                color: '#fff',
                border: '2px solid #fff',
                borderRadius: '5px',
              }}
            >
              Easy
            </button>
            <button
              onClick={() => {
                setDifficulty('medium');
                startGame();
              }}
              style={{
                padding: '10px 20px',
                margin: '0 10px',
                fontSize: '16px',
                cursor: 'pointer',
                backgroundColor: difficulty === 'medium' ? '#0f0' : '#333',
                color: '#fff',
                border: '2px solid #fff',
                borderRadius: '5px',
              }}
            >
              Medium
            </button>
            <button
              onClick={() => {
                setDifficulty('hard');
                startGame();
              }}
              style={{
                padding: '10px 20px',
                margin: '0 10px',
                fontSize: '16px',
                cursor: 'pointer',
                backgroundColor: difficulty === 'hard' ? '#0f0' : '#333',
                color: '#fff',
                border: '2px solid #fff',
                borderRadius: '5px',
              }}
            >
              Hard
            </button>
          </div>
          <div style={{ marginTop: '20px', fontSize: '18px' }}>
            High Score: {highScore}
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '10px', fontSize: '20px', display: 'flex', gap: '30px' }}>
            <span>Score: {score}</span>
            <span>High Score: {highScore}</span>
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
            <p>Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
            {gameOver && <p>Press Space to restart</p>}
          </div>
        </>
      )}
    </div>
  );
}