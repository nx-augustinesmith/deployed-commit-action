import * as core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/rest";
import { createOrUpdateTextFile } from "@octokit/plugin-create-or-update-text-file";
import { getExecOutput } from "@actions/exec";

async function getAffectedProjects(
  project_type: "libs" | "apps",
  base?: string,
  head?: string
) {
  const commandArgs = ["--plain"];

  if (base) {
    commandArgs.push("--base", base);
  }
  if (head) {
    commandArgs.push("--head", head);
  }

  const affectedCommand = `npx nx affected:${project_type}`;
  core.info(`${affectedCommand} ${commandArgs.join(" ")}`);
  const affectedResult = await getExecOutput(affectedCommand, commandArgs, {
    silent: false,
  });
  core.info(affectedResult.stdout);
  core.info(affectedResult.stderr);
  console.log("Affected result error", affectedResult.stderr);
  return affectedResult.stdout;
}

async function run() {
  try {
    const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
    const COMMITTER = core.getInput("COMMITTER");
    const COMMIT_MESSAGE = core.getInput("COMMIT_MESSAGE");
    const DESTINATION_FILE_PATH = core.getInput("DESTINATION_FILE_PATH");
    const HEAD = core.getInput("HEAD");
    const BASE = core.getInput("BASE");

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

    console.log(commitInfo);
    
    const allAffectedProjects = [
      ...(await getAffectedProjects("libs", HEAD, BASE)),
      ...(await getAffectedProjects("apps", HEAD, BASE)),
    ];
    await octokit.createOrUpdateTextFile({
      owner: COMMITTER,
      repo: github.context.repo.repo,
      path: DESTINATION_FILE_PATH,
      message: `Updated ${DESTINATION_FILE_PATH}`,
      content: () => commitInfo,
    });
    
    console.log(allAffectedProjects);

    core.setOutput("commit-info", commitInfo);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      core.setFailed(error.message);
    }
  }
}

run();
