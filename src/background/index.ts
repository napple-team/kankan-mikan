import browser from 'webextension-polyfill';
import { Post } from '../lib/post';

const post: Post = new Post();

(async () => {
  await post.sync();
})();

const notification = async (message: string) => {
  await browser.notifications.create(`kankan-mikan-${new Date().getTime()}`, {
    type: 'basic',
    title: 'kankan-mikan',
    iconUrl: 'icons/icon.png',
    message
  });
};

browser.contextMenus.create({
  type: 'normal',
  title: 'Post url with kankan-mikan',
  contexts: ['link'],
  onclick: async (info) => {
    if (!post.isStandby) await notification('Please setup')
    try {
      if (info.linkUrl && (post.isFilteredUrl() || post.validate(info.linkUrl))) {
        await post.submit(info.linkUrl);
        await notification('Posted!');
      } else {
        await notification('Invalid url');
      }
    } catch (err) {
      await notification(`${err}`);
    }
  }
});

browser.runtime.onMessage.addListener(async (message, sender) => {
  if (sender.id === browser.runtime.id) {
    switch (message.cmd) {
      case 'configures/save':
        post.postUrl = message.postUrl;
        post.template = message.template;
        post.contentType = message.contentType;
        post.regexp = message.regexp;
        await post.save();
        break;
      case 'configures/get':
        return Promise.resolve(post.get());
    }
  }
});
