#!/usr/bin/env node
/**
 * 🎵 Claude Code セッションフック自動保存
 * 会話終了時に重要な内容を自動保存
 */

const neo4j = require('neo4j-driver');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

console.log('🎵 Claude Codeセッションフック初期化...\n');

class SessionAutoSave {
    constructor() {
        this.driver = neo4j.driver(
            process.env.NEO4J_URI,
            neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
        );
        this.session = null;
        this.sessionData = {
            startTime: new Date(),
            interactions: [],
            fileChanges: [],
            importantDecisions: [],
            learnings: []
        };
    }

    async initialize() {
        this.session = this.driver.session({ database: process.env.NEO4J_DATABASE });
        console.log('✅ セッションフック準備完了');
        
        // Claude Code設定ファイルにフック登録
        await this.registerHooks();
    }

    // Claude Code設定にフック登録
    async registerHooks() {
        const hookScript = `
#!/bin/bash
# Claude Code Session Auto-Save Hook

# セッション終了時に自動実行
if [ "$CLAUDE_SESSION_END" = "true" ]; then
    echo "🎵 セッション情報を自動保存中..."
    node ${__filename} --save-session "$CLAUDE_SESSION_ID"
fi

# 重要なファイル変更時
if [ "$CLAUDE_FILE_SAVED" = "true" ]; then
    echo "💾 ファイル変更を記録中..."
    node ${__filename} --save-file "$CLAUDE_SAVED_FILE"
fi
`;

        const hookPath = path.join(process.env.HOME, '.claude-code', 'hooks', 'auto-save.sh');
        
        try {
            await fs.mkdir(path.dirname(hookPath), { recursive: true });
            await fs.writeFile(hookPath, hookScript, { mode: 0o755 });
            
            console.log('✅ Claudeフック登録完了:', hookPath);
            
            // Claude Code設定更新を提案
            console.log('\n📝 Claude Code設定に以下を追加してください:');
            console.log('```json');
            console.log('{');
            console.log('  "hooks": {');
            console.log('    "onSessionEnd": "~/.claude-code/hooks/auto-save.sh",');
            console.log('    "onFileSave": "~/.claude-code/hooks/auto-save.sh"');
            console.log('  }');
            console.log('}');
            console.log('```\n');
            
        } catch (error) {
            console.error('⚠️  フック登録エラー:', error.message);
        }
    }

    // セッション内容の重要度分析
    analyzeSessionImportance(sessionData) {
        let importance = 0;
        const insights = [];

        // ファイル変更数による重要度
        if (sessionData.fileChanges.length > 0) {
            importance += sessionData.fileChanges.length * 2;
            insights.push(`${sessionData.fileChanges.length}個のファイル変更`);
        }

        // 決定事項の重要度
        if (sessionData.importantDecisions.length > 0) {
            importance += sessionData.importantDecisions.length * 5;
            insights.push(`${sessionData.importantDecisions.length}個の重要決定`);
        }

        // 学習項目の重要度
        if (sessionData.learnings.length > 0) {
            importance += sessionData.learnings.length * 3;
            insights.push(`${sessionData.learnings.length}個の新規学習`);
        }

        // セッション時間による重要度
        const duration = (new Date() - sessionData.startTime) / 1000 / 60; // 分
        if (duration > 30) {
            importance += 10;
            insights.push(`長時間セッション(${Math.round(duration)}分)`);
        }

        return {
            score: importance,
            shouldSave: importance >= 10,
            insights: insights,
            duration: duration
        };
    }

    // セッションデータをNeo4jに保存
    async saveSessionToNeo4j(sessionData, importance) {
        try {
            const query = `
                MERGE (p:Project {name: 'TypeMate'})
                
                CREATE (session:DevelopmentSession {
                    id: randomUUID(),
                    startTime: $startTime,
                    endTime: $endTime,
                    duration: $duration,
                    importance: $importance,
                    insights: $insights,
                    saved_by: 'Session Hook'
                })
                
                MERGE (p)-[:HAS_SESSION]->(session)
                
                // ファイル変更記録
                WITH session
                UNWIND $fileChanges as fileChange
                MERGE (file:File {path: fileChange.path})
                CREATE (change:FileChange {
                    timestamp: fileChange.timestamp,
                    changeType: fileChange.type,
                    session: session.id
                })
                MERGE (file)-[:CHANGED_IN]->(session)
                MERGE (session)-[:MODIFIED]->(file)
                
                // 重要決定記録
                WITH session
                UNWIND $decisions as decision
                CREATE (d:Decision {
                    id: randomUUID(),
                    description: decision.description,
                    rationale: decision.rationale,
                    timestamp: decision.timestamp
                })
                MERGE (session)-[:MADE_DECISION]->(d)
                
                // 学習記録
                WITH session
                UNWIND $learnings as learning
                CREATE (l:Learning {
                    id: randomUUID(),
                    topic: learning.topic,
                    insight: learning.insight,
                    timestamp: learning.timestamp
                })
                MERGE (session)-[:LEARNED]->(l)
                
                RETURN session.id as sessionId, 
                       session.duration as duration,
                       size($fileChanges) as fileCount,
                       size($decisions) as decisionCount,
                       size($learnings) as learningCount
            `;

            const params = {
                startTime: sessionData.startTime.toISOString(),
                endTime: new Date().toISOString(),
                duration: importance.duration,
                importance: importance.score,
                insights: importance.insights,
                fileChanges: sessionData.fileChanges,
                decisions: sessionData.importantDecisions,
                learnings: sessionData.learnings
            };

            const result = await this.session.run(query, params);

            if (result.records.length > 0) {
                const record = result.records[0];
                console.log('\n✅ セッション保存完了!');
                console.log(`   🆔 セッションID: ${record.get('sessionId').substring(0, 8)}...`);
                console.log(`   ⏱️  継続時間: ${Math.round(record.get('duration'))}分`);
                console.log(`   📝 ファイル変更: ${record.get('fileCount')}個`);
                console.log(`   🎯 重要決定: ${record.get('decisionCount')}個`);
                console.log(`   💡 学習項目: ${record.get('learningCount')}個`);
                console.log(`   ⭐ 重要度スコア: ${importance.score}`);
            }

            return true;

        } catch (error) {
            console.error('❌ セッション保存エラー:', error.message);
            return false;
        }
    }

    // インタラクティブセッション監視
    async startInteractiveMonitor() {
        console.log('🎯 インタラクティブセッション監視開始');
        console.log('💡 ヒント: "save"と入力すると手動保存、"exit"で終了\n');

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        // シミュレートされたセッションデータ収集
        const collectSessionData = () => {
            // 実際のClaude Codeでは、MCPプロトコル経由で自動収集
            console.log('📊 セッションデータ収集中...');
            
            // デモ用のサンプルデータ
            this.sessionData.fileChanges.push({
                path: 'src/app/chat/page.tsx',
                type: 'modify',
                timestamp: new Date().toISOString()
            });

            this.sessionData.importantDecisions.push({
                description: 'Claude Code ↔ Cipher統合システム採用',
                rationale: '17.1倍の効率化を実現',
                timestamp: new Date().toISOString()
            });

            this.sessionData.learnings.push({
                topic: 'MCP Protocol',
                insight: 'Neo4j統合による知識グラフ構築方法',
                timestamp: new Date().toISOString()
            });
        };

        // 定期的なデータ収集
        const collectionInterval = setInterval(collectSessionData, 30000); // 30秒ごと

        // コマンド処理
        rl.on('line', async (input) => {
            const command = input.trim().toLowerCase();

            if (command === 'save') {
                console.log('\n💾 手動保存実行中...');
                const importance = this.analyzeSessionImportance(this.sessionData);
                await this.saveSessionToNeo4j(this.sessionData, importance);
                
            } else if (command === 'status') {
                const importance = this.analyzeSessionImportance(this.sessionData);
                console.log('\n📊 現在のセッション状態:');
                console.log(`   ⏱️  経過時間: ${Math.round(importance.duration)}分`);
                console.log(`   📝 ファイル変更: ${this.sessionData.fileChanges.length}個`);
                console.log(`   🎯 重要決定: ${this.sessionData.importantDecisions.length}個`);
                console.log(`   💡 学習項目: ${this.sessionData.learnings.length}個`);
                console.log(`   ⭐ 重要度: ${importance.score}`);
                console.log();
                
            } else if (command === 'exit') {
                console.log('\n🛑 セッション終了中...');
                clearInterval(collectionInterval);
                
                // 終了時自動保存
                const importance = this.analyzeSessionImportance(this.sessionData);
                if (importance.shouldSave) {
                    console.log('📦 重要なセッションのため自動保存します...');
                    await this.saveSessionToNeo4j(this.sessionData, importance);
                }
                
                await this.cleanup();
                process.exit(0);
                
            } else if (command === 'help') {
                console.log('\n📚 利用可能なコマンド:');
                console.log('   save   - セッションを手動保存');
                console.log('   status - 現在のセッション状態を表示');
                console.log('   exit   - セッションを終了（自動保存）');
                console.log('   help   - このヘルプを表示\n');
            }
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n🛑 割り込み検出...');
            clearInterval(collectionInterval);
            
            const importance = this.analyzeSessionImportance(this.sessionData);
            if (importance.shouldSave) {
                console.log('📦 セッション自動保存中...');
                await this.saveSessionToNeo4j(this.sessionData, importance);
            }
            
            await this.cleanup();
            process.exit(0);
        });
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
    const autoSave = new SessionAutoSave();

    try {
        await autoSave.initialize();

        // コマンドライン引数処理
        const args = process.argv.slice(2);
        
        if (args[0] === '--save-session') {
            // Claude Codeから呼び出された場合
            console.log('🎵 Claude Codeセッション自動保存実行');
            const importance = autoSave.analyzeSessionImportance(autoSave.sessionData);
            await autoSave.saveSessionToNeo4j(autoSave.sessionData, importance);
            await autoSave.cleanup();
            
        } else if (args[0] === '--save-file') {
            // ファイル保存フック
            const filePath = args[1];
            console.log(`💾 ファイル変更記録: ${filePath}`);
            autoSave.sessionData.fileChanges.push({
                path: filePath,
                type: 'save',
                timestamp: new Date().toISOString()
            });
            
        } else {
            // インタラクティブモード
            await autoSave.startInteractiveMonitor();
        }

    } catch (error) {
        console.error('❌ セッションフックエラー:', error.message);
        process.exit(1);
    }
}

// 引数がある場合は即座に実行
if (process.argv.length > 2) {
    main().catch(console.error);
} else {
    // インタラクティブモード
    main().catch(console.error);
}