# [vscode-file-vault](https://marketplace.visualstudio.com/items?itemName=zaguini.vscode-file-vault)

Quickly grab your favorite files directly from Github!

## What?

I created this extension to solve a problem I had, that was having files like `.prettierrc`, `.eslintrc` and so on, and I don't want to copy paste files. I want to keep them remotely and versioned. So I created this extension to automatically download and place the files I want exactly where I want. Enjoy!

## Requirements

Before downloading files you need to specify the sources, which are the repository URLs. For that, either open `Settings > File Vault > Repositories` or include a key named `fileVault.repositories`, which is an array of strings.

## Usage

Just right click in any folder on the file explorer and select `Download files from vault`. After that, choose the desired repository, the files and you're done! The files should have been downloaded to the target folder, like in the example below:

![Demo](./example.gif)

As you can see, it's possible to fetch multiple files at once as long as they belong to the same repository! Woohoo!

## Troubleshooting

If you find any issues, please copy what was thrown in the output tab on the `File Vault` task.
After copying, please file an issue with general information about your environment, like:

- OS
- VSCode version
- Desired repository and files selected

## License

MIT

## Rights

- bank vault icon PNG Designed By IYIKON from <a href="https://pngtree.com/">Pngtree.com</a>
