import { applyJuejinRule } from "@sitdown/juejin/dist/src.esm"
import { applyWechatRule, extraFootLinks } from "@sitdown/wechat/dist/src.esm"
import { applyZhihuRule } from "@sitdown/zhihu/dist/src.esm"
import { RootNode, Sitdown } from "sitdown/dist/src.esm"

const gfm = new Sitdown({
  keepFilter: ["style"],
  codeBlockStyle: "fenced"
})
const juejin = new Sitdown({
  keepFilter: ["style"],
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  hr: "---"
})
juejin.use(applyJuejinRule)
const wechat = new Sitdown({
  keepFilter: ["style"],
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  hr: "---"
})
wechat.use(applyWechatRule)
const wechatToMD = (html) => {
  const root = new RootNode(html)
  const footLinks = extraFootLinks(root)
  return wechat.HTMLToMD(html, { footLinks })
}
const zhihu = new Sitdown({
  keepFilter: ["style"],
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  hr: "---"
})
zhihu.use(applyZhihuRule)
const csdn = new Sitdown({
  keepFilter: ["style"],
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  hr: "---"
})
const methods = {
  GFM: (input: string): string => gfm.HTMLToMD(input),
  Juejin: (input: string): string => juejin.HTMLToMD(input),
  Zhihu: (input: string): string => zhihu.HTMLToMD(input),
  Wechat: (input: string): string => wechatToMD(input),
  CSDN: (input: string): string => csdn.HTMLToMD(input)
}

export default methods
