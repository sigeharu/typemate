#!/usr/bin/env node
// 🎵 Cipher + Neo4j TypeMate Knowledge MCP Server
// カスタムMCPサーバーでTypeMate開発知識をCipherと統合

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');  
const neo4j = require('neo4j-driver');

// Neo4j Driver Setup
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

// MCP Server Setup
const server = new Server(
  {
    name: "neo4j-typemate-knowledge",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Knowledge Search Tool
server.setRequestHandler("tools/list", {
  method: "tools/list"
}, async () => {
  return {
    tools: [
      {
        name: "search_typemate_knowledge",
        description: "TypeMate開発知識をグラフベースで検索",
        inputSchema: {
          type: "object",
          properties: {
            query: { 
              type: "string", 
              description: "検索クエリ（例：'ベクトル検索の実装方法'）" 
            },
            domain: { 
              type: "string", 
              enum: ["vector_search", "memory_management", "ai_personalities", "database"],
              description: "検索対象ドメイン（オプション）"
            },
            include_context: { 
              type: "boolean", 
              default: true,
              description: "関連する文脈情報も含める"
            }
          },
          required: ["query"]
        }
      },
      {
        name: "get_project_structure",
        description: "TypeMateプロジェクト全体の構造を取得",
        inputSchema: {
          type: "object",
          properties: {
            detailed: { 
              type: "boolean", 
              default: false,
              description: "詳細情報を含める"
            }
          }
        }
      },
      {
        name: "get_implementation_details",
        description: "特定機能の実装詳細を取得",
        inputSchema: {
          type: "object",
          properties: {
            feature_name: { 
              type: "string",
              description: "機能名（例：'Vector Search'）"
            },
            include_code: { 
              type: "boolean", 
              default: false,
              description: "実装ファイル情報を含める"
            }
          },
          required: ["feature_name"]
        }
      }
    ]
  };
});

// Tool Execution Handler
server.setRequestHandler("tools/call", {
  method: "tools/call"
}, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    if (name === "search_typemate_knowledge") {
      return await searchTypeMateKnowledge(args);
    }
    
    if (name === "get_project_structure") {
      return await getProjectStructure(args);
    }
    
    if (name === "get_implementation_details") {
      return await getImplementationDetails(args);
    }
    
    throw new Error(`Unknown tool: ${name}`);
    
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `❌ Error: ${error.message}`
      }],
      isError: true
    };
  }
});

// TypeMate知識検索実装
async function searchTypeMateKnowledge({ query, domain, include_context = true }) {
  const session = driver.session();
  
  try {
    let cypher = `
      MATCH (f:Feature)
      WHERE ($domain IS NULL OR f.domain = $domain)
        AND (toLower(f.name) CONTAINS toLower($query) 
             OR toLower(f.description) CONTAINS toLower($query))
      RETURN f.name as feature, 
             f.description as description,
             f.status as status,
             f.domain as domain
      ORDER BY f.name
    `;
    
    const result = await session.run(cypher, { query, domain });
    
    let response = `🔍 TypeMate知識検索結果: "${query}"\n\n`;
    
    if (result.records.length === 0) {
      response += "❌ 該当する機能が見つかりませんでした。\n";
      response += "利用可能なドメイン: vector_search, memory_management, ai_personalities, database";
    } else {
      response += `✅ ${result.records.length}件の機能が見つかりました:\n\n`;
      
      for (const record of result.records) {
        const feature = record.get('feature');
        const description = record.get('description');
        const status = record.get('status');
        const featureDomain = record.get('domain');
        
        response += `📌 **${feature}** (${featureDomain})\n`;
        response += `   状態: ${status}\n`;
        response += `   説明: ${description}\n`;
        
        if (include_context) {
          // 関連概念を取得
          const conceptResult = await session.run(`
            MATCH (f:Feature {name: $featureName})-[:IMPLEMENTS]->(c:Concept)
            RETURN c.name as concept, c.description as concept_description
          `, { featureName: feature });
          
          if (conceptResult.records.length > 0) {
            response += `   関連技術: `;
            const concepts = conceptResult.records.map(r => r.get('concept'));
            response += concepts.join(', ') + '\n';
          }
        }
        
        response += '\n';
      }
    }
    
    return {
      content: [{
        type: "text",
        text: response
      }]
    };
    
  } finally {
    await session.close();
  }
}

// プロジェクト構造取得
async function getProjectStructure({ detailed = false }) {
  const session = driver.session();
  
  try {
    const result = await session.run(`
      MATCH (p:Project)-[:HAS_FEATURE]->(f:Feature)
      RETURN p.name as project,
             p.version as version,
             p.tech_stack as tech_stack,
             collect(f {.name, .status, .domain}) as features
    `);
    
    if (result.records.length === 0) {
      return {
        content: [{
          type: "text", 
          text: "❌ プロジェクト情報が見つかりません。"
        }]
      };
    }
    
    const record = result.records[0];
    const project = record.get('project');
    const version = record.get('version');
    const techStack = record.get('tech_stack');
    const features = record.get('features');
    
    let response = `🏗️ **${project} v${version}** プロジェクト構造\n\n`;
    
    if (detailed) {
      response += `🛠️ **技術スタック:**\n`;
      techStack.forEach(tech => {
        response += `   • ${tech}\n`;
      });
      response += '\n';
    }
    
    response += `⚡ **機能 (${features.length}件):**\n`;
    
    // ドメイン別にグループ化
    const domainGroups = {};
    features.forEach(feature => {
      const domain = feature.domain || 'その他';
      if (!domainGroups[domain]) {
        domainGroups[domain] = [];
      }
      domainGroups[domain].push(feature);
    });
    
    Object.keys(domainGroups).forEach(domain => {
      response += `\n📂 **${domain}:**\n`;
      domainGroups[domain].forEach(feature => {
        const statusIcon = feature.status === 'completed' ? '✅' : '🔄';
        response += `   ${statusIcon} ${feature.name}\n`;
      });
    });
    
    return {
      content: [{
        type: "text",
        text: response
      }]
    };
    
  } finally {
    await session.close();
  }
}

// 実装詳細取得
async function getImplementationDetails({ feature_name, include_code = false }) {
  const session = driver.session();
  
  try {
    const result = await session.run(`
      MATCH (f:Feature {name: $featureName})
      OPTIONAL MATCH (f)-[:IMPLEMENTS]->(c:Concept)
      RETURN f.name as feature,
             f.description as description,
             f.status as status,
             f.implementation_files as files,
             collect(c {.name, .description}) as concepts
    `, { featureName: feature_name });
    
    if (result.records.length === 0) {
      return {
        content: [{
          type: "text",
          text: `❌ 機能 "${feature_name}" が見つかりません。`
        }]
      };
    }
    
    const record = result.records[0];
    const feature = record.get('feature');
    const description = record.get('description');
    const status = record.get('status');
    const files = record.get('files');
    const concepts = record.get('concepts');
    
    let response = `📌 **${feature}** 実装詳細\n\n`;
    response += `**状態:** ${status}\n`;
    response += `**説明:** ${description}\n\n`;
    
    if (concepts && concepts.length > 0) {
      response += `🧠 **使用技術・概念:**\n`;
      concepts.forEach(concept => {
        if (concept.name) {
          response += `   • **${concept.name}**`;
          if (concept.description) {
            response += `: ${concept.description}`;
          }
          response += '\n';
        }
      });
      response += '\n';
    }
    
    if (include_code && files && files.length > 0) {
      response += `💻 **実装ファイル:**\n`;
      files.forEach(file => {
        response += `   • ${file}\n`;
      });
    }
    
    return {
      content: [{
        type: "text",
        text: response
      }]
    };
    
  } finally {
    await session.close();
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await driver.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await driver.close();
  process.exit(0);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🎵 TypeMate Neo4j MCP Server started");
}

main().catch(console.error);