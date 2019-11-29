import axios, { AxiosResponse } from 'axios'
import { writeFile as writeFileCb } from 'fs'
import { resolve, basename } from 'path'
import { promisify } from 'util'

const writeFile = promisify(writeFileCb)

interface GetRepositoryFiles {
  user: string
  repository: string
}

export interface RepositoryFiles {
  [name: string]: string
}

interface RemoteFile {
  name: string
  download_url: string
  type: 'dir' | 'file'
}

export const getRepositoryFiles = async ({
  user,
  repository,
}: GetRepositoryFiles) => {
  const { data } = await axios.get<RemoteFile[]>(
    `https://api.github.com/repos/${user}/${repository}/contents`
  )

  return data.reduce<RepositoryFiles>((curr, next) => {
    if (next.type === 'file' && next.download_url) {
      curr[next.name] = next.download_url
    }

    return curr
  }, {})
}

interface DownloadFiles {
  possibleFiles: RepositoryFiles
  chosenFiles: string[]
}

export const downloadFiles = ({ possibleFiles, chosenFiles }: DownloadFiles) =>
  Promise.all(chosenFiles.map((file) => axios.get<string>(possibleFiles[file])))

interface WriteFiles {
  files: AxiosResponse<string>[]
  path: string
}

export const writeFiles = async ({ files, path }: WriteFiles) => {
  Promise.all(
    files.map(({ data, request }) => {
      const filePath = resolve(path, basename(request.path))

      return writeFile(filePath, data)
    })
  )
}
