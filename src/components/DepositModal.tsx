import { useState } from 'react';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeposit: (amount: number) => void;
}

const DepositModal = ({ open, onOpenChange, onDeposit }: DepositModalProps) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const userFriendlyAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const { toast } = useToast();

  const PLATFORM_WALLET = 'UQBvHqhqW-fV9c8LRMn2KF8KZqVQNd0VWLNMa8RqZNXzDtWe';

  const handleDeposit = async () => {
    const depositAmount = Number(amount);
    
    if (!userFriendlyAddress) {
      toast({
        title: 'Кошелек не подключен',
        description: 'Подключите TON кошелек для пополнения',
        variant: 'destructive',
      });
      return;
    }

    if (depositAmount < 10) {
      toast({
        title: 'Сумма слишком мала',
        description: 'Минимальная сумма пополнения: 10 TON',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
          {
            address: PLATFORM_WALLET,
            amount: (depositAmount * 1000000000).toString(),
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(transaction);
      
      const response = await fetch('https://functions.poehali.dev/1ea745e7-c74d-4045-941f-5356a0dc4def', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: userFriendlyAddress,
          amount: depositAmount,
          tx_hash: result.boc,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onDeposit(depositAmount);
        toast({
          title: 'Пополнение успешно!',
          description: `${depositAmount} TON зачислено на баланс`,
        });
        onOpenChange(false);
        setAmount('');
      } else {
        toast({
          title: 'Ошибка пополнения',
          description: data.message || 'Попробуйте позже',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      if (error?.message?.includes('Wallet declined')) {
        toast({
          title: 'Транзакция отменена',
          description: 'Вы отклонили транзакцию в кошельке',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Ошибка транзакции',
          description: 'Не удалось отправить TON',
          variant: 'destructive',
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const quickAmounts = [10, 50, 100, 500];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Plus" size={24} className="text-primary" />
            Пополнение баланса
          </DialogTitle>
          <DialogDescription>
            Пополните баланс через TON кошелек
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {userFriendlyAddress ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="deposit-amount">Сумма пополнения (TON)</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  placeholder="10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="10"
                />
                <p className="text-xs text-muted-foreground">
                  Минимум: 10 TON
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((amt) => (
                  <Button
                    key={amt}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(amt.toString())}
                  >
                    {amt}
                  </Button>
                ))}
              </div>

              {Number(amount) >= 10 && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">К оплате:</span>
                    <span className="font-bold text-lg text-primary">{amount} TON</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Средства поступят мгновенно после подтверждения транзакции
                  </p>
                </div>
              )}

              <Button
                onClick={handleDeposit}
                disabled={!amount || Number(amount) < 10 || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Icon name="Loader2" className="mr-2 animate-spin" size={18} />
                    Обработка...
                  </>
                ) : (
                  <>
                    <Icon name="Wallet" className="mr-2" size={18} />
                    Пополнить на {amount || 0} TON
                  </>
                )}
              </Button>

              <div className="pt-4 border-t border-border/40">
                <p className="text-xs text-muted-foreground text-center">
                  Транзакция будет выполнена через ваш TON кошелек.<br />
                  Комиссия сети оплачивается отдельно.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8 space-y-4">
              <Icon name="Wallet" size={64} className="mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                Подключите TON кошелек для пополнения
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DepositModal;
