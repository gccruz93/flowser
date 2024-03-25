const defaultStorage = {
  sites: {
    youtube: {
      confirmSkipCount: 0,
      videoAdSkipCount: 0,
    },
    twitch: {
      adsMute: true,
      adsMuteCount: 0,
    },
  },
  config: {},
};
let storage = {};

const mergeObjects = (a, b) => {
  for (const key in a) if (b.hasOwnProperty(key)) a[key] = b[key];
  return a;
};

(async () => {
  storage = JSON.parse(JSON.stringify(defaultStorage));
  console.log(1, storage.sites.twitch.adsMute);
  const cloudStorage = (await chrome.storage.sync.get('storage')) || {};
  storage = mergeObjects(storage, cloudStorage);
  console.log(2, storage.sites.twitch.adsMute);
  const localStorage = (await chrome.storage.local.get('storage')) || {};
  storage = mergeObjects(storage, localStorage);
  console.log(3, storage.sites.twitch.adsMute);

  const syncLocal = async () => {
    console.log('syncLocal');
    chrome.storage.local.set({ storage });
  };
  syncLocal();
  setInterval(() => syncLocal(), 5000);

  const syncCloud = async () => {
    console.log('syncCloud');
    chrome.storage.sync.set(storage);
  };
  syncCloud();
  setInterval(() => syncCloud(), 600000); // 10min
})();

const throttle = {};
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('onMessage', { sender, request, storage });

  if (request.action == 'set-storage') {
    if (!throttle[`${request.site}-${request.key}`])
      throttle[`${request.site}-${request.key}`] = performance.now();
    else if (
      performance.now() - throttle[`${request.site}-${request.key}`] <
      1000
    ) {
      console.log('throttled');
      return;
    }
  }

  switch (request.action) {
    case 'get-storage':
      if (request.site) {
        sendResponse({
          storage: storage.sites[request.site],
        });
      } else {
        sendResponse({ storage });
      }
      break;
    case 'set-storage':
      if (request.value == 'increment') {
        storage.sites[request.site][request.key]++;
      } else {
        storage.sites[request.site][request.key] = request.value;
      }
      break;
    case 'clear-storage':
      storage = JSON.parse(JSON.stringify(defaultStorage));
      chrome.storage.local.set({ storage });
    default:
  }

  return true;
});
