# Release Action

This action will create a GitHub release and optionally upload an artifact to it.

## Action Inputs
- **allowUpdates**: An optional flag which indicates if we should update a release if it already exists. Defaults to `false`.
- **artifactErrorsFailBuild**: An optional flag which indicates if artifact read or upload errors should fail the build.  
- **artifact** (deprecated): An optional set of paths representing artifacts to upload to the release. This may be a single path or a comma delimited list of paths (or globs).
- **artifacts**: An optional set of paths representing artifacts to upload to the release. This may be a single path or a comma delimited list of paths (or globs).
- **artifactContentType**: The content type of the artifact. Defaults to `raw`.
- **body**: An optional body for the release.
- **bodyFile**: An optional body file for the release. This should be the path to the file.
- **commit**: An optional commit reference. This will be used to create the tag if it does not exist.
- **discussionCategory**: When provided this will generate a discussion of the specified category. The category must exist otherwise this will cause the action to fail. This isn't used with draft releases.
- **draft**: Optionally marks this release as a draft release. Set to `true` to enable.
- **name**: An optional name for the release. If this is omitted the tag will be used.
- **omitBody**: Indicates if the release body should be omitted.
- **omitBodyDuringUpdate**: Indicates if the release body should be omitted during updates. The body will still be applied for newly created releases. This will preserve the existing body during updates.
- **omitName**: Indicates if the release name should be omitted.
- **omitNameDuringUpdate**: Indicates if the release name should be omitted during updates. The name will still be applied for newly created releases. This will preserve the existing name during updates.
- **omitPrereleaseDuringUpdate**: Indicates if the prerelease flag should be omitted during updates. The prerelease flag will still be applied for newly created releases.
  This will preserve the existing prerelease state during updates.
- **owner**: Optionally specify the owner of the repo where the release should be generated. Defaults to current repo's owner.
- **prerelease**: Optionally marks this release as prerelease. Set to true to enable.
- **replacesArtifacts**: Indicates if existing release artifacts should be replaced. Defaults to `true`.
- **repo**: Optionally specify the repo where the release should be generated. Defaults to current repo.
- **tag**: An optional tag for the release. If this is omitted the git ref will be used (if it is a tag).
- **token**: (**Required**) The GitHub token. Typically this will be `${{ secrets.GITHUB_TOKEN }}`.

## Action Outputs
- **id**: The identifier of the created release.
- **html_url**: The HTML URL of the release.
- **upload_url**: The URL for uploading assets to the release.

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
