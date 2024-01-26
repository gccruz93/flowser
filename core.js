const flowser = {
  storage: {
    default: {
      config: {
        logs: false,
      },
      sites: {
        youtube: {
          confirmSkip: true,
          confirmSkipCount: 0,
          videoAdSkipCount: 0,
        },
        twitch: {
          adsMute: true,
          adsMuteCount: 0,
        },
      },
    },
    data: {},

    init: async () => {
      flowser.storage.data = { ...flowser.storage.default };
      await flowser.storage.load();
      flowser.storage.loadInterval = setInterval(() => {
        flowser.storage.load();
      }, 5000);
    },
    loadInterval: 0,
    load: async () => {
      const store = await chrome.storage.local.get(['sites', 'config']);
      flowser.storage.data = flowser.utils.mergeObjects(
        flowser.storage.data,
        store
      );
    },
    save: async () => {
      chrome.storage.local.set(flowser.storage.data);
      flowser.utils.log('storage saved', flowser.storage.data);
    },
  },

  utils: {
    log: (message, ...optionalParams) => {
      if (!flowser.storage.data.config.logs) return;

      const date = new Date();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');

      console.log(
        '%s \x1b[36m%s \x1b[0m%s',
        `${hours}:${minutes}:${seconds}`,
        '[Flowser]',
        message,
        optionalParams
      );
    },
    mergeObjects: (obj1, obj2) => {
      for (let key in obj1) {
        if (obj2.hasOwnProperty(key)) {
          obj1[key] = obj2[key];
        }
      }
      return obj1;
    },
  },
};
