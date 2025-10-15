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
      // Clear canvas with dark gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGradient.addColorStop(0, '#0f0f23');
      bgGradient.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle grid pattern
      ctx.strokeStyle = 'rgba(100, 100, 200, 0.1)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(canvas.width, i * CELL_SIZE);
        ctx.stroke();
      }

      // Draw snake with gradient and glow
      gameState.snake.forEach((segment, index) => {
        const x = segment.x * CELL_SIZE;
        const y = segment.y * CELL_SIZE;
        const size = CELL_SIZE - 2;
        
        // Create gradient for snake
        const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
        if (index === 0) {
          // Head - brighter gradient
          gradient.addColorStop(0, '#00ff88');
          gradient.addColorStop(1, '#00d4ff');
          
          // Add glow effect for head
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#00ff88';
        } else {
          // Body - gradient based on position
          const colorIntensity = 1 - (index / gameState.snake.length) * 0.5;
          gradient.addColorStop(0, `rgba(0, 255, 136, ${colorIntensity})`);
          gradient.addColorStop(1, `rgba(0, 212, 255, ${colorIntensity})`);
          
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#00ff88';
        }
        
        ctx.fillStyle = gradient;
        
        // Draw rounded rectangle
        const radius = 4;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + size - radius, y);
        ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
        ctx.lineTo(x + size, y + size - radius);
        ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
        ctx.lineTo(x + radius, y + size);
        ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
        
        ctx.shadowBlur = 0;
      });

      // Draw food with pulsing glow effect
      const foodX = gameState.food.x * CELL_SIZE;
      const foodY = gameState.food.y * CELL_SIZE;
      const foodSize = CELL_SIZE - 2;
      const pulseTime = Date.now() / 500;
      const pulseScale = 1 + Math.sin(pulseTime) * 0.15;
      
      // Outer glow
      const glowGradient = ctx.createRadialGradient(
        foodX + foodSize / 2, foodY + foodSize / 2, 0,
        foodX + foodSize / 2, foodY + foodSize / 2, foodSize * pulseScale
      );
      glowGradient.addColorStop(0, 'rgba(255, 100, 150, 0.8)');
      glowGradient.addColorStop(0.5, 'rgba(255, 50, 100, 0.4)');
      glowGradient.addColorStop(1, 'rgba(255, 0, 100, 0)');
      
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(
        foodX + foodSize / 2,
        foodY + foodSize / 2,
        foodSize * pulseScale,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Inner food with gradient
      const foodGradient = ctx.createRadialGradient(
        foodX + foodSize / 2, foodY + foodSize / 2, 0,
        foodX + foodSize / 2, foodY + foodSize / 2, foodSize / 2
      );
      foodGradient.addColorStop(0, '#ff6b9d');
      foodGradient.addColorStop(1, '#c94b7a');
      
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ff0066';
      ctx.fillStyle = foodGradient;
      ctx.beginPath();
      ctx.arc(
        foodX + foodSize / 2,
        foodY + foodSize / 2,
        foodSize / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw game over overlay
      if (gameState.gameOver) {
        // Semi-transparent backdrop
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Game Over text with gradient
        const textGradient = ctx.createLinearGradient(0, canvas.height / 2 - 40, canvas.width, canvas.height / 2 - 40);
        textGradient.addColorStop(0, '#ff6b9d');
        textGradient.addColorStop(0.5, '#00d4ff');
        textGradient.addColorStop(1, '#00ff88');
        
        ctx.fillStyle = textGradient;
        ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00d4ff';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px system-ui, -apple-system, sans-serif';
        ctx.fillText(
          'Press SPACE to restart',
          canvas.width / 2,
          canvas.height / 2 + 30
        );
        ctx.shadowBlur = 0;
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
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '20px',
      }}
    >
      <h1 style={{ 
        marginBottom: '30px',
        fontSize: '48px',
        fontWeight: '800',
        background: 'linear-gradient(135deg, #00ff88, #00d4ff, #ff6b9d)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textShadow: '0 0 40px rgba(0, 212, 255, 0.3)',
        letterSpacing: '2px',
      }}>
        SNAKE
      </h1>
      
      {!gameStarted ? (
        <div style={{ 
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '40px 60px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}>
          <h2 style={{ 
            marginBottom: '30px',
            fontSize: '24px',
            fontWeight: '600',
            color: '#00d4ff',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Select Difficulty
          </h2>
          <div style={{ marginBottom: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {['easy', 'medium', 'hard'].map((level) => (
              <button
                key={level}
                onClick={() => {
                  setDifficulty(level);
                  startGame();
                }}
                style={{
                  padding: '14px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: difficulty === level 
                    ? 'linear-gradient(135deg, #00ff88, #00d4ff)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  border: difficulty === level 
                    ? 'none' 
                    : '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.3s ease',
                  boxShadow: difficulty === level 
                    ? '0 4px 20px rgba(0, 255, 136, 0.4)' 
                    : '0 4px 12px rgba(0, 0, 0, 0.2)',
                }}
                onMouseEnter={(e) => {
                  if (difficulty !== level) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.borderColor = 'rgba(0, 212, 255, 0.5)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(0, 212, 255, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (difficulty !== level) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                  }
                }}
              >
                {level}
              </button>
            ))}
          </div>
          <div style={{ 
            marginTop: '30px', 
            fontSize: '20px',
            fontWeight: '600',
            padding: '16px 24px',
            background: 'rgba(0, 212, 255, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(0, 212, 255, 0.3)',
          }}>
            🏆 High Score: <span style={{ color: '#00ff88' }}>{highScore}</span>
          </div>
        </div>
      ) : (
        <>
          <div style={{ 
            marginBottom: '20px', 
            fontSize: '20px', 
            display: 'flex', 
            gap: '30px',
            fontWeight: '600',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            padding: '16px 32px',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}>
            <span style={{ color: '#00ff88' }}>Score: {score}</span>
            <span style={{ color: '#00d4ff' }}>High Score: {highScore}</span>
          </div>
          <canvas
            ref={canvasRef}
            width={GRID_SIZE * CELL_SIZE}
            height={GRID_SIZE * CELL_SIZE}
            style={{
              border: '3px solid rgba(0, 212, 255, 0.3)',
              backgroundColor: '#0f0f23',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 212, 255, 0.2), inset 0 0 40px rgba(0, 0, 0, 0.5)',
            }}
          />
          <div style={{ 
            marginTop: '24px', 
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            padding: '16px 24px',
            borderRadius: '12px',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}>
            <p style={{ marginBottom: '8px' }}>⌨️ Use arrow keys to move</p>
            <p style={{ marginBottom: '8px' }}>
              Difficulty: <span style={{ 
                color: '#00d4ff', 
                fontWeight: '600',
                textTransform: 'uppercase',
              }}>
                {difficulty}
              </span>
            </p>
            {gameOver && <p style={{ color: '#ff6b9d', fontWeight: '600', marginTop: '12px', fontSize: '16px' }}>Press SPACE to restart</p>}
          </div>
        </>
      )}
    </div>
  );
}