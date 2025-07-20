#!/bin/bash

# 🎯 TypeMate自動バックアップスクリプト（ENFPサポート版）
# 使用方法: このスクリプトを実行するだけで自動バックアップ

PROJECT_DIR="/Users/miyamotoseiyou/Library/Mobile Documents/com~apple~CloudDocs/CreativeWorkspace/ActiveProjects/typemate"
cd "$PROJECT_DIR"

echo "🎯 TypeMate自動バックアップ開始..."

# 現在の状況をチェック
git status --porcelain > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Gitリポジトリが見つかりません"
    exit 1
fi

# 変更があるかチェック
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ 変更なし - バックアップ不要"
    exit 0
fi

# 自動コミット（30秒ルール対応）
TIMESTAMP=$(date "+%Y/%m/%d %H:%M")
git add .
git commit -m "🔄 自動バックアップ: $TIMESTAMP"

echo "✅ ローカルバックアップ完了"

# リモートリポジトリがあればプッシュ
git remote -v | grep -q "origin"
if [ $? -eq 0 ]; then
    echo "📤 リモートに同期中..."
    git push origin main 2>/dev/null || git push origin master 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ リモート同期完了"
    else
        echo "⚠️ リモート同期スキップ（オフラインまたは設定なし）"
    fi
else
    echo "💡 リモートリポジトリ未設定（ローカルバックアップのみ）"
fi

echo "🎉 バックアップ完了！"
