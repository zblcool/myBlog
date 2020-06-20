module.exports = {
  title: 'Baolong Zhang', // Title for the site. This will be displayed in the navbar.
  theme: '@vuepress/theme-blog',
  head: [
    ['link', { rel: 'icon', href: '/logo.png' }]
  ],
  themeConfig: {
    // Please keep looking down to see the available options.
    nav: [
      {
        text: 'Blog',
        link: '/post/',
      },
      {
        text: 'Notes',
        link: '/notes/',
      },
      {
        text: 'Tags',
        link: '/tag/',
      },
      {
        text: 'Github',
        link: 'https://github.com/zblcool',
      },
    ],
    footer: {
      contact: [
        {
          type: 'github',
          link: 'https://github.com/zblcool',
        },
        {
          type: 'instagram',
          link: 'https://www.instagram.com/zblash95/?hl=zh-cn',
        },
        {
          type: 'linkedin',
          link: 'https://www.linkedin.com/in/baolong-zhang-704062a1/',
        },
      ],
      copyright: [
        // {
        //   text: 'Privacy Policy',
        //   link: 'https://policies.google.com/privacy?hl=en-US',
        // },
        {
          text: 'Powered by VuePress | Ash © 1995-present',
          link: '',
        },
      ],      
    },
    directories: [
      {
        id: 'post',
        dirname: '_posts',
        path: '/post/',
        title: 'posts',
    
      },
      {
        id: 'notes',
        dirname: '_notes',
        path: '/notes/',
      },
    ],
    smoothScroll: true,
  },
  plugins: [
    [
      'vuepress-plugin-mathjax',
      {
        target: 'svg',
        macros: {
          '*': '\\times',
        },
      },
    ],
  ],
}