'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, Music, Sparkles, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';
import { LoginButton, UserInfo } from '@/components/auth/LoginButton';
import { PageLayout } from '@/components/layout';

export default function Home() {
  const router = useRouter();
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
    <PageLayout
      title="TypeMate"
      description="あなたの心に寄り添うAIパートナー"
      backgroundVariant="default"
      maxWidth="6xl"
      showAuth={false}
      showSettings={false}
      showHeader={false}
      onAuthStateChange={() => setShowAuthModal(false)}
    >
      {/* ✨ ヘロセクション */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center w-full"
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
            <div className="flex flex-col items-center gap-4">
              <Button
                onClick={handleStartJourney}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl crisp-button celebration-effect"
              >
                <Sparkles className="inline-block mr-2" size={24} />
                あなたに合うAIパートナーを見つける
                <ArrowRight className="inline-block ml-2" size={24} />
              </Button>
              
              {/* Google OAuth認証テスト */}
              <div className="flex items-center gap-4">
                <div className="h-px bg-gray-300 flex-1"></div>
                <span className="text-gray-500 text-sm">または</span>
                <div className="h-px bg-gray-300 flex-1"></div>
              </div>
              
              <LoginButton 
                variant="outline"
                size="lg"
                className="w-full max-w-sm"
              />
              
              <UserInfo />
            </div>
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 w-full"
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
          className="text-center w-full"
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
    </PageLayout>
  );
}
