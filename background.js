'use strict';

var blacklist = [];

const isBlacklisted = blacklist => url => blacklist.some(
  i => url.search(i) > -1
);

function reqListener(req) {
  let searchInBlacklist = isBlacklisted(blacklist);

  if(searchInBlacklist(req.url)) return {cancel: true};
  return {cancel: false};
}

browser.webRequest.onBeforeRequest.addListener(
  reqListener,
  {urls: ['<all_urls>']},
  ['blocking']
);

browser.storage.sync.get('urls').then(
  ({urls}) => {
    blacklist = urls;
  },
  error => console.log(error)
);

browser.storage.onChanged.addListener(({urls}) => {
  blacklist = urls.newValue;
});
