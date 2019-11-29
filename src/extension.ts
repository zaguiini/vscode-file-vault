import { AxiosResponse } from 'axios'
import * as vscode from 'vscode'
import parseGitHubUrl from 'parse-github-url'
import {
  getRepositoryFiles,
  downloadFiles,
  writeFiles,
  RepositoryFiles,
} from './utils'

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'extension.fileVault',
    async ({ fsPath }) => {
      let output = vscode.window.createOutputChannel('File Vault')

      const repositories = vscode.workspace
        .getConfiguration('fileVault')
        .get('repositories') as string[]

      if (!repositories.length) {
        vscode.window.showErrorMessage(
          `Please add repositories on Settings > File Vault > Repositories`
        )

        return
      }

      const repositoryUrl = await vscode.window.showQuickPick(repositories, {
        placeHolder: 'Select the desired repository to fetch files',
      })

      if (!repositoryUrl) {
        return
      }

      const { owner: user, name: repository } =
        parseGitHubUrl(repositoryUrl) || {}

      if (!user || !repository) {
        vscode.window.showErrorMessage(`Invalid repository`)

        return
      }

      let possibleFiles: RepositoryFiles = {}

      try {
        possibleFiles = await vscode.window.withProgress(
          {
            title: 'Getting repository information...',
            location: vscode.ProgressLocation.Notification,
          },
          () => getRepositoryFiles({ user, repository })
        )
      } catch (err) {
        output.append(err.name)
        output.append(err.stack || '')
        output.show()

        vscode.window.showErrorMessage(
          `Couldn't get files from remote. Try again!`
        )

        return
      }

      const chosenFiles = await vscode.window.showQuickPick(
        Object.keys(possibleFiles),
        {
          placeHolder: 'Select the files you want to download',
          canPickMany: true,
        }
      )

      if (!chosenFiles || chosenFiles.length === 0) {
        return
      }

      let downloadedFiles: AxiosResponse<string>[]

      try {
        downloadedFiles = await vscode.window.withProgress(
          {
            title: 'Downloading files...',
            location: vscode.ProgressLocation.Notification,
          },
          () => downloadFiles({ possibleFiles, chosenFiles })
        )
      } catch (err) {
        output.append(err.name)
        output.append(err.stack || '')
        output.show()

        vscode.window.showErrorMessage(
          `Couldn't download files from remote. Try again!`
        )

        return
      }

      try {
        await writeFiles({
          files: downloadedFiles,
          path: fsPath as string,
        })
      } catch (err) {
        output.append(err.name)
        output.append(err.stack || '')
        output.show()

        vscode.window.showErrorMessage(
          `Couldn't write files locally. Try again!`
        )
      }
    }
  )

  context.subscriptions.push(disposable)
}

export function deactivate() {}
