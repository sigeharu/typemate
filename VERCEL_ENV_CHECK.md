# Vercel環境変数チェックリスト

## 必須の環境変数

以下の環境変数がVercelダッシュボードで設定されている必要があります：

### 1. Supabase関連
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - https://ypwvkihattwxushbwsig.supabase.co
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - eyJhbGciOiJI...（.env.localから）
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - eyJhbGciOiJI...（.env.localから）

### 2. Claude API
- [ ] `CLAUDE_API_KEY` - sk-ant-api03-...（.env.localから）

### 3. Google OAuth（Supabaseダッシュボードで設定）
- Supabaseダッシュボード → Authentication → Providers → Google
- [ ] Client ID設定済み
- [ ] Client Secret設定済み

## 確認手順

1. https://vercel.com にログイン
2. TypeMateプロジェクトを選択
3. Settings → Environment Variables
4. 上記の環境変数がすべて設定されているか確認
5. 特に`CLAUDE_API_KEY`が設定されていない場合、AIが動作しません

## 強制再デプロイ手順

```bash
# キャッシュを無視して再デプロイ
vercel --prod --force

# または、Vercelダッシュボードから：
# 1. Deployments タブ
# 2. 最新のデプロイの「...」メニュー
# 3. "Redeploy"
# 4. "Use existing Build Cache"のチェックを外す
# 5. "Redeploy"をクリック
```

## デバッグ用コマンド

```bash
# 本番環境の確認
vercel env ls production

# 最新のビルドログ確認
vercel logs --output raw
```