#!/usr/bin/env node
// 🎵 Smart Auto-Save System for Claude Code Sessions
// 実用的な自動保存タイミング管理システム

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class SmartAutoSave {
  constructor() {
    this.projectRoot = process.cwd();
    this.sessionFile = path.join(this.projectRoot, '.claude-session-tracker.json');
    this.lastSaveTime = Date.now();
    this.sessionStartTime = Date.now();
    this.conversationBuffer = [];
    this.autoSaveInterval = 30 * 60 * 1000; // 30分
  }

  // セッション開始
  startSession() {
    const sessionData = {
      startTime: this.sessionStartTime,
      lastActivity: Date.now(),
      autoSaves: 0,
      manualSaves: 0,
      keyEvents: []
    };
    
    fs.writeFileSync(this.sessionFile, JSON.stringify(sessionData, null, 2));
    console.log('🎵 Claude Code セッション開始');
    
    // 定期保存タイマー設定
    this.setupPeriodicSave();
  }

  // 重要イベント記録
  recordKeyEvent(eventType, description) {
    const sessionData = this.loadSession();
    sessionData.keyEvents.push({
      timestamp: Date.now(),
      type: eventType,
      description: description
    });
    sessionData.lastActivity = Date.now();
    
    fs.writeFileSync(this.sessionFile, JSON.stringify(sessionData, null, 2));
    
    // 重要イベントの場合は即座に保存検討
    if (this.shouldAutoSaveNow(eventType)) {
      this.performAutoSave(`重要イベント: ${eventType}`);
    }
  }

  // 自動保存判定
  shouldAutoSaveNow(eventType) {
    const criticalEvents = [
      'major_implementation',
      'problem_solved',
      'system_complete',
      'integration_success',
      'error_resolved'
    ];
    
    return criticalEvents.includes(eventType);
  }

  // 定期保存設定
  setupPeriodicSave() {
    setInterval(() => {
      const sessionData = this.loadSession();
      const timeSinceLastActivity = Date.now() - sessionData.lastActivity;
      
      // 最近活動があった場合のみ保存
      if (timeSinceLastActivity < this.autoSaveInterval) {
        this.performAutoSave('定期保存');
      }
    }, this.autoSaveInterval);
  }

  // 実際の保存実行
  async performAutoSave(trigger) {
    const sessionData = this.loadSession();
    const sessionDuration = Date.now() - sessionData.startTime;
    
    const summary = this.generateSessionSummary(sessionData, sessionDuration);
    
    console.log(`🔄 自動保存実行 (${trigger})`);
    
    try {
      await this.saveToMemory(summary);
      
      sessionData.autoSaves++;
      sessionData.lastSave = Date.now();
      fs.writeFileSync(this.sessionFile, JSON.stringify(sessionData, null, 2));
      
      console.log('✅ 自動保存完了');
    } catch (error) {
      console.error('❌ 自動保存エラー:', error.message);
    }
  }

  // セッション概要生成
  generateSessionSummary(sessionData, duration) {
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    const recentEvents = sessionData.keyEvents
      .slice(-5) // 最新5イベント
      .map(event => `• ${event.type}: ${event.description}`)
      .join('\n');

    return `
🎵 Claude Code開発セッション自動保存

【セッション時間】
${hours}時間${minutes}分

【重要なイベント】
${recentEvents || '• 通常の開発作業'}

【統計】
- 自動保存回数: ${sessionData.autoSaves}
- 手動保存回数: ${sessionData.manualSaves}
- イベント数: ${sessionData.keyEvents.length}

【保存タイミング】
- 定期保存: 30分間隔
- イベント保存: 重要な実装・解決時
- 手動保存: ユーザー指示時

この情報を開発記憶として保存してください。
    `.trim();
  }

  // Cipherに保存
  async saveToMemory(summary) {
    return new Promise((resolve, reject) => {
      const cipherProcess = spawn('cipher', [
        '-a', path.join(this.projectRoot, 'memAgent/cipher.yml'),
        summary
      ], {
        env: { 
          ...process.env,
          OPENAI_API_KEY: process.env.OPENAI_API_KEY 
        }
      });

      let output = '';
      let error = '';

      cipherProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      cipherProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      cipherProcess.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(error));
        }
      });
    });
  }

  // セッションデータ読み込み
  loadSession() {
    try {
      return JSON.parse(fs.readFileSync(this.sessionFile, 'utf8'));
    } catch (error) {
      return {
        startTime: Date.now(),
        lastActivity: Date.now(),
        autoSaves: 0,
        manualSaves: 0,
        keyEvents: []
      };
    }
  }

  // 手動保存
  async manualSave(customSummary = null) {
    const sessionData = this.loadSession();
    
    if (customSummary) {
      await this.saveToMemory(customSummary);
    } else {
      await this.performAutoSave('手動保存');
    }
    
    sessionData.manualSaves++;
    fs.writeFileSync(this.sessionFile, JSON.stringify(sessionData, null, 2));
    
    console.log('✅ 手動保存完了');
  }

  // セッション終了
  async endSession() {
    const sessionData = this.loadSession();
    
    // 最終保存
    await this.performAutoSave('セッション終了');
    
    console.log('🎵 Claude Codeセッション終了');
    console.log(`📊 セッション統計:`);
    console.log(`   時間: ${Math.floor((Date.now() - sessionData.startTime) / (1000 * 60))}分`);
    console.log(`   自動保存: ${sessionData.autoSaves + 1}回`);
    console.log(`   手動保存: ${sessionData.manualSaves}回`);
    console.log(`   重要イベント: ${sessionData.keyEvents.length}件`);
    
    // セッションファイルクリーンアップ
    if (fs.existsSync(this.sessionFile)) {
      fs.unlinkSync(this.sessionFile);
    }
  }

  // 使用方法表示
  showUsage() {
    console.log(`
🎵 Claude Code Smart Auto-Save System

【自動保存タイミング】
✅ 30分間隔での定期保存
✅ 重要実装完了時の即座保存  
✅ 問題解決時の即座保存
✅ セッション終了時の最終保存

【使用方法】
# セッション開始
node smart-auto-save.js start

# 重要イベント記録
node smart-auto-save.js event major_implementation "チャット機能完成"

# 手動保存
node smart-auto-save.js save "特別な学習内容"

# セッション終了
node smart-auto-save.js end

【推奨ワークフロー】
1. 開発開始時に 'start' 実行
2. 重要な成果達成時に 'event' 記録
3. 必要に応じて 'save' 手動実行
4. 開発終了時に 'end' 実行
    `);
  }
}

// CLI実行
if (require.main === module) {
  const autoSave = new SmartAutoSave();
  const command = process.argv[2];
  
  switch (command) {
    case 'start':
      autoSave.startSession();
      break;
      
    case 'event':
      const eventType = process.argv[3];
      const description = process.argv[4] || 'イベント発生';
      autoSave.recordKeyEvent(eventType, description);
      break;
      
    case 'save':
      const customSummary = process.argv[3];
      autoSave.manualSave(customSummary);
      break;
      
    case 'end':
      autoSave.endSession();
      break;
      
    default:
      autoSave.showUsage();
  }
}

module.exports = SmartAutoSave;