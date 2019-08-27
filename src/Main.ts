import * as github from '@actions/github';
import * as core from '@actions/core';
import { CoreInputs } from './Inputs';
import { GithubReleases } from './Releases';
import { Action } from './Action';

async function run() {
  try {
    const action = createAction()
    await action.perform()
  } catch (error) {
    core.setFailed(error.message);
  }
}

function createAction(): Action {
  const token = core.getInput('token')
  const context = github.context
  const git = new github.GitHub(token)
  const releases = new GithubReleases(context, git)
  const inputs = new CoreInputs(context)
  return new Action(inputs, releases)
}

run();
