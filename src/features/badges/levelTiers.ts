import { Ionicons } from '@expo/vector-icons';

type IoniconName = keyof typeof Ionicons.glyphMap;

export interface LevelBenefit {
  icon: IoniconName;
  textKey: string;
}

export interface LevelTier {
  rangeStart: number;
  rangeEnd: number;
  titleKey: string;
  icon: IoniconName;
  color: string;
  benefits: LevelBenefit[];
}

export const LEVEL_TIERS: LevelTier[] = [
  {
    rangeStart: 1,
    rangeEnd: 2,
    titleKey: 'badge.level.newcomer',
    icon: 'leaf',
    color: '#43A047',
    benefits: [
      { icon: 'medal', textKey: 'badge.level.perk.founderBadge' },
      { icon: 'bar-chart', textKey: 'badge.level.perk.basicStats' },
    ],
  },
  {
    rangeStart: 3,
    rangeEnd: 6,
    titleKey: 'badge.level.youth',
    icon: 'book',
    color: '#1E88E5',
    benefits: [
      { icon: 'grid', textKey: 'badge.level.perk.wall3' },
      { icon: 'share-outline', textKey: 'badge.level.perk.shareCard' },
      { icon: 'flag', textKey: 'badge.level.perk.readingGoal' },
    ],
  },
  {
    rangeStart: 7,
    rangeEnd: 10,
    titleKey: 'badge.level.expert',
    icon: 'star',
    color: '#FB8C00',
    benefits: [
      { icon: 'grid', textKey: 'badge.level.perk.wall6' },
      { icon: 'color-palette', textKey: 'badge.level.perk.shareStyles3' },
      { icon: 'chatbubble', textKey: 'badge.level.perk.agoraLevel' },
    ],
  },
  {
    rangeStart: 11,
    rangeEnd: 15,
    titleKey: 'badge.level.voyager',
    icon: 'boat',
    color: '#00ACC1',
    benefits: [
      { icon: 'person-circle', textKey: 'badge.level.perk.avatarFrame' },
      { icon: 'grid', textKey: 'badge.level.perk.wall9' },
      { icon: 'color-palette', textKey: 'badge.level.perk.shareStylesAll' },
    ],
  },
  {
    rangeStart: 16,
    rangeEnd: 20,
    titleKey: 'badge.level.walker',
    icon: 'walk',
    color: '#8E24AA',
    benefits: [
      { icon: 'sparkles', textKey: 'badge.level.perk.particleEffect' },
      { icon: 'ribbon', textKey: 'badge.level.perk.agoraBadge' },
      { icon: 'brush', textKey: 'badge.level.perk.profileColor' },
    ],
  },
  {
    rangeStart: 21,
    rangeEnd: 30,
    titleKey: 'badge.level.master',
    icon: 'trophy',
    color: '#FDD835',
    benefits: [
      { icon: 'document-text', textKey: 'badge.level.perk.annualTemplate' },
      { icon: 'diamond', textKey: 'badge.level.perk.diamondFrame' },
      { icon: 'grid', textKey: 'badge.level.perk.wallUnlimited' },
    ],
  },
  {
    rangeStart: 31,
    rangeEnd: 50,
    titleKey: 'badge.level.grandmaster',
    icon: 'business',
    color: '#E53935',
    benefits: [
      { icon: 'star-half', textKey: 'badge.level.perk.legendFrame' },
      { icon: 'text', textKey: 'badge.level.perk.goldName' },
      { icon: 'infinite', textKey: 'badge.level.perk.allPerks' },
    ],
  },
];

export function getCurrentTier(level: number): LevelTier | undefined {
  return LEVEL_TIERS.find(
    (tier) => level >= tier.rangeStart && level <= tier.rangeEnd
  );
}

export function isTierUnlocked(level: number, tier: LevelTier): boolean {
  return level >= tier.rangeStart;
}

export function isTierCurrent(level: number, tier: LevelTier): boolean {
  return level >= tier.rangeStart && level <= tier.rangeEnd;
}
