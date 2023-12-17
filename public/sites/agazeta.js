/**
 * Main logger
 * @param {string} description
 */
const log = (description) => {
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

log('Agazeta identified...')
const startTime = performance.now()

/**
 * Thread principal para todos os sites
 */

const mainObserver = new MutationObserver((mutationList) => {
  for (const mutation of mutationList) {
    if (mutation.type === 'attributes') {
      mutation.target.style.overflowY = 'auto'
    }
  }
})

mainObserver.observe(document.documentElement, { attributes: true })
mainObserver.observe(document.body, { attributes: true })

const ob = new MutationObserver((mutationList) => {
  for (const mutation of mutationList) {
    switch (mutation.type) {
      case 'attributes': {
        mutation.target.classList.remove('tp-modal-open')
        break
      }
      case 'childList': {
        for (const node of mutation.addedNodes) {
          if (node.className == 'tp-modal') node.remove()
          else if (node.className == 'tp-backdrop') node.remove()
        }
        break
      }
      default:
    }
  }
})
ob.observe(document.body, { attributes: true, childList: true })

log(`loaded in ${Math.round(performance.now() - startTime)}ms.`)
