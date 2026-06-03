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
  PenLine,
  Calendar,
  FileText,
  ShoppingCart,
  ShoppingBag,
  Car,
  Bus,
  Train,
  House,
  Church,
  Building2,
  Utensils,
  Coffee,
  HeartPulse,
  GraduationCap,
  Gamepad2,
  Fuel,
  Smartphone,
  Wifi,
  Shield,
  Gift,
  Dumbbell,
  Tag,
  Coins,
  Calculator,
  BarChart3,
  PieChart,
  Handshake,
  Luggage,
  MapPin,
  Navigation,
  Globe,
  Camera,
  BaggageClaim,
  Ticket,
  Bike,
  Ship,
  PlaneTakeoff,
  Music,
  Film,
  Popcorn,
  PartyPopper,
  BookOpen,
  Tv,
  Puzzle,
  Beer,
  Home,
  Sofa,
  BedDouble,
  Bath,
  Wrench,
  Lightbulb,
  KeyRound,
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
  | 'pen-line'
  | 'calendar'
  | 'file-text'
  | 'shopping-cart'
  | 'shopping-bag'
  | 'car'
  | 'bus'
  | 'train'
  | 'house'
  | 'church'
  | 'building-2'
  | 'utensils'
  | 'coffee'
  | 'heart-pulse'
  | 'graduation-cap'
  | 'gamepad-2'
  | 'fuel'
  | 'smartphone'
  | 'wifi'
  | 'shield'
  | 'gift'
  | 'dumbbell'
  | 'tag'
  | 'coins'
  | 'calculator'
  | 'bar-chart-3'
  | 'pie-chart'
  | 'handshake'
  | 'luggage'
  | 'map-pin'
  | 'navigation'
  | 'globe'
  | 'camera'
  | 'baggage-claim'
  | 'ticket'
  | 'bike'
  | 'ship'
  | 'plane-takeoff'
  | 'music'
  | 'film'
  | 'popcorn'
  | 'party-popper'
  | 'book-open'
  | 'tv'
  | 'puzzle'
  | 'beer'
  | 'home'
  | 'sofa'
  | 'bed-double'
  | 'bath'
  | 'wrench'
  | 'lightbulb'
  | 'key-round';

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
  calendar: Calendar,
  'pen-line': PenLine,
  'file-text': FileText,
  'shopping-cart': ShoppingCart,
  'shopping-bag': ShoppingBag,
  car: Car,
  bus: Bus,
  train: Train,
  house: House,
  church: Church,
  'building-2': Building2,
  utensils: Utensils,
  coffee: Coffee,
  'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap,
  'gamepad-2': Gamepad2,
  fuel: Fuel,
  smartphone: Smartphone,
  wifi: Wifi,
  shield: Shield,
  gift: Gift,
  dumbbell: Dumbbell,
  tag: Tag,
  coins: Coins,
  calculator: Calculator,
  'bar-chart-3': BarChart3,
  'pie-chart': PieChart,
  handshake: Handshake,
  luggage: Luggage,
  'map-pin': MapPin,
  navigation: Navigation,
  globe: Globe,
  camera: Camera,
  'baggage-claim': BaggageClaim,
  ticket: Ticket,
  bike: Bike,
  ship: Ship,
  'plane-takeoff': PlaneTakeoff,
  music: Music,
  film: Film,
  popcorn: Popcorn,
  'party-popper': PartyPopper,
  'book-open': BookOpen,
  tv: Tv,
  puzzle: Puzzle,
  beer: Beer,
  home: Home,
  sofa: Sofa,
  'bed-double': BedDouble,
  bath: Bath,
  wrench: Wrench,
  lightbulb: Lightbulb,
  'key-round': KeyRound,
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
  { id: 'pen-line', label: 'Assinatura' },
  { id: 'calendar', label: 'Calendário' },
  { id: 'file-text', label: 'Documento' },
  { id: 'shopping-cart', label: 'Mercado' },
  { id: 'shopping-bag', label: 'Compras' },
  { id: 'car', label: 'Carro' },
  { id: 'bus', label: 'Onibus' },
  { id: 'train', label: 'Trem' },
  { id: 'house', label: 'Casa' },
  { id: 'church', label: 'Igreja' },
  { id: 'building-2', label: 'Imovel' },
  { id: 'utensils', label: 'Alimentacao' },
  { id: 'coffee', label: 'Cafe' },
  { id: 'heart-pulse', label: 'Saude' },
  { id: 'graduation-cap', label: 'Educacao' },
  { id: 'gamepad-2', label: 'Lazer' },
  { id: 'fuel', label: 'Combustivel' },
  { id: 'smartphone', label: 'Telefone' },
  { id: 'wifi', label: 'Internet' },
  { id: 'shield', label: 'Seguro' },
  { id: 'gift', label: 'Presente' },
  { id: 'dumbbell', label: 'Esporte' },
  { id: 'tag', label: 'Categoria' },
  { id: 'coins', label: 'Moedas' },
  { id: 'calculator', label: 'Calculadora' },
  { id: 'bar-chart-3', label: 'Grafico de barras' },
  { id: 'pie-chart', label: 'Grafico pizza' },
  { id: 'handshake', label: 'Acordo' },
  { id: 'luggage', label: 'Bagagem' },
  { id: 'map-pin', label: 'Localizacao' },
  { id: 'navigation', label: 'Navegacao' },
  { id: 'globe', label: 'Mundo' },
  { id: 'camera', label: 'Camera' },
  { id: 'baggage-claim', label: 'Esteira bagagem' },
  { id: 'ticket', label: 'Passagem' },
  { id: 'bike', label: 'Bicicleta' },
  { id: 'ship', label: 'Navio' },
  { id: 'plane-takeoff', label: 'Decolagem' },
  { id: 'music', label: 'Musica' },
  { id: 'film', label: 'Filme' },
  { id: 'popcorn', label: 'Pipoca' },
  { id: 'party-popper', label: 'Festa' },
  { id: 'book-open', label: 'Livro' },
  { id: 'tv', label: 'TV' },
  { id: 'puzzle', label: 'Quebra-cabeca' },
  { id: 'beer', label: 'Cerveja' },
  { id: 'home', label: 'Lar' },
  { id: 'sofa', label: 'Sofa' },
  { id: 'bed-double', label: 'Quarto' },
  { id: 'bath', label: 'Banheiro' },
  { id: 'wrench', label: 'Manutencao' },
  { id: 'lightbulb', label: 'Energia' },
  { id: 'key-round', label: 'Chaves' },
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
