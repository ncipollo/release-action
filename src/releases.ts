import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github";
import { Response, ReposCreateReleaseResponse } from "@octokit/rest";

export class Releases {
    context: Context;
    git: GitHub;

    constructor(context: Context, git: GitHub) {
        this.context = context;
        this.git = git;
    }

    async create(): Promise<Response<ReposCreateReleaseResponse>> {
        return this.git.repos.createRelease({
            name: "Test release",
            draft: true,
            owner: this.context.repo.owner,
            repo: this.context.repo.repo,
            target_commitish: "master",
            tag_name: "0.0.666"
        })
    }
}