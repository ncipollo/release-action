import * as core from "@actions/core"
import { describe, expect, it, vi } from "vitest"
import { CoreOutputs, type Outputs } from "../src/Outputs.js"
import type { ReleaseData } from "../src/Releases.js"

vi.mock("@actions/core")
const mockSetOutput = vi.mocked(core.setOutput)

const TEST_URLS = {
    HTML_URL: "https://api.example.com/assets",
    UPLOAD_URL: "https://api.example.com",
    TARBALL_URL: "https://api.example.com/tarball",
    ZIPBALL_URL: "https://api.example.com/zipball",
} as const

describe("Outputs", () => {
    let outputs: Outputs
    let releaseData: ReleaseData

    beforeEach(() => {
        outputs = new CoreOutputs()
        releaseData = {
            id: 1,
            html_url: TEST_URLS.HTML_URL,
            upload_url: TEST_URLS.UPLOAD_URL,
            tarball_url: TEST_URLS.TARBALL_URL,
            zipball_url: TEST_URLS.ZIPBALL_URL,
        }
    })

    it("Applies the release data to the action output", () => {
        outputs.applyReleaseData(releaseData)
        expect(mockSetOutput).toHaveBeenCalledWith("id", releaseData.id)
        expect(mockSetOutput).toHaveBeenCalledWith("html_url", releaseData.html_url)
        expect(mockSetOutput).toHaveBeenCalledWith("upload_url", releaseData.upload_url)
        expect(mockSetOutput).toHaveBeenCalledWith("tarball_url", releaseData.tarball_url)
        expect(mockSetOutput).toHaveBeenCalledWith("zipball_url", releaseData.zipball_url)
    })

    it("Handles null tarball_url and zipball_url", () => {
        const releaseDataWithNulls = {
            ...releaseData,
            tarball_url: null,
            zipball_url: null,
        }
        outputs.applyReleaseData(releaseDataWithNulls)
        expect(mockSetOutput).toHaveBeenCalledWith("tarball_url", "")
        expect(mockSetOutput).toHaveBeenCalledWith("zipball_url", "")
    })

    it("Applies asset URLs to the action output", () => {
        const assetUrls = {
            "example.zip": "https://github.com/owner/repo/releases/download/v1.0.0/example.zip",
            "example.tar.gz": "https://github.com/owner/repo/releases/download/v1.0.0/example.tar.gz",
        }
        outputs.applyAssetUrls(assetUrls)
        expect(mockSetOutput).toHaveBeenCalledWith("assets", JSON.stringify(assetUrls))
    })

    it("Applies empty asset URLs to the action output", () => {
        const assetUrls = {}
        outputs.applyAssetUrls(assetUrls)
        expect(mockSetOutput).toHaveBeenCalledWith("assets", JSON.stringify(assetUrls))
    })
})
