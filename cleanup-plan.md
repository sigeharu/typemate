# 🧹 TypeMate プロジェクトクリーンアップ計画

**作成日**: 2025年8月6日  
**目的**: 不要ファイルの安全な削除によるプロジェクト整理

---

## 📊 現状分析

- **総ファイル数**: 約200ファイル
- **削除候補**: 約70ファイル (35%)
- **削除後の効果**: プロジェクトがクリーンで管理しやすくなる

---

## 🗑️ 削除対象ファイル

### 1. テストレポート・ログファイル (48ファイル)
```bash
# Production test reports
production-test-report-2025-08-03T*.json (16ファイル)
production-test-summary-2025-08-03T*.md (16ファイル)

# GUI test reports  
gui-evaluation-report-*.json (2ファイル)
gui-evaluation-summary-*.md (2ファイル)
gui-test-executive-summary-*.md
comprehensive-gui-test-report-*.json

# Other test reports
static-site-diagnostic-*.json
static-site-diagnostic-summary-*.md
ux-analysis-report-*.json
ux-analysis-summary-*.md

# Log files
test-results-20250803-*.log (7ファイル)
backup.log
backup_error.log
build-output.log
server.log
ts-check.log
```

### 2. 古いテスト・デモスクリプト (11ファイル)
```bash
direct-api-test.js
production-debug-test.js
test-harmonic-fixes.js
mood-button-static-analysis.js
auto-learn-session.js
cipher-integration-test.js
cipher-knowledge-update-test.js
cipher-mcp-integration-test.js
cipher-performance-test.js
cipher-stability-test.js
simple-knowledge-query.js
hybrid-search-demo.js
```

### 3. 不要なドキュメント (5ファイル)
```bash
DISABLE_DEV_MODE.md
MOOD_BUTTON_TEST_REPORT.md
VECTOR_TEST_REPORT.md  
VERCEL_ENV_CHECK.md
accessibility-test-result.md
```

### 4. 古いMCPサーバー実装 (2ファイル)
```bash
claude-memory-mcp-server.js
claude-memory-mcp-server-fixed.js
```

---

## ✅ 保持すべき重要ファイル

### コアドキュメント
- README.md
- CLAUDE.md
- CLAUDE_CIPHER_GOLDEN_RELAY_COMPLETE.md
- CLAUDE_CIPHER_INTEGRATION_SUCCESS.md
- CONTEXT_ENGINEERING.md
- docs/フォルダ内全て

### 実装済みシステム
- claude-cipher-golden-relay.js (黄金リレー)
- auto-save-file-watcher.js (ファイル監視)
- auto-save-session-hook.js (セッションフック)
- smart-auto-save.js (スマート保存)

### 必須スクリプト  
- test-neo4j-connection.js
- test-vector-memory.js
- typemate-knowledge-import.js
- vector-memory-enhancement.ts

### データベース・設定
- data/フォルダ (Cipherデータベース)
- memAgent/フォルダ (Cipher設定)
- .env.local (環境変数)

---

## 🚀 実行コマンド

### 安全な削除実行
```bash
# 1. まずバックアップ作成
tar -czf typemate-backup-$(date +%Y%m%d-%H%M%S).tar.gz .

# 2. テストレポート削除
rm -f production-test-report-*.json
rm -f production-test-summary-*.md
rm -f gui-evaluation-*.{json,md}
rm -f gui-test-executive-summary-*.md
rm -f comprehensive-gui-test-report-*.json
rm -f static-site-diagnostic-*.{json,md}
rm -f ux-analysis-*.{json,md}

# 3. ログファイル削除
rm -f test-results-*.log
rm -f {backup,backup_error,build-output,server,ts-check}.log

# 4. 古いスクリプト削除
rm -f {direct-api-test,production-debug-test,test-harmonic-fixes}.js
rm -f {mood-button-static-analysis,auto-learn-session}.js
rm -f cipher-{integration,knowledge-update,mcp-integration,performance,stability}-test.js
rm -f {simple-knowledge-query,hybrid-search-demo}.js

# 5. 不要ドキュメント削除
rm -f {DISABLE_DEV_MODE,MOOD_BUTTON_TEST_REPORT,VECTOR_TEST_REPORT,VERCEL_ENV_CHECK,accessibility-test-result}.md

# 6. 古いMCPサーバー削除
rm -f claude-memory-mcp-server{,-fixed}.js
```

---

## ⚠️ 注意事項

1. **実行前に必ずバックアップを作成**
2. **削除前に各ファイルを再確認**
3. **誤って重要ファイルを削除しないよう注意**
4. **疑わしい場合は削除せず保持**

---

## 📊 クリーンアップ効果

- **ファイル数**: 約200 → 約130 (35%削減)
- **可読性**: プロジェクト構造が明確に
- **管理性**: 必要なファイルのみで作業効率向上
- **ストレージ**: 不要なログ・レポートファイル削除で軽量化

**🎵 クリーンで美しいプロジェクト構造を実現！**