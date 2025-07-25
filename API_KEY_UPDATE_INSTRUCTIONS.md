# 🚨 Supabase APIキー更新手順

## 問題
現在のSupabase APIキーが無効で、401エラーが発生しています。

## 解決手順

### 1. SupabaseダッシュボードでAPIキーを確認
1. https://supabase.com/dashboard にログイン
2. **ypwvkihattwxushbwsig** プロジェクトを選択
3. **Settings** → **API** に移動

### 2. 以下の値をコピー
- **Project URL**: `https://ypwvkihattwxushbwsig.supabase.co`
- **anon public key**: `eyJhbG...` で始まる長い文字列
- **service_role secret key**: `eyJhbG...` で始まる長い文字列

### 3. ローカル環境の更新
`.env.local` ファイルの以下の行を更新：

```env
NEXT_PUBLIC_SUPABASE_URL=https://ypwvkihattwxushbwsig.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[新しいanon key]
SUPABASE_SERVICE_ROLE_KEY=[新しいservice_role key]
```

### 4. src/lib/supabase-simple.ts の更新
ハードコードされたAPIキーも更新が必要：

```typescript
const supabaseUrl = 'https://ypwvkihattwxushbwsig.supabase.co';
const supabaseKey = '[新しいanon key]';
```

### 5. Vercel本番環境の更新
1. https://vercel.com → TypeMateプロジェクト
2. **Settings** → **Environment Variables**
3. 以下を更新：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
   - `SUPABASE_SERVICE_ROLE_KEY`

### 6. 確認方法
1. 開発サーバーを再起動
2. ブラウザコンソールを開く
3. チャットでメッセージ送信
4. `✅ Memory saved successfully` が表示されることを確認

## APIキーが期限切れの場合
- Supabaseプロジェクトの再生成が必要
- または新しいプロジェクトの作成を検討