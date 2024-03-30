import { NextApiRequest, NextApiResponse } from 'next'

const notionClientVersion = '23.13.0.157'
const comboList = {
  free: [
    '增添 Notion 文章大纲目录',
    '文章一键排版到公号等平台',
    '不支持上传图片'
  ],
  plus: ['支持无限制图片上传', '访问额外的实验性功能（开发中）'],
  pro: ['使用 Harvest 快速收藏并分析文章', '访问额外的AI实验性功能']
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'method not allowed' })
  }
  return res.send({ ok: true, comboList, notionClientVersion })
}
