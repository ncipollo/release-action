import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github";
import { AnyResponse, Response, ReposCreateReleaseResponse } from "@octokit/rest";

export interface Releases {
    create(
        tag: string,
        body?: string,
        commitHash?: string,
        draft?: boolean,
        name?: string
    ): Promise<Response<ReposCreateReleaseResponse>>

    uploadArtifact(
        assetUrl: string,
        contentLength: number,
        contentType: string,
        file: string | object,
        name: string
    ): Promise<Response<AnyResponse>>
}

export class GithubReleases implements Releases{
    context: Context
    git: GitHub

    constructor(context: Context, git: GitHub) {
        this.context = context
        this.git = git
    }

    async create(
        tag: string,
        body?: string,
        commitHash?: string,
        draft?: boolean,
        name?: string
    ): Promise<Response<ReposCreateReleaseResponse>> {
        return this.git.repos.createRelease({
            body: body,
            name: name,
            draft: draft,
            owner: this.context.repo.owner,
            repo: this.context.repo.repo,
            target_commitish: commitHash,
            tag_name: tag
        })
    }

    async uploadArtifact(
        assetUrl: string,
        contentLength: number,
        contentType: string,
        file: string | object,
        name: string
    ): Promise<Response<AnyResponse>> {
        return this.git.repos.uploadReleaseAsset({
            url: assetUrl,
            headers: {
                "content-length": contentLength,
                "content-type": contentType
            },
            file: file,
            name: name
        })
    }
}
