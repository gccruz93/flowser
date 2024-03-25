const storage = {};
if (chrome.runtime) {
  chrome.runtime.sendMessage(
    {
      action: 'get-storage',
    },
    (response) => {
      Object.assign(storage, response.storage);
      init();
    }
  );
}

const init = () => {
  /**
   * Sites.Youtube
   */
  $('#youtube-total-count').text(
    storage.sites.youtube.confirmSkipCount +
      storage.sites.youtube.videoAdSkipCount
  );

  /**
   * Sites.Twitch
   */
  $('#twitch-total-count').text(storage.sites.twitch.adsMuteCount);

  $('#twitch-chk-adsMute').prop('checked', storage.sites.twitch.adsMute);
  $('#twitch-chk-adsMute').on('change', (e) => {
    storage.sites.twitch.adsMute = e.target.checked;
    chrome.runtime.sendMessage({
      action: 'set-storage',
      site: 'twitch',
      key: 'adsMute',
      value: e.target.checked,
    });
  });
};

/**
 * Sites.Youtube
 */
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

/**
 * Sites.Twitch
 */
$('#twitch-collapse').hide();
let isTwitchOpened = false;
const toggleTwitch = () => {
  if (!isTwitchOpened) {
    $('#twitch-collapse').show();
    $('#twitch-collapse-title svg').addClass('rotate-180');
    isTwitchOpened = true;
  } else {
    $('#twitch-collapse').hide();
    $('#twitch-collapse-title svg').removeClass('rotate-180');
    isTwitchOpened = false;
  }
};
$('#twitch-collapse-title').on('click', toggleTwitch);

$('#clear').on('click', () => {
  chrome.runtime.sendMessage({
    action: 'clear-storage',
  });
});
