const init = async () => {
  await flowser.storage.init();

  setInterval(() => {
    $('#config-chk-logs').prop('checked', flowser.storage.data.config.logs);

    $('#youtube-chk-confirmSkip').prop(
      'checked',
      flowser.storage.data.sites.youtube.confirmSkip
    );

    $('#twitch-chk-adsMute').prop(
      'checked',
      flowser.storage.data.sites.twitch.adsMute
    );
  }, 1000);

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
  $('#config-chk-logs').prop('checked', flowser.storage.data.config.logs);
  $('#config-chk-logs').on('change', (e) => {
    flowser.storage.data.config.logs = e.target.checked;
    flowser.storage.save();
  });

  /**
   * Sites.Youtube
   */
  $('#youtube-total-count').text(
    flowser.storage.data.sites.youtube.confirmSkipCount +
      flowser.storage.data.sites.youtube.videoAdSkipCount
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

  $('#youtube-chk-confirmSkip').prop(
    'checked',
    flowser.storage.data.sites.youtube.confirmSkip
  );
  $('#youtube-chk-confirmSkip').on('change', (e) => {
    flowser.storage.data.sites.youtube.confirmSkip = e.target.checked;
    flowser.storage.save();
  });

  /**
   * Sites.Twitch
   */
  $('#twitch-total-count').text(flowser.storage.data.sites.twitch.adsMuteCount);
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

  $('#twitch-chk-adsMute').prop(
    'checked',
    flowser.storage.data.sites.twitch.adsMute
  );
  $('#twitch-chk-adsMute').on('change', (e) => {
    flowser.storage.data.sites.twitch.adsMute = e.target.checked;
    flowser.storage.save();
  });
};

init();
