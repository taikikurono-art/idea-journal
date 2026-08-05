(async function () {
  const contentEl = document.getElementById("content");
  const repoLink = document.getElementById("repo-link");

  const params = new URLSearchParams(location.search);
  const number = params.get("number");

  try {
    repoLink.href = IdeaJournal.repoUrl();
  } catch (e) {
    contentEl.innerHTML = `<p class="error">${IdeaJournal.escapeHtml(e.message)}</p>`;
    return;
  }

  if (!number) {
    contentEl.innerHTML = `<p class="error">アイデアが指定されていません。</p>`;
    return;
  }

  try {
    const [issue, comments] = await Promise.all([
      IdeaJournal.getIssue(number),
      IdeaJournal.listComments(number),
    ]);

    document.title = `${issue.title} — アイデア帳`;

    const authorLogin = issue.user.login;

    // The issue body is the first journal entry. Any later comment written
    // by the same person continues the journal (and can use ~~strikethrough~~
    // to correct earlier text without deleting it). Comments from anyone
    // else are shown as feedback instead.
    const entries = [
      {
        author: issue.user,
        body: issue.body || "*(本文なし)*",
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        isAuthor: true,
      },
      ...comments.map((c) => ({
        author: c.user,
        body: c.body,
        created_at: c.created_at,
        updated_at: c.updated_at,
        isAuthor: c.user.login === authorLogin,
      })),
    ];

    const journalHtml = entries
      .map((e) => {
        const edited = IdeaJournal.wasEdited(e);
        const cls = e.isAuthor ? "entry" : "comment";
        return `
          <div class="${cls}${edited ? " edited" : ""}">
            <div class="entry-meta">
              <img src="${e.author.avatar_url}" alt="" />
              <span>${IdeaJournal.escapeHtml(e.author.login)}</span>
              <span>・ ${IdeaJournal.formatDate(e.created_at)}</span>
              ${edited ? '<span class="edited-badge">(訂正あり)</span>' : ""}
            </div>
            <div class="entry-body">${IdeaJournal.renderMarkdown(e.body)}</div>
          </div>
        `;
      })
      .join("");

    contentEl.innerHTML = `
      <h1 class="idea-title">${IdeaJournal.escapeHtml(issue.title)}</h1>
      <p class="idea-sub">
        ${IdeaJournal.escapeHtml(issue.user.login)} が ${IdeaJournal.formatDate(issue.created_at)} に書き始めた
      </p>

      <div class="note">
        訂正は文章を消さずに <code>~~取り消し線~~</code> を引いて新しい文章を書き足すのがこのアイデア帳のルールです。
        GitHub上でコメントを編集すると反映されます。
      </div>

      <div class="journal">${journalHtml}</div>

      <div class="cta-row">
        <a class="cta primary" href="${IdeaJournal.issueUrl(number)}" target="_blank" rel="noopener">
          GitHubで書き足す・コメントする
        </a>
      </div>
    `;
  } catch (e) {
    contentEl.innerHTML = `<p class="error">${IdeaJournal.escapeHtml(e.message)}</p>`;
  }
})();
