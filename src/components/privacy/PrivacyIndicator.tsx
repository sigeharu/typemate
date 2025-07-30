// 🎵 TypeMate Privacy Indicator
// エレガントなプライバシー保護UI表示コンポーネント

'use client';

import { useState } from 'react';
import { Shield, Lock, Eye, ChevronRight } from 'lucide-react';
import { SecurityDetailsModal } from './SecurityDetailsModal';

export const PrivacyIndicator = () => (
  <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-full shadow-sm border border-green-200">
    <Lock className="w-4 h-4" />
    <span className="text-xs font-medium">🔐 エンドツーエンド暗号化</span>
  </div>
);

export const EncryptionBadge = ({ message }: { message: string }) => (
  <div className="group relative inline-block">
    <Shield className="w-4 h-4 text-green-500 hover:text-green-600 transition-colors" />
    <div className="absolute invisible group-hover:visible bg-black text-white text-xs rounded p-2 -top-8 left-0 whitespace-nowrap z-10 shadow-lg">
      このメッセージは暗号化されています
    </div>
  </div>
);

export const PrivacyLevelIndicator = ({ level }: { level: number }) => {
  const levelConfig = {
    1: { color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', label: '基本保護' },
    2: { color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', label: '高度保護' },
    3: { color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: '最高保護' }
  };

  const config = levelConfig[level as keyof typeof levelConfig] || levelConfig[1];

  return (
    <div className={`flex items-center space-x-1 ${config.color} ${config.bg} px-2 py-1 rounded text-xs ${config.border} border`}>
      <Eye className="w-3 h-3" />
      <span>{config.label}</span>
    </div>
  );
};

interface SecureConnectionStatusProps {
  messagesEncrypted?: number;
  totalMessages?: number;
  securityEnhanced?: boolean; // 強化セキュリティ対応
}

export const SecureConnectionStatus = ({ 
  messagesEncrypted = 0, 
  totalMessages = 0,
  securityEnhanced = false
}: SecureConnectionStatusProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div 
        className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-gradient-to-r hover:from-green-100 hover:to-blue-100"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <Shield className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">
            セキュア接続中
          </p>
          <p className="text-xs text-gray-600">
            {securityEnhanced 
              ? '最高レベルの暗号化で保護中 - タップして詳細を確認'
              : 'あなたの会話は完全に保護されています - タップして詳細を確認'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-xs text-green-600 font-mono bg-white px-2 py-1 rounded border">
            AES-256
          </div>
          {securityEnhanced && (
            <div className="text-xs text-red-600 font-mono bg-red-50 px-2 py-1 rounded border border-red-200">
              100K-PBKDF2
            </div>
          )}
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      <SecurityDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        messagesEncrypted={messagesEncrypted}
        totalMessages={totalMessages}
        securityEnhanced={securityEnhanced}
      />
    </>
  );
};

interface PrivacyStatsProps {
  messagesEncrypted: number;
  totalMessages: number;
}

export const PrivacyStats = ({ messagesEncrypted, totalMessages }: PrivacyStatsProps) => {
  const percentage = totalMessages > 0 ? Math.round((messagesEncrypted / totalMessages) * 100) : 0;
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center space-x-2 mb-2">
        <Shield className="w-4 h-4 text-green-600" />
        <h3 className="text-sm font-medium text-gray-800">プライバシー統計</h3>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">暗号化済みメッセージ</span>
          <span className="font-medium text-green-600">{messagesEncrypted}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">保護率</span>
          <span className="font-medium text-green-600">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};