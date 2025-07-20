#!/bin/bash

# 🚨 TypeMate緊急復旧スクリプト（ENFPサポート版）
# 使用方法: ./emergency_restore.sh [戻したいコミット数]

PROJECT_DIR="/Users/miyamotoseiyou/Library/Mobile Documents/com~apple~CloudDocs/CreativeWorkspace/ActiveProjects/typemate"
cd "$PROJECT_DIR"

echo "🚨 TypeMate緊急復旧システム"
echo "================================"

# 引数チェック
STEPS_BACK=${1:-1}

echo "📋 最近のバックアップ履歴:"
echo "================================"
git log --oneline -10 --pretty=format:"%C(yellow)%h%C(reset) %C(blue)%ad%C(reset) %s" --date=format:'%m/%d %H:%M'

echo ""
echo "================================"
echo "🎯 選択されたオプション: ${STEPS_BACK}つ前のバックアップに復旧"
echo ""

# 確認
read -p "🤔 本当に復旧しますか？現在の変更は失われます。(y/N): " confirm
if [[ $confirm != "y" && $confirm != "Y" ]]; then
    echo "❌ 復旧をキャンセルしました"
    exit 0
fi

# バックアップ実行
echo "⏳ 復旧中..."
git reset --hard HEAD~${STEPS_BACK}

if [ $? -eq 0 ]; then
    echo "✅ 復旧完了！${STEPS_BACK}つ前の状態に戻りました"
    echo ""
    echo "📊 現在のファイル状況:"
    git status
else
    echo "❌ 復旧に失敗しました"
    exit 1
fi

echo ""
echo "🎵 復旧完了！安心して開発を再開してください♪"
