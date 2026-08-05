# アイデア帳(GitHub Pages版)

知人限定で、考え中のビジネスアイデアとその「思考の過程」を共有するための静的サイトです。サーバーやデータベースは使わず、**GitHub Issues をデータの保存先**として使います。GitHub Pagesで無料公開できます。

## コンセプト

- アイデアごとに1つのGitHub Issueを作ります。Issue本文が最初の書き出しになります。
- 思いついたこと・考えの続きは、そのIssueに**コメント**として書き足していきます。
- 訂正したいときは、文章を消さずに `~~取り消し線~~` を引いてから新しい文章を続けます(GitHubのMarkdownがそのまま `<del>` 打ち消し線として表示されます)。コメントを編集すればサイト側にも反映されます。
- Issue作成者本人の投稿は「思考ログ」、それ以外の人のコメントは「フィードバック」として見た目を分けて表示します。
- 知人は各自のGitHubアカウントでコメント・Issue作成ができます(承認制ではありません — 下記「公開範囲についての注意」を参照)。

## 公開手順

1. GitHubで新しいリポジトリを作成する(例: `idea-journal`)。**Public**にしてください(GitHub Pagesを無料で使うため)。
2. このフォルダの中身をそのリポジトリにpushする。

   ```bash
   cd idea-journal-pages
   git init
   git add .
   git commit -m "init"
   git branch -M main
   git remote add origin https://github.com/<あなたのユーザー名>/<リポジトリ名>.git
   git push -u origin main
   ```

3. GitHubのリポジトリ画面で **Settings → Pages** を開き、Source を `Deploy from a branch`、Branch を `main` / `/(root)` に設定して保存する。
4. 数分待つと `https://<あなたのユーザー名>.github.io/<リポジトリ名>/` でサイトが公開されます。
5. Issuesタブが有効になっていることを確認する(通常はデフォルトで有効です)。
6. 発行されたURLを知人に共有すれば完了です。

サイトはページのURL(`<owner>.github.io/<repo>/`)から自動的にどのリポジトリのIssuesを見るか判断するので、コード側で何かを書き換える必要はありません。

## 使い方

- トップページの「+ 新しいアイデアを書き留める」→ GitHubのIssue作成画面が開きます(テンプレート付き)。
- 各アイデアのカードをクリックすると詳細ページへ。GitHub上のIssue本文とコメントを取得して、思考ログとフィードバックを分けて表示します。
- 詳細ページ下部の「GitHubで書き足す・コメントする」から、そのままGitHubのIssueページに移動して書き込めます。

## 公開範囲についての注意

- Publicリポジトリなので、サイトもIssuesも**世界中の誰でも閲覧できます**。URLを知っている人だけに知らせる、という運用になります。
- GitHubの仕様上、Publicリポジトリでは(コラボレーターでなくても)GitHubアカウントを持つ人なら誰でもIssueやコメントを作成できます。荒らし対策が必要になったら、Issueテンプレートを必須化する、目に余るものは手動でクローズ/削除する、といった運用でカバーしてください。
- どうしても非公開にしたい場合は、GitHubの有料プラン(Pro等)でPrivateリポジトリからPagesを公開する方法があります。

## ローカルで見た目を確認する

```bash
cd idea-journal-pages
python3 -m http.server 8000
```

`http://localhost:8000` を開いても、ページのURLからリポジトリを特定できないためエラーになります。ローカルで確認したい場合は `index.html` と `idea.html` の `<head>` に以下を追記してください(公開前に必ず削除):

```html
<script>window.__REPO_OVERRIDE__ = { owner: "あなたのユーザー名", repo: "リポジトリ名" };</script>
```

## 技術構成

- 素のHTML / CSS / JavaScript(ビルド不要、フレームワーク不使用)
- データ取得は GitHub REST API (`api.github.com`) を直接fetch。認証不要(未認証は1時間あたり60リクエストまでの制限あり)
- Markdown描画は [marked.js](https://marked.js.org/)(CDN経由)
- ホスティングは GitHub Pages(無料)
