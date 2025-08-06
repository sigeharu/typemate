#!/usr/bin/env node
/**
 * 🎵 Claude Code ↔ Cipher 自動保存システム
 * ファイル監視による完全自動化
 */

const chokidar = require('chokidar');
const neo4j = require('neo4j-driver');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

console.log('🎵 Cipher自動保存システム起動...\n');

class AutoSaveWatcher {
    constructor() {
        this.driver = neo4j.driver(
            process.env.NEO4J_URI,
            neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
        );
        this.session = null;
        this.saveQueue = [];
        this.processing = false;
        this.fileHashes = new Map(); // ファイルの変更検出用
        
        // 監視対象設定
        this.watchPatterns = [
            'src/**/*.{js,jsx,ts,tsx}',
            'pages/**/*.{js,jsx,ts,tsx}',
            'components/**/*.{js,jsx,ts,tsx}',
            '*.{json,md,yml,yaml}',
            '.env*'
        ];
        
        this.ignorePatterns = [
            '**/node_modules/**',
            '**/.git/**',
            '**/dist/**',
            '**/build/**',
            '**/.next/**',
            '**/coverage/**',
            '**/backup_*.log'
        ];
    }

    async initialize() {
        this.session = this.driver.session({ database: process.env.NEO4J_DATABASE });
        console.log('✅ Neo4j接続初期化完了');
        console.log('👀 監視対象パターン:', this.watchPatterns.join(', '));
        console.log('🚫 無視パターン:', this.ignorePatterns.join(', '));
        console.log();
    }

    // ファイルハッシュ計算（重複保存防止）
    async getFileHash(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            return crypto.createHash('md5').update(content).digest('hex');
        } catch (error) {
            return null;
        }
    }

    // ファイル変更の意味的重要度を判定
    async assessImportance(filePath, changeType) {
        const ext = path.extname(filePath);
        const basename = path.basename(filePath);
        
        // 重要度スコア計算
        let importance = 0;
        
        // ファイルタイプによる重要度
        const typeScores = {
            '.tsx': 5, '.ts': 5,
            '.jsx': 4, '.js': 4,
            '.json': 3,
            '.md': 2,
            '.yml': 3, '.yaml': 3,
            '.env': 5
        };
        
        importance += typeScores[ext] || 1;
        
        // 特定ファイルの重要度
        if (basename.includes('page') || basename.includes('Page')) importance += 2;
        if (basename.includes('api') || basename.includes('API')) importance += 2;
        if (basename.includes('config') || basename.includes('Config')) importance += 3;
        if (basename.includes('schema') || basename.includes('Schema')) importance += 3;
        
        // ディレクトリによる重要度
        if (filePath.includes('/src/')) importance += 1;
        if (filePath.includes('/pages/')) importance += 2;
        if (filePath.includes('/api/')) importance += 2;
        
        return {
            score: importance,
            shouldSave: importance >= 3, // 3点以上で保存対象
            priority: importance >= 5 ? 'high' : 'normal'
        };
    }

    // ファイル変更をNeo4jに保存
    async saveToNeo4j(changeData) {
        const { filePath, changeType, timestamp, importance, projectContext } = changeData;
        
        try {
            const query = `
                MERGE (p:Project {name: $projectName})
                
                CREATE (change:FileChange {
                    id: randomUUID(),
                    filePath: $filePath,
                    changeType: $changeType,
                    timestamp: $timestamp,
                    importance: $importance,
                    saved_by: 'Auto-Save Watcher'
                })
                
                MERGE (file:File {path: $filePath})
                SET file.lastModified = $timestamp,
                    file.extension = $extension,
                    file.directory = $directory
                
                MERGE (p)-[:HAS_FILE]->(file)
                MERGE (file)-[:CHANGED]->(change)
                
                // 開発セッション記録
                MERGE (session:DevelopmentSession {
                    date: date($timestamp),
                    project: $projectName
                })
                MERGE (session)-[:INCLUDES_CHANGE]->(change)
                
                RETURN change.id as changeId, file.path as filePath
            `;
            
            const params = {
                projectName: projectContext.name,
                filePath: filePath,
                changeType: changeType,
                timestamp: timestamp,
                importance: importance.score,
                extension: path.extname(filePath),
                directory: path.dirname(filePath)
            };
            
            const result = await this.session.run(query, params);
            
            if (result.records.length > 0) {
                const record = result.records[0];
                console.log(`✅ 保存完了: ${record.get('filePath')}`);
                console.log(`   📊 重要度: ${importance.score}/10 (${importance.priority})`);
                console.log(`   🆔 変更ID: ${record.get('changeId').substring(0, 8)}...`);
            }
            
            return true;
            
        } catch (error) {
            console.error(`❌ 保存エラー (${filePath}):`, error.message);
            return false;
        }
    }

    // 保存キュー処理
    async processSaveQueue() {
        if (this.processing || this.saveQueue.length === 0) {
            return;
        }
        
        this.processing = true;
        console.log(`\n📦 保存キュー処理開始 (${this.saveQueue.length}件)...`);
        
        try {
            // バッチ処理で効率化
            const batch = this.saveQueue.splice(0, 10); // 最大10件ずつ処理
            
            for (const change of batch) {
                await this.saveToNeo4j(change);
                await new Promise(resolve => setTimeout(resolve, 100)); // レート制限
            }
            
            console.log(`✅ バッチ処理完了 (${batch.length}件)\n`);
            
        } catch (error) {
            console.error('❌ キュー処理エラー:', error.message);
        } finally {
            this.processing = false;
            
            // 残りがあれば再実行
            if (this.saveQueue.length > 0) {
                setTimeout(() => this.processSaveQueue(), 1000);
            }
        }
    }

    // ファイル変更ハンドラ
    async handleFileChange(filePath, changeType) {
        const normalizedPath = path.relative(process.cwd(), filePath);
        
        // ハッシュチェック（重複防止）
        const currentHash = await this.getFileHash(filePath);
        const previousHash = this.fileHashes.get(normalizedPath);
        
        if (changeType !== 'add' && currentHash === previousHash) {
            console.log(`⏭️  変更なしスキップ: ${normalizedPath}`);
            return;
        }
        
        this.fileHashes.set(normalizedPath, currentHash);
        
        // 重要度判定
        const importance = await this.assessImportance(normalizedPath, changeType);
        
        if (!importance.shouldSave) {
            console.log(`⏭️  低重要度スキップ: ${normalizedPath} (スコア: ${importance.score})`);
            return;
        }
        
        console.log(`\n🔔 ファイル変更検出: ${normalizedPath}`);
        console.log(`   📝 変更タイプ: ${changeType}`);
        console.log(`   ⭐ 重要度: ${importance.score}/10`);
        
        // 保存キューに追加
        const changeData = {
            filePath: normalizedPath,
            changeType: changeType,
            timestamp: new Date().toISOString(),
            importance: importance,
            projectContext: {
                name: 'TypeMate',
                branch: 'main' // TODO: 実際のブランチ名を取得
            }
        };
        
        this.saveQueue.push(changeData);
        
        // 即座に処理開始（デバウンス付き）
        setTimeout(() => this.processSaveQueue(), 500);
    }

    // 監視開始
    startWatching() {
        const watcher = chokidar.watch(this.watchPatterns, {
            ignored: this.ignorePatterns,
            persistent: true,
            ignoreInitial: true,
            awaitWriteFinish: {
                stabilityThreshold: 500,
                pollInterval: 100
            }
        });
        
        // イベントハンドラ登録
        watcher
            .on('add', path => this.handleFileChange(path, 'add'))
            .on('change', path => this.handleFileChange(path, 'change'))
            .on('unlink', path => this.handleFileChange(path, 'delete'))
            .on('ready', () => {
                console.log('🎯 ファイル監視開始！');
                console.log('💡 ヒント: ファイルを編集すると自動的にCipherに保存されます\n');
            })
            .on('error', error => {
                console.error('❌ 監視エラー:', error);
            });
        
        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n🛑 自動保存システム終了中...');
            
            // 残りのキューを処理
            if (this.saveQueue.length > 0) {
                console.log(`📦 残りのキュー処理中 (${this.saveQueue.length}件)...`);
                await this.processSaveQueue();
            }
            
            await this.cleanup();
            process.exit(0);
        });
    }

    // 統計情報表示
    async showStatistics() {
        setInterval(async () => {
            try {
                const stats = await this.session.run(`
                    MATCH (c:FileChange)
                    WHERE c.timestamp > datetime() - duration('PT1H')
                    RETURN count(c) as hourly_changes,
                           avg(c.importance) as avg_importance
                `);
                
                if (stats.records.length > 0) {
                    const record = stats.records[0];
                    console.log(`\n📊 自動保存統計 (過去1時間):`);
                    console.log(`   保存件数: ${record.get('hourly_changes')}件`);
                    console.log(`   平均重要度: ${record.get('avg_importance')?.toFixed(1) || 'N/A'}/10\n`);
                }
            } catch (error) {
                // 統計エラーは無視
            }
        }, 60000); // 1分ごと
    }

    async cleanup() {
        if (this.session) {
            await this.session.close();
        }
        await this.driver.close();
        console.log('✅ リソースクリーンアップ完了');
    }
}

// メイン実行
async function main() {
    // 必要なパッケージチェック
    try {
        require.resolve('chokidar');
    } catch (e) {
        console.error('❌ chokidarがインストールされていません');
        console.log('📦 実行: npm install chokidar');
        process.exit(1);
    }
    
    const watcher = new AutoSaveWatcher();
    
    try {
        await watcher.initialize();
        watcher.startWatching();
        await watcher.showStatistics();
        
        console.log('🌟 Cipher自動保存システムが稼働中です！');
        console.log('🎵 ファイルを編集すると自動的に開発履歴が保存されます\n');
        
    } catch (error) {
        console.error('❌ 起動エラー:', error.message);
        process.exit(1);
    }
}

main().catch(console.error);