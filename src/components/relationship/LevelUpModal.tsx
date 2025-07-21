// 🎊 TypeMate Level Up Modal
// レベルアップ通知モーダル

'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RelationshipLevel } from '@/types';
import confetti from 'canvas-confetti';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: RelationshipLevel;
}

export function LevelUpModal({ isOpen, onClose, newLevel }: LevelUpModalProps) {
  // レベルアップ時の紙吹雪エフェクト
  useEffect(() => {
    if (isOpen) {
      // 音楽的なリズムで紙吹雪
      const shootConfetti = () => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f97316', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981']
        });
      };

      shootConfetti();
      const timer1 = setTimeout(shootConfetti, 200);
      const timer2 = setTimeout(shootConfetti, 400);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
              }
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 背景グラデーション */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: `linear-gradient(135deg, var(--${newLevel.color}) 0%, transparent 100%)`
              }}
            />

            {/* コンテンツ */}
            <div className="relative p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ 
                  scale: 1,
                  transition: { delay: 0.2, type: "spring" }
                }}
              >
                <span className="text-8xl inline-block mb-4">
                  {newLevel.icon}
                </span>
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ 
                  y: 0, 
                  opacity: 1,
                  transition: { delay: 0.3 }
                }}
                className="text-3xl font-bold text-gray-800 mb-2"
              >
                レベルアップ！
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ 
                  y: 0, 
                  opacity: 1,
                  transition: { delay: 0.4 }
                }}
                className="text-xl font-medium text-gray-700 mb-4"
              >
                {newLevel.name}に到達！
              </motion.p>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ 
                  y: 0, 
                  opacity: 1,
                  transition: { delay: 0.5 }
                }}
                className="text-gray-600 mb-6"
              >
                {newLevel.unlockMessage}
              </motion.p>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ 
                  y: 0, 
                  opacity: 1,
                  transition: { delay: 0.6 }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className={`px-8 py-3 rounded-full font-medium text-white ${newLevel.color} hover:opacity-90 transition-opacity`}
              >
                ありがとう！
              </motion.button>
            </div>

            {/* 装飾的な波形 */}
            <svg
              className="absolute bottom-0 left-0 right-0"
              viewBox="0 0 1440 100"
              preserveAspectRatio="none"
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: 1,
                  transition: { duration: 1.5, ease: "easeInOut" }
                }}
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="3"
                d="M0,50 Q360,20 720,50 T1440,50"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}