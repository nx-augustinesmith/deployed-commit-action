import * as core from "@actions/core";
import * as github from "@actions/github";
import * as fs from "fs";
import { Octokit } from "@octokit/rest";
import { createOrUpdateTextFile } from "@octokit/plugin-create-or-update-text-file";

async function run() {
  try {
    const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
    const COMMITTER = core.getInput("COMMITTER");
    const COMMIT_MESSAGE = core.getInput("COMMIT_MESSAGE");

    const EnhancedOctokit = Octokit.plugin(createOrUpdateTextFile).defaults({
      userAgent: "Nx-Igus",
    });

    const octokit = new EnhancedOctokit({
      auth: GITHUB_TOKEN,
    });

    const sha = process.env.GITHUB_SHA as string;
    const message = COMMIT_MESSAGE;
    const author = COMMITTER;

    const commitInfo = `Commit: ${sha}\nAuthor: ${author}\nMessage: ${message}\n`;
    console.log(commitInfo);

    await octokit.createOrUpdateTextFile({
      owner: "nx-augustinesmith",
      repo: "deployed-commit-action",
      path: "COMMIT_INFO",
      message: "Updated COMMIT_INFO",
      content: ({ content }) => {
        return commitInfo;
      },
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
