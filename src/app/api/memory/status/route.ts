// 🎵 TypeMate 統合記憶システム状態API
// 3層記憶システムの稼働状況確認

import { NextRequest, NextResponse } from 'next/server';
import { unifiedMemorySystem } from '@/lib/unified-memory-system';
import { validateProductionSecurity } from '@/lib/input-validation';
import { secureLog } from '@/lib/secure-logger';

export async function GET(request: NextRequest) {
  // セキュリティ検証（開発環境では緩和）
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       process.env.NEXT_PUBLIC_DEV_MODE === 'true';
  
  if (!isDevelopment) {
    const securityCheck = validateProductionSecurity(request);
    if (!securityCheck.isValid) {
      return NextResponse.json(
        { error: 'Security validation failed' },
        { status: 403 }
      );
    }
  }

  try {
    secureLog.info('Memory system status check requested');

    // 統合記憶システムの状態を取得
    const systemStatus = await unifiedMemorySystem.getSystemStatus();

    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      memoryLayers: {
        shortTerm: {
          name: 'Redis短期記憶',
          status: systemStatus.shortTerm.connected ? 'connected' : 'disconnected',
          details: systemStatus.shortTerm,
          description: '1時間TTL、直近10メッセージのキャッシュ'
        },
        mediumTerm: {
          name: 'Supabase中期記憶',
          status: systemStatus.mediumTerm.initialized ? 'active' : 'inactive',
          details: systemStatus.mediumTerm,
          description: 'pgvector統合、永続的会話記録'
        },
        vectorSearch: {
          name: 'OpenAI Vector検索',
          status: systemStatus.vectorSearch.hasOpenAI ? 'active' : 'inactive',
          details: systemStatus.vectorSearch,
          description: '意味的類似性検索、コンテキスト理解'
        }
      },
      overall: {
        healthy: systemStatus.shortTerm.connected && 
                systemStatus.mediumTerm.initialized &&
                systemStatus.vectorSearch.hasOpenAI,
        degraded: !systemStatus.shortTerm.connected || 
                 !systemStatus.mediumTerm.initialized ||
                 !systemStatus.vectorSearch.hasOpenAI
      }
    };

    secureLog.info('Memory system status retrieved', {
      shortTermConnected: systemStatus.shortTerm.connected,
      mediumTermActive: systemStatus.mediumTerm.initialized,
      vectorSearchActive: systemStatus.vectorSearch.hasOpenAI,
      overallHealthy: response.overall.healthy
    });

    return NextResponse.json(response);

  } catch (error) {
    secureLog.error('Memory system status check failed', error);
    
    return NextResponse.json(
      { 
        error: 'Memory system status unavailable',
        details: error instanceof Error ? error.message : String(error),
        status: 'error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}