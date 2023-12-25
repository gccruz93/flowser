<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import IconDefault from './components/IconDefault.vue';
import InputToggle from './components/InputToggle.vue';
import { storageConfig, storageSites } from '../public/storage';

const config = reactive({
  opened: false,
  storage: storageConfig,
});
const sites = reactive({
  youtube: {
    name: 'Youtube',
    opened: false,
    lastUpdate: '22/12/2023',
    storage: storageSites.youtube,
  },
});

const storeGetConfig = () => {
  if (!chrome) return;
  chrome.storage.local.get('config').then((result) => {
    if (!result.config) return;
    config.storage = result.config.storage;
  });
};
const storeSetConfig = () => {
  if (!chrome) return;
  chrome.storage.local.set({ config });
};

const storeGetSites = () => {
  if (!chrome) return;
  chrome.storage.local.get('sites').then((result) => {
    if (!result.sites) return;
    for (const siteName in sites) {
      sites[siteName as keyof typeof sites].storage = result.sites[siteName];
    }
  });
};
const storeSetSites = () => {
  if (!chrome) return;
  chrome.storage.local.set({ sites });
};

onMounted(() => {
  if (chrome) {
    chrome.tabs.query({ active: true }).then((res) => {
      chrome.scripting.executeScript({
        target: { tabId: res[0].id! },
        func: () => {
          console.log('opened');
        },
      });
    });
  }

  storeGetConfig();
  storeGetSites();

  setInterval(() => {
    storeGetSites();
  }, 5000);
});
</script>

<template>
  <div class="relative">
    <div
      class="flex select-none justify-between border-b border-neutral-800 px-4"
    >
      <div class="flex items-center gap-3 py-3">
        <img src="/icon.png" class="h-10 w-10" />
        <p class="font-semibold">Flowser</p>
      </div>
      <div class="flex items-center py-3">
        <button
          class="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-neutral-900 hover:bg-opacity-50 hover:text-white"
          title="Mais configurações"
          @click="config.opened = true"
        >
          <IconDefault name="Cog" />
        </button>
      </div>
    </div>

    <div class="relative h-full max-h-96 overflow-auto">
      <div v-if="config.opened" class="mb-5 mt-1">
        <div class="flex px-1 pb-1">
          <button
            class="inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-xs hover:bg-neutral-900 hover:bg-opacity-50 hover:text-white"
            title="Voltar"
            @click="config.opened = false"
          >
            <IconDefault name="ArrowLeft" />
            Voltar
          </button>
        </div>

        <div class="mb-1 px-3 text-sm text-neutral-500">
          Outras configurações:
        </div>

        <div class="px-5">
          <InputToggle
            v-model="config.storage.logs"
            text="Habilitar logs"
            @change="storeSetConfig"
          />
        </div>
      </div>
      <div v-else class="my-5">
        <div class="flex justify-between px-3 text-sm text-neutral-500">
          <div>Sites:</div>
          <div>Bloqueios:</div>
        </div>

        <template v-for="(site, index) in sites" :key="`site-${index}`">
          <div
            class="flex h-8 items-center justify-between px-3 hover:bg-neutral-900 hover:bg-opacity-50 hover:text-white"
          >
            <label
              class="inline-flex cursor-pointer select-none items-center"
              @click="site.opened = !site.opened"
            >
              <p>{{ site.name }}</p>
              <IconDefault
                name="CaretDown"
                class="ml-2 transition-transform duration-200"
                :class="{ 'rotate-180': site.opened }"
              />
            </label>

            <div
              class="mx-4 h-4 flex-1 border-b border-dashed border-neutral-800"
            ></div>

            <p v-if="index == 'youtube'">
              {{ sites.youtube.storage.autoConfirmSkipCount }}
            </p>
          </div>

          <Transition
            enter-from-class="-translate-y-[3px] opacity-0"
            leave-to-class="-translate-y-[3px] opacity-0"
            enter-active-class="transition duration-200"
            leave-active-class="transition duration-200"
          >
            <div
              v-show="site.opened"
              class="m-3 rounded-md border border-neutral-800 px-3 pt-3"
            >
              <template v-if="index == 'youtube'">
                <InputToggle
                  v-model="sites.youtube.storage.autoConfirmSkip"
                  :text="`Auto confirmar (${sites.youtube.storage.autoConfirmSkipCount})`"
                  title="Impede que os vídeos pausem durante sua reprodução."
                  @change="storeSetSites"
                />
                <InputToggle
                  v-model="sites.youtube.storage.blockAdsCards"
                  text="Bloquear Ads em cards"
                  title="Propagandas na lateral do vídeo e nas buscas."
                  @change="storeSetSites"
                />
                <InputToggle
                  v-model="sites.youtube.storage.hideLiveChat"
                  text="Esconder live chat"
                  title="Somente em replays."
                  @change="storeSetSites"
                />
              </template>

              <div class="mb-1 mt-3 text-xs text-neutral-500">
                <span>Últ. atualização: </span> {{ site.lastUpdate }}
              </div>
            </div>
          </Transition>
        </template>
      </div>
    </div>

    <div
      class="flex select-none justify-center border-t border-neutral-800 py-2"
    >
      <p class="font-semibold">
        by:
        <a href="https://www.github.com/gccruz93" target="_blank"> gccruz </a>
      </p>
    </div>

    <div class="pointer-events-none absolute bottom-0 left-0 -z-10 w-full">
      <div class="wave"></div>
      <div class="wave"></div>
    </div>
  </div>
</template>
