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

  /**
   * Observer =============================
   */
  // const ob = new MutationObserver(() => {
  //   log('mutation observed');

  // handleVideoAds();

  // saveStorage();
  // });

  let isQualityByAds = false;
  let isMutedByAds = false;
  const setAutomaticQuality = () => {
    if (!isQualityByAds) return;
    try {
      const buttonsPlayerControls = document
        .querySelectorAll('[data-a-target="player-controls"]')[0]
        .getElementsByTagName('button');
      const configButton = buttonsPlayerControls[2];
      configButton.click();

      isQualityByAds = false;

      setTimeout(() => {
        document
          .querySelectorAll('[role="menuitem"]')[2]
          ?.querySelector('button')
          ?.click();

        setTimeout(() => {
          document.querySelectorAll('[role="menuitemradio"]')[0]?.click();
          document.querySelector('.Layout-sc-1xcs6mc-0.kuGBVB')?.click();
        }, 100);
      }, 150);
    } catch (err) {
      console.log(err);
    }
  };
  const setLowQuality = () => {
    if (isQualityByAds) return;
    try {
      const buttonsPlayerControls = document
        .querySelectorAll('[data-a-target="player-controls"]')[0]
        .getElementsByTagName('button');
      const configButton = buttonsPlayerControls[2];
      configButton.click();

      isQualityByAds = true;

      setTimeout(() => {
        document
          .querySelectorAll('[role="menuitem"]')[2]
          ?.querySelector('button')
          ?.click();

        setTimeout(() => {
          const options = document.querySelectorAll('[role="menuitemradio"]');
          options[options.length - 1]?.click();
          document.querySelector('.Layout-sc-1xcs6mc-0.kuGBVB')?.click();
        }, 100);
      }, 150);
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

    setLowQuality();
    audioMute();
  };
  setInterval(() => {
    handleVideoAds();
  }, 500);

  // ob.observe(document.body, { childList: true });

  log(`loaded in ${Math.round(performance.now() - startTime)}ms.`);
};

document.addEventListener('readystatechange', (event) => {
  if (event.target.readyState === 'interactive') {
    init();
  } else if (event.target.readyState === 'complete') {
    init();
  }
});
