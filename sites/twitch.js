const init = async () => {
  const startTime = performance.now();

  const log = (description, force = false) => {
    // if (!force && !defaultStorage.config.logs) return;

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

  log('running on twitch...');

  /**
   * Elements ===========================
   */
  const audio = {
    isMutedByAds: false,

    mute: () => {
      if (audio.isMutedByAds) return;
      try {
        const buttonsPlayerControls = document
          .querySelectorAll('[data-a-target="player-controls"]')[0]
          .getElementsByTagName('button');
        const audioButton = buttonsPlayerControls[1];
        const container = audioButton.parentNode.parentNode;
        const input = container.getElementsByTagName('input')[0];
        if (+input.getAttribute('aria-valuenow') == 0) return;
        audioButton.click();
        audio.isMutedByAds = true;
      } catch (err) {
        console.log(err);
      }
    },
    unmute: () => {
      if (!audio.isMutedByAds) return;
      try {
        audio.isMutedByAds = false;
        const buttonsPlayerControls = document
          .querySelectorAll('[data-a-target="player-controls"]')[0]
          .getElementsByTagName('button');
        const audioButton = buttonsPlayerControls[1];
        const container = audioButton.parentNode.parentNode;
        const input = container.getElementsByTagName('input')[0];
        if (+input.getAttribute('aria-valuenow') > 0) return;
        audioButton.click();
      } catch (err) {
        console.log(err);
      }
    },
  };
  const clickDelayMs = 150;
  const video = {
    isQualityChangedByAds: false,

    config: {
      click: (callback) => {
        const buttonsPlayerControls = document
          .querySelectorAll('[data-a-target="player-controls"]')[0]
          .getElementsByTagName('button');
        const configButton = buttonsPlayerControls[2];
        configButton.click();

        setTimeout(() => {
          callback();
        }, clickDelayMs);
      },

      quality: {
        click: (callback) => {
          document
            .querySelectorAll('[role="menuitem"]')[2]
            ?.querySelector('button')
            ?.click();

          setTimeout(() => {
            callback();
          }, clickDelayMs);
        },
        close: () => {},

        auto: () => {
          if (!video.isQualityChangedByAds) return;
          try {
            video.config.click(() => {
              video.isQualityChangedByAds = false;
              video.config.quality.click(() => {
                document.querySelectorAll('[role="menuitemradio"]')[0]?.click();
                video.config.click();
              });
            });
          } catch (err) {
            console.log(err);
          }
        },
        low: () => {
          if (video.isQualityChangedByAds) return;
          try {
            video.config.click(() => {
              video.isQualityChangedByAds = true;
              video.config.quality.click(() => {
                const options = document.querySelectorAll(
                  '[role="menuitemradio"]'
                );
                options[options.length - 1]?.click();
                video.config.click();
              });
            });
          } catch (err) {
            console.log(err);
          }
        },
      },
    },
  };

  /**
   * Starting events ===========================
   */
  setInterval(() => {
    if (storage.data.sites.twitch.autoAdsMute) {
      const isAdPlaying = document.querySelectorAll(
        '[data-a-target="video-ad-countdown"]'
      );

      if (!isAdPlaying.length) {
        video.config.quality.auto();
        audio.unmute();
        return;
      }

      log('ad detected');

      video.config.quality.low();
      audio.mute();
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
