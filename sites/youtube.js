const init = async () => {
  const startTime = performance.now();

  const log = (description, force = false) => {
    // if (!force && !storage.data.config.logs) return;

    const date = new Date();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    console.log(
      '%s \x1b[36m%s \x1b[0m%s',
      `${hours}:${minutes}:${seconds}`,
      '[Flowser]',
      description
    );
  };

  const storage = {
    data: {
      config: {
        logs: false,
      },
      sites: {
        youtube: {
          autoConfirmSkip: true,
          autoConfirmSkipCount: 0,
          autoVideoAdSkip: true,
          autoVideoAdSkipCount: 0,
          blockAdsCards: true,
        },
        twitch: {
          autoAdsMute: true,
          autoAdsMuteCount: 0,
        },
      },
    },

    load: async () => {
      log('fetching storage...', true);
      if (chrome.storage) {
        const store = await chrome.storage.sync.get(['sites', 'config']);
        storage.data = mergeObjects(storage.data, store);
        console.log('storage', storage.data);
        chrome.storage.sync.set(storage.data);
      } else {
        log('chrome.storage not found', true);
      }
    },
    save: () => {
      if (chrome.storage) {
        chrome.storage.sync.set(storage.data);
      }
    },
  };

  await storage.load();

  log('running youtube cleaner...');

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
        log('fetching video info...');
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
      return document.getElementById('confirm-button');
    },

    click: () => {
      const el = confirmButton.query();
      if (!el) return;
      log(el);
      if (!el.classList.contains('yt-confirm-dialog-renderer')) return;
      log('confirmou');
      el.click();
      storage.data.sites.youtube.autoConfirmSkipCount++;
    },
  };

  /**
   * Starting events ===========================
   */
  video.setInterval();
  dislikeButton.setInterval();

  setInterval(() => {
    if (storage.data.sites.youtube.autoConfirmSkip) {
      confirmButton.click();
    }

    if (storage.data.sites.youtube.autoVideoAdSkip) {
      try {
        const adElement = document.querySelector('.ad-showing');
        const overlayAds = document.querySelectorAll('.video-ads');

        if (adElement) {
          const video = document.querySelector('.ad-showing video');

          video.currentTime = video?.duration || 9999;

          const skipButtons = document.querySelectorAll(
            '.ytp-ad-skip-button-modern'
          );

          for (const skipButton of skipButtons) {
            skipButton.click();
          }

          storage.data.sites.youtube.autoVideoAdSkipCount++;
        }

        for (const overlayAd of overlayAds) {
          overlayAd.style.visibility = 'hidden';
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, 200);

  log(`loaded in ${Math.round(performance.now() - startTime)}ms.`);
};

document.addEventListener('readystatechange', (event) => {
  if (event.target.readyState === 'interactive') {
    init();
  } else if (event.target.readyState === 'complete') {
    init();
  }
});

const mergeObjects = (obj1, obj2) => {
  for (let key in obj1) {
    if (obj2.hasOwnProperty(key)) {
      obj1[key] = obj2[key];
    }
  }
  return obj1;
};
