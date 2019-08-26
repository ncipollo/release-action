import { Inputs } from "./Inputs";
import { Releases } from "./Releases";

export class Action {
    private inputs: Inputs
    private releases: Releases

    constructor(inputs: Inputs, releases: Releases) {
        this.inputs = inputs
        this.releases = releases
    }
}