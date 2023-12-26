const defaultStorage = {
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

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install') {
    console.log('storage installed!');
    chrome.storage.sync.set(defaultStorage);
  }

  let storage = await chrome.storage.sync.get(['sites', 'config']);
  storage = mergeObjects(defaultStorage, storage);
  console.log('storage', storage);
  chrome.storage.sync.set(storage);
});

function mergeObjects(obj1, obj2) {
  for (let key in obj1) {
    if (obj2.hasOwnProperty(key)) {
      obj1[key] = obj2[key];
    }
  }
  return obj1;
}
