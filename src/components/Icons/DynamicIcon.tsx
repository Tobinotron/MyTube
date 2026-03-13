import {
  Video,
  Gamepad2,
  Film,
  Music,
  BookOpen,
  Star,
  Heart,
  Folder,
  Smartphone,
  Zap,
  Plane,
  CookingPot,
  Brush,
  Puzzle,
  Flower,
  Mountain,
  Camera,
  Image,
} from 'lucide-react';
import { IconName } from '@/types/category';

type IconComponent = React.ComponentType<{ className?: string }>;

const iconRegistry: Record<IconName, IconComponent> = {
  'video-camera': Video,
  'game-controller': Gamepad2,
  'film': Film,
  'music': Music,
  'book': BookOpen,
  'star': Star,
  'heart': Heart,
  'folder': Folder,
  'smartphone': Smartphone,
  'zap': Zap,
  'plane': Plane,
  'cooking-pot': CookingPot,
  'brush': Brush,
  'puzzle': Puzzle,
  'flower': Flower,
  'mountain': Mountain,
  'camera': Camera,
  'image': Image,
};

export function DynamicIcon({ name, className }: { name: IconName; className?: string }) {
  const IconComponent = iconRegistry[name] || Folder;
  return <IconComponent className={className} />;
}
