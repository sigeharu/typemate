// 🎵 TypeMate Chat History Component
// チャット履歴サイドバー

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { storage, type ChatSession } from '@/lib/storage';
import { ARCHETYPE_DATA } from '@/lib/diagnostic-data';

interface ChatHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  currentSessionId: string;
}

export function ChatHistory({
  isOpen,
  onClose,
  onSelectSession,
  onNewSession,
  currentSessionId
}: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = storage.searchChatSessions(searchQuery);
      setFilteredSessions(filtered);
    } else {
      setFilteredSessions(sessions);
    }
  }, [searchQuery, sessions]);

  const loadSessions = () => {
    const allSessions = storage.getAllChatSessions();
    // 最新順でソート
    const sorted = allSessions.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    setSessions(sorted);
  };

  const handleDeleteSession = (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm('このチャットセッションを削除しますか？')) {
      storage.deleteChatSession(sessionId);
      loadSessions();
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return new Date(date).toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      return new Date(date).toLocaleDateString('ja-JP', { 
        month: 'short', 
        day: 'numeric' 
      });
    } else {
      return new Date(date).toLocaleDateString('ja-JP', { 
        year: 'numeric',
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getSessionPreview = (session: ChatSession) => {
    const userMessages = session.messages.filter(m => m.sender === 'user');
    if (userMessages.length === 0) return '新しい会話';
    
    const lastMessage = userMessages[userMessages.length - 1];
    return lastMessage.content.length > 30 
      ? lastMessage.content.substring(0, 30) + '...'
      : lastMessage.content;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-80 md:w-96 bg-white border-r border-slate-200 shadow-xl z-50"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-800">チャット履歴</h2>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X size={20} />
                  </Button>
                </div>
                
                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="チャットを検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* New Chat Button */}
                <Button 
                  onClick={onNewSession}
                  className="w-full bg-gradient-to-r from-slate-600 to-blue-600 hover:from-slate-700 hover:to-blue-700"
                >
                  <Plus size={16} className="mr-2" />
                  新しいチャット
                </Button>
              </div>
              
              {/* Session List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredSessions.length === 0 ? (
                  <div className="text-center text-slate-500 mt-8">
                    <Clock size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {searchQuery ? 'チャットが見つかりません' : 'チャット履歴がありません'}
                    </p>
                  </div>
                ) : (
                  filteredSessions.map((session) => {
                    const aiArchetype = ARCHETYPE_DATA[session.aiPersonality];
                    const isActive = session.id === currentSessionId;
                    
                    return (
                      <motion.div
                        key={session.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={`p-3 cursor-pointer transition-all group ${
                            isActive 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                          }`}
                          onClick={() => onSelectSession(session.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-slate-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                  AI
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {aiArchetype.name}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-slate-800 font-medium mb-1 truncate">
                                {session.title || getSessionPreview(session)}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">
                                  {session.messages.length}件のメッセージ
                                </span>
                                <span className="text-xs text-slate-500">
                                  {formatDate(session.updatedAt)}
                                </span>
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                              onClick={(e) => handleDeleteSession(session.id, e)}
                            >
                              <Trash2 size={14} className="text-red-500" />
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </div>
              
              {/* Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50">
                <p className="text-xs text-slate-500 text-center">
                  {sessions.length}個のチャットセッション
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}