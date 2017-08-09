/* global Mastodon, prompt */

// you may want to transpile this to es5

const token = prompt('input your access_token from OAuth2')
const M = new Mastodon({access_token: token})

M.get('timelines/home') // get latest 20 toots from home timeline
  .then(statuses => {
    const timelines = []
    const homeElement = document.getElementById('home')
    for (const status of statuses) {
      const content = status.content
      const username = `${status.account.display_name} (@${status.account.acct})`
      const html = `${username}: ${content}`
      timelines.push(html)
    }
    homeElement.innerHTML = timelines.join('<hr>')
  })

M.stream('public/local')
  .on('update', data => console.log(data.account))
