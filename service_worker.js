try {
  importScripts('/core.js');
} catch (e) {
  console.error(e);
}

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install') {
    chrome.storage.local.set(flowser.storage.default);
  }

  const f = async () => {
    let storageSync = await chrome.storage.sync.get(['sites', 'config']);
    let storageLocal = await chrome.storage.local.get(['sites', 'config']);
    let newStorage = flowser.utils.mergeObjects(storageLocal, storageSync);
    newStorage = flowser.utils.mergeObjects(
      newStorage,
      flowser.storage.default
    );
    try {
      chrome.storage.sync.set(newStorage);
    } catch (error) {}
  };
  f();
  flowser.storage.syncInterval = setInterval(async () => {
    f();
  }, 600000); // 10min
});
