#!/bin/bash

# 📊 TypeMate自動バックアップ ステータスチェッカー
# 使用方法: ./status_check.sh

PROJECT_DIR="/Users/miyamotoseiyou/Library/Mobile Documents/com~apple~CloudDocs/CreativeWorkspace/ActiveProjects/typemate"
cd "$PROJECT_DIR"

echo "📊 TypeMate自動バックアップ システム状況"
echo "========================================"

# Git状況確認
echo "🎯 Gitリポジトリ状況:"
if [ -d ".git" ]; then
    echo "✅ Gitリポジトリ: 正常"
    
    # 最新コミット情報
    echo "📝 最新バックアップ:"
    git log -1 --pretty=format:"   🕐 %ad%n   📄 %s%n" --date=format:'%Y/%m/%d %H:%M'
    
    # 未コミット変更
    if [ -z "$(git status --porcelain)" ]; then
        echo "💾 変更状況: 保存済み"
    else
        echo "⚠️ 変更状況: 未保存の変更あり"
        echo "   💡 次回自動バックアップで保存されます"
    fi
else
    echo "❌ Gitリポジトリ: 見つかりません"
fi

echo ""

# 自動バックアップサービス状況
echo "🤖 自動バックアップサービス:"
if launchctl list | grep -q "com.typemate.autobackup"; then
    echo "✅ 自動バックアップ: 稼働中"
    echo "   ⏱️ 30分毎に自動実行"
else
    echo "❌ 自動バックアップ: 停止中"
    echo "   💡 再開: launchctl load ~/Library/LaunchAgents/com.typemate.autobackup.plist"
fi

echo ""

# バックアップログ確認
echo "📋 最近のバックアップログ:"
if [ -f "backup.log" ]; then
    tail -3 "backup.log" | sed 's/^/   /'
else
    echo "   📄 ログファイルなし（まだバックアップ未実行）"
fi

echo ""
echo "🎵 システム正常！安心して開発してください♪"
