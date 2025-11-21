# 🗾 日本IT技術カンファレンスマップ

日本全国のIT技術カンファレンスの開催履歴を地図上で視覚的に確認できるWebアプリケーションです。

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?logo=tailwind-css)

## ✨ 特徴

- 📍 **インタラクティブマップ** - OpenStreetMapベースの地図上にカンファレンス開催地を表示
- 🎯 **多彩なフィルター機能**
  - 年度別フィルター
  - カテゴリー別フィルター（Web、Mobile、Backend、Frontend、DevOps、AI/ML、など）
  - 都道府県別フィルター
  - オンライン/オフライン開催形式フィルター
- 🎨 **カテゴリー別カラーコーディング** - 視覚的に分かりやすい色分け
- 📊 **統計情報** - イベント数やカンファレンス数の集計表示
- 🚀 **完全静的生成（SSG）** - 高速な読み込みとホスティング
- 📱 **レスポンシブデザイン** - デスクトップ/モバイル対応

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 16** - App Router、React Server Components
- **TypeScript** - 型安全性
- **React-Leaflet** - インタラクティブマップ
- **Tailwind CSS** - スタイリング

### データ管理
- **JSON** - カンファレンスデータ
- **Zod** - スキーマバリデーション

## 📦 インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/conference-history-map.git
cd conference-history-map

# 依存パッケージのインストール
npm install
```

## 🚀 開発

```bash
# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

## 🏗️ ビルド

```bash
# 本番用ビルド（静的エクスポート）
npm run build

# ビルド結果の確認
npm run start
```

静的ファイルは `out/` ディレクトリに生成されます。

## 📁 プロジェクト構造

```
conference-history-map/
├── app/                      # Next.js App Router
│   ├── page.tsx             # メインページ
│   ├── layout.tsx           # レイアウト
│   └── globals.css          # グローバルスタイル
├── components/              # Reactコンポーネント
│   ├── ConferenceMap.tsx   # 地図コンポーネント
│   ├── FilterPanel.tsx     # フィルターUI
│   └── ConferenceMapPage.tsx # メインページロジック
├── lib/                     # ユーティリティ
│   ├── data.ts             # データ読み込み
│   └── utils.ts            # ヘルパー関数
├── types/                   # TypeScript型定義
│   └── conference.ts       # データスキーマ
├── data/                    # カンファレンスデータ
│   ├── conferences/        # カンファレンス基本情報
│   └── events/             # 開催履歴（年度別）
└── public/                  # 静的ファイル
```

## 📝 データの追加方法

### 新しいカンファレンスを追加

`data/conferences/` に新しいJSONファイルを作成：

```json
{
  "id": "conference-id",
  "name": "カンファレンス名",
  "description": "説明文",
  "category": ["Web", "Backend"],
  "programmingLanguages": ["PHP"],
  "website": "https://example.com",
  "twitter": "@example"
}
```

### 開催イベントを追加

`data/events/YYYY.json` に開催情報を追加：

```json
{
  "conferenceId": "conference-id",
  "year": 2024,
  "startDate": "2024-10-01",
  "endDate": "2024-10-03",
  "location": {
    "name": "会場名",
    "address": "住所",
    "lat": 35.6812,
    "lng": 139.7671,
    "prefecture": "東京都"
  },
  "isOnline": false,
  "isHybrid": false,
  "eventUrl": "https://example.com/2024"
}
```

## 🎨 カテゴリー一覧

### 技術領域

- **Web** - Webテクノロジー全般
- **Mobile** - モバイルアプリ開発
- **Backend** - バックエンド開発
- **Frontend** - フロントエンド開発
- **DevOps** - DevOps、インフラ
- **AI/ML** - 人工知能、機械学習
- **Data** - データエンジニアリング
- **Security** - セキュリティ
- **Cloud** - クラウドサービス
- **General** - 総合的な技術カンファレンス
- **Design** - UI/UXデザイン
- **Testing** - テスト、QA
- **IoT** - IoT、組み込み
- **Game** - ゲーム開発

### プログラミング言語

- **JavaScript** - JavaScript関連カンファレンス
- **TypeScript** - TypeScript関連カンファレンス
- **PHP** - PHP関連カンファレンス
- **Ruby** - Ruby関連カンファレンス
- **Python** - Python関連カンファレンス
- **Go** - Go言語関連カンファレンス
- **Rust** - Rust関連カンファレンス
- **Java** - Java関連カンファレンス
- **Kotlin** - Kotlin関連カンファレンス
- **Swift** - Swift関連カンファレンス
- **C#** - C#関連カンファレンス
- **C++** - C++関連カンファレンス

## 🌐 デプロイ

### Vercel（推奨）

```bash
# Vercel CLIでデプロイ
npx vercel
```

### GitHub Pages

```bash
# ビルドして静的ファイルを生成
npm run build

# out/ ディレクトリをGitHub Pagesにデプロイ
```

### Cloudflare Pages（推奨）

**簡単な設定で高速なグローバル配信が可能です。**

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) で Workers & Pages を開く
2. 「Create application」→「Pages」→「Connect to Git」
3. リポジトリを選択
4. ビルド設定：
   - **ビルドコマンド**: `npm run build`
   - **ビルド出力ディレクトリ**: `out`
   - **Node.js バージョン**: 18以上（自動検出）

詳細な手順は [DEPLOY_CLOUDFLARE.md](./DEPLOY_CLOUDFLARE.md) を参照してください。

**最適化済み:**
- セキュリティヘッダー設定済み（`_headers`）
- 静的アセットの自動キャッシング
- グローバルCDN配信

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT License

## 🙏 謝辞

- [OpenStreetMap](https://www.openstreetmap.org/) - 地図データ
- [Leaflet](https://leafletjs.com/) - 地図ライブラリ
- 各カンファレンスの運営チームの皆様

---

Made with ❤️ for the Japanese tech community
