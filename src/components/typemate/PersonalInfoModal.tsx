'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BaseArchetype } from '@/types';

interface PersonalInfo {
  name: string;
  birthday: string;
}

interface PersonalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (info: PersonalInfo) => void;
  aiPersonality: BaseArchetype;
  reason?: string;
}

export const PersonalInfoModal: React.FC<PersonalInfoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  aiPersonality,
  reason = "親しくなった記念"
}) => {
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthday) return;

    setIsSubmitting(true);
    
    // 音楽的アニメーション効果
    const submitElement = e.target as HTMLFormElement;
    submitElement.classList.add('submitting-animation');
    
    await new Promise(resolve => setTimeout(resolve, 800)); // 少し待つ
    
    onSubmit({ name: name.trim(), birthday });
    
    // お祝いエフェクト
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      setName('');
      setBirthday('');
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ 
            type: "spring",
            damping: 25,
            stiffness: 300
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="w-full max-w-md bg-gradient-to-br from-pink-50 to-purple-50 border-0 shadow-2xl">
            <CardHeader className="text-center relative">
              <button
                onClick={onClose}
                className="absolute right-2 top-2 p-2 hover:bg-white/20 rounded-full transition-all duration-300"
              >
                <X size={20} className="text-gray-500" />
              </button>
              
              <motion.div 
                className="flex justify-center mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <div className="flex space-x-2">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <Star className="text-yellow-400" size={24} />
                  </motion.div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <Heart className="text-pink-400" size={24} />
                  </motion.div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, -5, 5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: 0.5
                    }}
                  >
                    <Star className="text-yellow-400" size={24} />
                  </motion.div>
                </div>
              </motion.div>
              
              <CardTitle className="text-xl font-bold text-gray-800">
                🌸 {reason} 🌸
              </CardTitle>
              <motion.p 
                className="text-gray-600 text-center mt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                もっと親しくなりたいので、教えてもらえませんか？
              </motion.p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-700">
                    お名前（ニックネーム可）
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="何て呼んだら良いですか？"
                    className="w-full p-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all duration-300 bg-white/80"
                    required
                  />
                </motion.div>
                
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-medium text-gray-700">
                    誕生日
                  </label>
                  <Input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full p-3 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all duration-300 bg-white/80"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    特別な日は覚えておきたいです♪
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    type="submit"
                    disabled={!name.trim() || !birthday || isSubmitting}
                    className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white p-3 rounded-lg font-medium transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <motion.div 
                        className="flex items-center justify-center space-x-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>教えています...</span>
                      </motion.div>
                    ) : (
                      <motion.span 
                        className="flex items-center justify-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Heart size={18} />
                        <span>✨ 教える ✨</span>
                        <Heart size={18} />
                      </motion.span>
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};