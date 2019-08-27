import * as github from '@actions/github';
import * as core from '@actions/core';
import { Inputs, CoreInputs } from './Inputs';
import { Releases, GithubReleases } from './Releases';

async function run() {
  try {
    const token = core.getInput('token');
    const context = github.context
    const git = new github.GitHub(token);
    const releases = new GithubReleases(context, git)
    const inputs = new CoreInputs(context)
    await releases.create(inputs.tag)
    .catch(error => {
      core.warning(error)
    })
    .then(response => {
      core.warning(`response: ${response}`)
    })
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
