// 🎵 TypeMate Chat History Component
// チャット履歴サイドバー - localStorage/Supabase統合対応

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Trash2, Clock, Cloud, HardDrive, RefreshCw, Filter, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { storage, type ChatSession } from '@/lib/storage';
import { memoryManager } from '@/lib/memory-manager';
import { ARCHETYPE_DATA } from '@/lib/diagnostic-data';

// 🔄 統合セッション型定義
interface UnifiedSession extends ChatSession {
  source: 'localStorage' | 'supabase' | 'both';
  supabaseMessageCount?: number;
  lastSyncAt?: Date;
  syncStatus: 'synced' | 'pending' | 'conflict' | 'local_only' | 'cloud_only';
}

// 📊 データソースフィルター型
type DataSourceFilter = 'all' | 'local' | 'cloud' | 'synced';

// 🎯 拡張されたProps
interface ChatHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  currentSessionId: string;
  userId?: string; // 新規追加：Supabase統合用
}

// 🎯 ソースバッジコンポーネント
function SourceBadge({ 
  source, 
  syncStatus 
}: { 
  source: UnifiedSession['source'], 
  syncStatus: UnifiedSession['syncStatus'] 
}) {
  const getBadgeConfig = () => {
    switch (source) {
      case 'localStorage':
        return { 
          icon: HardDrive, 
          text: 'Local', 
          className: 'bg-blue-100 text-blue-800 border-blue-300',
          tooltip: 'ローカル限定'
        };
      case 'supabase':
        return { 
          icon: Cloud, 
          text: 'Cloud', 
          className: 'bg-green-100 text-green-800 border-green-300',
          tooltip: 'クラウド同期済み'
        };
      case 'both':
        return { 
          icon: RefreshCw, 
          text: 'Synced', 
          className: 'bg-purple-100 text-purple-800 border-purple-300',
          tooltip: '完全同期'
        };
      default:
        return { 
          icon: AlertCircle, 
          text: 'Unknown', 
          className: 'bg-gray-100 text-gray-800 border-gray-300',
          tooltip: '不明'
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-1" title={config.tooltip}>
      <Icon size={10} />
      <Badge 
        variant="outline" 
        className={`text-xs px-1 py-0 h-5 ${config.className}`}
      >
        {config.text}
      </Badge>
      {syncStatus === 'pending' && (
        <span className="text-xs text-yellow-600" title="同期待ち">⏳</span>
      )}
      {syncStatus === 'conflict' && (
        <span className="text-xs text-red-600" title="同期競合">⚠️</span>
      )}
    </div>
  );
}

export function ChatHistory({
  isOpen,
  onClose,
  onSelectSession,
  onNewSession,
  currentSessionId,
  userId
}: ChatHistoryProps) {
  const [unifiedSessions, setUnifiedSessions] = useState<UnifiedSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSessions, setFilteredSessions] = useState<UnifiedSession[]>([]);
  const [sourceFilter, setSourceFilter] = useState<DataSourceFilter>('all');
  const [isLoadingSupabase, setIsLoadingSupabase] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  // 🔄 Supabaseセッション取得関数
  const loadSupabaseSessions = async (userId: string): Promise<UnifiedSession[]> => {
    if (!userId) return [];
    
    try {
      setIsLoadingSupabase(true);
      setSupabaseError(null);
      
      console.log('🔍 Loading Supabase conversations for user:', userId);
      
      // Supabaseから会話IDを取得
      const latestConversation = await memoryManager.getLatestConversation(userId);
      console.log('📊 Latest conversation:', latestConversation);
      
      // TODO: 複数の会話セッションを取得する実装
      // 現在は最新の会話のみ対応
      const supabaseSessions: UnifiedSession[] = [];
      
      if (latestConversation) {
        // 会話のメッセージを取得
        const messages = await memoryManager.getConversationMessages(latestConversation.conversation_id, userId);
        console.log('💬 Messages for conversation:', messages.length);
        
        if (messages.length > 0) {
          // UnifiedSessionとして変換
          const supabaseSession: UnifiedSession = {
            id: latestConversation.conversation_id,
            userType: 'ARC-AS', // TODO: 実際の値を取得
            aiPersonality: 'DRM', // TODO: 実際の値を取得
            messages: messages,
            createdAt: new Date(latestConversation.created_at),
            updatedAt: new Date(), // TODO: 実際の更新日時を取得
            title: `Supabase会話 (${messages.length}件)`,
            source: 'supabase',
            supabaseMessageCount: messages.length,
            lastSyncAt: new Date(),
            syncStatus: 'cloud_only'
          };
          
          supabaseSessions.push(supabaseSession);
        }
      }
      
      console.log('✅ Supabase sessions loaded:', supabaseSessions.length);
      return supabaseSessions;
      
    } catch (error) {
      console.error('❌ Supabase sessions load error:', error);
      setSupabaseError(`Supabase読み込みエラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    } finally {
      setIsLoadingSupabase(false);
    }
  };

  // 🔄 データマージ関数
  const mergeSessionSources = (
    localSessions: ChatSession[], 
    supabaseSessions: UnifiedSession[]
  ): UnifiedSession[] => {
    const merged = new Map<string, UnifiedSession>();
    
    // ローカルセッションを追加
    localSessions.forEach(session => {
      merged.set(session.id, {
        ...session,
        source: 'localStorage',
        syncStatus: 'local_only'
      });
    });
    
    // Supabaseセッションを追加（マージまたは新規）
    supabaseSessions.forEach(session => {
      const existing = merged.get(session.id);
      if (existing) {
        // 両方に存在する場合
        merged.set(session.id, {
          ...existing,
          source: 'both',
          supabaseMessageCount: session.supabaseMessageCount,
          lastSyncAt: session.lastSyncAt,
          syncStatus: existing.messages.length === session.supabaseMessageCount ? 'synced' : 'conflict'
        });
      } else {
        // Supabaseのみに存在
        merged.set(session.id, session);
      }
    });
    
    // 配列に変換して最新順でソート
    return Array.from(merged.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  };

  // 🔄 統合セッション読み込み
  const loadUnifiedSessions = async () => {
    console.log('🔄 Loading unified sessions...', { userId });
    
    // localStorageから読み込み
    const localSessions = storage.getAllChatSessions();
    console.log('📋 Local sessions loaded:', localSessions.length);
    
    // Supabaseから読み込み（userIdがある場合のみ）
    const supabaseSessions = userId ? await loadSupabaseSessions(userId) : [];
    
    // データをマージ
    const merged = mergeSessionSources(localSessions, supabaseSessions);
    console.log('🔄 Sessions merged:', {
      local: localSessions.length,
      supabase: supabaseSessions.length,
      merged: merged.length
    });
    
    setUnifiedSessions(merged);
  };

  useEffect(() => {
    if (isOpen) {
      loadUnifiedSessions();
    }
  }, [isOpen, userId]);

  // 🔍 検索とフィルター適用
  useEffect(() => {
    let filtered = unifiedSessions;
    
    // ソースフィルター適用
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(session => {
        switch (sourceFilter) {
          case 'local':
            return session.source === 'localStorage';
          case 'cloud':
            return session.source === 'supabase';
          case 'synced':
            return session.source === 'both';
          default:
            return true;
        }
      });
    }
    
    // 検索クエリ適用
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session =>
        session.title?.toLowerCase().includes(query) ||
        session.messages.some(msg => 
          msg.content.toLowerCase().includes(query)
        )
      );
    }
    
    setFilteredSessions(filtered);
  }, [searchQuery, unifiedSessions, sourceFilter]);

  const handleDeleteSession = (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm('このチャットセッションを削除しますか？')) {
      storage.deleteChatSession(sessionId);
      loadUnifiedSessions();
    }
  };

  // 📊 統計情報計算
  const getStats = () => {
    const local = unifiedSessions.filter(s => s.source === 'localStorage').length;
    const cloud = unifiedSessions.filter(s => s.source === 'supabase').length;
    const synced = unifiedSessions.filter(s => s.source === 'both').length;
    
    return { local, cloud, synced, total: unifiedSessions.length };
  };

  const stats = getStats();

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

  const getSessionPreview = (session: UnifiedSession) => {
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
            className="fixed left-0 top-0 h-full w-80 md:w-96 bg-white border-r border-gray-200 shadow-xl z-50 flex flex-col"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">チャット履歴</h2>
                  <div className="flex items-center gap-2">
                    {isLoadingSupabase && (
                      <RefreshCw size={16} className="animate-spin text-blue-500" />
                    )}
                    <Button variant="ghost" size="sm" onClick={onClose}>
                      <X size={20} />
                    </Button>
                  </div>
                </div>

                {/* Data Source Filter */}
                <div className="mb-3">
                  <div className="flex items-center gap-1 mb-2">
                    <Filter size={14} className="text-gray-500" />
                    <span className="text-xs text-gray-600">データソース</span>
                  </div>
                  <div className="flex gap-1">
                    {[
                      { key: 'all', label: `全て (${stats.total})`, icon: null },
                      { key: 'local', label: `Local (${stats.local})`, icon: HardDrive },
                      { key: 'cloud', label: `Cloud (${stats.cloud})`, icon: Cloud },
                      { key: 'synced', label: `同期済み (${stats.synced})`, icon: RefreshCw }
                    ].map(({ key, label, icon: Icon }) => (
                      <Button
                        key={key}
                        variant={sourceFilter === key ? "default" : "outline"}
                        size="sm"
                        className={`text-xs px-2 py-1 h-7 ${
                          sourceFilter === key 
                            ? 'bg-gray-900 text-white' 
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setSourceFilter(key as DataSourceFilter)}
                      >
                        {Icon && <Icon size={10} className="mr-1" />}
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Error Display */}
                {supabaseError && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={14} className="text-red-500" />
                      <span className="text-xs text-red-700">{supabaseError}</span>
                    </div>
                  </div>
                )}
                
                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="チャットを検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white"
                  />
                </div>
                
                {/* New Chat Button */}
                <Button 
                  onClick={onNewSession}
                  className="w-full bg-black hover:bg-gray-800 text-white"
                >
                  <Plus size={16} className="mr-2" />
                  新しいチャット
                </Button>
              </div>
              
              {/* Session List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredSessions.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <Clock size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {searchQuery ? 'チャットが見つかりません' : 'チャット履歴がありません'}
                    </p>
                  </div>
                ) : (
                  filteredSessions.map((session) => {
                    const aiArchetype = ARCHETYPE_DATA[session.aiPersonality] || ARCHETYPE_DATA['DRM']; // フォールバック
                    const isActive = session.id === currentSessionId;
                    
                    return (
                      <motion.div
                        key={session.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={`p-3 cursor-pointer transition-all group border ${
                            isActive 
                              ? 'border-gray-900 bg-gray-50' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => onSelectSession(session.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-white font-medium text-xs">
                                  AI
                                </div>
                                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                                  {aiArchetype?.name || 'AI'}
                                </Badge>
                                <SourceBadge source={session.source} syncStatus={session.syncStatus} />
                              </div>
                              
                              <p className="text-sm text-gray-900 font-medium mb-1 truncate">
                                {session.title || getSessionPreview(session)}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {session.messages.length}件のメッセージ
                                  {session.supabaseMessageCount && session.supabaseMessageCount !== session.messages.length && (
                                    <span className="text-yellow-600 ml-1">
                                      (Cloud: {session.supabaseMessageCount}件)
                                    </span>
                                  )}
                                </span>
                                <span className="text-xs text-gray-500">
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
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between items-center">
                    <span>総セッション数</span>
                    <span className="font-medium">{stats.total}個</span>
                  </div>
                  {userId && (
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1">
                        <HardDrive size={10} />
                        <span>ローカル</span>
                      </div>
                      <span>{stats.local}個</span>
                    </div>
                  )}
                  {userId && (
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1">
                        <Cloud size={10} />
                        <span>クラウド</span>
                      </div>
                      <span>{stats.cloud}個</span>
                    </div>
                  )}
                  {userId && stats.synced > 0 && (
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1">
                        <RefreshCw size={10} />
                        <span>同期済み</span>
                      </div>
                      <span>{stats.synced}個</span>
                    </div>
                  )}
                  {!userId && (
                    <p className="text-center text-xs text-amber-600 mt-1">
                      ログインするとクラウド同期が利用できます
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}