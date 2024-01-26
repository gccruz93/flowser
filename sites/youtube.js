const init = async () => {
  const startTime = performance.now();

  await flowser.storage.init();

  /**
   * Elements ===========================
   */
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
    },

    interval: 0,
    setInterval: () => {
      video.interval = setInterval(() => {
        video.getId();
        if (!video.id || video.id == video.lastId) return;
        flowser.utils.log('fetching video info...');
        video.lastId = video.id;
        video.getInfo();
      }, 3000);
    },
  };

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
        document.getElementById('dislike-text') ||
        document.createElement('div');

      text.id = 'dislike-text';
      text.style.margin = '0 0 0 6px';
      text.innerHTML = video.info.dislikes;
      iconEl.after(text);
      el.style.width = '80px';
    },

    interval: 0,
    setInterval: () => {
      dislikeButton.interval = setInterval(() => {
        dislikeButton.update();
      }, 250);
    },
  };

  const confirmButton = {
    query: () => {
      return document.querySelector('yt-confirm-dialog-renderer');
    },

    click: () => {
      const el = confirmButton.query();
      if (!el) return;

      const buttons = document.querySelectorAll('[aria-label="Sim"]');
      if (!buttons.length) return;

      for (const skipButton of buttons) {
        skipButton.click();
      }

      flowser.utils.log('confirmou');
      flowser.storage.data.sites.youtube.confirmSkipCount++;
      flowser.storage.save();
    },
  };

  /**
   * Starting events ===========================
   */
  video.setInterval();
  dislikeButton.setInterval();

  setInterval(() => {
    if (flowser.storage.data.sites.youtube.confirmSkip) {
      confirmButton.click();
    }

    if (document.querySelector('.ad-showing')) {
      const video = document.querySelector('.ad-showing video');
      video.currentTime = video?.duration || 9999;
      const skipButtons = document.querySelectorAll(
        '.ytp-ad-skip-button-modern'
      );
      for (const skipButton of skipButtons) {
        skipButton.click();
      }
      flowser.storage.data.sites.youtube.videoAdSkipCount++;
      flowser.storage.save();
    }
    // const overlayAds = document.querySelectorAll('.video-ads');
    // for (const overlayAd of overlayAds) {
    //   overlayAd.style.visibility = 'hidden';
    // }
  }, 250);

  flowser.utils.log(
    `loaded in ${Math.round(performance.now() - startTime)}ms.`
  );
};

document.addEventListener('readystatechange', (event) => {
  if (event.target.readyState === 'interactive') {
    init();
  } else if (event.target.readyState === 'complete') {
    init();
  }
});
