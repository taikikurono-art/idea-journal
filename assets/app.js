// Shared helpers for the idea-journal GitHub Pages site.
// Data source: this repo's GitHub Issues (via the public REST API).
// No backend, no build step — everything runs client-side.

window.IdeaJournal = (() => {
  // Figure out which repo we're serving from. Works automatically once
  // deployed at https://<owner>.github.io/<repo>/. For local testing
  // (file:// or plain http://localhost) set window.__REPO_OVERRIDE__
  // in a local-only <script> tag, e.g. { owner: "octocat", repo: "hello-world" }.
  function repoInfo() {
    if (window.__REPO_OVERRIDE__) return window.__REPO_OVERRIDE__;

    const host = location.hostname; // "<owner>.github.io"
    const owner = host.endsWith(".github.io") ? host.replace(".github.io", "") : null;
    const pathParts = location.pathname.split("/").filter(Boolean);
    const repo = pathParts[0] || null;

    if (!owner || !repo) {
      throw new Error(
        "リポジトリを特定できませんでした。GitHub Pagesで公開するか、window.__REPO_OVERRIDE__ を設定してください。"
      );
    }
    return { owner, repo };
  }

  async function api(path) {
    const { owner, repo } = repoInfo();
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}${path}`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) {
      if (res.status === 403) {
        throw new Error(
          "GitHub APIの利用制限(レート制限)に達した可能性があります。しばらく待って再読み込みしてください。"
        );
      }
      throw new Error(`GitHub APIエラー: ${res.status}`);
    }
    return res.json();
  }

  function listIssues() {
    // pulls/PRs never show up here because we only request issues,
    // but the REST API can technically include PRs too — filter them out.
    return api(`/issues?state=all&per_page=100&sort=created&direction=desc`).then((issues) =>
      issues.filter((i) => !i.pull_request)
    );
  }

  function getIssue(number) {
    return api(`/issues/${number}`);
  }

  function listComments(number) {
    return api(`/issues/${number}/comments?per_page=100`);
  }

  function newIssueUrl() {
    const { owner, repo } = repoInfo();
    return `https://github.com/${owner}/${repo}/issues/new`;
  }

  function issueUrl(number) {
    const { owner, repo } = repoInfo();
    return `https://github.com/${owner}/${repo}/issues/${number}`;
  }

  function repoUrl() {
    const { owner, repo } = repoInfo();
    return `https://github.com/${owner}/${repo}`;
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  }

  function wasEdited(item) {
    // GitHub bumps updated_at for label/state changes too, so give a
    // small grace period from created_at before calling it "edited".
    return new Date(item.updated_at).getTime() - new Date(item.created_at).getTime() > 60000;
  }

  function renderMarkdown(text) {
    if (!text) return "";
    if (window.marked) {
      window.marked.setOptions({ gfm: true, breaks: true });
      return window.marked.parse(text);
    }
    // Fallback: escape + linebreaks only (no CDN available).
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<p>${escaped.replace(/\n/g, "<br>")}</p>`;
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  return {
    repoInfo,
    listIssues,
    getIssue,
    listComments,
    newIssueUrl,
    issueUrl,
    repoUrl,
    formatDate,
    wasEdited,
    renderMarkdown,
    escapeHtml,
  };
})();
