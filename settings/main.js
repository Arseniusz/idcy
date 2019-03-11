'use strict';

const URL_LIST = 'urls';
const DOM_LOADED_EVENT = 'DOMContentLoaded';
const FORM_NAME_FIELD = 'exeption-name';

const compose = (...functions) => data => functions.reduceRight(
  (val, f) => f(val), data
);

// getFromStorage :: (right left) -> Promise right left
const getFromStorage = (a, b) => browser.storage.sync.get(URL_LIST).then(a, b);
// merge :: [a] -> [b] -> [a b] 
const merge = a => b => a.concat(b);
// getUrl :: DomElement -> String
const getUrl = form => new FormData(form).get(FORM_NAME_FIELD);
// safeData :: [a] | Null -> [a] | []
const safeData = data => {
  if(!data) return [];
  return data;
};

const saveOptions = event => {
  event.preventDefault();
  let mergeWith = merge([getUrl(event.target)]);

  let writeToStorage = ({urls}) => browser.storage.sync.set({
    urls: mergeWith(safeData(urls))
  });

  return getFromStorage(writeToStorage, errorHandler);
};

const deleteOption = option => event => {
  event.preventDefault();
  let deleteFromStorage = ({urls}) => browser.storage.sync.set({
    urls: urls.filter(i => i !== option)
  });

  return getFromStorage(deleteFromStorage, errorHandler);
};

// DOM manipulations
const clear = element => element.innerHTML = '';
// createElement :: String -> HTMLElement
const createElement = name => {
  let element = document.createElement(name);
  return element;
};
// addClass :: String -> HTMLElement -> HTMLElement
const addClass = className => element => {
  element.classList.add(className);
  return element;
};
// addText :: String -> HTMLElement -> HTMLElement
const addText = text => element => {
  element.innerText = text;
  return element;
};
// addEvent :: String -> HTMLElement -> HTMLElement
const addRemoveEvent = text => element => {
  let optionDeleter = deleteOption(text);
  element.addEventListener('click', optionDeleter);
  return element;
};
// append :: HTMLElement -> HTMLElement -> HTMLElement
const append = child => parent => {
  parent.appendChild(child);
  return parent;
};

const createButton = text => compose(
  addRemoveEvent(text),
  addText('remove'),
  addClass('browser-style'),
  createElement
)('button');

const createSpan = text => compose(
  addText(text),
  addClass('browser-style'),
  createElement
)('span');

const createWrapper = () => compose(
  addClass('item-wrapper'),
  createElement
)('div');

const createItem = text => compose(
  append(createButton(text)),
  append(createSpan(text))
)(createWrapper());

const renderHandler = ({urls}) => {
  let items = urls.map(i => createItem(i));
  let wrapper = document.getElementById('items');

  items.forEach(i => wrapper.append(i));
};

const errorHandler = error => console.log(error);
const render = getFromStorage(renderHandler, errorHandler);

const storeChangeHandler = ({urls}) => {
  let wrapper = document.getElementById('items');
  clear(wrapper);
  return renderHandler({urls: urls.newValue});
};

document.querySelector('form').addEventListener('submit', saveOptions);
document.addEventListener(DOM_LOADED_EVENT, render);

browser.storage.onChanged.addListener(storeChangeHandler);
