import {
  SmartphoneIcon,
  LaptopIcon,
  ShirtIcon,
  SofaIcon,
  SparkleIcon,
  PlugIcon,
  DumbbellIcon,
  BookIcon,
  ToyIcon,
  BasketIcon,
  TagIcon,
} from '@/components/ui/Icons';

const MAP: Record<string, typeof TagIcon> = {
  mobiles: SmartphoneIcon,
  electronics: LaptopIcon,
  fashion: ShirtIcon,
  'home & furniture': SofaIcon,
  beauty: SparkleIcon,
  appliances: PlugIcon,
  'sports & fitness': DumbbellIcon,
  books: BookIcon,
  'toys & baby': ToyIcon,
  grocery: BasketIcon,
};

/** Falls back to a generic tag icon for any category not in the map above. */
export function getCategoryIcon(category: string) {
  return MAP[category.trim().toLowerCase()] ?? TagIcon;
}
