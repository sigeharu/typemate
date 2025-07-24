# 本番環境でDeveloperモードを無効化する手順

## Vercelダッシュボードから設定（推奨）

1. https://vercel.com にログイン
2. TypeMateプロジェクトを選択
3. **Settings** → **Environment Variables**
4. `NEXT_PUBLIC_DEV_MODE` を見つける
5. 以下のいずれかを実行：
   - **編集**: Production の値を `false` に変更
   - **削除**: 環境変数自体を削除（デフォルトでfalseになる）
6. **Save** をクリック
7. 自動的に再デプロイが開始される

## CLIから設定

```bash
# 環境変数を削除
vercel env rm NEXT_PUBLIC_DEV_MODE production
# 確認プロンプトで "y" を入力

# または、falseに設定
vercel env add NEXT_PUBLIC_DEV_MODE production
# プロンプトで "false" と入力
```

## 確認方法

設定後、本番環境 (https://typemate.vercel.app) にアクセスして：
- 開発者モードバーが表示されないこと
- 通常のログイン・診断フローが動作すること

## コード側の対応

`src/lib/dev-mode.ts` の `isDevelopmentMode()` 関数は：
- `NEXT_PUBLIC_DEV_MODE === 'true'` の場合のみ開発モードを有効化
- 未設定または `false` の場合は無効化

そのため、環境変数を削除するか `false` に設定すれば、自動的に本番環境で開発モードが無効になります。