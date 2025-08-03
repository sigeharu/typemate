// 🤖 TypeMate Autonomous GUI/UX Evaluator
// 自律的GUI品質評価・改善提案システム

const { chromium } = require('playwright');

class AutonomousGUIEvaluator {
  constructor() {
    this.browser = null;
    this.page = null;
    this.evaluationResults = {
      accessibility: { score: 0, issues: [], recommendations: [] },
      usability: { score: 0, issues: [], recommendations: [] },
      performance: { score: 0, metrics: {}, recommendations: [] },
      design: { score: 0, issues: [], recommendations: [] },
      responsiveness: { score: 0, breakpoints: {}, issues: [] },
      authentication: { bypassSuccess: false, method: '', issues: [] }
    };
  }

  async initializeBrowser() {
    console.log('🚀 Launching browser for autonomous GUI evaluation...');
    this.browser = await chromium.launch({ 
      headless: false, // GUIテストのため可視化
      args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
    this.page = await this.browser.newPage();
    
    // より大きなビューポートで詳細テスト
    await this.page.setViewportSize({ width: 1200, height: 800 });
  }

  async bypassAuthentication() {
    console.log('🔓 Attempting authentication bypass...');
    
    try {
      // Method 1: Development mode setup
      await this.page.goto('http://localhost:3001');
      
      await this.page.evaluate(() => {
        // 開発モード強制設定
        localStorage.setItem('user_id', 'autonomous-test-user-2025');
        localStorage.setItem('userType64', 'ARC-AS');
        localStorage.setItem('test_ai_personality', 'DRM');
        localStorage.setItem('test_mode_active', 'true');
        localStorage.setItem('authenticated', 'true');
        
        // Supabaseセッション模擬
        const mockSession = {
          access_token: 'mock-token-for-testing',
          user: {
            id: 'autonomous-test-user-2025',
            email: 'test@autonomous-gui.eval'
          }
        };
        localStorage.setItem('supabase.auth.token', JSON.stringify(mockSession));
      });

      // 直接チャットページアクセステスト
      await this.page.goto('http://localhost:3001/chat');
      await this.page.waitForTimeout(2000);
      
      const currentUrl = this.page.url();
      if (currentUrl.includes('/chat') && !currentUrl.includes('/auth/signin')) {
        this.evaluationResults.authentication.bypassSuccess = true;
        this.evaluationResults.authentication.method = 'localStorage_mock';
        console.log('✅ Authentication bypass successful!');
        return true;
      }

      // Method 2: Debug page bypass
      await this.page.goto('http://localhost:3001/debug');
      await this.page.waitForTimeout(1000);
      
      if (this.page.url().includes('/debug')) {
        this.evaluationResults.authentication.bypassSuccess = true;
        this.evaluationResults.authentication.method = 'debug_page';
        console.log('✅ Debug page access successful!');
        return true;
      }

      throw new Error('Authentication bypass failed');
      
    } catch (error) {
      this.evaluationResults.authentication.issues.push(`Bypass failed: ${error.message}`);
      console.log('❌ Authentication bypass failed, proceeding with limited testing');
      return false;
    }
  }

  async evaluateAccessibility() {
    console.log('♿ Evaluating accessibility...');
    
    const accessibilityIssues = await this.page.evaluate(() => {
      const issues = [];
      
      // Color contrast check
      const elements = document.querySelectorAll('*');
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const bgColor = styles.backgroundColor;
        const textColor = styles.color;
        
        if (textColor && textColor !== 'rgba(0, 0, 0, 0)' && bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          // Simplified contrast check
          if (textColor === bgColor) {
            issues.push(`Low contrast detected on ${el.tagName}`);
          }
        }
      });

      // Alt text check
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.alt || img.alt.trim() === '') {
          issues.push(`Missing alt text on image: ${img.src || img.className}`);
        }
      });

      // Keyboard navigation
      const interactive = document.querySelectorAll('button, a, input, select, textarea');
      let tabIndex = 0;
      interactive.forEach(el => {
        if (el.tabIndex === -1) {
          issues.push(`Element not keyboard accessible: ${el.tagName}.${el.className}`);
        }
        tabIndex++;
      });

      // ARIA labels
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {
        if (!btn.textContent?.trim() && !btn.getAttribute('aria-label')) {
          issues.push(`Button missing accessible label: ${btn.className}`);
        }
      });

      return {
        issues,
        totalElements: elements.length,
        interactiveElements: interactive.length
      };
    });

    const score = Math.max(0, 100 - (accessibilityIssues.issues.length * 10));
    this.evaluationResults.accessibility = {
      score,
      issues: accessibilityIssues.issues,
      recommendations: this.generateAccessibilityRecommendations(accessibilityIssues.issues)
    };
  }

  async evaluateUsability() {
    console.log('👤 Evaluating usability...');
    
    const usabilityMetrics = await this.page.evaluate(() => {
      const metrics = {
        buttonSizes: [],
        tapTargets: [],
        formIssues: [],
        navigationIssues: []
      };

      // Button size check (minimum 44px for mobile)
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
          metrics.buttonSizes.push(`Small button: ${btn.textContent?.trim() || btn.className} (${Math.round(rect.width)}x${Math.round(rect.height)})`);
        }
      });

      // Tap target spacing (minimum 8px)
      const clickables = document.querySelectorAll('button, a, [onclick]');
      clickables.forEach((el, i) => {
        const rect1 = el.getBoundingClientRect();
        clickables.forEach((other, j) => {
          if (i !== j) {
            const rect2 = other.getBoundingClientRect();
            const distance = Math.sqrt(
              Math.pow(rect1.x - rect2.x, 2) + Math.pow(rect1.y - rect2.y, 2)
            );
            if (distance < 8 && distance > 0) {
              metrics.tapTargets.push(`Close tap targets: ${el.textContent?.trim()} and ${other.textContent?.trim()}`);
            }
          }
        });
      });

      // Form usability
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        if (!input.labels || input.labels.length === 0) {
          metrics.formIssues.push(`Input missing label: ${input.type || input.tagName}`);
        }
        if (input.type === 'email' && !input.pattern && !input.inputMode) {
          metrics.formIssues.push(`Email input missing mobile optimization`);
        }
      });

      // Navigation structure
      const navElements = document.querySelectorAll('nav, [role="navigation"]');
      if (navElements.length === 0) {
        metrics.navigationIssues.push('No navigation landmark found');
      }

      return metrics;
    });

    const totalIssues = Object.values(usabilityMetrics).flat().length;
    const score = Math.max(0, 100 - (totalIssues * 8));
    
    this.evaluationResults.usability = {
      score,
      issues: Object.values(usabilityMetrics).flat(),
      recommendations: this.generateUsabilityRecommendations(usabilityMetrics)
    };
  }

  async evaluatePerformance() {
    console.log('⚡ Evaluating performance...');
    
    const performanceMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paintEntries = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
        resourceCount: performance.getEntriesByType('resource').length
      };
    });

    // Performance scoring
    let score = 100;
    const recommendations = [];
    
    if (performanceMetrics.domContentLoaded > 2000) {
      score -= 20;
      recommendations.push('DOM Content Loaded time is slow (>2s)');
    }
    
    if (performanceMetrics.firstContentfulPaint > 1500) {
      score -= 15;
      recommendations.push('First Contentful Paint is slow (>1.5s)');
    }
    
    if (performanceMetrics.resourceCount > 50) {
      score -= 10;
      recommendations.push('Too many resources loaded');
    }

    this.evaluationResults.performance = {
      score: Math.max(0, score),
      metrics: performanceMetrics,
      recommendations
    };
  }

  async evaluateResponsiveness() {
    console.log('📱 Evaluating responsiveness...');
    
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1200, height: 800 }
    ];

    const responsivenessResults = {};
    
    for (const breakpoint of breakpoints) {
      await this.page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await this.page.waitForTimeout(500);
      
      const evaluation = await this.page.evaluate(() => {
        const issues = [];
        
        // Horizontal scrollbar check
        if (document.body.scrollWidth > window.innerWidth) {
          issues.push('Horizontal scrollbar present');
        }
        
        // Overlapping elements
        const elements = Array.from(document.querySelectorAll('*')).filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });
        
        for (let i = 0; i < elements.length; i++) {
          const rect1 = elements[i].getBoundingClientRect();
          for (let j = i + 1; j < elements.length; j++) {
            const rect2 = elements[j].getBoundingClientRect();
            
            if (rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y) {
              // Check if it's intentional overlap (parent-child)
              if (!elements[j].contains(elements[i]) && !elements[i].contains(elements[j])) {
                issues.push(`Overlapping elements detected at ${breakpoint.name}`);
                break;
              }
            }
          }
        }
        
        // Text readability
        const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
        textElements.forEach(el => {
          const styles = window.getComputedStyle(el);
          const fontSize = parseFloat(styles.fontSize);
          if (fontSize < 14) {
            issues.push(`Small font size (${fontSize}px) on ${breakpoint.name}`);
          }
        });
        
        return { issues, viewportUsage: window.innerWidth / document.body.scrollWidth };
      });
      
      responsivenessResults[breakpoint.name] = evaluation;
    }

    const totalIssues = Object.values(responsivenessResults).reduce((sum, result) => sum + result.issues.length, 0);
    const score = Math.max(0, 100 - (totalIssues * 15));
    
    this.evaluationResults.responsiveness = {
      score,
      breakpoints: responsivenessResults,
      issues: Object.values(responsivenessResults).flatMap(r => r.issues)
    };
  }

  async evaluateDesign() {
    console.log('🎨 Evaluating design consistency...');
    
    const designMetrics = await this.page.evaluate(() => {
      const issues = [];
      const recommendations = [];
      
      // Color consistency
      const colors = new Set();
      const elements = document.querySelectorAll('*');
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        if (styles.color !== 'rgba(0, 0, 0, 0)') colors.add(styles.color);
        if (styles.backgroundColor !== 'rgba(0, 0, 0, 0)') colors.add(styles.backgroundColor);
      });
      
      if (colors.size > 20) {
        issues.push(`Too many colors used (${colors.size}), consider design system`);
      }
      
      // Font consistency
      const fonts = new Set();
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        fonts.add(styles.fontFamily);
      });
      
      if (fonts.size > 5) {
        issues.push(`Too many font families (${fonts.size}), consider typography system`);
      }
      
      // Spacing consistency
      const margins = new Set();
      const paddings = new Set();
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        if (styles.margin !== '0px') margins.add(styles.margin);
        if (styles.padding !== '0px') paddings.add(styles.padding);
      });
      
      // Button consistency
      const buttons = document.querySelectorAll('button');
      const buttonStyles = [];
      buttons.forEach(btn => {
        const styles = window.getComputedStyle(btn);
        buttonStyles.push({
          borderRadius: styles.borderRadius,
          padding: styles.padding,
          fontSize: styles.fontSize
        });
      });
      
      // Check for inconsistent button styles
      const uniqueButtonStyles = new Set(buttonStyles.map(s => JSON.stringify(s)));
      if (uniqueButtonStyles.size > 3 && buttons.length > 3) {
        issues.push('Inconsistent button styling detected');
      }
      
      return {
        issues,
        colorCount: colors.size,
        fontCount: fonts.size,
        buttonStyleCount: uniqueButtonStyles.size
      };
    });

    const score = Math.max(0, 100 - (designMetrics.issues.length * 12));
    
    this.evaluationResults.design = {
      score,
      issues: designMetrics.issues,
      recommendations: this.generateDesignRecommendations(designMetrics)
    };
  }

  generateAccessibilityRecommendations(issues) {
    const recommendations = [];
    
    if (issues.some(i => i.includes('contrast'))) {
      recommendations.push('Improve color contrast ratios to meet WCAG AA standards (4.5:1)');
    }
    if (issues.some(i => i.includes('alt text'))) {
      recommendations.push('Add descriptive alt text to all images');
    }
    if (issues.some(i => i.includes('keyboard'))) {
      recommendations.push('Ensure all interactive elements are keyboard accessible');
    }
    if (issues.some(i => i.includes('aria-label'))) {
      recommendations.push('Add ARIA labels to buttons without visible text');
    }
    
    return recommendations;
  }

  generateUsabilityRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.buttonSizes.length > 0) {
      recommendations.push('Increase button sizes to minimum 44x44px for touch accessibility');
    }
    if (metrics.tapTargets.length > 0) {
      recommendations.push('Increase spacing between clickable elements (minimum 8px)');
    }
    if (metrics.formIssues.length > 0) {
      recommendations.push('Add proper labels and mobile optimization to form inputs');
    }
    if (metrics.navigationIssues.length > 0) {
      recommendations.push('Add semantic navigation structure with proper landmarks');
    }
    
    return recommendations;
  }

  generateDesignRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.colorCount > 15) {
      recommendations.push('Implement a consistent color palette with design tokens');
    }
    if (metrics.fontCount > 3) {
      recommendations.push('Establish a typography system with consistent font usage');
    }
    if (metrics.buttonStyleCount > 3) {
      recommendations.push('Create consistent button component variants');
    }
    
    return recommendations;
  }

  async generateComprehensiveReport() {
    console.log('📊 Generating comprehensive evaluation report...');
    
    const overall = {
      totalScore: 0,
      grade: '',
      criticalIssues: [],
      quickWins: [],
      longTermImprovements: []
    };

    // Calculate overall score
    const scores = Object.values(this.evaluationResults).filter(r => r.score !== undefined).map(r => r.score);
    overall.totalScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    
    // Assign grade
    if (overall.totalScore >= 90) overall.grade = 'A';
    else if (overall.totalScore >= 80) overall.grade = 'B';
    else if (overall.totalScore >= 70) overall.grade = 'C';
    else if (overall.totalScore >= 60) overall.grade = 'D';
    else overall.grade = 'F';

    // Categorize improvements
    Object.entries(this.evaluationResults).forEach(([category, result]) => {
      if (result.score !== undefined && result.score < 60) {
        overall.criticalIssues.push(`${category}: ${result.score}/100`);
      }
      if (result.recommendations) {
        result.recommendations.forEach(rec => {
          if (rec.includes('Add') || rec.includes('Increase spacing')) {
            overall.quickWins.push(rec);
          } else {
            overall.longTermImprovements.push(rec);
          }
        });
      }
    });

    return { ...this.evaluationResults, overall };
  }

  async runFullEvaluation() {
    try {
      await this.initializeBrowser();
      
      const authSuccess = await this.bypassAuthentication();
      
      if (authSuccess) {
        console.log('🎯 Running full GUI evaluation suite...');
        await this.evaluateAccessibility();
        await this.evaluateUsability();
        await this.evaluatePerformance();
        await this.evaluateResponsiveness();
        await this.evaluateDesign();
      } else {
        console.log('⚠️ Running limited evaluation without authentication...');
        await this.page.goto('http://localhost:3001');
        await this.evaluateAccessibility();
        await this.evaluateResponsiveness();
        await this.evaluateDesign();
      }
      
      const report = await this.generateComprehensiveReport();
      await this.saveReport(report);
      
      return report;
      
    } catch (error) {
      console.error('❌ Evaluation failed:', error);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  async saveReport(report) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `gui-evaluation-report-${timestamp}.json`;
    
    require('fs').writeFileSync(fileName, JSON.stringify(report, null, 2));
    console.log(`📋 Report saved: ${fileName}`);
    
    // Also create human-readable summary
    const summary = this.createHumanReadableSummary(report);
    require('fs').writeFileSync(`gui-evaluation-summary-${timestamp}.md`, summary);
    console.log(`📝 Summary saved: gui-evaluation-summary-${timestamp}.md`);
  }

  createHumanReadableSummary(report) {
    return `# TypeMate GUI Evaluation Report
Generated: ${new Date().toISOString()}

## Overall Assessment
**Grade: ${report.overall.grade}**  
**Total Score: ${report.overall.totalScore}/100**

## Category Scores
${Object.entries(report).filter(([k, v]) => v.score !== undefined).map(([category, result]) => 
  `- **${category}**: ${result.score}/100`
).join('\n')}

## Authentication Status
- **Bypass Success**: ${report.authentication.bypassSuccess}
- **Method Used**: ${report.authentication.method || 'None'}

## Critical Issues (Score < 60)
${report.overall.criticalIssues.map(issue => `- ${issue}`).join('\n') || 'None detected ✅'}

## Quick Wins
${report.overall.quickWins.slice(0, 5).map(win => `- ${win}`).join('\n') || 'None identified'}

## Long-term Improvements
${report.overall.longTermImprovements.slice(0, 5).map(imp => `- ${imp}`).join('\n') || 'None identified'}

## Detailed Results

### Accessibility (${report.accessibility.score}/100)
Issues: ${report.accessibility.issues.length}
${report.accessibility.recommendations.map(rec => `- ${rec}`).join('\n')}

### Usability (${report.usability.score}/100)
Issues: ${report.usability.issues.length}
${report.usability.recommendations.map(rec => `- ${rec}`).join('\n')}

### Performance (${report.performance.score}/100)
Metrics:
- DOM Content Loaded: ${Math.round(report.performance.metrics.domContentLoaded)}ms
- First Contentful Paint: ${Math.round(report.performance.metrics.firstContentfulPaint)}ms
- Resource Count: ${report.performance.metrics.resourceCount}

### Responsiveness (${report.responsiveness.score}/100)
Issues across breakpoints: ${report.responsiveness.issues.length}

### Design (${report.design.score}/100)
Issues: ${report.design.issues.length}
${report.design.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*Generated by TypeMate Autonomous GUI Evaluator*
`;
  }
}

// Main execution
async function runAutonomousEvaluation() {
  console.log('🤖 Starting TypeMate Autonomous GUI Evaluation...');
  
  const evaluator = new AutonomousGUIEvaluator();
  
  try {
    const report = await evaluator.runFullEvaluation();
    
    console.log('\n🎉 Evaluation Complete!');
    console.log(`📊 Overall Grade: ${report.overall.grade}`);
    console.log(`🎯 Total Score: ${report.overall.totalScore}/100`);
    console.log(`🔐 Auth Bypass: ${report.authentication.bypassSuccess ? '✅ Success' : '❌ Failed'}`);
    
    if (report.overall.criticalIssues.length > 0) {
      console.log('\n🚨 Critical Issues:');
      report.overall.criticalIssues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    if (report.overall.quickWins.length > 0) {
      console.log('\n⚡ Quick Wins:');
      report.overall.quickWins.slice(0, 3).forEach(win => console.log(`  - ${win}`));
    }
    
    return report;
    
  } catch (error) {
    console.error('💥 Evaluation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runAutonomousEvaluation();
}

module.exports = { AutonomousGUIEvaluator };