// 🔍 TypeMate Static Site Problem Diagnosis
// 静的サイトでの問題調査とデバッグ

const { chromium } = require('playwright');

class StaticSiteDiagnostic {
  constructor() {
    this.browser = null;
    this.page = null;
    this.issues = [];
  }

  async initialize() {
    console.log('🔍 Initializing Static Site Diagnostic...');
    this.browser = await chromium.launch({ 
      headless: false,
      args: ['--disable-web-security']
    });
    this.page = await this.browser.newPage();
    
    // すべてのコンソールログをキャッチ
    this.page.on('console', msg => {
      console.log(`📝 Console [${msg.type()}]: ${msg.text()}`);
      if (msg.type() === 'error') {
        this.issues.push({
          type: 'console_error',
          message: msg.text(),
          location: 'console'
        });
      }
    });

    // ネットワークエラーをキャッチ
    this.page.on('requestfailed', request => {
      console.warn(`⚠️ Network Failed: ${request.url()} - ${request.failure().errorText}`);
      this.issues.push({
        type: 'network_error', 
        message: `${request.url()} - ${request.failure().errorText}`,
        location: 'network'
      });
    });

    await this.page.setViewportSize({ width: 1200, height: 800 });
  }

  async testHomePage() {
    console.log('🏠 Testing Home Page...');
    
    try {
      await this.page.goto('http://localhost:3002');
      await this.page.waitForTimeout(3000);

      const title = await this.page.title();
      console.log(`📄 Home Page Title: ${title}`);

      // JavaScriptが動作しているかチェック
      const hasReact = await this.page.evaluate(() => {
        return typeof window.React !== 'undefined' || document.querySelector('[data-reactroot]') !== null;
      });

      console.log(`⚛️ React Detection: ${hasReact ? 'Found' : 'Not Found'}`);

      // 静的生成されたコンテンツをチェック
      const bodyText = await this.page.locator('body').innerText();
      console.log(`📝 Body Content Preview: ${bodyText.slice(0, 200)}...`);

      return { success: true, title, hasReact, bodyPreview: bodyText.slice(0, 200) };
      
    } catch (error) {
      console.error(`❌ Home Page Test Failed: ${error.message}`);
      this.issues.push({
        type: 'page_load_error',
        message: error.message,
        location: 'home_page'
      });
      return { success: false, error: error.message };
    }
  }

  async testChatPageStatic() {
    console.log('💬 Testing Chat Page (Static)...');
    
    try {
      await this.page.goto('http://localhost:3002/chat');
      await this.page.waitForTimeout(3000);

      const title = await this.page.title();
      console.log(`📄 Chat Page Title: ${title}`);

      // チャット関連要素の確認
      const hasTextarea = await this.page.locator('textarea').count();
      const hasButtons = await this.page.locator('button').count();
      
      console.log(`📝 Textareas found: ${hasTextarea}`);
      console.log(`🔘 Buttons found: ${hasButtons}`);

      // JavaScriptエラーの確認
      const jsErrors = this.issues.filter(issue => issue.type === 'console_error');
      
      return { 
        success: true, 
        title, 
        hasTextarea, 
        hasButtons, 
        jsErrors: jsErrors.length 
      };
      
    } catch (error) {
      console.error(`❌ Chat Page Test Failed: ${error.message}`);
      this.issues.push({
        type: 'page_load_error',
        message: error.message,
        location: 'chat_page'
      });
      return { success: false, error: error.message };
    }
  }

  async testSettingsPageStatic() {
    console.log('⚙️ Testing Settings Page (Static)...');
    
    try {
      await this.page.goto('http://localhost:3002/settings');
      await this.page.waitForTimeout(5000);

      const title = await this.page.title();
      console.log(`📄 Settings Page Title: ${title}`);

      // ページコンテンツの確認
      const headings = await this.page.locator('h1, h2, h3').count();
      const bodyText = await this.page.locator('body').innerText();
      
      console.log(`📝 Headings found: ${headings}`);
      console.log(`📝 Body Content Preview: ${bodyText.slice(0, 200)}...`);

      // ローディング状態のチェック
      const hasLoadingIndicators = await this.page.locator('text=loading, text=読み込み中, .loading, .spinner').count();
      console.log(`⏳ Loading indicators: ${hasLoadingIndicators}`);

      return { 
        success: true, 
        title, 
        headings, 
        hasLoadingIndicators,
        bodyPreview: bodyText.slice(0, 200) 
      };
      
    } catch (error) {
      console.error(`❌ Settings Page Test Failed: ${error.message}`);
      this.issues.push({
        type: 'page_load_error',
        message: error.message,
        location: 'settings_page'
      });
      return { success: false, error: error.message };
    }
  }

  async identifyRootCause() {
    console.log('🔬 Analyzing Root Cause...');
    
    const analysis = {
      hydrationIssues: false,
      authenticationProblems: false,
      apiConnectionFailure: false,
      buildProblems: false,
      staticVsDynamicIssues: false
    };

    // JavaScriptエラー分析
    const jsErrors = this.issues.filter(issue => issue.type === 'console_error');
    
    jsErrors.forEach(error => {
      const message = error.message.toLowerCase();
      
      if (message.includes('hydration') || message.includes('hydrate')) {
        analysis.hydrationIssues = true;
      }
      if (message.includes('auth') || message.includes('authentication')) {
        analysis.authenticationProblems = true;
      }
      if (message.includes('fetch') || message.includes('api') || message.includes('network')) {
        analysis.apiConnectionFailure = true;
      }
      if (message.includes('chunk') || message.includes('module')) {
        analysis.buildProblems = true;
      }
    });

    // ネットワークエラー分析
    const networkErrors = this.issues.filter(issue => issue.type === 'network_error');
    if (networkErrors.length > 0) {
      analysis.apiConnectionFailure = true;
    }

    return analysis;
  }

  async generateDiagnosticReport() {
    console.log('📊 Generating Diagnostic Report...');
    
    const rootCause = await this.identifyRootCause();
    
    const report = {
      timestamp: new Date().toISOString(),
      environment: 'static_site',
      totalIssues: this.issues.length,
      issues: this.issues,
      rootCauseAnalysis: rootCause,
      recommendations: []
    };

    // 推奨事項の生成
    if (rootCause.hydrationIssues) {
      report.recommendations.push({
        priority: 'HIGH',
        issue: 'React Hydration Problems',
        solution: 'Check for client-server rendering mismatches. Review useEffect dependencies and localStorage usage.'
      });
    }

    if (rootCause.authenticationProblems) {
      report.recommendations.push({
        priority: 'HIGH', 
        issue: 'Authentication System Issues',
        solution: 'Review authentication provider setup and localStorage/sessionStorage usage in SSR context.'
      });
    }

    if (rootCause.apiConnectionFailure) {
      report.recommendations.push({
        priority: 'MEDIUM',
        issue: 'API Connection Failures',
        solution: 'Check API endpoints, environment variables, and CORS settings.'
      });
    }

    if (rootCause.buildProblems) {
      report.recommendations.push({
        priority: 'HIGH',
        issue: 'Build/Bundle Problems', 
        solution: 'Review webpack/next.js build configuration and dependencies.'
      });
    }

    // レポート保存
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    require('fs').writeFileSync(`static-site-diagnostic-${timestamp}.json`, JSON.stringify(report, null, 2));
    
    const summary = this.createHumanReadableSummary(report);
    require('fs').writeFileSync(`static-site-diagnostic-summary-${timestamp}.md`, summary);
    
    console.log(`📋 Diagnostic report saved: static-site-diagnostic-${timestamp}.json`);
    return report;
  }

  createHumanReadableSummary(report) {
    return `# TypeMate Static Site Diagnostic Report
**Generated**: ${new Date().toISOString()}

## Issue Summary
- **Total Issues**: ${report.totalIssues}
- **Console Errors**: ${report.issues.filter(i => i.type === 'console_error').length}
- **Network Errors**: ${report.issues.filter(i => i.type === 'network_error').length}
- **Page Load Errors**: ${report.issues.filter(i => i.type === 'page_load_error').length}

## Root Cause Analysis
${Object.entries(report.rootCauseAnalysis).map(([cause, detected]) => 
  `- **${cause}**: ${detected ? '🚨 DETECTED' : '✅ Clear'}`
).join('\n')}

## Detailed Issues
${report.issues.map((issue, i) => `
### Issue ${i + 1}: ${issue.type}
- **Location**: ${issue.location}
- **Message**: ${issue.message}
`).join('\n')}

## Recommendations
${report.recommendations.map((rec, i) => `
### ${rec.priority} Priority: ${rec.issue}
**Solution**: ${rec.solution}
`).join('\n')}

## Next Steps
1. Address HIGH priority issues first
2. Test in development mode to compare behavior
3. Check browser console for additional clues
4. Review environment variables and build configuration

---
*Generated by TypeMate Static Site Diagnostic*
`;
  }

  async run() {
    console.log('🚀 Starting TypeMate Static Site Diagnostic...\n');
    
    try {
      await this.initialize();
      
      // テスト実行
      const homeResult = await this.testHomePage();
      console.log(`✅ Home Page: ${homeResult.success ? 'SUCCESS' : 'FAILED'}\n`);
      
      const chatResult = await this.testChatPageStatic();
      console.log(`✅ Chat Page: ${chatResult.success ? 'SUCCESS' : 'FAILED'}\n`);
      
      const settingsResult = await this.testSettingsPageStatic();
      console.log(`✅ Settings Page: ${settingsResult.success ? 'SUCCESS' : 'FAILED'}\n`);
      
      // 診断レポート生成
      const report = await this.generateDiagnosticReport();
      
      console.log(`🎉 Diagnostic Complete!`);
      console.log(`📊 Total Issues Found: ${report.totalIssues}`);
      
      if (report.recommendations.length > 0) {
        console.log(`🔧 Recommendations Generated: ${report.recommendations.length}`);
        report.recommendations.forEach(rec => {
          console.log(`  - ${rec.priority}: ${rec.issue}`);
        });
      }
      
      return report;
      
    } catch (error) {
      console.error('💥 Diagnostic failed:', error);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// メイン実行
async function runStaticSiteDiagnostic() {
  const diagnostic = new StaticSiteDiagnostic();
  return await diagnostic.run();
}

if (require.main === module) {
  runStaticSiteDiagnostic().catch(console.error);
}

module.exports = { StaticSiteDiagnostic };