import {Context} from "@actions/github/lib/context";
import { GitHub } from '@actions/github/lib/utils'
import {
    OctokitResponse,
    ReposListReleaseAssetsResponseData,
    ReposCreateReleaseResponseData,
    ReposGetReleaseByTagResponseData,
    ReposListReleasesResponseData,
    ReposUploadReleaseAssetResponseData
} from "@octokit/types";

export interface Releases {
    create(
        tag: string,
        body?: string,
        commitHash?: string,
        draft?: boolean,
        name?: string,
        prerelease?: boolean
    ): Promise<OctokitResponse<ReposCreateReleaseResponseData>>

    deleteArtifact(assetId: number): Promise<OctokitResponse<any>>

    getByTag(tag: string): Promise<OctokitResponse<ReposGetReleaseByTagResponseData>>

    listArtifactsForRelease(releaseId: number): Promise<OctokitResponse<ReposListReleaseAssetsResponseData>>

    listReleases(): Promise<OctokitResponse<ReposListReleasesResponseData>>

    update(
        id: number,
        tag: string,
        body?: string,
        commitHash?: string,
        draft?: boolean,
        name?: string,
        prerelease?: boolean
    ): Promise<OctokitResponse<ReposCreateReleaseResponseData>>

    uploadArtifact(
        assetUrl: string,
        contentLength: number,
        contentType: string,
        file: string | object,
        name: string,
        releaseId: number,
    ): Promise<OctokitResponse<ReposUploadReleaseAssetResponseData>>
}

export class GithubReleases implements Releases {
    context: Context
    git: InstanceType<typeof GitHub>

    constructor(context: Context, git: InstanceType<typeof GitHub>) {
        this.context = context
        this.git = git
    }

    async create(
        tag: string,
        body?: string,
        commitHash?: string,
        draft?: boolean,
        name?: string,
        prerelease?: boolean
    ): Promise<OctokitResponse<ReposCreateReleaseResponseData>> {
        // noinspection TypeScriptValidateJSTypes
        return this.git.repos.createRelease({
            body: body,
            name: name,
            draft: draft,
            owner: this.context.repo.owner,
            prerelease: prerelease,
            repo: this.context.repo.repo,
            target_commitish: commitHash,
            tag_name: tag
        })
    }

    async deleteArtifact(
        assetId: number
    ): Promise<OctokitResponse<any>> {
        return this.git.repos.deleteReleaseAsset({
            asset_id: assetId,
            owner: this.context.repo.owner,
            repo: this.context.repo.repo
        })
    }

    async listArtifactsForRelease(
        releaseId: number
    ): Promise<OctokitResponse<ReposListReleaseAssetsResponseData>> {
        return this.git.repos.listReleaseAssets({
            owner: this.context.repo.owner,
            release_id: releaseId,
            repo: this.context.repo.repo
        })
    }

    async listReleases(): Promise<OctokitResponse<ReposListReleasesResponseData>> {
        return this.git.repos.listReleases({
            owner: this.context.repo.owner,
            repo: this.context.repo.repo
        })
    }

    async getByTag(tag: string): Promise<OctokitResponse<ReposGetReleaseByTagResponseData>> {
        return this.git.repos.getReleaseByTag({
            owner: this.context.repo.owner,
            repo: this.context.repo.repo,
            tag: tag
        })
    }

    async update(
        id: number,
        tag: string,
        body?: string,
        commitHash?: string,
        draft?: boolean,
        name?: string,
        prerelease?: boolean
    ): Promise<OctokitResponse<ReposCreateReleaseResponseData>> {
        // noinspection TypeScriptValidateJSTypes
        return this.git.repos.updateRelease({
            release_id: id,
            body: body,
            name: name,
            draft: draft,
            owner: this.context.repo.owner,
            prerelease: prerelease,
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
        name: string,
        releaseId: number,
    ): Promise<OctokitResponse<ReposUploadReleaseAssetResponseData>> {
        return this.git.repos.uploadReleaseAsset({
            url: assetUrl,
            headers: {
                "content-length": contentLength,
                "content-type": contentType
            },
            data: file as any,
            name: name,
            owner: this.context.repo.owner,
            release_id: releaseId,
            repo: this.context.repo.repo
        })
    }
}
