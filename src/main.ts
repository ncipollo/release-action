import * as github from '@actions/github';
import * as core from '@actions/core';
import { Releases } from './releases';

async function run() {
  try {
    const token = core.getInput('token');
    const context = github.context
    const git = new github.GitHub(token);
    const release = new Releases(context, git)
    
    const myInput = core.getInput('token');
    core.debug(`Token ${myInput}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
