(async function () {
  const listEl = document.getElementById("list");
  const newIdeaBtn = document.getElementById("new-idea-btn");
  const repoLink = document.getElementById("repo-link");

  try {
    newIdeaBtn.href = IdeaJournal.newIssueUrl();
    repoLink.href = IdeaJournal.repoUrl();
  } catch (e) {
    listEl.innerHTML = `<p class="error">${IdeaJournal.escapeHtml(e.message)}</p>`;
    return;
  }

  try {
    const issues = await IdeaJournal.listIssues();

    if (issues.length === 0) {
      listEl.innerHTML = `<p class="empty">まだアイデアがありません。最初の一つを書き留めてみましょう。</p>`;
      return;
    }

    listEl.innerHTML = issues
      .map((issue) => {
        const excerpt = (issue.body || "").replace(/[#*`>_~-]/g, "").slice(0, 120);
        return `
          <a class="idea-card" href="idea.html?number=${issue.number}">
            <div class="row">
              <div>
                <h2>${IdeaJournal.escapeHtml(issue.title)}</h2>
                <p class="excerpt">${IdeaJournal.escapeHtml(excerpt)}</p>
              </div>
              <div class="meta">
                <div>${IdeaJournal.escapeHtml(issue.user.login)}</div>
                <div>${IdeaJournal.formatDate(issue.created_at)}</div>
              </div>
            </div>
            <div class="stats">
              <span>コメント ${issue.comments}件</span>
              <span>${issue.state === "closed" ? "クローズ済み" : "進行中"}</span>
            </div>
          </a>
        `;
      })
      .join("");
  } catch (e) {
    listEl.innerHTML = `<p class="error">${IdeaJournal.escapeHtml(e.message)}</p>`;
  }
})();
