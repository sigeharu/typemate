// 🎵 TypeMate Database Logger
// 統一されたデータベース操作ログシステム

let performanceTracker: any = null;

// 遅延読み込みでcircular import回避
function getPerformanceTracker() {
  if (!performanceTracker) {
    try {
      const module = require('./db-performance-tracker');
      performanceTracker = module.dbPerformanceTracker;
    } catch (e) {
      // パフォーマンストラッカーが利用できない場合は無視
    }
  }
  return performanceTracker;
}

export const dbLogger = {
  success: (operation: string, data: any) => {
    console.log(`✅ DB ${operation} succeeded:`, {
      operation,
      recordCount: Array.isArray(data) ? data.length : 1,
      timestamp: new Date().toISOString()
    });
  },
  
  error: (operation: string, error: any) => {
    console.error(`❌ DB ${operation} failed:`, {
      operation,
      error: error.message || String(error),
      code: error.code,
      details: error.details,
      hint: error.hint,
      timestamp: new Date().toISOString()
    });
  },
  
  warn: (operation: string, message: string, details?: any) => {
    console.warn(`⚠️ DB ${operation} warning:`, {
      operation,
      message,
      details,
      timestamp: new Date().toISOString()
    });
  },
  
  info: (operation: string, message: string, details?: any) => {
    console.log(`ℹ️ DB ${operation} info:`, {
      operation,
      message,
      details,
      timestamp: new Date().toISOString()
    });
  },
  
  // パフォーマンス計測用
  time: (operation: string) => {
    const startTime = performance.now();
    const tracker = getPerformanceTracker();
    const endTracker = tracker?.startOperation(operation);
    
    return {
      end: (result?: any) => {
        const duration = performance.now() - startTime;
        const recordCount = result && Array.isArray(result) ? result.length : (result ? 1 : 0);
        
        console.log(`⏱️ DB ${operation} completed in ${duration.toFixed(2)}ms`, {
          operation,
          duration: `${duration.toFixed(2)}ms`,
          recordCount,
          timestamp: new Date().toISOString()
        });
        
        // パフォーマンストラッカーに記録
        if (endTracker) {
          endTracker(recordCount, true);
        }
      }
    };
  }
};

// UUID検証ヘルパー
export const validateUUID = (uuid: string, fieldName: string = 'id'): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    dbLogger.error('validateUUID', new Error(`Invalid UUID format for ${fieldName}: ${uuid}`));
    return false;
  }
  return true;
};

// 安全なデータベース操作ラッパー
export async function safeDbOperation<T>(
  operation: string,
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
  const timer = dbLogger.time(operation);
  
  try {
    const result = await queryFn();
    
    if (result.error) {
      dbLogger.error(operation, result.error);
      return result;
    }
    
    dbLogger.success(operation, result.data);
    timer.end(result.data);
    return result;
    
  } catch (error) {
    dbLogger.error(operation, error);
    timer.end();
    return { data: null, error };
  }
}

// バッチ処理用ヘルパー
export async function safeBatchOperation<T>(
  operation: string,
  operations: Array<() => Promise<{ data: T | null; error: any }>>,
  batchSize: number = 10
): Promise<{ successes: T[]; errors: any[]; totalCount: number }> {
  const timer = dbLogger.time(`${operation}_batch`);
  const successes: T[] = [];
  const errors: any[] = [];
  
  try {
    dbLogger.info(operation, `Starting batch operation with ${operations.length} items, batch size: ${batchSize}`);
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      
      const results = await Promise.allSettled(
        batch.map(async (op, index) => {
          try {
            const result = await op();
            if (result.error) {
              errors.push({ index: i + index, error: result.error });
              return null;
            }
            return result.data;
          } catch (error) {
            errors.push({ index: i + index, error });
            return null;
          }
        })
      );
      
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          successes.push(result.value);
        } else if (result.status === 'rejected') {
          errors.push({ error: result.reason });
        }
      });
      
      // バッチ間の短い待機（レート制限対策）
      if (i + batchSize < operations.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    dbLogger.success(operation, `Batch completed: ${successes.length} successes, ${errors.length} errors`);
    timer.end({ successCount: successes.length, errorCount: errors.length });
    
    return { successes, errors, totalCount: operations.length };
  } catch (error) {
    dbLogger.error(operation, error);
    timer.end();
    return { successes, errors, totalCount: operations.length };
  }
}