import { useState } from 'react';
import { useTonAddress } from '@tonconnect/ui-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
  onWithdraw: (amount: number) => void;
}

const WithdrawModal = ({ open, onOpenChange, balance, onWithdraw }: WithdrawModalProps) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const userFriendlyAddress = useTonAddress();
  const { toast } = useToast();

  const handleWithdraw = async () => {
    const withdrawAmount = Number(amount);
    
    if (!userFriendlyAddress) {
      toast({
        title: 'Кошелек не подключен',
        description: 'Подключите TON кошелек для вывода средств',
        variant: 'destructive',
      });
      return;
    }

    if (withdrawAmount < 100) {
      toast({
        title: 'Сумма слишком мала',
        description: 'Минимальная сумма вывода: 100 TON',
        variant: 'destructive',
      });
      return;
    }

    if (withdrawAmount > balance) {
      toast({
        title: 'Недостаточно средств',
        description: `Доступно: ${balance} TON`,
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('https://functions.poehali.dev/88a5acbe-a7b9-4af0-a8a3-cb1fb5dacfbf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user123',
          amount: withdrawAmount,
          walletAddress: userFriendlyAddress,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onWithdraw(withdrawAmount);
        toast({
          title: 'Заявка на вывод создана!',
          description: `${data.netAmount} TON будет отправлено на ваш кошелек через ${data.estimatedTime}`,
        });
        onOpenChange(false);
        setAmount('');
      } else {
        toast({
          title: 'Ошибка вывода',
          description: data.message || 'Попробуйте позже',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка сети',
        description: 'Не удалось отправить запрос',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const fee = Number(amount) > 0 ? Math.max(1, Math.floor(Number(amount) * 0.01)) : 0;
  const netAmount = Number(amount) > 0 ? Number(amount) - fee : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="ArrowDownToLine" size={24} className="text-primary" />
            Вывод средств
          </DialogTitle>
          <DialogDescription>
            Выведите TON на свой кошелек
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {userFriendlyAddress ? (
            <>
              <div className="space-y-2">
                <Label>Адрес кошелька</Label>
                <div className="p-3 bg-muted rounded-lg text-sm font-mono break-all">
                  {userFriendlyAddress}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Сумма вывода (TON)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="100"
                  max={balance}
                />
                <p className="text-xs text-muted-foreground">
                  Минимум: 100 TON • Доступно: {balance.toLocaleString()} TON
                </p>
              </div>

              {Number(amount) > 0 && (
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Сумма вывода:</span>
                    <span className="font-bold">{amount} TON</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Комиссия (1%):</span>
                    <span className="text-destructive">-{fee} TON</span>
                  </div>
                  <div className="h-px bg-border my-2"></div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Получите:</span>
                    <span className="font-bold text-primary text-lg">{netAmount} TON</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleWithdraw}
                disabled={!amount || Number(amount) < 100 || Number(amount) > balance || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Icon name="Loader2" className="mr-2 animate-spin" size={18} />
                    Обработка...
                  </>
                ) : (
                  <>
                    <Icon name="Send" className="mr-2" size={18} />
                    Вывести {netAmount || 0} TON
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="text-center py-8 space-y-4">
              <Icon name="Wallet" size={64} className="mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                Подключите TON кошелек для вывода средств
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawModal;
