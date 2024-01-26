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
        document
          .querySelectorAll('[data-a-target="player-controls"]')[0]
          .getElementsByTagName('button')[2]
          .click();
        if (!callback) return;
        setTimeout(() => {
          callback();
        }, clickDelayMs);
      },
      buttonsList: () => {
        return document.querySelectorAll(
          '[aria-labelledby="active-settings-menu-header"] [role="menuitem"]'
        );
      },

      quality: {
        click: (callback = false) => {
          video.config.buttonsList()[2]?.querySelector('button')?.click();
          if (!callback) return;
          setTimeout(() => {
            callback();
          }, clickDelayMs);
        },
        buttonsList: () => {
          return document.querySelectorAll(
            '[aria-labelledby="active-settings-menu-header"] [role="menuitemradio"]'
          );
        },

        previousState: 0,
        saveCurrentState: () => {
          const options = video.config.quality.buttonsList();
          let index = 0;
          for (const option of options) {
            if (option.querySelector('input[type="checkbox"]:checked')) {
              video.config.quality.previousState = index;
              break;
            }
            index++;
          }
        },

        previous: () => {
          if (!video.isQualityChangedByAds) return;
          try {
            video.config.click(() => {
              video.isQualityChangedByAds = false;
              video.config.quality.click(() => {
                const options = video.config.quality.buttonsList();
                options[video.config.quality.previousState]?.click();
                video.config.quality.previousState = 0;
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
                video.config.quality.saveCurrentState();
                const options = video.config.quality.buttonsList();
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
        video.config.quality.previous();
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
        flowser.storage.save();
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
