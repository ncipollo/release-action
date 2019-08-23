import * as core from '@actions/core';

async function run() {
  try {
    const myInput = core.getInput('token');
    core.debug(`Token ${myInput}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
