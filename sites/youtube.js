const init = async () => {
  const startTime = performance.now();

  let defaultStorage = {
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
        hideLiveChat: true,
      },
      twitch: {
        autoAdsMute: true,
        autoAdsMuteCount: 0,
      },
    },
  };

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

  const loadStorage = async () => {
    log('fetching storage...', true);
    if (chrome.storage) {
      const storage = await chrome.storage.sync.get(['sites', 'config']);
      defaultStorage = mergeObjects(defaultStorage, storage);
      console.log('storage', defaultStorage);
      chrome.storage.sync.set(defaultStorage);
    } else {
      log('chrome.storage not found', true);
    }
  };
  const saveStorage = () => {
    if (chrome.storage) {
      chrome.storage.sync.set(defaultStorage);
    }
  };
  loadStorage();

  log('running youtube cleaner...');

  /**
   * Video info ===========================
   */
  const currentVideo = {
    id: '',
    dislikes: 0,
  };
  const getVideoId = () => {
    const urlObject = new URL(window.location.href);
    const pathname = urlObject.pathname;
    if (pathname.startsWith('/clip')) {
      return document.querySelector("meta[itemprop='videoId']").content;
    } else {
      if (pathname.startsWith('/shorts')) {
        return pathname.slice(8);
      }
      return urlObject.searchParams.get('v');
    }
  };
  const getVideoInfo = async (id) => {
    const response = await fetch(
      `https://returnyoutubedislikeapi.com/votes?videoId=${id}`
    );
    return await response.json();
  };
  const updateCurrentVideoInfo = async () => {
    const videoId = getVideoId();
    if (!videoId || videoId == currentVideo.id) return;
    log('fetching video info...');
    currentVideo.id = videoId;
    const { dislikes } = await getVideoInfo(currentVideo.id);
    currentVideo.dislikes = dislikes;
  };
  const updateDislikeBtnText = () => {
    const dislikeBtn = document.querySelector(
      'dislike-button-view-model button'
    );
    if (!dislikeBtn) return;

    const dislikeBtnIcon = dislikeBtn.querySelector(
      '.yt-spec-button-shape-next__icon'
    );
    if (!dislikeBtnIcon) return;

    let dislikeText = document.getElementById('dislike-text');
    if (!dislikeText) dislikeText = document.createElement('div');

    dislikeText.id = 'dislike-text';
    dislikeText.style.margin = '0 0 0 6px';
    dislikeText.innerHTML = currentVideo.dislikes;
    dislikeBtnIcon.after(dislikeText);
    dislikeBtn.style.width = '80px';
  };
  updateCurrentVideoInfo();
  setInterval(() => {
    updateCurrentVideoInfo();
  }, 3000);
  setInterval(() => {
    updateDislikeBtnText();
  }, 500);

  const autoConfirmVideo = () => {
    const confirmButton = document.getElementById('confirm-button');
    if (confirmButton) {
      log(confirmButton);
      if (confirmButton.classList.contains('yt-confirm-dialog-renderer')) {
        log('confirmou');
        confirmButton.click();
        defaultStorage.sites.youtube.autoConfirmSkipCount++;
      }
    }
  };
  const hideLiveChat = () => {
    try {
      const liveChatContainer = document.getElementById('chat');
      const liveChatFrame = document.getElementById('chatframe');
      if (liveChatFrame) {
        const labelText =
          liveChatFrame.contentWindow.document.querySelector('#label-text');
        if (labelText && labelText.innerHTML.includes('chat')) {
          liveChatContainer.remove();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Volume button ===========================
   */
  const getVolumeButton = () => {
    if (!document.querySelectorAll('.ytp-mute-button').length) return null;
    const muteButton = document.querySelectorAll('.ytp-mute-button')[0];
    if (!muteButton) return null;
    return muteButton;
  };
  /**
   *
   * @param {HTMLElement} volumeButton
   */
  const isVideoMuted = (volumeButton) => {
    if (!volumeButton) volumeButton = getVolumeButton();
    return ['Reativar o som', 'Unmute'].includes(
      volumeButton.getAttribute('data-title-no-tooltip')
    );
  };
  const muteVideo = () => {
    const volumeButton = getVolumeButton();
    if (isVideoMuted(volumeButton)) return;
    volumeButton.click();
  };
  const unmuteVideo = () => {
    const volumeButton = getVolumeButton();
    if (!isVideoMuted(volumeButton)) return;
    volumeButton.click();
  };

  const skipYoutubeAd = () => {
    try {
      const adElement = document.querySelector('.ad-showing');
      const overlayAds = document.querySelectorAll('.video-ads');

      if (adElement) {
        muteVideo();
        const video = document.querySelector('.ad-showing video');

        video.currentTime = video?.duration || 9999; // if video?.duration is NaN set video to 9999 sec to make sure it goes to the end

        const skipButtons = document.querySelectorAll(
          '.ytp-ad-skip-button-modern'
        );

        for (const skipButton of skipButtons) {
          skipButton.click();
        }

        defaultStorage.sites.youtube.autoVideoAdSkipCount++;

        setTimeout(() => {
          unmuteVideo();
        }, 300);
      }

      for (const overlayAd of overlayAds) {
        overlayAd.style.visibility = 'hidden';
      }
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Observer =============================
   */
  const bodyMutationObserver = new MutationObserver(() => {
    // log('MutationObserver: body');

    if (defaultStorage.sites.youtube.autoConfirmSkip) {
      autoConfirmVideo();
    }

    if (defaultStorage.sites.youtube.hideLiveChat) {
      hideLiveChat();
    }

    if (defaultStorage.sites.youtube.autoVideoAdSkip) {
      skipYoutubeAd();
    }

    // saveStorage();
  });
  bodyMutationObserver.observe(document.body, { childList: true });

  const videoMutationObserver = new MutationObserver(() => {
    // log('MutationObserver: video');

    if (defaultStorage.sites.youtube.autoVideoAdSkip) {
      skipYoutubeAd();
    }

    // saveStorage();
  });
  const setVideoPlayerObserver = async () => {
    if (document.querySelector('.html5-video-player')) {
      videoMutationObserver.observe(
        document.querySelector('.html5-video-player'),
        {
          attributes: true,
        }
      );
    } else {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setVideoPlayerObserver();
    }
  };
  setVideoPlayerObserver();

  log(`loaded in ${Math.round(performance.now() - startTime)}ms.`);
};

document.addEventListener('readystatechange', (event) => {
  if (event.target.readyState === 'interactive') {
    init();
  } else if (event.target.readyState === 'complete') {
    init();
  }
});

function mergeObjects(obj1, obj2) {
  for (let key in obj1) {
    if (obj2.hasOwnProperty(key)) {
      obj1[key] = obj2[key];
    }
  }
  return obj1;
}
