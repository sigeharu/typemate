// 🎵 TypeMate Optimized Icons
// Context7推奨: lucide-react の最適化インポート

// 🚀 パフォーマンス最適化: 必要なアイコンのみインポート
// Context7情報: 「Instead of this: import { TriangleIcon } from '@phosphor-icons/react'
//              Do this: import { TriangleIcon } from '@phosphor-icons/react/dist/csr/Triangle'」

// TypeMateで使用されているアイコンを効率的にインポート
export {
  // 基本UI
  ArrowRight,
  ArrowLeft,
  X,
  Menu,
  Settings,
  User,
  Heart,
  
  // 機能アイコン
  Brain,
  Sparkles,
  Wand2,
  Music,
  Clock,
  Calendar,
  Search,
  
  // ステータス
  Check,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  
  // データ・分析
  BarChart3,
  Target,
  Eye,
  Zap,
  
  // インタラクション
  Send,
  Mic,
  Image,
  Plus,
  Minus,
  
  // ナビゲーション
  Home,
  Users,
  MessageCircle,
  
  // ソーシャル・外部
  Github,
  Twitter,
  ExternalLink,
} from 'lucide-react';

// 🎼 音楽的なアイコンエイリアス（TypeMate専用）
export { Music as MusicalNote } from 'lucide-react';
export { Brain as Intelligence } from 'lucide-react';
export { Heart as Affection } from 'lucide-react';
export { Sparkles as Magic } from 'lucide-react';

// 🔮 占星術・スピリチュアル用アイコン
export {
  Moon,
  Sun,
  Star,
  Stars,
  Compass,
  Globe,
  Telescope,
} from 'lucide-react';

// 📊 診断・分析用アイコン
export {
  Activity,
  TrendingUp,
  PieChart,
  BarChart,
  LineChart,
} from 'lucide-react';

// 🛡️ プライバシー・セキュリティ
export {
  Shield,
  Lock,
  Unlock,
  Key,
  Database,
} from 'lucide-react';

// 📱 デバイス・インタラクション
export {
  Smartphone,
  Monitor,
  Tablet,
  Volume2,
  VolumeX,
} from 'lucide-react';

// 🎨 UI状態
export {
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
} from 'lucide-react';

// 💡 Context7情報に基づく使用ガイド
/*
使用例:
import { Heart, Brain, Sparkles } from '@/lib/optimized-icons';

代わりに以下を避ける:
import { Heart, Brain, Sparkles } from 'lucide-react'; // 全体インポート

パフォーマンス向上:
- Tree shaking最適化
- Bundle size削減
- 初期ロード時間短縮
- next.config.js のoptimizePackageImportsと連携
*/