import * as core from "@actions/core";
import * as github from "@actions/github";
import * as fs from "fs";
import { Octokit } from "@octokit/rest";
import { createOrUpdateTextFile } from "@octokit/plugin-create-or-update-text-file";

async function run() {
  try {
    const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");

    const EnhancedOctokit = Octokit.plugin(createOrUpdateTextFile).defaults({
      userAgent: "Nx-Igus",
    });

    const octokit = new EnhancedOctokit({
      auth: GITHUB_TOKEN,
    });

    const sha = process.env.GITHUB_SHA as string;
    const message = process.env.GITHUB_MESSAGE as string;
    const author = "nx-augustinesmith";

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
    
    // fs.writeFileSync("COMMIT_INFO", commitInfo);
    // const repo = github.context.repo;
    // const branch = github.context.ref.replace("refs/heads/", "");
    // const blob = await octokit.rest.git.createBlob({
    //   owner: repo.owner,
    //   repo: repo.repo,
    //   content: commitInfo,
    //   encoding: "utf-8",
    // });
    // const tree = await octokit.rest.git.getTree({
    //   owner: repo.owner,
    //   repo: repo.repo,
    //   tree_sha: `${sha}^{tree}`,
    // });

    // const newTree = await octokit.rest.git.createTree({
    //   owner: repo.owner,
    //   repo: repo.repo,
    //   tree: tree.data.tree.concat({
    //     path: "COMMIT_INFO",
    //     mode: "100644",
    //     type: "blob",
    //     sha: `${sha}^{blob}`,
    //   }),
    // } as any);
    // const newCommit = await octokit.rest.git.createCommit({
    //   owner: repo.owner,
    //   repo: repo.repo,
    //   message: "Add COMMIT_INFO",
    //   tree: newTree.data.sha,
    //   parents: [sha],
    //   author: {
    //     name: author,
    //     email: "nx-augustinesmith@nexum.com",
    //     date: new Date().toISOString(),
    //   },
    // });

    // await octokit.rest.git.updateRef({
    //   owner: repo.owner,
    //   repo: repo.repo,
    //   ref: `heads/${branch}`,
    //   sha: newCommit.data.sha,
    // });
    core.setOutput("commit-info", commitInfo);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();
