import * as core from "@actions/core"
import { ReleaseData } from "./Releases.js"

export interface Outputs {
    applyReleaseData(releaseData: ReleaseData): void
    applyAssetUrls(assetUrls: Record<string, string>): void
}

export class CoreOutputs implements Outputs {
    applyReleaseData(releaseData: ReleaseData) {
        core.setOutput("id", releaseData.id)
        core.setOutput("html_url", releaseData.html_url)
        core.setOutput("upload_url", releaseData.upload_url)
        core.setOutput("tarball_url", releaseData.tarball_url || "")
        core.setOutput("zipball_url", releaseData.zipball_url || "")
    }

    applyAssetUrls(assetUrls: Record<string, string>) {
        const assetUrlsJson = JSON.stringify(assetUrls)
        core.setOutput("assets", assetUrlsJson)
    }
}
