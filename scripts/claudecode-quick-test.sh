#!/bin/bash

# 🎵 TypeMate Stage 3 - ClaudeCode 簡易テストスクリプト
# しげちゃんドラマー感性完全実装版 自動検証

set -e

echo "🎵 TypeMate Stage 3 - 簡易品質検証開始"
echo "=================================="

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# ログファイル
LOG_FILE="test-results-$(date +%Y%m%d-%H%M%S).log"

# ヘルパー関数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

log_section() {
    echo -e "\n${PURPLE}=== $1 ===${NC}" | tee -a "$LOG_FILE"
}

# Phase 1: 環境・依存関係チェック
log_section "Phase 1: 環境チェック"

log_info "Node.js環境確認..."
node --version | tee -a "$LOG_FILE"
npm --version | tee -a "$LOG_FILE"

log_info "Package.json確認..."
if [ -f "package.json" ]; then
    log_success "package.json 存在確認"
    grep -A 5 '"scripts"' package.json | tee -a "$LOG_FILE"
else
    log_error "package.json が見つかりません"
    exit 1
fi

log_info "依存関係確認..."
npm list --depth=0 > /dev/null 2>&1 && log_success "依存関係OK" || log_warning "依存関係に問題があります"

# Phase 2: ビルドテスト
log_section "Phase 2: ビルド性能測定"

log_info "クリーンビルド実行中..."
BUILD_START=$(date +%s)
if npm run build > build-output.log 2>&1; then
    BUILD_END=$(date +%s)
    BUILD_TIME=$((BUILD_END - BUILD_START))
    log_success "ビルド成功 (${BUILD_TIME}秒)"
    
    # ビルド結果確認
    if [ -d ".next" ]; then
        log_info "ビルド成果物確認..."
        echo "Generated pages:" | tee -a "$LOG_FILE"
        find .next/server/pages -name "*.html" 2>/dev/null | wc -l | tee -a "$LOG_FILE"
        
        # Static chunks確認
        if [ -d ".next/static/chunks" ]; then
            log_info "Bundle chunks確認..."
            echo "Chunk files count:" | tee -a "$LOG_FILE"
            ls .next/static/chunks/ | wc -l | tee -a "$LOG_FILE"
            
            echo "Top 5 largest chunks:" | tee -a "$LOG_FILE"
            find .next/static/chunks -name "*.js" -exec du -h {} \; | sort -hr | head -5 | tee -a "$LOG_FILE"
        fi
    fi
else
    log_error "ビルド失敗"
    cat build-output.log | tail -20 | tee -a "$LOG_FILE"
    exit 1
fi

# Phase 3: TypeScript型チェック
log_section "Phase 3: TypeScript検証"

log_info "TypeScript型チェック実行中..."
if npx tsc --noEmit > ts-check.log 2>&1; then
    log_success "TypeScript型チェック成功"
else
    log_error "TypeScript型エラーが発生"
    cat ts-check.log | head -10 | tee -a "$LOG_FILE"
fi

# Phase 4: 新機能コンポーネント確認
log_section "Phase 4: Stage 3新機能確認"

log_info "新機能コンポーネントファイル確認..."

COMPONENTS=(
    "src/components/harmonic/WeeklyGuidanceWidget.tsx"
    "src/components/harmonic/MonthlyGuidanceWidget.tsx"
    "src/components/harmonic/CompatibilityAnalysisWidget.tsx"
    "src/app/test-widgets/page.tsx"
)

for component in "${COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        log_success "✅ $component 存在確認"
        # ファイルサイズ確認
        size=$(wc -l < "$component")
        echo "   行数: ${size}行" | tee -a "$LOG_FILE"
    else
        log_error "❌ $component が見つかりません"
    fi
done

# Phase 5: しげちゃんドラマー感性確認
log_section "Phase 5: しげちゃんドラマー感性実装確認"

log_info "ドラマー感性アニメーション確認..."

# 100ms間隔アニメーション確認
if grep -r "staggerChildren.*0\.1" src/components/harmonic/ > /dev/null 2>&1; then
    log_success "✅ 100msアニメーション間隔実装確認"
else
    log_warning "⚠️ 100msアニメーション間隔が見つかりません"
fi

# 音楽的要素確認
if grep -r "ドラマー\|音楽的\|リズム" src/components/harmonic/ > /dev/null 2>&1; then
    log_success "✅ ドラマー感性コメント実装確認"
else
    log_warning "⚠️ ドラマー感性要素が少ない可能性"
fi

# framer-motion使用確認
if grep -r "framer-motion" src/components/harmonic/ > /dev/null 2>&1; then
    log_success "✅ Framer Motion実装確認"
    motion_count=$(grep -r "motion\." src/components/harmonic/ | wc -l)
    echo "   Motion要素数: ${motion_count}箇所" | tee -a "$LOG_FILE"
else
    log_error "❌ Framer Motion実装が見つかりません"
fi

# Phase 6: Bundle分析（可能な場合）
log_section "Phase 6: Bundle分析"

if command -v npx >/dev/null 2>&1; then
    log_info "Bundle分析実行..."
    if npm run analyze > /dev/null 2>&1 &
    then
        ANALYZE_PID=$!
        log_info "Bundle Analyzer起動中... (PID: $ANALYZE_PID)"
        log_info "手動で http://localhost:8888 にアクセスして分析結果を確認してください"
        sleep 5
        
        # プロセス確認
        if kill -0 $ANALYZE_PID 2>/dev/null; then
            log_success "Bundle Analyzer正常起動"
            # 5秒後に自動停止
            sleep 5 && kill $ANALYZE_PID 2>/dev/null &
        else
            log_warning "Bundle Analyzer起動に問題があります"
        fi
    else
        log_warning "Bundle分析をスキップしました"
    fi
else
    log_warning "npxが利用できません - Bundle分析をスキップ"
fi

# Phase 7: 簡易パフォーマンス確認
log_section "Phase 7: 簡易パフォーマンス確認"

log_info "ビルド結果ファイルサイズ確認..."

if [ -d ".next" ]; then
    # .nextディレクトリサイズ
    next_size=$(du -sh .next 2>/dev/null | cut -f1)
    log_info ".next ディレクトリサイズ: $next_size"
    
    # 主要JSファイル確認
    if [ -d ".next/static/chunks/pages" ]; then
        echo "主要ページファイル:" | tee -a "$LOG_FILE"
        find .next/static/chunks/pages -name "*.js" -exec du -h {} \; | head -5 | tee -a "$LOG_FILE"
    fi
else
    log_warning "ビルド結果ディレクトリが見つかりません"
fi

# 最終レポート生成
log_section "最終レポート"

echo "🎵 TypeMate Stage 3 簡易検証結果" | tee -a "$LOG_FILE"
echo "================================" | tee -a "$LOG_FILE"
echo "実行日時: $(date)" | tee -a "$LOG_FILE"
echo "ビルド時間: ${BUILD_TIME:-"未測定"}秒" | tee -a "$LOG_FILE"
echo "ログファイル: $LOG_FILE" | tee -a "$LOG_FILE"

# 成功/失敗判定
if [ -d ".next" ] && [ -f "src/components/harmonic/WeeklyGuidanceWidget.tsx" ]; then
    log_success "🎉 基本検証クリア - TypeMate Stage 3実装確認完了！"
    echo "次のステップ: 詳細テスト手順書での手動検証を推奨" | tee -a "$LOG_FILE"
    exit 0
else
    log_error "❌ 基本検証で問題が発見されました"
    echo "問題解決後、再実行してください" | tee -a "$LOG_FILE"
    exit 1
fi

# クリーンアップ
rm -f build-output.log ts-check.log 2>/dev/null

log_success "🎵 TypeMate Stage 3 簡易検証完了！詳細は $LOG_FILE を確認してください"