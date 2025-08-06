#!/usr/bin/env node
/**
 * 🎵 TypeMate本番環境ヘルスチェック
 * デプロイ後の総合動作確認
 */

const https = require('https');
const { URL } = require('url');

console.log('🎵 TypeMate本番環境ヘルスチェック開始...\n');

const PRODUCTION_URL = 'https://typemate.vercel.app';

class ProductionHealthCheck {
    constructor() {
        this.results = [];
        this.startTime = Date.now();
    }

    async checkEndpoint(path, expectedStatus = 200) {
        const url = new URL(path, PRODUCTION_URL);
        const testName = `GET ${path}`;
        
        return new Promise((resolve) => {
            const startTime = Date.now();
            
            const req = https.get(url.toString(), (res) => {
                const responseTime = Date.now() - startTime;
                const success = res.statusCode === expectedStatus;
                
                const result = {
                    test: testName,
                    url: url.toString(),
                    expectedStatus,
                    actualStatus: res.statusCode,
                    responseTime: responseTime,
                    success: success,
                    headers: {
                        contentType: res.headers['content-type'],
                        cacheControl: res.headers['cache-control'],
                        poweredBy: res.headers['x-powered-by']
                    }
                };

                console.log(`${success ? '✅' : '❌'} ${testName}`);
                console.log(`   Status: ${res.statusCode} (期待値: ${expectedStatus})`);
                console.log(`   応答時間: ${responseTime}ms`);
                console.log(`   Content-Type: ${res.headers['content-type'] || 'N/A'}`);
                console.log();

                this.results.push(result);
                resolve(result);
            });

            req.on('error', (error) => {
                const result = {
                    test: testName,
                    url: url.toString(),
                    expectedStatus,
                    actualStatus: 'ERROR',
                    responseTime: Date.now() - startTime,
                    success: false,
                    error: error.message
                };

                console.log(`❌ ${testName}`);
                console.log(`   エラー: ${error.message}`);
                console.log();

                this.results.push(result);
                resolve(result);
            });

            req.setTimeout(10000, () => {
                req.destroy();
                const result = {
                    test: testName,
                    url: url.toString(),
                    expectedStatus,
                    actualStatus: 'TIMEOUT',
                    responseTime: Date.now() - startTime,
                    success: false,
                    error: 'Request timeout (10s)'
                };

                console.log(`❌ ${testName}`);
                console.log(`   エラー: タイムアウト (10秒)`);
                console.log();

                this.results.push(result);
                resolve(result);
            });
        });
    }

    async runHealthCheck() {
        console.log('🏥 基本ページのヘルスチェック...');
        
        // メインページ
        await this.checkEndpoint('/');
        
        // 主要ページ
        await this.checkEndpoint('/chat');
        await this.checkEndpoint('/diagnosis');
        await this.checkEndpoint('/settings');
        await this.checkEndpoint('/profile');
        await this.checkEndpoint('/harmonic-setup');
        
        // 認証ページ
        await this.checkEndpoint('/auth/signin');
        
        // APIエンドポイント（認証が必要な場合は401を期待）
        console.log('🔌 APIエンドポイントチェック...');
        await this.checkEndpoint('/api/chat', 401); // 認証必要
        await this.checkEndpoint('/api/memory', 401); // 認証必要
        
        // 存在しないページ（404を期待）
        await this.checkEndpoint('/non-existent-page', 404);
        
        this.generateReport();
    }

    generateReport() {
        const totalTime = Date.now() - this.startTime;
        const totalTests = this.results.length;
        const passedTests = this.results.filter(r => r.success).length;
        const successRate = (passedTests / totalTests * 100).toFixed(1);
        
        console.log('🎯 本番環境ヘルスチェック結果');
        console.log('═══════════════════════════════════════════');
        
        // 結果サマリー
        this.results.forEach(result => {
            const status = result.success ? '✅' : '❌';
            const statusText = typeof result.actualStatus === 'number' 
                ? result.actualStatus.toString()
                : result.actualStatus;
            console.log(`${status} ${result.test.padEnd(25)} | ${statusText.padStart(3)} | ${result.responseTime.toString().padStart(4)}ms`);
        });
        
        console.log('═══════════════════════════════════════════');
        console.log(`📊 成功率: ${passedTests}/${totalTests} (${successRate}%)`);
        console.log(`⏱️  総実行時間: ${totalTime}ms`);
        
        // 応答時間統計
        const responseTimes = this.results
            .filter(r => r.success && typeof r.responseTime === 'number')
            .map(r => r.responseTime);
        
        if (responseTimes.length > 0) {
            const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
            const maxResponseTime = Math.max(...responseTimes);
            const minResponseTime = Math.min(...responseTimes);
            
            console.log(`🚀 平均応答時間: ${avgResponseTime.toFixed(0)}ms`);
            console.log(`📈 最速応答: ${minResponseTime}ms`);
            console.log(`📊 最遅応答: ${maxResponseTime}ms`);
        }
        
        console.log();
        
        // 全体評価
        if (successRate >= 90) {
            console.log('🌟 本番環境: 完全正常動作！');
            console.log('🎵 TypeMateは健全に稼働中です');
        } else if (successRate >= 75) {
            console.log('🎶 本番環境: 基本的に正常動作');
            console.log('🔧 一部改善の余地あり');
        } else {
            console.log('🎺 本番環境: 要確認');
            console.log('⚠️  複数の問題が検出されました');
        }
        
        console.log('\n📝 詳細は上記のテスト結果を確認してください');
        
        // 失敗したテストの詳細
        const failedTests = this.results.filter(r => !r.success);
        if (failedTests.length > 0) {
            console.log('\n❌ 失敗したテスト詳細:');
            failedTests.forEach(test => {
                console.log(`   • ${test.test}: ${test.error || test.actualStatus}`);
            });
        }
    }
}

// メイン実行
async function main() {
    const healthCheck = new ProductionHealthCheck();
    
    try {
        await healthCheck.runHealthCheck();
    } catch (error) {
        console.error('❌ ヘルスチェック実行エラー:', error.message);
        process.exit(1);
    }
}

main().catch(console.error);