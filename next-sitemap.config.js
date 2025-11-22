/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://jp-conference.pages.dev',
  generateRobotstxt: false, // 手動でrobots.txtを作成したのでfalseに
  outDir: './public',
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/404'],
  
  // 静的エクスポート用の設定
  trailingSlash: true,
  
  // 変換関数でページ別の優先度を設定
  transform: async (config, path) => {
    // ホームページ（マップビュー）の優先度を高く設定
    let priority = config.priority;
    let changefreq = config.changefreq;
    
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path === '/list/') {
      priority = 0.8;
      changefreq = 'daily';
    }
    
    return {
      loc: path,
      changefreq: changefreq,
      priority: priority,
      lastmod: new Date().toISOString(),
    }
  },
}