/**
 * Ads
 */
setInterval(() => {
  if (!document.querySelector('.ad-showing')) return;

  const buttons = document.querySelectorAll('.ytp-skip-ad-button');
  if (buttons.length == 0) {
    const video = document.querySelector('.ad-showing video');
    if (video && video.duration > 0) {
      let adInterval = 0
      const increment = video.duration * 0.05
      adInterval = setInterval(() => {
        if (video.currentTime + increment < video.duration) {
          video.currentTime += increment
        } else {
          clearInterval(adInterval)
        }
      }, 100)
    }
  } else {
    for (const btn of buttons) btn.click();
  }

  chrome.runtime.sendMessage({
    action: 'set-storage',
    site: 'youtube',
    key: 'videoAdSkipCount',
    value: 'increment',
  });
}, 200);

/**
 * Confirm dialog
 */
setInterval(() => {
  const dialog = document.querySelector('yt-confirm-dialog-renderer');
  if (dialog) {
    const buttons = dialog.querySelectorAll('[aria-label="Sim"]');
    if (buttons.length) {
      for (const btn of buttons) btn.click();
      dialog.remove()
      console.log('dialog clicked')
      chrome.runtime.sendMessage({
        action: 'set-storage',
        site: 'youtube',
        key: 'confirmSkipCount',
        value: 'increment',
      });
    }
    const overlay = document.getElementsByTagName("tp-yt-iron-overlay-backdrop")
    if (overlay.length) {
      overlay[0].click()
      console.log('overlay clicked')
    }
  }

}, 2000);

const video = {
  id: '',
  lastId: '',
  info: {
    dislikes: 0,
  },

  getId: () => {
    const urlObject = new URL(window.location.href);
    const pathname = urlObject.pathname;

    if (pathname.startsWith('/clip')) {
      video.id = document.querySelector("meta[itemprop='videoId']").content;
      return;
    }

    if (pathname.startsWith('/shorts')) {
      video.id = pathname.slice(8);
      return;
    }

    video.id = urlObject.searchParams.get('v');
  },
  getInfo: async () => {
    const response = await fetch(
      `https://returnyoutubedislikeapi.com/votes?videoId=${video.id}`
    );
    const info = await response.json();

    video.info.dislikes = info.dislikes;

    dislikeButton.update();
  },

  interval: 0,
  setInterval: () => {
    video.interval = setInterval(() => {
      try {
        video.getId();
        if (!video.id || video.id == video.lastId) return;
        video.lastId = video.id;
        video.getInfo();
      } catch (error) {}
    }, 3000);
  },
};
video.setInterval();

const dislikeButton = {
  query: () => {
    return document.querySelector('dislike-button-view-model button');
  },

  update: () => {
    const el = dislikeButton.query();
    if (!el) return;

    const iconEl = el.querySelector('.yt-spec-button-shape-next__icon');
    if (!iconEl) return;

    const text =
      document.getElementById('dislike-text') || document.createElement('div');

    text.id = 'dislike-text';
    text.style.margin = '0 0 0 6px';
    text.innerHTML = video.info.dislikes;
    iconEl.after(text);
    el.style.width = '80px';
  },
};
