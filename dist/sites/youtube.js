let config = {
  logs: false,
}
let storage = {
  autoConfirm: true,
  autoConfirmCount: 0,
  blockAdSlotRenderer: true,
  blockAdSlotRendererCount: 0,
  blockPlayerAds: true,
  blockPlayerAdsCount: 0,
  blockSearchPyvRenderer: true,
  blockSearchPyvRendererCount: 0,
}
const storeGet = () => {
  chrome.storage.local.get('config').then((result) => {
    config = result.config
  })
  chrome.storage.local.get('sites').then((result) => {
    storage = result.sites.youtube
  })
}
const storeSetSites = () => {
  chrome.storage.local.get('sites').then((result) => {
    result.sites.youtube.storage = storage
    chrome.storage.local.set({ sites: result.sites })
  })
}
setInterval(() => {
  storeGet()
}, 5000)

/**
 * Main logger
 * @param {string} description
 */
const log = (description) => {
  if (!config.logs) return

  const date = new Date()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')

  console.log(
    '%s \x1b[36m%s \x1b[0m%s',
    `${hours}:${minutes}:${seconds}`,
    '[Flowser]',
    description
  )
}

log('Youtube identified...')
const startTime = performance.now()

// function isMobile() {
//   return location.hostname == 'm.youtube.com'
// }

// function isShorts() {
//   return location.pathname.startsWith('/shorts')
// }

const currentVideo = {
  id: '',
  dislikes: 0,
}
const getVideoId = () => {
  const urlObject = new URL(window.location.href)
  const pathname = urlObject.pathname
  if (pathname.startsWith('/clip')) {
    return document.querySelector("meta[itemprop='videoId']").content
  } else {
    if (pathname.startsWith('/shorts')) {
      return pathname.slice(8)
    }
    return urlObject.searchParams.get('v')
  }
}

// const isVideoLoaded = () => {
//   if (isMobile) {
//     return document.getElementById('player').getAttribute('loading') == 'false'
//   }
//   const videoId = getVideoId()

//   return (
//     document.querySelector(`ytd-watch-flexy[video-id='${videoId}']`) !== null
//   )
// }
/**
 * @param {string} id
 */
const getVideoInfo = async (id) => {
  const response = await fetch(
    `https://returnyoutubedislikeapi.com/votes?videoId=${id}`
  )
  return await response.json()
}
const updateCurrentVideoInfo = async () => {
  const videoId = getVideoId()
  if (!videoId || videoId == currentVideo.id) {
    updateDislikeBtnText()
    return
  }

  currentVideo.id = videoId
  const { dislikes } = await getVideoInfo(currentVideo.id)
  currentVideo.dislikes = dislikes

  updateDislikeBtnText()
}
const updateDislikeBtnText = () => {
  const dislikeBtn = document.querySelector('dislike-button-view-model button')
  if (!dislikeBtn) return
  dislikeBtn.style.width = '80px'

  const dislikeBtnIcon = dislikeBtn.querySelector(
    '.yt-spec-button-shape-next__icon'
  )
  if (!dislikeBtnIcon) return

  let dislikeText = document.getElementById('dislike-text')
  if (!dislikeText) dislikeText = document.createElement('div')
  dislikeText.id = 'dislike-text'
  dislikeText.style.margin = '0 0 0 6px'
  dislikeText.innerHTML = currentVideo.dislikes
  dislikeBtnIcon.after(dislikeText)
}
setInterval(() => {
  updateCurrentVideoInfo()
}, 3000)

const ob = new MutationObserver(() => {
  console.log({ storage })
  if (storage.autoConfirm) {
    const confirmButton = document.getElementById('confirm-button')
    if (confirmButton) {
      log(confirmButton.classList)
      if (confirmButton.classList.contains('yt-confirm-dialog-renderer')) {
        log('confirmou')
        confirmButton.click()
        storage.autoConfirmCount++
        storeSetSites()
      }
    }
  }

  if (storage.blockPlayerAds) {
    const playerAds = document.getElementById('player-ads')
    if (playerAds) {
      playerAds.innerHTML = ''
      log('player-ads filtered.')
      storage.blockPlayerAdsCount++
      storeSetSites()
    }
  }

  if (storage.blockAdSlotRenderer) {
    const ytdAdSlotRenderer = document.querySelectorAll('ytd-ad-slot-renderer')
    ytdAdSlotRenderer.forEach((el) => {
      el.innerHTML = ''
      log('ytd-ad-slot-renderer filtered.')
      storage.blockAdSlotRendererCount++
      storeSetSites()
    })
  }

  if (storage.blockSearchPyvRenderer) {
    const ytdSeachPyvRenderer = document.querySelectorAll(
      'ytd-search-pyv-renderer'
    )
    ytdSeachPyvRenderer.forEach((el) => {
      el.innerHTML = ''
      log('ytd-search-pyv-renderer filtered.')
      storage.blockSearchPyvRendererCount++
      storeSetSites()
    })
  }
})

chrome.storage.local.get('sites').then((result) => {
  storage = result.sites.youtube
  ob.observe(document.body, { childList: true })
  log(`loaded in ${Math.round(performance.now() - startTime)}ms.`)
})
