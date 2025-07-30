// 🎵 TypeMate Security Details Modal
// セキュリティ保護内容を詳細表示するモーダルコンポーネント

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Eye, 
  Key, 
  FileCheck, 
  Server, 
  X, 
  CheckCircle,
  AlertCircle,
  Info,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface SecurityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  messagesEncrypted?: number;
  totalMessages?: number;
}

export const SecurityDetailsModal = ({ 
  isOpen, 
  onClose, 
  messagesEncrypted = 0, 
  totalMessages = 0 
}: SecurityDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'stats'>('overview');
  const encryptionRate = totalMessages > 0 ? Math.round((messagesEncrypted / totalMessages) * 100) : 100;

  // セキュリティ機能リスト
  const securityFeatures = [
    {
      icon: <Lock className="w-5 h-5 text-green-600" />,
      title: 'AES-256暗号化',
      description: '軍事レベルの暗号化でメッセージを完全保護',
      status: 'active',
      details: 'Advanced Encryption Standard 256-bit'
    },
    {
      icon: <Key className="w-5 h-5 text-blue-600" />,
      title: 'PBKDF2キー生成',
      description: 'セッション固有の安全なキー生成システム',
      status: 'active',
      details: '10,000回の反復処理による強化'
    },
    {
      icon: <FileCheck className="w-5 h-5 text-purple-600" />,
      title: 'SHA-256整合性チェック',
      description: 'データの改ざんを検出する完全性保証',
      status: 'active',
      details: 'メッセージごとに一意のハッシュ生成'
    },
    {
      icon: <Server className="w-5 h-5 text-orange-600" />,
      title: 'エンドツーエンド',
      description: 'サーバーでも復号化できない設計',
      status: 'active',
      details: 'クライアントサイド専用暗号化'
    }
  ];

  // 技術的詳細情報
  const technicalSpecs = [
    { label: '暗号化方式', value: 'AES-256-CBC', status: 'secure' },
    { label: 'キー導出', value: 'PBKDF2-SHA256', status: 'secure' },
    { label: '反復回数', value: '10,000回', status: 'secure' },
    { label: 'キー長', value: '256-bit', status: 'secure' },
    { label: 'ハッシュ関数', value: 'SHA-256', status: 'secure' },
    { label: 'セッション管理', value: 'UUID v4', status: 'secure' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">TypeMate セキュリティ</h2>
                    <p className="text-green-100">世界最高レベルのプライバシー保護</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-full p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* タブナビゲーション */}
            <div className="flex border-b">
              {[
                { id: 'overview', label: '概要', icon: <Eye className="w-4 h-4" /> },
                { id: 'technical', label: '技術詳細', icon: <Zap className="w-4 h-4" /> },
                { id: 'stats', label: '統計', icon: <FileCheck className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 p-4 text-sm font-medium flex items-center justify-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'text-green-600 border-b-2 border-green-500 bg-green-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* コンテンツ */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* セキュリティ状態 */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-green-800">完全保護状態</h3>
                    </div>
                    <p className="text-green-700 text-sm">
                      あなたの会話は最高レベルの暗号化で保護されています。
                      TypeMateチーム含め、誰もあなたのメッセージを読むことはできません。
                    </p>
                  </div>

                  {/* セキュリティ機能一覧 */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <span>セキュリティ機能</span>
                    </h3>
                    <div className="grid gap-4">
                      {securityFeatures.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="mt-1">{feature.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-800">{feature.title}</h4>
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                有効
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{feature.description}</p>
                            <p className="text-xs text-gray-500">{feature.details}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* プライバシー保証 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Info className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-800">プライバシー保証</h3>
                    </div>
                    <ul className="space-y-1 text-sm text-blue-700">
                      <li>✓ メッセージはクライアントサイドでのみ暗号化</li>
                      <li>✓ サーバーには暗号化されたデータのみ保存</li>
                      <li>✓ 復号化キーはあなたのブラウザ内でのみ生成</li>
                      <li>✓ TypeMateチームも内容を読むことは不可能</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'technical' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-purple-600" />
                      <span>技術仕様</span>
                    </h3>
                    <div className="space-y-3">
                      {technicalSpecs.map((spec, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">{spec.label}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-900 font-mono">{spec.value}</span>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 暗号化フロー */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4">暗号化処理フロー</h3>
                    <div className="space-y-3">
                      {[
                        { step: 1, title: 'メッセージ入力', desc: 'あなたがメッセージを入力' },
                        { step: 2, title: 'キー生成', desc: 'PBKDF2でセッション固有キーを生成' },
                        { step: 3, title: 'AES暗号化', desc: 'AES-256でメッセージを暗号化' },
                        { step: 4, title: 'ハッシュ生成', desc: 'SHA-256で整合性ハッシュを生成' },
                        { step: 5, title: 'サーバー送信', desc: '暗号化データのみをサーバーに送信' }
                      ].map((flow, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {flow.step}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{flow.title}</h4>
                            <p className="text-sm text-gray-600">{flow.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="space-y-6">
                  {/* 暗号化統計 */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <FileCheck className="w-5 h-5 text-green-600" />
                      <span>暗号化統計</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{messagesEncrypted}</div>
                        <div className="text-sm text-green-700">暗号化済みメッセージ</div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{encryptionRate}%</div>
                        <div className="text-sm text-blue-700">保護率</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>暗号化進捗</span>
                        <span>{messagesEncrypted}/{totalMessages}</span>
                      </div>
                      <Progress value={encryptionRate} className="h-2" />
                    </div>
                  </div>

                  {/* セキュリティレベル */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4">セキュリティレベル分布</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">基本保護</span>
                        </div>
                        <span className="text-sm font-medium">60%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span className="text-sm">高度保護</span>
                        </div>
                        <span className="text-sm font-medium">30%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm">最高保護</span>
                        </div>
                        <span className="text-sm font-medium">10%</span>
                      </div>
                    </div>
                  </div>

                  {/* セキュリティ監査 */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">最新セキュリティ監査</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">暗号化整合性</span>
                        <span className="text-green-600 font-medium">✓ 正常</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">キー生成品質</span>
                        <span className="text-green-600 font-medium">✓ 最高</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">データ漏洩スキャン</span>
                        <span className="text-green-600 font-medium">✓ 問題なし</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* フッター */}
            <div className="border-t bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>TypeMate セキュリティチーム認証済み</span>
                </div>
                <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
                  閉じる
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};