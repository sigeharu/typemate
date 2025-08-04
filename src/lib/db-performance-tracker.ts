// 🎵 TypeMate Database Performance Tracker
// Supabaseデータベース操作専用パフォーマンス測定

import { supabase } from './supabase-simple';
import { dbLogger } from './db-logger';

export interface DatabaseMetrics {
  operation: string;
  duration: number;
  recordCount: number;
  queryType: 'select' | 'insert' | 'update' | 'delete' | 'upsert';
  complexity: 'simple' | 'complex' | 'join' | 'batch';
  timestamp: Date;
  success: boolean;
  errorCode?: string;
  tableName?: string;
}

export interface DatabaseBenchmark {
  operation: string;
  avgDuration: number;
  p95Duration: number;
  minDuration: number;
  maxDuration: number;
  totalOps: number;
  successRate: number;
  throughput: number; // ops per second
}

class DatabasePerformanceTracker {
  private static instance: DatabasePerformanceTracker;
  private metrics: DatabaseMetrics[] = [];
  private readonly MAX_METRICS = 500;

  private constructor() {}

  static getInstance(): DatabasePerformanceTracker {
    if (!DatabasePerformanceTracker.instance) {
      DatabasePerformanceTracker.instance = new DatabasePerformanceTracker();
    }
    return DatabasePerformanceTracker.instance;
  }

  // 操作開始時に呼び出し
  startOperation(operation: string): () => void {
    const startTime = performance.now();
    return (recordCount: number = 0, success: boolean = true, errorCode?: string) => {
      const duration = performance.now() - startTime;
      this.recordMetric({
        operation,
        duration,
        recordCount,
        queryType: this.inferQueryType(operation),
        complexity: this.inferComplexity(operation),
        timestamp: new Date(),
        success,
        errorCode,
        tableName: this.extractTableName(operation)
      });
    };
  }

  // メトリクス記録
  private recordMetric(metric: DatabaseMetrics): void {
    this.metrics.push(metric);
    
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
    
    // パフォーマンス警告
    if (metric.duration > 3000) {
      dbLogger.warn('dbPerformance', `Slow database operation: ${metric.operation}`, {
        duration: `${metric.duration.toFixed(2)}ms`,
        table: metric.tableName,
        records: metric.recordCount
      });
    }
  }

  // ベンチマーク生成
  generateBenchmarks(): DatabaseBenchmark[] {
    const grouped = this.groupByOperation();
    
    return Object.entries(grouped).map(([operation, metrics]) => {
      const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
      const successCount = metrics.filter(m => m.success).length;
      const timeSpan = this.getTimeSpan(metrics);
      
      return {
        operation,
        avgDuration: this.average(durations),
        p95Duration: this.percentile(durations, 95),
        minDuration: durations[0] || 0,
        maxDuration: durations[durations.length - 1] || 0,
        totalOps: metrics.length,
        successRate: (successCount / metrics.length) * 100,
        throughput: timeSpan > 0 ? metrics.length / (timeSpan / 1000) : 0
      };
    });
  }

  // 現在のパフォーマンス統計
  getCurrentStats(): {
    totalOperations: number;
    avgResponseTime: number;
    slowQueries: number;
    errorRate: number;
    topTables: Array<{ table: string; operations: number }>;
  } {
    if (this.metrics.length === 0) {
      return {
        totalOperations: 0,
        avgResponseTime: 0,
        slowQueries: 0,
        errorRate: 0,
        topTables: []
      };
    }

    const totalOps = this.metrics.length;
    const avgTime = this.average(this.metrics.map(m => m.duration));
    const slowQueries = this.metrics.filter(m => m.duration > 2000).length;
    const errors = this.metrics.filter(m => !m.success).length;
    
    // テーブル別集計
    const tableStats = this.metrics
      .filter(m => m.tableName)
      .reduce((acc, m) => {
        const table = m.tableName!;
        acc[table] = (acc[table] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const topTables = Object.entries(tableStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([table, operations]) => ({ table, operations }));

    return {
      totalOperations: totalOps,
      avgResponseTime: Math.round(avgTime),
      slowQueries,
      errorRate: (errors / totalOps) * 100,
      topTables
    };
  }

  // パフォーマンステスト実行
  async runDatabasePerformanceTest(): Promise<void> {
    dbLogger.info('dbPerformanceTest', 'Starting database performance evaluation');

    const tests = [
      () => this.testUserProfileQuery(),
      () => this.testMemoryQuery(),
      () => this.testChatSessionQuery(),
      () => this.testComplexJoinQuery()
    ];

    for (const test of tests) {
      try {
        await test();
        // テスト間の短い待機
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        dbLogger.error('dbPerformanceTest', error);
      }
    }

    const benchmarks = this.generateBenchmarks();
    console.log('\n📊 Database Performance Benchmarks:');
    console.table(benchmarks);

    const stats = this.getCurrentStats();
    console.log('\n📈 Current Performance Stats:', stats);

    dbLogger.success('dbPerformanceTest', 'Database performance test completed');
  }

  // プライベートメソッド
  private groupByOperation(): Record<string, DatabaseMetrics[]> {
    return this.metrics.reduce((groups, metric) => {
      const key = metric.operation;
      if (!groups[key]) groups[key] = [];
      groups[key].push(metric);
      return groups;
    }, {} as Record<string, DatabaseMetrics[]>);
  }

  private average(numbers: number[]): number {
    return numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
  }

  private percentile(sortedNumbers: number[], p: number): number {
    if (sortedNumbers.length === 0) return 0;
    const index = Math.ceil((p / 100) * sortedNumbers.length) - 1;
    return sortedNumbers[Math.min(index, sortedNumbers.length - 1)];
  }

  private getTimeSpan(metrics: DatabaseMetrics[]): number {
    if (metrics.length < 2) return 0;
    const timestamps = metrics.map(m => m.timestamp.getTime());
    return Math.max(...timestamps) - Math.min(...timestamps);
  }

  private inferQueryType(operation: string): DatabaseMetrics['queryType'] {
    const op = operation.toLowerCase();
    if (op.includes('get') || op.includes('fetch') || op.includes('load')) return 'select';
    if (op.includes('save') && op.includes('upsert')) return 'upsert';
    if (op.includes('save') || op.includes('create') || op.includes('insert')) return 'insert';
    if (op.includes('update') || op.includes('repair')) return 'update';
    if (op.includes('delete') || op.includes('remove')) return 'delete';
    return 'select';
  }

  private inferComplexity(operation: string): DatabaseMetrics['complexity'] {
    const op = operation.toLowerCase();
    if (op.includes('batch') || op.includes('repair')) return 'batch';
    if (op.includes('join') || op.includes('chat_sessions') || op.includes('complex')) return 'join';
    if (op.includes('progress') || op.includes('statistics')) return 'complex';
    return 'simple';
  }

  private extractTableName(operation: string): string | undefined {
    const op = operation.toLowerCase();
    if (op.includes('memory')) return 'typemate_memory';
    if (op.includes('profile')) return 'user_profiles';
    if (op.includes('session')) return 'chat_sessions';
    if (op.includes('message')) return 'messages';
    if (op.includes('diagnostic')) return 'diagnostic_results';
    return undefined;
  }

  // テストメソッド群
  private async testUserProfileQuery(): Promise<void> {
    const endTimer = this.startOperation('test_user_profile_query');
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, user_type, selected_ai_personality, created_at')
        .limit(10);
      
      endTimer(data?.length || 0, !error, error?.code);
    } catch (error) {
      endTimer(0, false, 'exception');
    }
  }

  private async testMemoryQuery(): Promise<void> {
    const endTimer = this.startOperation('test_memory_query');
    try {
      const { data, error } = await supabase
        .from('typemate_memory')
        .select('id, archetype, message_role, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      
      endTimer(data?.length || 0, !error, error?.code);
    } catch (error) {
      endTimer(0, false, 'exception');
    }
  }

  private async testChatSessionQuery(): Promise<void> {
    const endTimer = this.startOperation('test_chat_session_query');
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('id, title, user_type, ai_personality, created_at')
        .order('updated_at', { ascending: false })
        .limit(5);
      
      endTimer(data?.length || 0, !error, error?.code);
    } catch (error) {
      endTimer(0, false, 'exception');
    }
  }

  private async testComplexJoinQuery(): Promise<void> {
    const endTimer = this.startOperation('test_complex_join_query');
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
          id, title, created_at,
          messages (id, content, sender, created_at)
        `)
        .limit(3);
      
      const recordCount = data?.reduce((total, session) => total + (session.messages?.length || 0), data.length) || 0;
      endTimer(recordCount, !error, error?.code);
    } catch (error) {
      endTimer(0, false, 'exception');
    }
  }
}

export const dbPerformanceTracker = DatabasePerformanceTracker.getInstance();

// 開発者コンソール用
if (typeof window !== 'undefined') {
  (window as any).dbPerformanceTracker = dbPerformanceTracker;
}