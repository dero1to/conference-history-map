# Cloudflare Pagesへのデプロイガイド

このガイドでは、本アプリケーションをCloudflare Pagesにデプロイする手順を説明します。

## 📋 前提条件

- Cloudflareアカウント（無料プランでOK）
- GitHubリポジトリ

## 🚀 デプロイ手順

### 1. Cloudflare Pagesプロジェクトの作成

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)にログイン
2. 左サイドバーから「Workers & Pages」を選択
3. 「Create application」→「Pages」→「Connect to Git」をクリック
4. GitHubリポジトリを選択

### 2. ビルド設定

以下の設定を入力してください：

| 設定項目 | 値 |
|---------|-----|
| **プロジェクト名** | 任意の名前（例：conference-history-map） |
| **本番ブランチ** | `main` または `master` |
| **ビルドコマンド** | `npm run build` |
| **ビルド出力ディレクトリ** | `out` |

### 3. 環境変数（オプション）

現在のバージョンでは環境変数は不要ですが、将来的にAPIキーなどを使用する場合は以下から設定できます：

- Settings → Environment variables

### 4. デプロイの実行

「Save and Deploy」をクリックすると、自動的にビルドとデプロイが開始されます。

初回デプロイには2-3分程度かかります。

### 5. カスタムドメインの設定（オプション）

1. プロジェクトの「Custom domains」タブを開く
2. 「Set up a custom domain」をクリック
3. 所有しているドメインを入力
4. DNS設定を追加（Cloudflareの指示に従う）

## 🔧 ビルド設定の詳細

### Node.jsバージョン

`.node-version` ファイルで Node.js 18.17.0 を指定しています。
Cloudflare Pagesは自動的にこのバージョンを使用します。

### セキュリティヘッダー

`public/_headers` ファイルで以下のヘッダーを設定しています：

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: interest-cohort=()

静的アセット（`_next/static/*`, `images/*`）には1年間のキャッシュを設定。

### パフォーマンス最適化

- **静的生成（SSG）**: 全ページをビルド時に生成
- **エッジキャッシング**: Cloudflareのグローバルネットワークで配信
- **自動minify**: HTML/CSS/JSの最小化

## 🔄 自動デプロイ

GitHubリポジトリにプッシュすると、Cloudflare Pagesが自動的に：

1. 変更を検知
2. ビルドを実行
3. デプロイを実施
4. プレビューURLを生成（PRの場合）

## 🐛 トラブルシューティング

### ビルドエラーが発生する

1. ローカルで `npm run build` が成功するか確認
2. Node.jsバージョンを確認（18以上推奨）
3. `package-lock.json` がコミットされているか確認

### 地図が表示されない

- ブラウザのコンソールでエラーを確認
- LeafletのCSSが正しく読み込まれているか確認

### パフォーマンスが遅い

- Cloudflare Analytics で配信状況を確認
- キャッシュヒット率をチェック
- 必要に応じて `_headers` の Cache-Control を調整

## 📊 監視とアナリティクス

Cloudflare Pagesダッシュボードで以下を確認できます：

- デプロイ履歴
- ビルドログ
- トラフィック統計
- エラーログ

Web Analyticsを有効にすると、詳細なアクセス解析も可能です（無料）。

## 💡 ヒント

### ステージング環境

プレビューブランチを設定すると、本番前に動作確認ができます：

1. Settings → Builds & deployments
2. Preview deployments を設定
3. 特定のブランチ（例：`staging`）をプレビュー用に指定

### 高度な設定

- **Wrangler CLI**: コマンドラインからデプロイ
- **Functions**: サーバーレス関数の追加（今後の拡張用）
- **KV Storage**: キャッシュやセッション管理（今後の拡張用）

## 📚 参考リンク

- [Cloudflare Pages公式ドキュメント](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [カスタムドメイン設定](https://developers.cloudflare.com/pages/platform/custom-domains/)

---

問題が解決しない場合は、[Cloudflare Community](https://community.cloudflare.com/)で質問してください。
