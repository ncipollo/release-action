# Release Action

This action will create a github release and optionally upload an artifact to it.

## Action Inputs
- **artifact**: A path to an optional artifact to upload to the release.
- **artifactContentType**: The content type of the artifact. Defaults to raw.
- **body**: An optional body for the release.
- **bodyFile**: An optional body file for the release. This should be the path to the file.
- **commit**: An optional commit reference. This will be used to create the tag if it does not exist.
- **draft**: Optionally marks this release as a draft release. Set to `true` to enable.
- **name**: An optional name for the release. If this is omitted the tag will be used.
- **tag**: An optional tag for the release. If this is omitted the git ref will be used (if it is a tag).
- **token**: (**Required**) The Github token. Typically this will be `${{ secrets.GITHUB_TOKEN }}`.

## Example
This example will create a release when tag is pushed:

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
    - uses: actions/checkout@v1
    - uses: ncipollo/release-action@v1
      with:
        artifact: "release.tar.gz"
        bodyFile: "body.md"
        token: ${{ secrets.GITHUB_TOKEN }}

```

## Notes
- You must provide a tag either via the action input or the git ref (i.e push / create a tag). If you do not the action will fail.
- If the tag of the release you are creating does not exist yet, you should set both the `tag` and `commit` action inputs. `commit` can point to a commit hash or a branch name (ex - `master`).
