const axios = require('axios');

const GITHUB_API = 'https://api.github.com';

const getHeaders = () => ({
  Authorization: process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : undefined,
  Accept: 'application/vnd.github.v3+json',
});

/**
 * Verify a commit exists in a repository
 */
const verifyCommit = async (owner, repo, commitHash) => {
  try {
    const response = await axios.get(
      `${GITHUB_API}/repos/${owner}/${repo}/commits/${commitHash}`,
      { headers: getHeaders() }
    );
    return response.status === 200;
  } catch {
    return false;
  }
};

/**
 * Get commits for a repository within a date range
 */
const getRepoCommits = async (owner, repo, since, until) => {
  try {
    const response = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/commits`, {
      headers: getHeaders(),
      params: {
        since: since ? since.toISOString() : undefined,
        until: until ? until.toISOString() : undefined,
        per_page: 100,
      },
    });
    return response.data;
  } catch {
    return [];
  }
};

/**
 * Get weekly GitHub activity for a user
 */
const getWeeklyActivity = async (username, weekStart, weekEnd) => {
  try {
    const eventsRes = await axios.get(`${GITHUB_API}/users/${username}/events`, {
      headers: getHeaders(),
      params: { per_page: 100 },
    });

    const events = eventsRes.data.filter((e) => {
      const date = new Date(e.created_at);
      return date >= weekStart && date <= weekEnd;
    });

    const pushEvents = events.filter((e) => e.type === 'PushEvent');
    const prEvents = events.filter((e) => e.type === 'PullRequestEvent');

    let commits = 0;
    let additions = 0;
    let deletions = 0;

    pushEvents.forEach((e) => {
      commits += e.payload.commits ? e.payload.commits.length : 0;
    });

    return {
      commits,
      additions,
      deletions,
      pullRequests: prEvents.length,
    };
  } catch {
    return { commits: 0, additions: 0, deletions: 0, pullRequests: 0 };
  }
};

/**
 * Get contributor stats for a repository
 */
const getContributorStats = async (owner, repo) => {
  try {
    const response = await axios.get(
      `${GITHUB_API}/repos/${owner}/${repo}/contributors`,
      { headers: getHeaders() }
    );
    return response.data;
  } catch {
    return [];
  }
};

/**
 * Get repository info
 */
const getRepoInfo = async (owner, repo) => {
  try {
    const response = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch {
    return null;
  }
};

module.exports = { verifyCommit, getRepoCommits, getWeeklyActivity, getContributorStats, getRepoInfo };
