export default function About() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">JP Conference History Mapについて</h1>
            
            <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">概要</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    JP Conference History Mapは、日本国内で開催された技術カンファレンスやイベントの開催履歴を地図上で可視化するツールです。
                    過去に開催されたイベントの場所や時期を一目で確認でき、技術コミュニティの歴史を探索できます。
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">このツールを作った背景</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    技術コミュニティにおいて、カンファレンスやイベントは知識の共有や交流の重要な場となっています。
                    近年では、プログラミング言語や技術領域の垣根を超えて、複数ジャンルのイベントに参加するエンジニアも増えてきました。
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    各コミュニティが過去の開催履歴を公開している場合もありますが、多くは断片的な情報にとどまっていたり、過去のイベントは対象外とされていることもあるかと思います。
                    このツールでは、イベントの開催地や時系列を視覚的に表現することで、
                    カンファレンスの変遷や地理的な広がりを直感的に理解できるようにしました。
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    過去のイベント情報を横断的に検索・参照できることで、参加者はこれまでのイベントを振り返ることができ、
                    主催者は今後のイベント企画や開催地選定の参考にしていただけたらと思います。
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">主な機能</h2>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-3 pl-2">
                    <li>地図上のマーカーをクリックすることで、各開催地でのイベント詳細を確認</li>
                    <li>カンファレンス名、開催年、開催地などの条件でイベントを検索・フィルタリング</li>
                    <li>一覧表示でイベントの時系列を確認</li>
                </ul>
            </section>

            <section className="mb-10 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-center italic mb-4">
                    あなたがエンジニアとして成長するきっかけとなったイベントや、<br />
                    忘れられない出会いのあったカンファレンスを、<br />
                    このツールで振り返る機会になれば幸いです。
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
                    Created by <a href="https://twitter.com/dero1to" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">デロ(@dero1to)</a>
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">お問い合わせ</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    データの誤りや追加してほしいイベントのご要望などがございましたら、
                    GitHubのIssueまたはPull Requestでご連絡ください。可能な範囲で対応いたします。
                </p>
            </section>
        </div>
    );
}