import os from "node:os"
import { describe, expect, it } from "vitest"
import { expandTilde } from "../src/PathExpander.js"

describe("PathExpander", () => {
    describe("expandTilde", () => {
        it("expands ~ at the start of a path", () => {
            const result = expandTilde("~/documents")
            expect(result).toBe(`${os.homedir()}/documents`)
        })

        it("expands ~ with backslash separator", () => {
            const result = expandTilde("~\\documents")
            expect(result).toBe(`${os.homedir()}\\documents`)
        })

        it("expands standalone ~", () => {
            const result = expandTilde("~")
            expect(result).toBe(os.homedir())
        })

        it("does not expand ~ in the middle of a path", () => {
            const result = expandTilde("/home/~user/documents")
            expect(result).toBe("/home/~user/documents")
        })

        it("does not expand ~username patterns", () => {
            const result = expandTilde("~username/documents")
            expect(result).toBe("~username/documents")
        })

        it("returns path unchanged when no tilde present", () => {
            const result = expandTilde("/absolute/path")
            expect(result).toBe("/absolute/path")
        })

        it("returns relative path unchanged", () => {
            const result = expandTilde("relative/path")
            expect(result).toBe("relative/path")
        })
    })
})
