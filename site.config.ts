import { siteConfig } from './lib/site-config'

export default siteConfig({
  // the site's root Notion page (required)
  rootNotionPageId: 'cc5cf4b13b684d8c8cb1d4fb1300c454',

  // if you want to restrict pages to a single notion workspace (optional)
  // (this should be a Notion ID; see the docs for how to extract this)
  rootNotionSpaceId: null,

  // basic site info (required)
  name: 'Notion Nice',
  domain: 'notion-nice.com',
  author: 'Notion Nice',

  // open graph metadata (optional)
  description:
    'Format and distribute Notion content easily. Supports WeChat and more. Enhance your productivity.',

  // social usernames (optional)
  twitter: 'notion_nice',
  github: 'notion-nice',
  // linkedin: 'fisch2',
  // mastodon: '#', // optional mastodon profile URL, provides link verification
  // newsletter: '#', // optional newsletter URL
  // youtube: '#', // optional youtube channel name or `channel/UCGbXXXXXXXXXXXXXXXXXXXXXX`

  // default notion icon and cover images for site-wide consistency (optional)
  // page-specific values will override these site-wide defaults
  defaultPageIcon: null,
  defaultPageCover: null,
  defaultPageCoverPosition: 0.5,

  // whether or not to enable support for LQIP preview images (optional)
  isPreviewImageSupportEnabled: true,

  // whether or not redis is enabled for caching generated preview images (optional)
  // NOTE: if you enable redis, you need to set the `REDIS_HOST` and `REDIS_PASSWORD`
  // environment variables. see the readme for more info
  isRedisEnabled: false,
  isSearchEnabled: false,

  // map of notion page IDs to URL paths (optional)
  // any pages defined here will override their default URL paths
  // example:
  //
  pageUrlOverrides: {
    '/privacy': '94d0ba8c65ea40e2b6455b8d1037752e',
    '/changelog': '7cf2ecce1b4447a78ee8871a72778dc5',
    '/terms-of-use': 'a811088cf9614be3aafa428a666c902b'
  },

  // whether to use the default notion navigation style or a custom one with links to
  // important pages. To use `navigationLinks`, set `navigationStyle` to `custom`.
  navigationStyle: 'default',
  // navigationStyle: 'custom',
  navigationLinks: [
    {
      title: 'CHANGELOG',
      pageId: '7cf2ecce1b4447a78ee8871a72778dc5'
    }
  ]
})
