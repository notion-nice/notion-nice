import { NextApiRequest, NextApiResponse } from 'next'
import sitdownConverter from '@/lib/sitdownConverter'
import { markdownToBlocks } from '@tryfabric/martian'

/**
 * @swagger
 * /api/harvest/html2md:
 *   post:
 *     description: Html to Markdown and Markdown to Notion API Blocks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           type: object
 *           properties:
 *             html:
 *               type: string
 *             source:
 *               type: string
 *             to_block:
 *               type: boolean
 *     responses:
 *       200:
 *         description: Markdown or Notion API Blocks
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'method not allowed' })
  }
  try {
    const html = req.body.html as string
    const source = req.body.source as string
    const toBlock = req.body.to_block as string
    if (typeof html !== 'string') {
      return res.send({ ok: false, error: { message: '参数异常' } })
    }
    let md = sitdownConverter.GFM(html)
    switch (source) {
      case 'Juejin':
        md = sitdownConverter.Juejin(html)
        break
      case 'Zhihu':
        md = sitdownConverter.Zhihu(html)
        break
      case 'Wechat':
        md = sitdownConverter.Wechat(html)
        break
      case 'CSDN':
        md = sitdownConverter.CSDN(html)
        break

      default:
        break
    }
    if (!toBlock) {
      return res.send({ ok: true, md })
    }
    const blocks = markdownToBlocks(md)
    return res.send({ ok: true, blocks })
  } catch (error) {
    return res.send({ ok: false, error: { message: error.message } })
  }
}

export default handler
