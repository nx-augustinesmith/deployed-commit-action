import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
  try {
    const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
    const octokit = github.getOctokit(GITHUB_TOKEN);
    const sha = process.env.GITHUB_SHA;
    const message = process.env.GITHUB_MESSAGE;
    const author = process.env.GITHUB_ACTOR;

    const commitInfo = `Commit: ${sha}\nAuthor: ${author}\nMessage: ${message}\n`;
    console.log(commitInfo);
    core.setOutput("commit-info", commitInfo);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();
