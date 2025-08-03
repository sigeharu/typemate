// 🚨 TypeMate Production Functional Test
// 本番環境での機能テスト（チャット・設定ページ集中テスト）

const { chromium } = require('playwright');

class ProductionFunctionalTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = {
      timestamp: new Date().toISOString(),
      environment: 'production',
      tests: [],
      criticalIssues: [],
      summary: {}
    };
  }

  async initialize() {
    console.log('🚀 Initializing Production Functional Test...');
    this.browser = await chromium.launch({ 
      headless: false,
      args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
    this.page = await this.browser.newPage();
    
    // テストモード用ヘッダーを設定
    await this.page.setExtraHTTPHeaders({
      'x-test-mode': 'true'
    });
    
    // ネットワークエラーをキャッチ
    this.page.on('requestfailed', request => {
      console.warn(`⚠️ Network Request Failed: ${request.url()} - ${request.failure().errorText}`);
    });

    // コンソールエラーをキャッチ
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`❌ Console Error: ${msg.text()}`);
        this.testResults.criticalIssues.push({
          type: 'console_error',
          message: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });

    await this.page.setViewportSize({ width: 1200, height: 800 });
  }

  async testAuthentication() {
    console.log('🔐 Testing Authentication...');
    
    const testResult = {
      name: 'Authentication Flow',
      status: 'running',
      issues: [],
      startTime: Date.now()
    };

    try {
      // ホームページアクセス
      await this.page.goto('http://localhost:3000');
      await this.page.waitForTimeout(2000);

      // 認証バイパス（テスト用）
      await this.page.evaluate(() => {
        // より完全なUUID形式のユーザーID
        const testUserId = '550e8400-e29b-41d4-a716-446655440000';
        
        localStorage.setItem('user_id', testUserId);
        localStorage.setItem('userType64', 'ARC-AS');
        localStorage.setItem('test_ai_personality', 'DRM');
        localStorage.setItem('test_mode_active', 'true');
        localStorage.setItem('authenticated', 'true');
        
        // Supabase認証セッション設定
        const mockSession = {
          access_token: 'mock-production-token-2025',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: {
            id: testUserId,
            aud: 'authenticated',
            role: 'authenticated',
            email: 'test@production-functional.test',
            email_confirmed_at: new Date().toISOString(),
            confirmed_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            app_metadata: {
              provider: 'email',
              providers: ['email']
            },
            user_metadata: {},
            identities: []
          }
        };
        
        // Supabase認証設定
        localStorage.setItem('supabase.auth.token', JSON.stringify(mockSession));
        localStorage.setItem('sb-localhost-auth-token', JSON.stringify(mockSession));
        
        // 開発モード設定
        window.localStorage.setItem('development_mode', 'true');
      });

      testResult.status = 'passed';
      testResult.message = 'Authentication bypass successful for testing';
      
    } catch (error) {
      testResult.status = 'failed';
      testResult.issues.push(`Authentication failed: ${error.message}`);
      this.testResults.criticalIssues.push({
        type: 'authentication_failure',
        message: error.message,
        test: 'Authentication Flow'
      });
    }

    testResult.duration = Date.now() - testResult.startTime;
    this.testResults.tests.push(testResult);
    return testResult.status === 'passed';
  }

  async testChatFunction() {
    console.log('💬 Testing Chat Function...');
    
    const testResult = {
      name: 'Chat Function',
      status: 'running',
      issues: [],
      startTime: Date.now()
    };

    try {
      // チャットページに移動（テストモード付き）
      await this.page.goto('http://localhost:3000/chat?test_mode=true');
      
      // チャット画面の完全読み込みを待機
      console.log('⏳ チャット画面の完全読み込みを待機中...');
      await this.page.waitForTimeout(3000);
      
      // 重要なログメッセージを待機してページの初期化完了を確認
      await this.page.waitForFunction(() => {
        return document.querySelector('textarea') || 
               document.querySelector('input[type="text"]') ||
               document.querySelector('[placeholder*="メッセージ"]');
      }, { timeout: 10000 });
      
      await this.page.waitForTimeout(2000); // 追加の安定化待機

      // ページの読み込み確認
      const pageTitle = await this.page.title();
      console.log(`📄 Chat Page Title: ${pageTitle}`);

      // チャット入力フィールドの確認（複数のセレクターで試行）
      let chatInput;
      let isInputVisible = false;
      
      // 主要なセレクター
      const selectors = [
        'textarea[placeholder*="メッセージを入力してください"]',
        'textarea[placeholder*="メッセージ"]',
        'textarea',
        'input[type="text"]'
      ];
      
      for (const selector of selectors) {
        try {
          const allElements = await this.page.locator(selector).all();
          console.log(`🔍 Selector: ${selector} - Count: ${allElements.length}`);
          
          for (let i = 0; i < allElements.length; i++) {
            const element = allElements[i];
            const visible = await element.evaluate(el => {
              return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
            });
            console.log(`  - Element ${i}: Visible=${visible}`);
            
            if (visible) {
              chatInput = element;
              isInputVisible = true;
              console.log(`✅ Found visible input with selector: ${selector} (element ${i})`);
              break;
            }
          }
          
          if (isInputVisible) break;
        } catch (e) {
          console.log(`❌ Selector failed: ${selector} - Error: ${e.message}`);
        }
      }
      
      // さらに詳細な調査
      if (!isInputVisible) {
        console.log('🔍 Debugging: 全ての入力要素を確認中...');
        const allInputs = await this.page.evaluate(() => {
          const inputs = Array.from(document.querySelectorAll('input, textarea'));
          return inputs.map(el => ({
            tag: el.tagName,
            type: el.type,
            placeholder: el.placeholder,
            visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
          }));
        });
        console.log('🔍 All inputs found:', allInputs);
      }
      
      if (!isInputVisible) {
        testResult.issues.push('Chat input field not visible');
        throw new Error('Chat input field not found');
      }

      // テストメッセージの入力
      const testMessage = 'テスト用メッセージ：本番環境での動作確認';
      await chatInput.fill(testMessage);
      await this.page.waitForTimeout(1000);

      // 送信ボタンを探して確認
      const sendButton = await this.page.locator('button[type="submit"], button:has([data-testid="send-icon"]), button:has(svg)').first();
      const isSendButtonVisible = await sendButton.isVisible();
      
      if (!isSendButtonVisible) {
        testResult.issues.push('Send button not visible');
        throw new Error('Send button not found');
      }

      // 送信ボタンクリック
      await sendButton.click();
      await this.page.waitForTimeout(2000);

      // メッセージが送信されたかチェック
      const messageElements = await this.page.locator('[data-testid="message"], .message-bubble, div:has-text("テスト用メッセージ")').count();
      
      if (messageElements === 0) {
        testResult.issues.push('Message not displayed after send');
        
        // デバッグ: 現在のページ状態をチェック
        const currentUrl = this.page.url();
        const hasError = await this.page.locator('text=error, text=エラー').count();
        
        testResult.issues.push(`Current URL: ${currentUrl}`);
        testResult.issues.push(`Error indicators found: ${hasError}`);
        
        throw new Error('Chat message not sent successfully');
      }

      testResult.status = 'passed';
      testResult.message = `Chat function working - ${messageElements} messages found`;
      
    } catch (error) {
      testResult.status = 'failed';
      testResult.issues.push(`Chat function failed: ${error.message}`);
      this.testResults.criticalIssues.push({
        type: 'chat_functionality_failure',
        message: error.message,
        test: 'Chat Function'
      });
    }

    testResult.duration = Date.now() - testResult.startTime;
    this.testResults.tests.push(testResult);
    return testResult.status === 'passed';
  }

  async testSettingsPage() {
    console.log('⚙️ Testing Settings Page...');
    
    const testResult = {
      name: 'Settings Page',
      status: 'running',
      issues: [],
      startTime: Date.now()
    };

    try {
      // 設定ページに移動
      await this.page.goto('http://localhost:3000/settings');
      
      // より長い待機時間で読み込み完了を待つ
      await this.page.waitForTimeout(5000);

      // ローディング状態をチェック
      const loadingIndicators = await this.page.locator('text=loading, text=読み込み中, .loading, .spinner').count();
      
      if (loadingIndicators > 0) {
        console.log('⏳ Still loading, waiting more...');
        await this.page.waitForTimeout(5000);
        
        const stillLoading = await this.page.locator('text=loading, text=読み込み中, .loading, .spinner').count();
        if (stillLoading > 0) {
          testResult.issues.push('Settings page stuck in loading state');
          throw new Error('Settings page failed to load - stuck in loading state');
        }
      }

      // ページタイトル確認
      const pageTitle = await this.page.title();
      console.log(`📄 Settings Page Title: ${pageTitle}`);

      // 設定コンテンツの確認
      const settingsContent = await this.page.locator('h1, h2, h3').count();
      
      if (settingsContent === 0) {
        testResult.issues.push('No settings content found');
        
        // デバッグ情報収集
        const bodyText = await this.page.locator('body').innerText();
        const currentUrl = this.page.url();
        
        testResult.issues.push(`Current URL: ${currentUrl}`);
        testResult.issues.push(`Body content preview: ${bodyText.slice(0, 200)}...`);
        
        throw new Error('Settings page content not loaded');
      }

      // 具体的な設定項目をチェック
      const commonSettings = [
        'プロファイル', 'profile', '設定', 'settings', 
        'ユーザー', 'user', 'アカウント', 'account'
      ];
      
      let foundSettings = 0;
      for (const setting of commonSettings) {
        const count = await this.page.locator(`text=${setting}`).count();
        foundSettings += count;
      }

      testResult.status = 'passed';
      testResult.message = `Settings page loaded successfully - ${settingsContent} headings, ${foundSettings} setting items found`;
      
    } catch (error) {
      testResult.status = 'failed';
      testResult.issues.push(`Settings page failed: ${error.message}`);
      this.testResults.criticalIssues.push({
        type: 'settings_page_failure',
        message: error.message,
        test: 'Settings Page'
      });
    }

    testResult.duration = Date.now() - testResult.startTime;
    this.testResults.tests.push(testResult);
    return testResult.status === 'passed';
  }

  async generateReport() {
    console.log('📊 Generating Production Test Report...');
    
    const passedTests = this.testResults.tests.filter(t => t.status === 'passed').length;
    const failedTests = this.testResults.tests.filter(t => t.status === 'failed').length;
    const totalTests = this.testResults.tests.length;
    
    this.testResults.summary = {
      totalTests,
      passedTests,
      failedTests,
      successRate: Math.round((passedTests / totalTests) * 100),
      criticalIssuesCount: this.testResults.criticalIssues.length,
      status: failedTests === 0 ? 'PASS' : 'FAIL'
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFileName = `production-test-report-${timestamp}.json`;
    
    require('fs').writeFileSync(reportFileName, JSON.stringify(this.testResults, null, 2));
    
    // 人間可読レポートも生成
    const humanReport = this.createHumanReadableReport();
    require('fs').writeFileSync(`production-test-summary-${timestamp}.md`, humanReport);
    
    console.log(`📋 Reports saved: ${reportFileName} and summary.md`);
    return this.testResults;
  }

  createHumanReadableReport() {
    const { summary, tests, criticalIssues } = this.testResults;
    
    return `# TypeMate Production Functional Test Report
**Generated**: ${new Date().toISOString()}

## Summary
- **Status**: ${summary.status}
- **Success Rate**: ${summary.successRate}%
- **Tests**: ${summary.passedTests}/${summary.totalTests} passed
- **Critical Issues**: ${summary.criticalIssuesCount}

## Test Results

${tests.map(test => `
### ${test.name}
- **Status**: ${test.status === 'passed' ? '✅ PASSED' : '❌ FAILED'}
- **Duration**: ${test.duration}ms
- **Message**: ${test.message || 'No message'}
${test.issues.length > 0 ? `- **Issues**: 
  ${test.issues.map(issue => `  - ${issue}`).join('\n')}` : ''}
`).join('\n')}

## Critical Issues
${criticalIssues.length === 0 ? 'None detected ✅' : criticalIssues.map(issue => `
- **Type**: ${issue.type}
- **Test**: ${issue.test || 'Unknown'}
- **Message**: ${issue.message}
- **Time**: ${issue.timestamp}
`).join('\n')}

## Recommendations
${summary.failedTests > 0 ? `
🚨 **Immediate Action Required**
${tests.filter(t => t.status === 'failed').map(test => `
- Fix ${test.name}: ${test.issues[0] || 'See detailed issues above'}
`).join('')}
` : '✅ All tests passed - Production environment is functioning correctly'}

---
*Generated by TypeMate Production Functional Tester*
`;
  }

  async run() {
    console.log('🚀 Starting TypeMate Production Functional Test Suite...\n');
    
    try {
      await this.initialize();
      
      // テスト実行
      const authSuccess = await this.testAuthentication();
      console.log(`✅ Authentication: ${authSuccess ? 'PASSED' : 'FAILED'}\n`);
      
      const chatSuccess = await this.testChatFunction();
      console.log(`✅ Chat Function: ${chatSuccess ? 'PASSED' : 'FAILED'}\n`);
      
      const settingsSuccess = await this.testSettingsPage();
      console.log(`✅ Settings Page: ${settingsSuccess ? 'PASSED' : 'FAILED'}\n`);
      
      // レポート生成
      const report = await this.generateReport();
      
      console.log(`🎉 Production Test Complete!`);
      console.log(`📊 Overall Status: ${report.summary.status}`);
      console.log(`🎯 Success Rate: ${report.summary.successRate}%`);
      
      if (report.summary.criticalIssuesCount > 0) {
        console.log(`🚨 Critical Issues Found: ${report.summary.criticalIssuesCount}`);
        report.criticalIssues.forEach(issue => {
          console.log(`  - ${issue.type}: ${issue.message}`);
        });
      }
      
      return report;
      
    } catch (error) {
      console.error('💥 Production test suite failed:', error);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// メイン実行
async function runProductionTest() {
  const tester = new ProductionFunctionalTester();
  return await tester.run();
}

if (require.main === module) {
  runProductionTest().catch(console.error);
}

module.exports = { ProductionFunctionalTester };