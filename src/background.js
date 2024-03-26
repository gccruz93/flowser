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
  const cloudStorage = (await chrome.storage.sync.get()) || {};
  storage = mergeObjects(storage, cloudStorage);
  const localStorage = (await chrome.storage.local.get()) || {};
  storage = mergeObjects(storage, localStorage);
  chrome.storage.local.set(storage);

  const syncCloud = async () => {
    chrome.storage.sync.set(storage);
  };
  setInterval(() => syncCloud(), 600000); // 10min
})();

const throttle = {};
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // console.log('onMessage', { sender: sender.origin, request, storage });

  if (request.action == 'set-storage') {
    if (!throttle[`${request.site}-${request.key}`]) {
      throttle[`${request.site}-${request.key}`] = performance.now();
    } else if (
      performance.now() - throttle[`${request.site}-${request.key}`] <
      1000
    ) {
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
      chrome.storage.local.set(storage);
      break;
    case 'clear-storage':
      storage = JSON.parse(JSON.stringify(defaultStorage));
      chrome.storage.local.set(storage);
    default:
  }

  return true;
});
