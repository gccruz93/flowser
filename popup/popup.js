const init = async () => {
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
    },
  };

  const loadStorage = async () => {
    if (!chrome.storage) return;
    const storage = await chrome.storage.sync.get(['sites', 'config']);
    defaultStorage = storage;
  };
  const saveStorage = () => {
    if (!chrome.storage) return;
    chrome.storage.sync.set(defaultStorage);
  };
  loadStorage();
  console.log('storage', defaultStorage);

  /**
   * Config
   */
  $('#config').hide();
  let isConfigVisible = false;
  const toggleConfig = () => {
    if (!isConfigVisible) {
      $('#config').show();
      $('#sites').hide();
      isConfigVisible = true;
    } else {
      $('#config').hide();
      $('#sites').show();
      isConfigVisible = false;
    }
  };
  $('#config-btn').on('click', toggleConfig);
  $('#config-chk-logs').prop('checked', defaultStorage.config.logs);
  $('#config-chk-logs').on('change', (e) => {
    defaultStorage.config.logs = e.target.checked;
    saveStorage();
  });

  /**
   * Sites.Youtube
   */
  $('#youtube-total-count').text(
    defaultStorage.sites.youtube.autoConfirmSkipCount +
      defaultStorage.sites.youtube.autoVideoAdSkipCount
  );
  $('#youtube-collapse').hide();
  let isYoutubeOpened = false;
  const toggleYoutube = () => {
    if (!isYoutubeOpened) {
      $('#youtube-collapse').show();
      $('#youtube-collapse-title svg').addClass('rotate-180');
      isYoutubeOpened = true;
    } else {
      $('#youtube-collapse').hide();
      $('#youtube-collapse-title svg').removeClass('rotate-180');
      isYoutubeOpened = false;
    }
  };
  $('#youtube-collapse-title').on('click', toggleYoutube);

  $('#youtube-chk-autoVideoAdSkip').prop(
    'checked',
    defaultStorage.sites.youtube.autoVideoAdSkip
  );
  $('#youtube-chk-autoVideoAdSkip').on('change', (e) => {
    defaultStorage.sites.youtube.autoVideoAdSkip = e.target.checked;
    saveStorage();
  });

  $('#youtube-chk-autoConfirmSkip').prop(
    'checked',
    defaultStorage.sites.youtube.autoConfirmSkip
  );
  $('#youtube-chk-autoConfirmSkip').on('change', (e) => {
    defaultStorage.sites.youtube.autoConfirmSkip = e.target.checked;
    saveStorage();
  });

  $('#youtube-chk-blockAdsCards').prop(
    'checked',
    defaultStorage.sites.youtube.blockAdsCards
  );
  $('#youtube-chk-blockAdsCards').on('change', (e) => {
    defaultStorage.sites.youtube.blockAdsCards = e.target.checked;
    saveStorage();
  });

  $('#youtube-chk-hideLiveChat').prop(
    'checked',
    defaultStorage.sites.youtube.hideLiveChat
  );
  $('#youtube-chk-hideLiveChat').on('change', (e) => {
    defaultStorage.sites.youtube.hideLiveChat = e.target.checked;
    saveStorage();
  });
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
