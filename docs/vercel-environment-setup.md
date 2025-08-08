# 🛡️ TypeMate Vercel 環境変数設定ガイド

## 📋 概要

このガイドでは、TypeMateアプリケーションをVercelにデプロイする際に必要な環境変数の設定方法を説明します。セキュリティを保ちながら、OAuth認証が正常に動作する設定を確保します。

## 🚨 重要：設定前の確認事項

### DNS設定の確認
設定前に、必ずSupabaseプロジェクトURLを確認してください：

```bash
# 正しいURL（'i'が含まれる）
https://ypwvkihattwxushbwsig.supabase.co

# 間違ったURL（'h'が含まれる）- 使用しないでください
https://ypwvkhattwxushbwsig.supabase.co
```

⚠️ **注意**: URLの間違いは `DNS_PROBE_FINISHED_NXDOMAIN` エラーを引き起こします。

## 📝 必須環境変数一覧

### 🔐 Supabase設定（必須）
```
NEXT_PUBLIC_SUPABASE_URL=https://ypwvkihattwxushbwsig.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 🤖 AI API設定（必須）
```
CLAUDE_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...
```

### 🎯 Redis設定（短期記憶用）
```
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=your-redis-password
REDIS_SSL=true
```

## 🛠️ Vercel設定手順

### 1. Vercelダッシュボードにアクセス

1. [Vercel Dashboard](https://vercel.com/dashboard)にログイン
2. TypeMateプロジェクトを選択
3. 「Settings」タブをクリック
4. 左サイドバーから「Environment Variables」を選択

### 2. 環境変数の追加

各環境変数について、以下の設定を行います：

#### 🔐 Supabase URL設定
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://ypwvkihattwxushbwsig.supabase.co`
- **Environments**: Production, Preview, Development すべてを選択

#### 🔐 Supabase Anonymous Key設定
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` （完全なJWTトークン）
- **Environments**: Production, Preview, Development すべてを選択

#### 🔐 Supabase Service Role Key設定
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` （完全なJWTトークン）
- **Environments**: Production, Preview, Development すべてを選択

#### 🤖 Claude API Key設定
- **Name**: `CLAUDE_API_KEY`
- **Value**: `sk-ant-api03-...`
- **Environments**: Production, Preview, Development すべてを選択

#### 🤖 OpenAI API Key設定
- **Name**: `OPENAI_API_KEY`
- **Value**: `sk-...`
- **Environments**: Production, Preview, Development すべてを選択

### 3. Redis設定（オプション）

短期記憶機能を使用する場合：

#### Redis Host
- **Name**: `REDIS_HOST`
- **Value**: あなたのRedisホスト（例：`redis-xxx.upstash.io`）
- **Environments**: Production, Preview

#### Redis Port
- **Name**: `REDIS_PORT`  
- **Value**: `6379`
- **Environments**: Production, Preview

#### Redis Username
- **Name**: `REDIS_USERNAME`
- **Value**: `default`
- **Environments**: Production, Preview

#### Redis Password
- **Name**: `REDIS_PASSWORD`
- **Value**: あなたのRedisパスワード
- **Environments**: Production, Preview

#### Redis SSL
- **Name**: `REDIS_SSL`
- **Value**: `true`
- **Environments**: Production, Preview

## 🧪 デバッグ設定（開発環境のみ）

開発環境でのデバッグを細かく制御したい場合：

```
DEBUG_LEVEL=info
DEBUG_AUTH=true
DEBUG_SUPABASE=false
DEBUG_REDIS=true
DEBUG_AI=false
DEBUG_VECTOR=false
DEBUG_PERFORMANCE=true
DEBUG_SECURITY=true
```

## 🔄 設定の適用

### 1. 環境変数保存
すべての環境変数を追加したら、「Save」をクリックします。

### 2. デプロイメントの更新
新しい環境変数を適用するため、新しいデプロイメントを実行します：

```bash
# ローカルからプッシュして自動デプロイ
git add .
git commit -m "Update environment variables configuration"
git push origin main
```

または、Vercelダッシュボードから手動でRe-deployを実行します。

## ✅ 設定確認方法

### 1. 本番環境でのテスト
1. デプロイ完了後、本番URLにアクセス
2. Google OAuth認証を試行
3. 正常にログインできることを確認

### 2. ログの確認
Vercel Function Logsで以下を確認：

```
✅ Using environment variable for Supabase URL: https://ypwvk...
✅ Using environment variable for Supabase API key: eyJhb...
```

### 3. エラーの確認
以下のエラーが出ないことを確認：
- `DNS_PROBE_FINISHED_NXDOMAIN`
- `🚨 Using hardcoded Supabase URL in production`
- `Missing required environment variables`

## 🔧 トラブルシューティング

### DNS解決エラー
```
DNS_PROBE_FINISHED_NXDOMAIN
```

**解決策：**
1. `NEXT_PUBLIC_SUPABASE_URL`の値を確認
2. 正しいURL（`ypwvkihattwxushbwsig`）を使用しているか確認
3. 環境変数の削除・再追加を試行

### OAuth認証エラー
```
Invalid redirect URL
```

**解決策：**
1. Supabase Dashboard → Authentication → URL Configuration
2. Site URLとRedirect URLsの設定を確認
3. 本番URLが正しく設定されているか確認

### API認証エラー
```
401 Unauthorized
```

**解決策：**
1. APIキーの有効期限を確認
2. Supabase Anonymous Keyが正しいことを確認
3. APIキー用の権限設定を確認

## 🛡️ セキュリティベストプラクティス

### 1. 環境変数の保護
- 機密情報は絶対にコードにハードコーディングしない
- APIキーは定期的に更新する
- 開発環境と本番環境で異なるキーを使用する

### 2. アクセス制御
- Vercelプロジェクトへのアクセスを制限
- チームメンバーの権限を適切に管理
- 環境変数の変更履歴を追跡

### 3. 監視とログ
- 本番環境での認証エラーを監視
- 異常なAPIアクセスパターンを検知
- セキュリティログを定期的に確認

## 📞 サポート

設定で問題が発生した場合：

1. **開発者コンソール**でエラーログを確認
2. **Vercel Function Logs**でサーバーログを確認  
3. **Supabase Dashboard**で認証ログを確認
4. 必要に応じて、設定を一度削除して再設定

---

**最終更新**: 2025年1月現在
**対象バージョン**: TypeMate v2.0+