# 🗾 JP Conference History Map

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
git clone https://github.com/dero1to/conference-history-map.git
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

### 🛠️ CLIツールを使用した追加（推奨）

このプロジェクトには、インタラクティブにデータを追加できるCLIツールが用意されています。
手動でJSONを編集するよりも簡単で、バリデーションやIDの自動生成も行われます。

```bash
npm run add-data
```

画面の指示に従って、カンファレンスやイベント、会場情報を入力してください。

### 手動での追加

CLIツールを使用せず、直接JSONファイルを編集して追加することも可能です。

#### 新しいカンファレンスを追加

`data/conferences/` に新しいJSONファイルを作成：

```json
{
  "id": "conference-id",
  "name": "カンファレンス名",
  "category": ["Web", "Backend"],
  "programmingLanguages": ["Lang"],
  "website": "https://example.com",
  "twitter": "@example"
}
```

#### 開催イベントを追加

`data/events/YYYY.json` に開催情報を追加：

```json
{
  "conferenceId": "conference-id",
  "name": "カンファレンス名 2024",
  "year": 2024,
  "startDate": "2024-10-01",
  "endDate": "2024-10-03",
  "venueId": "tokyo/venue-id",
  "isHybrid": false,
  "eventUrl": "https://example.com/2024"
}
```

※ `venueId` は `data/venues/{prefecture}/venues.json` に登録されているIDを使用してください。

### ✅ データの検証

データを追加した後は、以下のコマンドで整合性をチェックしてください。

```bash
npm run validate-data
```

## 🎨 カテゴリー一覧

### 技術領域

- **Web** - Webテクノロジー全般
- **Mobile** - モバイルアプリ開発
- **Backend** - バックエンド開発
- **Frontend** - フロントエンド開発
- **DevOps** - DevOps、インフラ
- **Data** - データエンジニアリング
- **Security** - セキュリティ
- **Cloud** - クラウドサービス
- **General** - 総合的な技術カンファレンス

### プログラミング言語

- **JavaScript** - JavaScript関連カンファレンス
- **TypeScript** - TypeScript関連カンファレンス
- **PHP** - PHP関連カンファレンス
- **Ruby** - Ruby関連カンファレンス

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b add/new-event`)
3. `npm run add-data` でデータを追加
4. 変更をコミット (`git commit -m 'Add New Event 2025'`)
5. ブランチにプッシュ (`git push origin add/new-event`)
6. プルリクエストを作成

**⚠️ 基本的にPull Requestでの追加をお願いします！**

## 📄 ライセンス

MIT License

## 🙏 謝辞

- [OpenStreetMap](https://www.openstreetmap.org/) - 地図データ
- [Leaflet](https://leafletjs.com/) - 地図ライブラリ
- [国土地理院](https://www.gsi.go.jp/) - 住所検索API（ジオコーディング）
- 各カンファレンスの運営チームの皆様

---

Made with ❤️ for the Japanese tech community
