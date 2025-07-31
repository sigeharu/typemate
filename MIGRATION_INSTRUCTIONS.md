# 🌟 LifeMate データベースマイグレーション実行手順

## 🎯 **目標**: TypeMate → LifeMate データベース拡張

### **Step 1: Supabase SQL Editor アクセス**
1. https://supabase.com にアクセス
2. TypeMateプロジェクトを選択
3. SQL Editor を開く

### **Step 2: マイグレーションSQLコピー**
```bash
# ローカルファイルの内容をコピー
cat /Users/miyamotoseiyou/Library/Mobile\ Documents/com~apple~CloudDocs/CreativeWorkspace/ActiveProjects/typemate/LIFEMATE_DATABASE_UPGRADE.sql
```

### **Step 3: SQL実行**
1. SQL Editorに`LIFEMATE_DATABASE_UPGRADE.sql`の内容を貼り付け
2. "RUN"ボタンをクリック
3. 完了メッセージ確認

### **Step 4: 実行確認**
```sql
-- 新しいテーブル確認
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('mood_energy_logs', 'cosmic_events', 'personal_cosmic_guidance', 'synchronicity_events');

-- user_profilesの新カラム確認
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('birth_date', 'zodiac_sign', 'life_path_number');
```

## 🎉 **期待される結果**
- ✅ 4つの新しいテーブル作成
- ✅ user_profilesに9つの新カラム追加
- ✅ インデックス・RLS設定完了
- ✅ サンプル宇宙的イベントデータ投入

## 🚨 **エラーが出た場合**
- カラム追加エラー → `IF NOT EXISTS`で安全実行済み
- RLSエラー → 既存ポリシーと重複時は無視される
- インデックスエラー → `IF NOT EXISTS`で重複回避済み

## ⚡ **実行後の状況**
- データベース基盤完成
- 次: 占星術ライブラリ統合
- 次: UI拡張（気分ボタン + 星座エッセンス）

**🎵 しげちゃんの美しい宇宙的AIパートナー実現への第一歩！**