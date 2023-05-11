import * as core from "@actions/core";
import * as github from "@actions/github"
import { Octokit } from "@octokit/rest";
import { createOrUpdateTextFile } from "@octokit/plugin-create-or-update-text-file";

async function run() {
  try {
    const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
    const COMMITTER = core.getInput("COMMITTER");
    const COMMIT_MESSAGE = core.getInput("COMMIT_MESSAGE");
    const DESTINATION_FILE_PATH = core.getInput("DESTINATION_FILE_PATH");

    const EnhancedOctokit = Octokit.plugin(createOrUpdateTextFile).defaults({
      userAgent: "Nx-Igus",
    });

    const octokit = new EnhancedOctokit({
      auth: GITHUB_TOKEN,
    });

    const sha = process.env.GITHUB_SHA as string;
    const commitInfo = JSON.stringify({
      sha,
      committer: COMMITTER,
      message: COMMIT_MESSAGE,
    });

    await octokit.createOrUpdateTextFile({
      owner: COMMITTER,
      repo: github.context.repo.repo,
      path: DESTINATION_FILE_PATH,
      message: `Updated ${DESTINATION_FILE_PATH}`,
      content: () => commitInfo,
    });
    core.setOutput("commit-info", commitInfo);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      core.setFailed(error.message);
    }
  }
}

run();
