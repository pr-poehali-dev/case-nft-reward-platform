import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CaseItem {
  name: string;
  rarity: string;
  value: number;
}

interface CaseData {
  id: number;
  name: string;
  price: number;
  rarity: string;
  image: string;
  items: CaseItem[];
}

interface CaseCardProps {
  caseData: CaseData;
  onOpen: (caseData: CaseData, wonItem: CaseItem) => void;
  balance: number;
}

const CaseCard = ({ caseData, onOpen, balance }: CaseCardProps) => {
  const [isOpening, setIsOpening] = useState(false);
  const [wonItem, setWonItem] = useState<CaseItem | null>(null);
  const [showResult, setShowResult] = useState(false);

  const canAfford = balance >= caseData.price;

  const handleOpen = () => {
    if (!canAfford) return;

    setIsOpening(true);

    setTimeout(() => {
      const randomItem = caseData.items[Math.floor(Math.random() * caseData.items.length)];
      setWonItem(randomItem);
      onOpen(caseData, randomItem);
      setIsOpening(false);
      setShowResult(true);
    }, 2000);
  };

  return (
    <>
      <Card className={`p-6 gradient-${caseData.rarity} border-rarity-${caseData.rarity} hover:scale-105 transition-all duration-300 ${isOpening ? 'animate-pulse' : ''}`}>
        <div className="text-center space-y-4">
          <div className={`text-6xl mb-4 ${isOpening ? 'animate-spin-slow' : ''}`}>
            {caseData.image}
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{caseData.name}</h3>
            <Badge className={`bg-rarity-${caseData.rarity} text-white border-0`}>
              {caseData.rarity}
            </Badge>
          </div>

          <div className="flex items-center justify-center gap-2 text-white font-bold text-lg">
            <Icon name="Coins" size={20} />
            <span>{caseData.price} TON</span>
          </div>

          <Button
            onClick={handleOpen}
            disabled={!canAfford || isOpening}
            className="w-full bg-white text-black hover:bg-white/90 font-bold"
          >
            {isOpening ? (
              <>
                <Icon name="Loader2" className="mr-2 animate-spin" size={18} />
                Открытие...
              </>
            ) : !canAfford ? (
              'Недостаточно средств'
            ) : (
              'Открыть кейс'
            )}
          </Button>

          <div className="text-xs text-white/80">
            Содержит {caseData.items.length} предметов
          </div>
        </div>
      </Card>

      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">Поздравляем!</DialogTitle>
            <DialogDescription className="text-center">
              Вы получили новый предмет
            </DialogDescription>
          </DialogHeader>
          
          {wonItem && (
            <div className="space-y-4 py-4">
              <div className={`gradient-${wonItem.rarity} rounded-lg p-8 animate-float`}>
                <div className="text-6xl text-center animate-glow">🎁</div>
              </div>
              
              <div className="text-center space-y-2">
                <Badge className={`bg-rarity-${wonItem.rarity} text-white border-0`}>
                  {wonItem.rarity}
                </Badge>
                <h3 className="text-xl font-bold">{wonItem.name}</h3>
                <p className="text-2xl font-bold text-primary">{wonItem.value} TON</p>
              </div>

              <Button
                onClick={() => setShowResult(false)}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Отлично!
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CaseCard;
