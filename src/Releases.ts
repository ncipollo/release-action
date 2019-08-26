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

    async create(tag: string, commitHash?: string): Promise<Response<ReposCreateReleaseResponse>> {
        return this.git.repos.createRelease({
            name: "Test release",
            draft: true,
            owner: this.context.repo.owner,
            repo: this.context.repo.repo,
            target_commitish: commitHash,
            tag_name: tag
        })
    }
}
