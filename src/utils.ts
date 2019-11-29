import axios, { AxiosResponse } from 'axios'
import { createWriteStream } from 'fs'
import { resolve, basename } from 'path'
import { Stream } from 'stream'

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
  Promise.all(
    chosenFiles.map((file) =>
      axios.get<Stream>(possibleFiles[file], { responseType: 'stream' })
    )
  )

interface WriteFiles {
  files: AxiosResponse<Stream>[]
  path: string
}

export const writeFiles = async ({ files, path }: WriteFiles) => {
  Promise.all(
    files.map((file) => {
      const filePath = resolve(path, basename(file.request.path))
      return file.data.pipe(createWriteStream(filePath))
    })
  )
}
