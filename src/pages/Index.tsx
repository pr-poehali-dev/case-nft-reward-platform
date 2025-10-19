import { useState } from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import CaseCard from '@/components/CaseCard';
import CrashGame from '@/components/CrashGame';
import UserProfile from '@/components/UserProfile';
import WithdrawModal from '@/components/WithdrawModal';

const Index = () => {
  const [activeTab, setActiveTab] = useState('cases');
  const [balance, setBalance] = useState(10000);
  const [inventory, setInventory] = useState<any[]>([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const cases = [
    {
      id: 1,
      name: 'Starter Case',
      price: 100,
      rarity: 'common',
      image: '🎁',
      items: [
        { name: 'Common NFT #1', rarity: 'common', value: 50 },
        { name: 'Common NFT #2', rarity: 'common', value: 80 },
        { name: 'Rare NFT #1', rarity: 'rare', value: 150 },
      ]
    },
    {
      id: 2,
      name: 'Premium Case',
      price: 500,
      rarity: 'rare',
      image: '💎',
      items: [
        { name: 'Rare NFT #2', rarity: 'rare', value: 300 },
        { name: 'Epic NFT #1', rarity: 'epic', value: 800 },
        { name: 'Epic NFT #2', rarity: 'epic', value: 1200 },
      ]
    },
    {
      id: 3,
      name: 'Elite Case',
      price: 2000,
      rarity: 'epic',
      image: '👑',
      items: [
        { name: 'Epic NFT #3', rarity: 'epic', value: 1500 },
        { name: 'Legendary NFT #1', rarity: 'legendary', value: 5000 },
        { name: 'Legendary NFT #2', rarity: 'legendary', value: 8000 },
      ]
    },
    {
      id: 4,
      name: 'God Case',
      price: 10000,
      rarity: 'legendary',
      image: '⚡',
      items: [
        { name: 'Legendary NFT #3', rarity: 'legendary', value: 15000 },
        { name: 'Legendary NFT #4', rarity: 'legendary', value: 25000 },
        { name: 'Mythic NFT #1', rarity: 'legendary', value: 50000 },
      ]
    },
  ];

  const handleCaseOpen = (caseItem: any, wonItem: any) => {
    setBalance(prev => prev - caseItem.price);
    setInventory(prev => [...prev, wonItem]);
  };

  const handleWithdraw = (amount: number) => {
    setBalance(prev => prev - amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 dark">
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-3xl">🚀</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                NFT Cases
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Card className="px-4 py-2 bg-card/80 border-primary/20">
                <div className="flex items-center gap-2">
                  <Icon name="Wallet" className="text-primary" size={20} />
                  <span className="font-bold text-foreground">{balance.toLocaleString()}</span>
                  <span className="text-muted-foreground text-sm">TON</span>
                </div>
              </Card>
              <Button 
                variant="outline" 
                className="border-primary/20 text-primary hover:bg-primary/10"
                onClick={() => setShowWithdrawModal(true)}
              >
                <Icon name="ArrowDownToLine" className="mr-2" size={18} />
                Вывести
              </Button>
              <TonConnectButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 bg-card/50 border border-border/40">
            <TabsTrigger value="cases" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Package" size={18} className="mr-2" />
              Кейсы
            </TabsTrigger>
            <TabsTrigger value="crash" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="TrendingUp" size={18} className="mr-2" />
              Краш
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Backpack" size={18} className="mr-2" />
              Инвентарь
            </TabsTrigger>
            <TabsTrigger value="shop" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Store" size={18} className="mr-2" />
              Магазин
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="User" size={18} className="mr-2" />
              Профиль
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-bold">Открывай кейсы</h2>
              <p className="text-muted-foreground">Получай уникальные NFT подарки с разной редкостью</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cases.map((caseItem) => (
                <CaseCard
                  key={caseItem.id}
                  caseData={caseItem}
                  onOpen={handleCaseOpen}
                  balance={balance}
                />
              ))}
            </div>

            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-4">Редкость предметов</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 gradient-common border-rarity-common">
                  <Badge className="w-full justify-center bg-rarity-common text-white border-0">Common</Badge>
                  <p className="text-center mt-2 text-sm text-muted-foreground">50-100 TON</p>
                </Card>
                <Card className="p-4 gradient-rare border-rarity-rare">
                  <Badge className="w-full justify-center bg-rarity-rare text-white border-0">Rare</Badge>
                  <p className="text-center mt-2 text-sm text-muted-foreground">150-500 TON</p>
                </Card>
                <Card className="p-4 gradient-epic border-rarity-epic">
                  <Badge className="w-full justify-center bg-rarity-epic text-white border-0">Epic</Badge>
                  <p className="text-center mt-2 text-sm text-muted-foreground">800-2000 TON</p>
                </Card>
                <Card className="p-4 gradient-legendary border-rarity-legendary">
                  <Badge className="w-full justify-center bg-rarity-legendary text-white border-0">Legendary</Badge>
                  <p className="text-center mt-2 text-sm text-muted-foreground">5000+ TON</p>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="crash">
            <CrashGame balance={balance} setBalance={setBalance} />
          </TabsContent>

          <TabsContent value="inventory">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-bold">Твой инвентарь</h2>
                <p className="text-muted-foreground">Всего предметов: {inventory.length}</p>
              </div>

              {inventory.length === 0 ? (
                <Card className="p-12 text-center">
                  <Icon name="PackageOpen" size={64} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-xl text-muted-foreground">Инвентарь пуст</p>
                  <p className="text-sm text-muted-foreground mt-2">Открой кейс, чтобы получить первый NFT!</p>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {inventory.map((item, idx) => (
                    <Card key={idx} className={`p-4 border-rarity-${item.rarity} hover:scale-105 transition-transform`}>
                      <div className={`gradient-${item.rarity} rounded-lg p-6 mb-3`}>
                        <div className="text-4xl text-center">🎁</div>
                      </div>
                      <Badge className={`w-full justify-center bg-rarity-${item.rarity} text-white border-0 mb-2`}>
                        {item.rarity}
                      </Badge>
                      <p className="font-semibold text-sm text-center">{item.name}</p>
                      <p className="text-center text-primary font-bold">{item.value} TON</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="shop">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-bold">Магазин улучшений</h2>
                <p className="text-muted-foreground">Улучшай свои NFT и получай больше наград</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-primary/20 hover:border-primary transition-colors">
                  <Icon name="Zap" size={48} className="mx-auto text-primary mb-4" />
                  <h3 className="text-xl font-bold text-center mb-2">Быстрое открытие</h3>
                  <p className="text-muted-foreground text-center mb-4">Открывай кейсы в 2 раза быстрее</p>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Купить за 500 TON
                  </Button>
                </Card>

                <Card className="p-6 border-primary/20 hover:border-primary transition-colors">
                  <Icon name="Star" size={48} className="mx-auto text-primary mb-4" />
                  <h3 className="text-xl font-bold text-center mb-2">Удача +10%</h3>
                  <p className="text-muted-foreground text-center mb-4">Повышает шанс редких предметов</p>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Купить за 1000 TON
                  </Button>
                </Card>

                <Card className="p-6 border-primary/20 hover:border-primary transition-colors">
                  <Icon name="ArrowUpCircle" size={48} className="mx-auto text-primary mb-4" />
                  <h3 className="text-xl font-bold text-center mb-2">Улучшение NFT</h3>
                  <p className="text-muted-foreground text-center mb-4">Повысь редкость любого предмета</p>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    От 2000 TON
                  </Button>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <UserProfile balance={balance} inventory={inventory} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border/40 mt-16 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 NFT Cases. Игровая платформа с NFT наградами</p>
        </div>
      </footer>

      <WithdrawModal
        open={showWithdrawModal}
        onOpenChange={setShowWithdrawModal}
        balance={balance}
        onWithdraw={handleWithdraw}
      />
    </div>
  );
};

export default Index;