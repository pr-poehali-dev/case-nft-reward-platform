import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface CrashGameProps {
  balance: number;
  setBalance: (value: number | ((prev: number) => number)) => void;
}

const CrashGame = ({ balance, setBalance }: CrashGameProps) => {
  const [gameState, setGameState] = useState<'waiting' | 'running' | 'crashed'>('waiting');
  const [multiplier, setMultiplier] = useState(1.00);
  const [betAmount, setBetAmount] = useState(100);
  const [hasActiveBet, setHasActiveBet] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [crashPoint, setCrashPoint] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const startGame = () => {
    const randomCrash = 1 + Math.random() * 10;
    setCrashPoint(randomCrash);
    setGameState('running');
    setMultiplier(1.00);
  };

  const placeBet = () => {
    if (betAmount > balance || betAmount <= 0) return;
    setBalance(prev => prev - betAmount);
    setHasActiveBet(true);
  };

  const cashOut = () => {
    if (!hasActiveBet || gameState !== 'running') return;
    const winnings = Math.floor(betAmount * multiplier);
    setWinAmount(winnings);
    setBalance(prev => prev + winnings);
    setHasActiveBet(false);
  };

  useEffect(() => {
    if (gameState === 'running') {
      const interval = setInterval(() => {
        setMultiplier(prev => {
          const next = prev + 0.01;
          if (next >= crashPoint) {
            setGameState('crashed');
            setHasActiveBet(false);
            clearInterval(interval);
            setTimeout(() => {
              setGameState('waiting');
              setWinAmount(0);
              startGame();
            }, 3000);
            return crashPoint;
          }
          return next;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [gameState, crashPoint]);

  useEffect(() => {
    if (gameState === 'waiting') {
      setTimeout(startGame, 2000);
    }
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = gameState === 'crashed' ? '#ef4444' : '#0ea5e9';
      ctx.lineWidth = 3;
      ctx.beginPath();

      const points = 100;
      for (let i = 0; i <= points; i++) {
        const x = (i / points) * canvas.width;
        const progress = Math.min(multiplier, crashPoint) - 1;
        const y = canvas.height - (progress / 10) * canvas.height * 0.8 - 20;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [multiplier, crashPoint, gameState]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold">Краш-игра</h2>
        <p className="text-muted-foreground">Следи за графиком и выводи в нужный момент!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-8 bg-card border-primary/20">
            <div className="text-center mb-4">
              <div className={`text-6xl font-bold ${gameState === 'crashed' ? 'text-destructive' : 'text-primary'}`}>
                {multiplier.toFixed(2)}x
              </div>
              {gameState === 'crashed' && (
                <div className="text-2xl font-bold text-destructive mt-2">
                  CRASHED!
                </div>
              )}
            </div>

            <canvas
              ref={canvasRef}
              width={800}
              height={300}
              className="w-full border border-border/40 rounded-lg bg-background/50"
            />

            <div className="mt-4 text-center text-sm text-muted-foreground">
              {gameState === 'waiting' && 'Следующая игра начнется через несколько секунд...'}
              {gameState === 'running' && hasActiveBet && 'Нажми "Забрать" чтобы получить выигрыш!'}
              {gameState === 'running' && !hasActiveBet && 'Игра идёт...'}
            </div>
          </Card>

          {winAmount > 0 && (
            <Card className="p-4 bg-primary/10 border-primary">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="TrendingUp" className="text-primary" size={24} />
                  <span className="font-bold">Выигрыш!</span>
                </div>
                <span className="text-2xl font-bold text-primary">+{winAmount} TON</span>
              </div>
            </Card>
          )}
        </div>

        <Card className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold mb-2 block">Сумма ставки</label>
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              disabled={hasActiveBet || gameState !== 'running'}
              className="text-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBetAmount(100)}
              disabled={hasActiveBet}
            >
              100
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBetAmount(500)}
              disabled={hasActiveBet}
            >
              500
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBetAmount(1000)}
              disabled={hasActiveBet}
            >
              1000
            </Button>
          </div>

          {!hasActiveBet ? (
            <Button
              onClick={placeBet}
              disabled={betAmount > balance || betAmount <= 0 || gameState !== 'running'}
              className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
            >
              <Icon name="Rocket" className="mr-2" size={20} />
              Сделать ставку
            </Button>
          ) : (
            <Button
              onClick={cashOut}
              disabled={gameState !== 'running'}
              className="w-full bg-destructive hover:bg-destructive/90 text-lg py-6"
            >
              <Icon name="HandCoins" className="mr-2" size={20} />
              Забрать {Math.floor(betAmount * multiplier)} TON
            </Button>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Потенциальный выигрыш:</span>
              <span className="font-bold text-primary">
                {hasActiveBet ? Math.floor(betAmount * multiplier) : betAmount * 2} TON
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ваш баланс:</span>
              <span className="font-bold">{balance.toLocaleString()} TON</span>
            </div>
          </div>

          <div className="pt-4 border-t border-border/40">
            <h4 className="font-semibold mb-2">Правила игры:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Множитель растёт от 1.00x</li>
              <li>• График может упасть в любой момент</li>
              <li>• Заберите выигрыш до краша</li>
              <li>• Чем выше риск, тем больше награда</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CrashGame;
