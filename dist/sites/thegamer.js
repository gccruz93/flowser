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

log('Thegamer identified...')
const startTime = performance.now()

const ob = new MutationObserver((mutationList) => {
  for (const mutation of mutationList) {
    switch (mutation.type) {
      case 'childList': {
        for (const node of mutation.addedNodes) {
          if (node.className == ' fEy1Z2XT  ') node.remove()
        }
        break
      }
      default:
    }
  }
})
ob.observe(document.body, { childList: true })

log(`loaded in ${Math.round(performance.now() - startTime)}ms.`)
