#!/usr/bin/env node
// 🎵 Claude Code + Cipher Bridge
// Claude Codeが開発記憶を活用できるようにするMCPブリッジ

const { spawn } = require('child_process');
const path = require('path');

class ClaudeCipherBridge {
  constructor() {
    this.projectRoot = process.cwd();
    this.cipherConfig = path.join(this.projectRoot, 'memAgent/cipher.yml');
  }

  // Cipherの記憶を検索
  async searchMemory(query, options = {}) {
    return new Promise((resolve, reject) => {
      const { includeContext = true, maxResults = 5 } = options;
      
      console.log(`🧠 Cipherメモリ検索: "${query}"`);
      
      // Cipher経由で記憶検索
      const cipherProcess = spawn('cipher', [
        '-a', this.cipherConfig,
        `過去の開発記憶から「${query}」に関連する情報を検索して、簡潔に回答してください。`
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
          // Cipherの出力から有用な情報を抽出
          const cleanOutput = this.extractUsefulInfo(output);
          resolve({
            success: true,
            memory: cleanOutput,
            source: 'cipher'
          });
        } else {
          resolve({
            success: false,
            error: error,
            fallback: `Cipher記憶にアクセスできませんでしたが、「${query}」について以下の基本情報があります：`
          });
        }
      });
    });
  }

  // Neo4j知識グラフから検索
  async searchKnowledgeGraph(query) {
    return new Promise((resolve, reject) => {
      console.log(`📊 Neo4j知識検索: "${query}"`);
      
      const neo4jProcess = spawn('node', [
        path.join(this.projectRoot, 'simple-knowledge-query.js')
      ], {
        env: { ...process.env }
      });

      let output = '';
      
      neo4jProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      neo4jProcess.on('close', (code) => {
        if (code === 0 && output.includes('✅')) {
          resolve({
            success: true,
            knowledge: this.extractKnowledgeInfo(output),
            source: 'neo4j'
          });
        } else {
          resolve({
            success: false,
            error: `Neo4j知識グラフにアクセスできませんでした`
          });
        }
      });
    });
  }

  // 開発記憶を学習
  async learnFromDevelopment(sessionSummary, insights = []) {
    console.log('📚 開発記憶を学習中...');
    
    const learningPrompt = `
今日の開発セッションを記憶してください：

セッション概要: ${sessionSummary}

学んだこと・気づき:
${insights.map(insight => `- ${insight}`).join('\n')}

この情報を今後の開発に活用できるよう記憶してください。
    `.trim();

    return this.searchMemory(learningPrompt, { action: 'learn' });
  }

  // 統合検索（記憶 + 知識グラフ）
  async enhancedSearch(query) {
    console.log(`🎵 統合検索開始: "${query}"`);
    
    const [memoryResult, knowledgeResult] = await Promise.all([
      this.searchMemory(query),
      this.searchKnowledgeGraph(query)
    ]);

    return {
      query,
      memory: memoryResult,
      knowledge: knowledgeResult,
      combined: this.combineResults(memoryResult, knowledgeResult)
    };
  }

  // 結果統合
  combineResults(memoryResult, knowledgeResult) {
    let combined = `🎯 「${arguments[0] || 'query'}」に関する統合情報:\n\n`;
    
    if (memoryResult.success) {
      combined += `🧠 過去の記憶から:\n${memoryResult.memory}\n\n`;
    }
    
    if (knowledgeResult.success) {
      combined += `📊 プロジェクト知識から:\n${knowledgeResult.knowledge}\n\n`;
    }
    
    if (!memoryResult.success && !knowledgeResult.success) {
      combined += `❌ 記憶・知識へのアクセスに失敗しました。基本的な情報で回答します。`;
    }
    
    return combined;
  }

  // 有用情報抽出
  extractUsefulInfo(cipherOutput) {
    // Cipherの出力から実際のAI回答部分を抽出
    const lines = cipherOutput.split('\n');
    const aiResponseStart = lines.findIndex(line => line.includes('🤖 AI Response'));
    const aiResponseEnd = lines.findIndex(line => line.includes('└──'));
    
    if (aiResponseStart !== -1 && aiResponseEnd !== -1) {
      return lines.slice(aiResponseStart + 2, aiResponseEnd)
        .map(line => line.replace(/^│\s*/, '').trim())
        .filter(line => line.length > 0)
        .join('\n');
    }
    
    return cipherOutput.substring(0, 500) + '...';
  }

  // 知識情報抽出
  extractKnowledgeInfo(neo4jOutput) {
    const lines = neo4jOutput.split('\n');
    const relevantLines = lines.filter(line => 
      line.includes('✅') || line.includes('実装:') || line.includes('技術:')
    );
    return relevantLines.join('\n');
  }
}

// CLI実行
if (require.main === module) {
  const bridge = new ClaudeCipherBridge();
  const query = process.argv[2] || 'TypeMateベクトル検索実装';
  
  console.log('🎵 Claude Code + Cipher Bridge 起動');
  console.log('=====================================');
  
  bridge.enhancedSearch(query)
    .then(result => {
      console.log('\n' + result.combined);
      console.log('\n🎉 統合検索完了!');
    })
    .catch(error => {
      console.error('❌ エラー:', error);
    });
}

module.exports = ClaudeCipherBridge;