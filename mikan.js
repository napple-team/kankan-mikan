function postRequest(url, data) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.addEventListener('load', () => resolve(xhr));
    xhr.addEventListener('error', () => reject(xhr));
    xhr.send(JSON.stringify(data));
  });
}


(async () => {
  const pattern = new RegExp('^(https://twitter.com/(i/web|[a-zA-Z0-9_]+)/status/[0-9]+)', 'i');

  browser.contextMenus.create({
    type: 'normal',
    title: 'リンクを koresuki に送信する',
    contexts: ['link'],
    onclick: async (info) => {
      if (pattern.test(info.linkUrl)) {
        const tweetLink = info.linkUrl.replace(pattern, '$1');
        const setting = await browser.storage.sync.get(["url", "username"]);
        await postRequest(setting.url, {
          command: '/koresuki', user_name: setting.username, text: tweetLink
        });
      }
    }
  });
})();
