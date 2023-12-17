<script setup lang="ts">
  import { onMounted, reactive } from 'vue'
  import IconDefault from './components/IconDefault.vue'
  import InputToggle from './components/InputToggle.vue'

  const config = reactive({
    opened: false,
    storage: {
      logs: false,
    },
  })
  const sites = reactive({
    youtube: {
      name: 'Youtube',
      opened: false,
      lastUpdate: '17/12/2023',
      storage: {
        autoConfirm: true,
        autoConfirmCount: 0,
        blockAdSlotRenderer: true,
        blockAdSlotRendererCount: 0,
        blockPlayerAds: true,
        blockPlayerAdsCount: 0,
        blockSearchPyvRenderer: true,
        blockSearchPyvRendererCount: 0,
      },
    },
    agazeta: {
      name: 'A Gazeta',
      opened: false,
      lastUpdate: '27/07/2023',
      storage: {
        blockPopup: true,
        blockPopupCount: 0,
      },
    },
    thegamer: {
      name: 'TheGamer',
      opened: false,
      lastUpdate: '27/07/2023',
      storage: {
        blockPopup: true,
        blockPopupCount: 0,
      },
    },
  })

  const storeGetConfig = () => {
    if (!chrome) return
    chrome.storage.local.get('config').then((result) => {
      if (!result.config) return
      config.storage = result.config.storage
    })
  }
  const storeSetConfig = () => {
    if (!chrome) return
    chrome.storage.local.set({ config })
  }

  const storeGetSites = () => {
    if (!chrome) return
    chrome.storage.local.get('sites').then((result) => {
      if (!result.sites) return
      for (const siteName in sites) {
        sites[siteName as keyof typeof sites].storage =
          result.sites[siteName].storage
      }
    })
  }
  const storeSetSites = () => {
    if (!chrome) return
    chrome.storage.local.set({ sites })
  }

  onMounted(() => {
    if (chrome) {
      chrome.tabs.query({ active: true }).then((res) => {
        chrome.scripting.executeScript({
          target: { tabId: res[0].id! },
          func: () => {
            console.log('opened')
          },
        })
      })
    }

    storeGetConfig()
    storeGetSites()

    setInterval(() => {
      storeGetSites()
    }, 5000)
  })
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

        <div class="text-2xs mb-1 px-3 text-neutral-500">
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
        <div class="text-2xs flex justify-between px-3 text-neutral-500">
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
              {{
                sites.youtube.storage.autoConfirmCount +
                sites.youtube.storage.blockPlayerAdsCount +
                sites.youtube.storage.blockAdSlotRendererCount +
                sites.youtube.storage.blockSearchPyvRendererCount
              }}
            </p>
            <p v-else-if="index == 'agazeta'">
              {{ sites.agazeta.storage.blockPopupCount }}
            </p>
            <p v-else-if="index == 'thegamer'">
              {{ sites.thegamer.storage.blockPopupCount }}
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
                  v-model="sites.youtube.storage.autoConfirm"
                  :text="`Auto confirmar (${sites.youtube.storage.autoConfirmCount})`"
                  title="Impede que os vídeos pausem durante sua reprodução."
                  @change="storeSetSites"
                />
                <InputToggle
                  v-model="sites.youtube.storage.blockAdSlotRenderer"
                  :text="`Bloquear AdSlotRenderer (${sites.youtube.storage.blockAdSlotRendererCount})`"
                  title="Propaganda principal na lateral do vídeo."
                  @change="storeSetSites"
                />
                <InputToggle
                  v-model="sites.youtube.storage.blockPlayerAds"
                  :text="`Bloquear PlayerAds (${sites.youtube.storage.blockPlayerAdsCount})`"
                  title="Propagandas secundárias na lateral do vídeo."
                  @change="storeSetSites"
                />
                <InputToggle
                  v-model="sites.youtube.storage.blockSearchPyvRenderer"
                  :text="`Bloquear SearchPyvRenderer (${sites.youtube.storage.blockSearchPyvRendererCount})`"
                  title="Propagandas entre os resultados da busca."
                  @change="storeSetSites"
                />
              </template>
              <template v-else-if="index == 'agazeta'">
                <InputToggle
                  v-model="sites.agazeta.storage.blockPopup"
                  :text="`Bloquear Popup (${sites.agazeta.storage.blockPopupCount})`"
                  title="Impede o popup de cadastro de aparecer."
                  @change="storeSetSites"
                />
              </template>
              <template v-else-if="index == 'thegamer'">
                <InputToggle
                  v-model="sites.thegamer.storage.blockPopup"
                  :text="`Bloquear Popup (${sites.thegamer.storage.blockPopupCount})`"
                  title="Impede o popup de adblock de aparecer."
                  @change="storeSetSites"
                />
              </template>

              <div class="text-3xs mb-1 mt-3 text-neutral-500">
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
