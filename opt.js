"use strict";
import { dictionaries, forvoOptions } from "./data.js";

///***********Updating dictionaries or forvo, click on restore defaults to add them */
let Dicts = dictionaries;

let forvoLanguages = forvoOptions;

const LOCAL_STORAGE_PREFIX = "DICTONARIES_LIST";
const DICTIONARIES_STORAGE_KEY = `${LOCAL_STORAGE_PREFIX}-dictonaries`;
const FORVO_STORAGE_KEY = `${LOCAL_STORAGE_PREFIX}-forvo`;

const template = document.querySelector("#dictionary-template");
const dictonariesContainer = document.querySelector("#dictionary-list");

let listDictionaries;

const dictionaryList = document.getElementById("dictionary-list");

var sortable1 = Sortable.create(dictionaryList, {
  animation: 150,
  onUpdate: function (e) {
    // same properties as onEnd

    var list = dictionaryList.querySelectorAll("label");
    //console current order

    let newDictionaryList = [];
    list.forEach((dict) => {
      const dictionaryId = dict.dataset.id;
      const dictionary = listDictionaries.find(
        (dict) => dict.id === dictionaryId
      );
      newDictionaryList.push(dictionary);
    });
    listDictionaries = newDictionaryList;
    // saveDictionaries(); // use this to store in local storage.
    save_options();
  },
});

const checkboxes = document.querySelectorAll("input[type='checkbox']");

function renderDictionary(dictionary) {
  const templateClone = template.content.cloneNode(true);
  const labelDataId = templateClone.querySelector("[data-id]");
  labelDataId.dataset.id = dictionary.id;
  const textElement = templateClone.querySelector("[data-dictionary-name]");
  textElement.innerText = dictionary.name;
  const checkbox = templateClone.querySelector("[data-dictionary-checkbox]");
  checkbox.checked = dictionary.active;
  dictonariesContainer.appendChild(templateClone);
}

function loadDictionaries() {
  const dictionariesString = localStorage.getItem(DICTIONARIES_STORAGE_KEY);
  return JSON.parse(dictionariesString) || Dicts;
}

function saveDictionaries() {
  localStorage.setItem(
    DICTIONARIES_STORAGE_KEY,
    JSON.stringify(listDictionaries)
  );
}

dictonariesContainer.addEventListener("change", (e) => {
  if (!e.target.matches("[data-dictionary-checkbox]")) return;

  const parent = e.target.closest(".dictionary-label");
  const dictionaryId = parent.dataset.id;
  const dictionary = listDictionaries.find((dict) => dict.id === dictionaryId);
  dictionary.active = e.target.checked;
  //   saveDictionaries(); // use this one for local storage.
  save_options();
});

// Saves options to chrome.storage
function save_options() {
  const stringListDictionaries = listDictionaries;

  chrome.storage.sync.set(
    {
      DICTIONARIES_STORAGE_KEY: stringListDictionaries,
    },
    function () {
      // Update status to let user know options were saved.
      let statusMessage = document.getElementById("save-message");
      statusMessage.style.display = "block";
      setTimeout(function () {
        statusMessage.style.display = "none";
      }, 750);
    }
  );
  chrome.storage.sync.set(
    {
      FORVO_STORAGE_KEY: forvoLanguages,
    },
    function () {
      // Update status to let user know options were saved.
      let statusMessage = document.getElementById("save-message");
      statusMessage.style.display = "block";
      setTimeout(function () {
        statusMessage.style.display = "none";
      }, 750);
    }
  );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get(
    {
      DICTIONARIES_STORAGE_KEY: Dicts,
    },
    function (dicts) {
      const list = dicts.DICTIONARIES_STORAGE_KEY;
      listDictionaries = list;
      listDictionaries.forEach(renderDictionary);
    }
  );
  chrome.storage.sync.get(
    {
      FORVO_STORAGE_KEY: forvoLanguages,
    },
    function (opts) {
      console.log("opts is", opts.FORVO_STORAGE_KEY);
      const list = opts.FORVO_STORAGE_KEY;

      list.forEach(populateSelectForvo);
      // Selecting selected option
      const selectedForvoLanguage = list.filter((language) => {
        return language.selected == true;
      });
      console.log(selectedForvoLanguage);
      forvoSelect.value = selectedForvoLanguage[0].id;
    }
  );
}
document.addEventListener("DOMContentLoaded", restore_options);

function restoreDefaults() {
  const stringListDictionaries = Dicts;
  chrome.storage.sync.set({
    DICTIONARIES_STORAGE_KEY: stringListDictionaries,
  });
  chrome.storage.sync.set({
    FORVO_STORAGE_KEY: forvoLanguages,
  });
  location.reload();
}

const restoreBtn = document.querySelector("[data-restore]");
restoreBtn.addEventListener("click", restoreDefaults);

const forvoSelect = document.getElementById("forvo-select");

function populateSelectForvo(forvoOptions) {
  console.log("Forvo ops", forvoOptions);
  const option = document.createElement("option");

  option.value = forvoOptions.id;
  option.text = forvoOptions.languageName;
  forvoSelect.appendChild(option);
}

forvoSelect.addEventListener("change", (e) => {
  console.log("change");
  const oldSelected = forvoLanguages.filter((language) => {
    return language.selected == true;
  });
  oldSelected[0].selected = false;
  console.log(forvoLanguages);
  const newSelected = forvoLanguages.filter((language) => {
    return language.id == forvoSelect.value;
  });
  newSelected[0].selected = true;
  save_options();
  console.log("New selected", newSelected, forvoSelect.value);
});
