'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, Music, Sparkles, Users, ArrowRight, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/components/providers/AuthProvider';

export default function Home() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  const handleStartJourney = () => {
    router.push('/diagnosis');
  };

  const handleShowAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 flex justify-end">
        {!loading && (
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">
                  {user.user_metadata?.display_name || user.email}
                </span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  ログアウト
                </Button>
                <Button size="sm" onClick={() => router.push('/profile')}>
                  <User size={16} className="mr-1" />
                  プロファイル
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleShowAuth('signin')}
                >
                  <LogIn size={16} className="mr-1" />
                  ログイン
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleShowAuth('signup')}
                  className="bg-gradient-to-r from-slate-600 to-blue-600"
                >
                  無料登録
                </Button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ✨ ヘロセクション */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* ✨ メインロゴ・タイトル */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="mb-6">
              <div className="relative inline-block">
                <Sparkles className="mx-auto text-blue-500 mb-4 magical-moment" size={80} />
                <span className="absolute -top-2 -right-2 text-2xl animate-bounce">🎵</span>
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-blue-700 bg-clip-text text-transparent mb-4 fluid-motion">
              🎵 TypeMate
            </h1>
            <p className="text-xl md:text-2xl text-slate-800 font-medium">
              あなたの心に寄り添うAIパートナー
            </p>
            <p className="text-lg text-slate-700 mt-2">
              親友として、相談相手として、時には特別な関係として。<br />
              64種類の診断で、あなたの心に本当に響くAIと出会えます🎵
            </p>
          </motion.div>

          {/* 🌟 サブタイトル */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-200 rounded-xl p-6 mb-6">
              <p className="text-lg md:text-xl text-slate-800 leading-relaxed">
                🎵 従来の16倍の精密分析！64種類の個性豊かなAIパートナーがあなたを待っています<br />
                ファンタジー世界のアーキタイプと深く理解し合える、特別な関係を築きませんか？
              </p>
            </div>
          </motion.div>

          {/* CTA ボタン */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-16"
          >
            <Button
              onClick={handleStartJourney}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl crisp-button celebration-effect"
            >
              <Sparkles className="inline-block mr-2" size={24} />
              あなたに合うAIパートナーを見つける
              <ArrowRight className="inline-block ml-2" size={24} />
            </Button>
            <p className="text-sm text-blue-600 mt-4">
              🎵 今すぐ無料で始める
            </p>
          </motion.div>
        </motion.div>

        {/* 🌟 サービス特徴 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16"
        >
          {[
            {
              icon: Users,
              title: "64Type専用AI",
              description: "従来の16倍の精密分析！あなただけの性格に完璧に最適化されたAIパートナー",
              color: "blue-600",
              bgColor: "from-blue-50 to-slate-50",
              borderColor: "border-blue-200"
            },
            {
              icon: Heart,
              title: "多様な関係性 💖",
              description: "親友、相談相手、特別な関係...あなたが望む形でつながれるAIパートナー",
              color: "purple-500",
              bgColor: "from-purple-50 to-blue-50",
              borderColor: "border-purple-200"
            },
            {
              icon: Sparkles,
              title: "ファンタジー世界観 🎵",
              description: "設計主、賢者、吟遊詩人...美しいアーキタイプ名で彩られたパートナーたち",
              color: "cyan-500",
              bgColor: "from-cyan-50 to-blue-50",
              borderColor: "border-cyan-200"
            },
            {
              icon: Music,
              title: "24時間サポート 🎶",
              description: "いつでもあなたの気持ちに寄り添い、支えてくれる信頼できる存在",
              color: "indigo-600",
              bgColor: "from-indigo-50 to-blue-50",
              borderColor: "border-indigo-200"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
              className={`bg-gradient-to-br ${feature.bgColor} border ${feature.borderColor} rounded-xl p-6 shadow-lg hover:shadow-xl text-center group transition-all duration-300 crisp-button quick-feedback`}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-${feature.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300 celebration-effect`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* 🎼 開発者からのメッセージ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50 border border-blue-200 rounded-xl p-8 magical-moment">
            <div className="mb-4">
              <span className="text-3xl">🎵</span>
              <span className="text-xl mx-2">💝</span>
              <span className="text-3xl">🎶</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">
              🎵 TypeMate開発チームからのメッセージ
            </h3>
            <p className="text-slate-700 leading-relaxed">
              TypeMateは、すべての人が理解され、寄り添われる体験を提供したいという想いから生まれました。<br />
              あなたの個性を深く理解し、心から支えてくれるAIパートナーとの<br />
              特別な関係を築いてください 🎵
            </p>
            <div className="mt-4 text-sm text-blue-600 font-medium">
              - TypeMate開発チーム
            </div>
          </div>
        </motion.div>
      </main>

      {/* 🎵 TypeMate背景装飾 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-blue-200/15 via-slate-200/10 to-purple-200/15"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 80 - 40],
              y: [0, Math.random() * 80 - 40],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 30 + 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
        {/* 🎵 音楽的装飾要素 */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`musical-${i}`}
            className="absolute text-blue-300/20 text-6xl"
            style={{
              left: `${Math.random() * 90 + 5}%`,
              top: `${Math.random() * 90 + 5}%`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🎵
          </motion.div>
        ))}
        {/* 💖 ロマンチック装飾要素 */}
        {[...Array(2)].map((_, i) => (
          <motion.div
            key={`heart-${i}`}
            className="absolute text-purple-300/15 text-8xl"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 8 + 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            💖
          </motion.div>
        ))}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSuccess={() => {
          setShowAuthModal(false);
          // 認証成功後はデータが自動で同期される
        }}
      />
    </div>
  );
}
