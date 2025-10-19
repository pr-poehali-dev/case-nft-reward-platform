import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface UserProfileProps {
  balance: number;
  inventory: any[];
}

const UserProfile = ({ balance, inventory }: UserProfileProps) => {
  const totalValue = inventory.reduce((sum, item) => sum + item.value, 0);
  const rarityCount = {
    common: inventory.filter(i => i.rarity === 'common').length,
    rare: inventory.filter(i => i.rarity === 'rare').length,
    epic: inventory.filter(i => i.rarity === 'epic').length,
    legendary: inventory.filter(i => i.rarity === 'legendary').length,
  };

  const level = Math.floor(inventory.length / 5) + 1;
  const progressToNextLevel = (inventory.length % 5) * 20;

  const achievements = [
    { id: 1, name: 'Первый кейс', description: 'Открой первый кейс', unlocked: inventory.length >= 1, icon: 'Package' },
    { id: 2, name: 'Коллекционер', description: 'Собери 10 предметов', unlocked: inventory.length >= 10, icon: 'Backpack' },
    { id: 3, name: 'Легенда', description: 'Получи легендарный предмет', unlocked: rarityCount.legendary > 0, icon: 'Crown' },
    { id: 4, name: 'Богач', description: 'Накопи 50000 TON', unlocked: balance >= 50000, icon: 'Wallet' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold">Профиль игрока</h2>
        <p className="text-muted-foreground">Твоя статистика и достижения</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-3xl">
              🚀
            </div>
            <div>
              <h3 className="text-2xl font-bold">Игрок</h3>
              <Badge variant="outline" className="mt-1">Уровень {level}</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">До следующего уровня</span>
              <span className="font-semibold">{5 - (inventory.length % 5)} предметов</span>
            </div>
            <Progress value={progressToNextLevel} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{inventory.length}</div>
              <div className="text-sm text-muted-foreground">Предметов</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{totalValue.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Стоимость TON</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-bold">Статистика коллекции</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rarity-common"></div>
                <span>Common</span>
              </div>
              <Badge variant="outline">{rarityCount.common}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rarity-rare"></div>
                <span>Rare</span>
              </div>
              <Badge variant="outline">{rarityCount.rare}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rarity-epic"></div>
                <span>Epic</span>
              </div>
              <Badge variant="outline">{rarityCount.epic}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rarity-legendary"></div>
                <span>Legendary</span>
              </div>
              <Badge variant="outline">{rarityCount.legendary}</Badge>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-2xl font-bold mb-4">Достижения</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`p-4 ${achievement.unlocked ? 'bg-primary/10 border-primary' : 'opacity-50'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${achievement.unlocked ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <Icon name={achievement.icon as any} size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">{achievement.name}</h4>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
                {achievement.unlocked && (
                  <Icon name="Check" className="text-primary" size={24} />
                )}
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default UserProfile;
