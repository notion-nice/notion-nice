import { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'method not allowed' })
  }
  try {
    const response = await fetch(req.body.exportURL)
    if (!response.ok) {
      res.send({ ok: false, error: 'Failed to download file' })
      return
    }

    // 获取ZIP文件的二进制数据
    const arrayBuffer = await response.arrayBuffer()
    const zipped = new Uint8Array(arrayBuffer)
    const decoder = new TextDecoder('utf-8')

    const unzipped = unzipSync(zipped)

    let htmlFileContent = ''

    for (const filename in unzipped) {
      const fileContent = unzipped[filename]

      if (filename.endsWith('.html')) {
        htmlFileContent = decoder.decode(fileContent)
      }
    }

    return res.send({ ok: true, html: htmlFileContent })
  } catch (error) {
    return res.send({ ok: false, error: { message: error.message } })
  }
}
