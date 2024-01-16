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

  log('running on twitch...');

  let isQualityByAds = false;
  let isMutedByAds = false;
  let isAdModeActive = false;
  const openVideoConfig = (callback) => {
    const buttonsPlayerControls = document
      .querySelectorAll('[data-a-target="player-controls"]')[0]
      .getElementsByTagName('button');
    const configButton = buttonsPlayerControls[2];
    configButton.click();

    setTimeout(() => {
      callback();
    }, 150);
  };
  const openQualityMenu = (callback) => {
    setTimeout(() => {
      document
        .querySelectorAll('[role="menuitem"]')[2]
        ?.querySelector('button')
        ?.click();

      callback();
    }, 150);
  };
  const setAutomaticQuality = () => {
    if (!isQualityByAds) return;
    try {
      openVideoConfig();
      isQualityByAds = false;
      openQualityMenu(() => {
        setTimeout(() => {
          document.querySelectorAll('[role="menuitemradio"]')[0]?.click();
          document.querySelector('.Layout-sc-1xcs6mc-0.kuGBVB')?.click();
        }, 100);
      });
    } catch (err) {
      console.log(err);
    }
  };
  const setLowQuality = () => {
    if (isQualityByAds) return;
    try {
      openVideoConfig();
      isQualityByAds = true;
      openQualityMenu(() => {
        setTimeout(() => {
          const options = document.querySelectorAll('[role="menuitemradio"]');
          options[options.length - 1]?.click();
          document.querySelector('.Layout-sc-1xcs6mc-0.kuGBVB')?.click();
        }, 100);
      });
    } catch (err) {
      console.log(err);
    }
  };
  const audioUnmute = () => {
    if (!isMutedByAds) return;
    try {
      isMutedByAds = false;
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
  };
  const audioMute = () => {
    if (isMutedByAds) return;
    try {
      const buttonsPlayerControls = document
        .querySelectorAll('[data-a-target="player-controls"]')[0]
        .getElementsByTagName('button');
      const audioButton = buttonsPlayerControls[1];
      const container = audioButton.parentNode.parentNode;
      const input = container.getElementsByTagName('input')[0];
      if (+input.getAttribute('aria-valuenow') == 0) return;
      audioButton.click();
      isMutedByAds = true;
    } catch (err) {
      console.log(err);
    }
  };
  const handleVideoAds = () => {
    const isAdPlaying = document.querySelectorAll(
      '[data-a-target="video-ad-countdown"]'
    );

    if (!isAdPlaying.length) {
      setAutomaticQuality();
      audioUnmute();
      return;
    }

    log('ad detected');
    isAdModeActive = true;

    setLowQuality();
    audioMute();
  };

  /**
   * Observer =============================
   */
  const ob = new MutationObserver((mutations) => {
    log('mutation observed');
    console.log(mutations);
    // console.log(
    //   document.querySelectorAll(
    //     '[data-a-target="player-overlay-click-handler"]'
    //   )
    // );
    // if (
    //   !document.querySelectorAll(
    //     '[data-a-target="player-overlay-click-handler"]'
    //   ).length
    // )
    //   return;

    // log('ad detected');

    // mutations.forEach((mutation) => {
    //   if (mutation.attributeName === 'class') {
    //     const currentState = mutation.target.classList.contains('is-busy');
    //     if (prevState !== currentState) {
    //       prevState = currentState;
    //       console.log(`'is-busy' class ${currentState ? 'added' : 'removed'}`);
    //     }
    //   }
    // });

    // handleVideoAds();
  });
  ob.observe(document.querySelector('.video-player__default-player'), {
    attributes: true,
    childList: true,
    subtree: true,
  });

  log(`loaded in ${Math.round(performance.now() - startTime)}ms.`);
};

document.addEventListener('readystatechange', (event) => {
  if (event.target.readyState === 'interactive') {
    init();
  } else if (event.target.readyState === 'complete') {
    init();
  }
});
