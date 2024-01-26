const init = async () => {
  const startTime = performance.now();

  await flowser.storage.init();

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
  let adDetected = false;
  const video = {
    isQualityChangedByAds: false,

    config: {
      click: (callback = false) => {
        const buttonsPlayerControls = document
          .querySelectorAll('[data-a-target="player-controls"]')[0]
          .getElementsByTagName('button');
        const configButton = buttonsPlayerControls[2];
        configButton.click();

        if (callback) {
          setTimeout(() => {
            callback();
          }, clickDelayMs);
        }
      },

      quality: {
        click: (callback = false) => {
          document
            .querySelectorAll('[role="menuitem"]')[2]
            ?.querySelector('button')
            ?.click();

          if (callback) {
            setTimeout(() => {
              callback();
            }, clickDelayMs);
          }
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
    if (flowser.storage.data.sites.twitch.adsMute) {
      const isAdPlaying = document.querySelectorAll(
        '[data-a-target="video-ad-countdown"]'
      );

      if (!isAdPlaying.length) {
        video.config.quality.auto();
        audio.unmute();
        if (adDetected) {
          adDetected = false;
          flowser.utils.log('ad done');
        }
        return;
      }
      if (!adDetected) {
        adDetected = true;
        flowser.utils.log('ad detected');
        flowser.storage.data.sites.twitch.adsMuteCount++;
      }

      video.config.quality.low();
      audio.mute();
    }
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
