# Release Action

This action will create a GitHub release and optionally upload an artifact to it.

## Action Inputs
| Input name                 | Description                                                                               	                                                                                                                                                         | Required 	 | Default Value        |
|----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|----------------------|
| allowUpdates               | An optional flag which indicates if we should update a release if it already exists. Defaults to false.                                                                                                                                             | false      | ""                   |
| artifactErrorsFailBuild    | An optional flag which indicates if artifact read or upload errors should fail the build.                                                                                                                                                           | false      | ""                   |
| artifacts                  | An optional set of paths representing artifacts to upload to the release. This may be a single path or a comma delimited list of paths (or globs)                                                                                                   | false      | ""                   |
| artifactContentType        | The content type of the artifact. Defaults to raw                                                                                                                                                                                                   | false      | ""                   |
| body                       | An optional body for the release.                                                                                                                                                                                                                   | false      | ""                   |
| bodyFile                   | An optional body file for the release. This should be the path to the file.                                                                                                                                                                         | false      | ""                   |
| commit                     | An optional commit reference. This will be used to create the tag if it does not exist.                                                                                                                                                             | false      | ""                   |
| discussionCategory         | When provided this will generate a discussion of the specified category. The category must exist otherwise this will cause the action to fail. This isn't used with draft releases                                                                  | false      | ""                   |
| draft                      | Optionally marks this release as a draft release. Set to true to enable.                                                                                                                                                                            | false      | ""                   |
| generateReleaseNotes       | Indicates if release notes should be automatically generated.                                                                                                                                                                                       | false      | false                |
| name                       | An optional name for the release. If this is omitted the tag will be used.                                                                                                                                                                          | false      | ""                   |
| omitBody                   | Indicates if the release body should be omitted.                                                                                                                                                                                                    | false      | false                |
| omitBodyDuringUpdate       | Indicates if the release body should be omitted during updates. The body will still be applied for newly created releases. This will preserve the existing body during updates.                                                                     | false      | false                |
| omitDraftDuringUpdate      | Indicates if the draft flag should be omitted during updates. The draft flag will still be applied for newly created releases. This will preserve the existing draft state during updates.                                                          | false      | false                |
| omitName                   | Indicates if the release name should be omitted.                                                                                                                                                                                                    | false      | false                |
| omitNameDuringUpdate       | Indicates if the release name should be omitted during updates. The name will still be applied for newly created releases. This will preserve the existing name during updates.                                                                     | false      | false                |
| omitPrereleaseDuringUpdate | Indicates if the prerelease flag should be omitted during updates. The prerelease flag will still be applied for newly created releases. This will preserve the existing prerelease state during updates.                                           | false      | false                |
| owner                      | Optionally specify the owner of the repo where the release should be generated. Defaults to current repo'sowner.                                                                                                                                    | false      | "current repo owner" |
| prerelease                 | Optionally marks this release as prerelease. Set to true to enable.                                                                                                                                                                                 | false      | ""                   |
| removeArtifacts            | Indicates if existing release artifacts should be removed.                                                                                                                                                                                          | false      | false                |
| replacesArtifacts          | Indicates if existing release artifacts should be replaced.                                                                                                                                                                                         | false      | true                 |
| repo                       | Optionally specify the repo where the release should be generated.                                                                                                                                                                                  | false      | current repo         |
| tag                        | An optional tag for the release. If this is omitted the git ref will be used (if it is a tag).                                                                                                                                                      | false      | ""                   |
| token                      | The GitHub token. This will default to the GitHub app token. This is primarily useful if you want to use your personal token (for targeting other repos, etc).  If you are using a personal access token it should have access to the `repo` scope. | false      | github.token         |

## Action Outputs
| Output name | Description                                   |
|-------------|-----------------------------------------------|
| id          | The identifier of the created release.        |
| html_url    | The HTML URL of the release.                  |
| upload_url  | The URL for uploading assets to the release.  |

## Example
This example will create a release when a tag is pushed:

```yml
name: Releases

on: 
  push:
    tags:
    - '*'

jobs:

  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
    - uses: actions/checkout@v2
    - uses: ncipollo/release-action@v1
      with:
        artifacts: "release.tar.gz,foo/*.txt"
        bodyFile: "body.md"
        token: ${{ secrets.GITHUB_TOKEN }}

```

## Notes
- You must provide a tag either via the action input or the git ref (i.e push / create a tag). If you do not provide a tag the action will fail.
- If the tag of the release you are creating does not yet exist, you should set both the `tag` and `commit` action inputs. `commit` can point to a commit hash or a branch name (ex - `main`).
- In the example above only required permissions for the action specified (which is `contents: write`). If you add other actions to the same workflow you should expand `permissions` block accordingly.
