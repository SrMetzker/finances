import type { LucideIcon } from 'lucide-react';
import {
  Wallet,
  Landmark,
  PiggyBank,
  CreditCard,
  Banknote,
  HandCoins,
  BriefcaseBusiness,
  TrendingUp,
  TrendingDown,
  CircleDollarSign,
  Receipt,
  FileText,
  ShoppingCart,
  ShoppingBag,
  Car,
  Bus,
  Train,
  House,
  Building2,
  Utensils,
  Coffee,
  HeartPulse,
  GraduationCap,
  Gamepad2,
  Plane,
  Fuel,
  Smartphone,
  Wifi,
  Shield,
  Gift,
  Dumbbell,
  Tag,
} from 'lucide-react';

export type VisualIconName =
  | 'wallet'
  | 'landmark'
  | 'piggy-bank'
  | 'credit-card'
  | 'banknote'
  | 'hand-coins'
  | 'briefcase-business'
  | 'trending-up'
  | 'trending-down'
  | 'circle-dollar-sign'
  | 'receipt'
  | 'file-text'
  | 'shopping-cart'
  | 'shopping-bag'
  | 'car'
  | 'bus'
  | 'train'
  | 'house'
  | 'building-2'
  | 'utensils'
  | 'coffee'
  | 'heart-pulse'
  | 'graduation-cap'
  | 'gamepad-2'
  | 'plane'
  | 'fuel'
  | 'smartphone'
  | 'wifi'
  | 'shield'
  | 'gift'
  | 'dumbbell'
  | 'tag';

export const ICON_COMPONENTS: Record<VisualIconName, LucideIcon> = {
  wallet: Wallet,
  landmark: Landmark,
  'piggy-bank': PiggyBank,
  'credit-card': CreditCard,
  banknote: Banknote,
  'hand-coins': HandCoins,
  'briefcase-business': BriefcaseBusiness,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'circle-dollar-sign': CircleDollarSign,
  receipt: Receipt,
  'file-text': FileText,
  'shopping-cart': ShoppingCart,
  'shopping-bag': ShoppingBag,
  car: Car,
  bus: Bus,
  train: Train,
  house: House,
  'building-2': Building2,
  utensils: Utensils,
  coffee: Coffee,
  'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap,
  'gamepad-2': Gamepad2,
  plane: Plane,
  fuel: Fuel,
  smartphone: Smartphone,
  wifi: Wifi,
  shield: Shield,
  gift: Gift,
  dumbbell: Dumbbell,
  tag: Tag,
};

export const ICON_OPTIONS: Array<{ id: VisualIconName; label: string }> = [
  { id: 'wallet', label: 'Carteira' },
  { id: 'landmark', label: 'Banco' },
  { id: 'piggy-bank', label: 'Poupança' },
  { id: 'credit-card', label: 'Cartão' },
  { id: 'banknote', label: 'Dinheiro' },
  { id: 'hand-coins', label: 'Pagamento' },
  { id: 'briefcase-business', label: 'Trabalho' },
  { id: 'trending-up', label: 'Investimento alta' },
  { id: 'trending-down', label: 'Investimento baixa' },
  { id: 'circle-dollar-sign', label: 'Financeiro' },
  { id: 'receipt', label: 'Recibo' },
  { id: 'file-text', label: 'Documento' },
  { id: 'shopping-cart', label: 'Mercado' },
  { id: 'shopping-bag', label: 'Compras' },
  { id: 'car', label: 'Carro' },
  { id: 'bus', label: 'Onibus' },
  { id: 'train', label: 'Trem' },
  { id: 'house', label: 'Casa' },
  { id: 'building-2', label: 'Imovel' },
  { id: 'utensils', label: 'Alimentacao' },
  { id: 'coffee', label: 'Cafe' },
  { id: 'heart-pulse', label: 'Saude' },
  { id: 'graduation-cap', label: 'Educacao' },
  { id: 'gamepad-2', label: 'Lazer' },
  { id: 'plane', label: 'Viagem' },
  { id: 'fuel', label: 'Combustivel' },
  { id: 'smartphone', label: 'Telefone' },
  { id: 'wifi', label: 'Internet' },
  { id: 'shield', label: 'Seguro' },
  { id: 'gift', label: 'Presente' },
  { id: 'dumbbell', label: 'Esporte' },
  { id: 'tag', label: 'Categoria' },
];

export const COLOR_OPTIONS = [
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#EAB308',
  '#84CC16',
  '#22C55E',
  '#10B981',
  '#14B8A6',
  '#06B6D4',
  '#0EA5E9',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#A855F7',
  '#D946EF',
  '#EC4899',
  '#F43F5E',
  '#64748B',
] as const;

export const DEFAULT_ACCOUNT_ICON: VisualIconName = 'wallet';
export const DEFAULT_ACCOUNT_COLOR = '#EF4444';
export const DEFAULT_CATEGORY_ICON: VisualIconName = 'tag';
export const DEFAULT_CATEGORY_COLOR = '#6366F1';

export function getIconComponent(iconName: string | null | undefined): LucideIcon {
  if (!iconName) {
    return ICON_COMPONENTS.wallet;
  }

  return ICON_COMPONENTS[(iconName as VisualIconName) ?? 'wallet'] ?? ICON_COMPONENTS.wallet;
}

export function alphaHex(hexColor: string, alphaHexValue: string) {
  if (!hexColor || !hexColor.startsWith('#') || hexColor.length !== 7) {
    return '#64748B22';
  }

  return `${hexColor}${alphaHexValue}`;
}
