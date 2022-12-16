"use strict";
import {
  dictionaries,
  forvoOptions,
  forvoURLbase,
  googleImagesURL,
  navBar,
} from "./data.js";

let Dicts = dictionaries;
let forvoLanguages = forvoOptions;
let popupId;
let popupTabId;
let word = "";
let listDictionaries;
let dictionary;
chrome.storage.sync.get(
  {
    DICTIONARIES_STORAGE_KEY: Dicts,
    FORVO_STORAGE_KEY: forvoLanguages,
  },
  function (keys) {
    const list = keys.DICTIONARIES_STORAGE_KEY;
    const onlyActiveDictionaries = list.filter((dictionary) => {
      return dictionary.active == true;
    });
    listDictionaries = onlyActiveDictionaries;
    forvoLanguages = keys.FORVO_STORAGE_KEY;
    chrome.storage.sync.set({ STORAGE_DICTIONARY: listDictionaries[0] });
    dictionary = listDictionaries[0];
  }
);

try {
  chrome.webNavigation.onCompleted.addListener(async function (details) {
    console.log("on webnavigation");
    await chrome.storage.sync.get(
      {
        DICTIONARIES_STORAGE_KEY: Dicts,
        FORVO_STORAGE_KEY: forvoLanguages,
        STORAGE_DICTIONARY: dictionary,
      },
      function (keys) {
        console.log("key are", keys);
        const list = keys.DICTIONARIES_STORAGE_KEY;
        const onlyActiveDictionaries = list.filter((dictionary) => {
          return dictionary.active == true;
        });
        listDictionaries = onlyActiveDictionaries;
        forvoLanguages = keys.FORVO_STORAGE_KEY;
        dictionary = keys.STORAGE_DICTIONARY;
      }
    );

    let POPUPWINDOWSID;
    await new Promise((resolve) => {
      chrome.storage.sync.get("UITabID", function (oSetting) {
        resolve(oSetting.UITabID || 0);
      });
    }).then(async (nTabID) => {
      await chrome.windows.get(nTabID, async function (window) {
        if (chrome.runtime.lastError) {
          console.log("Tab id not found");
        } else {
          chrome.storage.sync.set({ UITabID: window.id });
          POPUPWINDOWSID = window.id;
        }
      });
    });
    console.log("Dictionary is ", dictionary);
    let currentTab = await chrome.tabs.get(details.tabId);

    if (POPUPWINDOWSID == currentTab.windowId) {
      console.log("Adding scripts");
      try {
        await addNavBarAndRemoveHeader(details.tabId);
        console.log("Adding nabvar.");
        await chrome.scripting.executeScript({
          target: { tabId: details.tabId, allFrames: true },
          func: eventListenerInputSearch,
        });
        await chrome.scripting.executeScript({
          target: { tabId: details.tabId, allFrames: true },
          func: addButtonsEventListeners,
        });
        await chrome.scripting.executeScript({
          target: { tabId: details.tabId, allFrames: true },
          func: addEventSelectDictionary,
        });
        await chrome.scripting.executeScript({
          target: { tabId: details.tabId, allFrames: true },
          func: fillInputWithWordAndSelectDictionary,
          args: [word, dictionary.id],
        });
      } catch (e) {
        console.log("Failed to execute scripts.", e);
      }
    }
  });

  // On first install open onboarding to allow permissions.

  chrome.runtime.onInstalled.addListener((r) => {
    if (r.reason == "install") {
      //first install
      // show onboarding page
      chrome.tabs.create({
        url: "onboarding-page.html",
      });
    }
  });
  chrome.storage.onChanged.addListener((e) => {
    chrome.storage.sync.get(
      {
        DICTIONARIES_STORAGE_KEY: Dicts,
        FORVO_STORAGE_KEY: forvoLanguages,
      },
      function (keys) {
        const list = keys.DICTIONARIES_STORAGE_KEY;
        const onlyActiveDictionaries = list.filter((dictionary) => {
          return dictionary.active == true;
        });
        listDictionaries = onlyActiveDictionaries;
        forvoLanguages = keys.FORVO_STORAGE_KEY;
        dictionary = keys.STORAGE_DICTIONARY || listDictionaries[0];
      }
    );
  });

  //Fires when select omnibox for extension
  chrome.omnibox.onInputStarted.addListener(function () {
    //Set a default ...

    chrome.omnibox.setDefaultSuggestion({
      description:
        "Enter a word and select the dictionary (for example, <match>test</match>)",
    });
  });

  //fires when select option and press enter
  chrome.omnibox.onInputEntered.addListener(async function (text) {
    // Here, we have set the first argument of update to undefined. This is the tab id that you're wanting to update. If it's undefined then Chrome will update the current tab in the current window.
    chrome.tabs.update(undefined, { url: text });
  });

  //fires when input changes e.g keyUp
  chrome.omnibox.onInputChanged.addListener(async function (text, suggest) {
    //TODO implement toPhonetics with https://github.com/ajlee2006/tophonetics-api
    //could send a request to my server to autofill resuts to add here....
    //{}
    let apiTextResult = "";

    if (text.includes("  ")) {
      const apiText = await fetch(
        `https://tophonetics-api.ajlee.repl.co/api?text=${text.trim()}&dialect=am`
      );
      await apiText.text().then((res) => {
        apiTextResult = res;
      });
    }

    // Add suggestions to an array

    let suggestions = listDictionaries.map((dictionary, index, array) => {
      const suggestion = {
        deletable: true,
        content: dictionary.url + text,
        description: `(Search on ${
          dictionary.name
        }) <match>"${text.trim()}"</match>`,
      };
      return suggestion;
    });
    // Forvo suggestion
    const selectedLanguageForvo = forvoLanguages.filter((language) => {
      return language.selected == true;
    });
    let url = `${forvoURLbase}${text}/${selectedLanguageForvo[0].suffix}`;
    suggestions.unshift({
      deletable: true,
      content: url,
      description: `(Search on Forvo pronunciation) <match>"${text}"</match> `,
    });
    // Google images suggestions
    suggestions.unshift({
      deletable: true,
      content: googleImagesURL + text,
      description: `(Search on Google images) <match>"${text}"</match> ${
        apiTextResult ? "IPA: " + apiTextResult : ""
      }`,
    });
    suggest(suggestions);
  });

  // When extension is clicked, this is fired.
  chrome.action.onClicked.addListener(async function (tab) {
    if (tab.url.startsWith("chrome")) {
      await new Promise((resolve) => {
        chrome.storage.sync.get("UITabID", function (oSetting) {
          resolve(oSetting.UITabID || 0);
        });
      }).then(async (nTabID) => {
        await chrome.windows.get(nTabID, async function (window) {
          if (chrome.runtime.lastError) {
            await sizeAndCenterPopup();
          } else {
            try {
              await chrome.windows.update(nTabID, {
                focused: true,
              });
              searchDictOnCommand(word);
            } catch (e) {
              console.log("Problem updating focus to dictionary window", e);
            }
          }
        });
      });
    } else {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: getSelectedText,
      });
    }
  });

  /// Commands and popup windows

  chrome.commands.onCommand.addListener(async function (command) {
    console.log("Command running", command);
    const currentWindow = await getCurrentWindow();
    if (!currentWindow) return;

    //Getting selected text in current window

    // If command is open dictionary.

    if (command === "openPopup") {
      await chrome.scripting.executeScript({
        target: { tabId: currentWindow.id, allFrames: true },
        func: getSelectedText,
      });
      //   await openOrCreatePopup(popupId);
    }
    if (command === "nextDict") {
      await chrome.scripting.executeScript({
        target: { tabId: currentWindow.id, allFrames: true },
        func: changeDictionaryNextOnCommand,
      });
    }

    if (command === "previousDict") {
      await chrome.scripting.executeScript({
        target: { tabId: currentWindow.id, allFrames: true },
        func: changeDictionaryPreviousOnCommand,
      });
    }
  });

  async function addNavBarAndRemoveHeader(tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId, allFrames: false },
        func: removeHeader,
      });
      await chrome.scripting.executeScript({
        target: { tabId: tabId, allFrames: false },
        func: addNavBar,
        args: [navBar],
      });
      await chrome.scripting.executeScript({
        target: { tabId: tabId, allFrames: false },
        func: populateSelectDict,
        args: [listDictionaries],
      });
    } catch (e) {
      console.log("Problem adding navbar", e);
    }
  }

  function populateSelectDict(dictionaries) {
    const select = document.getElementById("dictionariesSelect");
    select.innerHTML = "";
    dictionaries.forEach((dict) => {
      const option = document.createElement("option");
      if (dict.active) {
        option.value = dict.id;
        option.text = dict.name;
        select.appendChild(option);
      }
    });
    const option = document.createElement("option");
    option.value = "options";
    option.text = "More options...";
    option.style.fontStyle = "italic";
    select.appendChild(option);

    dictionary = dictionaries[0];
  }

  function addNavBar(html) {
    const existingNavbar = document.querySelector("#navBarDict");
    if (existingNavbar) {
      existingNavbar.remove();
    }

    document.body.insertAdjacentHTML("afterbegin", html);
  }

  function removeHeader() {
    [...document.getElementsByClassName("header")].map((n) => n && n.remove());
    [...document.getElementsByClassName("searchbar")].map(
      (n) => n && n.remove()
    );
    [...document.getElementsByTagName("header")].map((n) => n && n.remove());
    [...document.getElementsByTagName("nav")].map((n) => n && n.remove());

    if (document.getElementById("searchbar"))
      document.getElementById("searchbar").remove();

    if (document.getElementById("header"))
      document.getElementById("header").remove();
  }

  // receiving message

  chrome.runtime.onMessage.addListener(async function (
    request,
    sender,
    sendResponse
  ) {
    if (request.message.includes("inputTriggered")) {
      word = request.message.split(",")[1];
      let selectedDictionaryId = request.message.split(",")[2];
      sendResponse({ farewell: "Input search triggered" });
      searchOnDict(word, selectedDictionaryId);
    }

    if (request.message.includes("searchOnCommand")) {
      word = request.message.split(",")[1];
      sendResponse({ farewell: "Search on command ongoing" });
      await openOrCreatePopup();
    }
    if (request.message.includes("googleImagesTriggered")) {
      word = request.message.split(",")[1];
      sendResponse({ farewell: "Search on google images command ongoing" });
      searchOnGoogleImages();
    }
    if (request.message.includes("forvoTriggered")) {
      word = request.message.split(",")[1];
      sendResponse({ farewell: "Search on google images command ongoing" });
      searchOnForvo();
    }

    if (request.message.includes("selectDictionaryTriggered")) {
      word = request.message.split(",")[1];
      let selectedDictionaryId = request.message.split(",")[2];
      sendResponse({ farewell: "Select change, dictionary ongoing" });
      changeDictionaryOnSelect(word, selectedDictionaryId);
    }
    if (request.message.includes("changeDictOnNextBtnTriggered")) {
      word = request.message.split(",")[1];
      let dictionaryIndex = request.message.split(",")[2];
      let selectedDictionaryIndex = request.message.split(",")[2];
      sendResponse({ farewell: "Select change, dictionary ongoing" });
      changeDictionaryOnNext(word, selectedDictionaryIndex);
    }
    if (request.message.includes("changeDictOnPreviousBtnTriggered")) {
      word = request.message.split(",")[1];
      let dictionaryIndex = request.message.split(",")[2];
      let selectedDictionaryIndex = request.message.split(",")[2];
      sendResponse({ farewell: "Select change, dictionary ongoing" });
      changeDictionaryOnPrevious(word, selectedDictionaryIndex);
    }

    if (request.message.includes("changeDictionaryNextOnCommandTriggered")) {
      word = request.message.split(",")[1];
      let dictionaryIndex = request.message.split(",")[2];
      let selectedDictionaryIndex = request.message.split(",")[2];
      sendResponse({ farewell: "Select change, dictionary ongoing" });
      changeDictionaryOnNext(word, selectedDictionaryIndex);
    }
    if (
      request.message.includes("changeDictionaryPreviousOnCommandTriggered")
    ) {
      word = request.message.split(",")[1];
      let dictionaryIndex = request.message.split(",")[2];
      let selectedDictionaryIndex = request.message.split(",")[2];
      sendResponse({ farewell: "Select change, dictionary ongoing" });
      changeDictionaryOnPrevious(word, selectedDictionaryIndex);
    }
    if (request.message.includes("optionsTriggered")) {
      openOptionsPage();
    }
  });

  function openOptionsPage() {
    chrome.tabs.query({ url: chrome.runtime.getURL("opt.html") }, (tabs) => {
      if (tabs.length <= 0) {
        chrome.tabs.create({ url: chrome.runtime.getURL("opt.html") });
        return;
      }
      chrome.windows.update(tabs[0].windowId, { focused: true });
      chrome.tabs.update(tabs[0].id, { active: true });
    });
  }

  function fillInputWithWordAndSelectDictionary(wordToSearch, dictionaryId) {
    const searchForm = document.querySelector("#searchForm");
    const searchInput = document.querySelector("#searchInput");
    searchInput.value = wordToSearch;
    const selectedDictionary = document.querySelector("#dictionariesSelect");
    selectedDictionary.value = dictionaryId;
  }

  async function getCurrentWindow() {
    const [currentWindow] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (currentWindow?.url.startsWith("chrome")) return false;

    return currentWindow;
  }

  async function getSelectedText() {
    const selectedText = window.getSelection().toString().trim();
    if (window === window.top) {
      chrome.runtime.sendMessage(
        { message: `searchOnCommand,${selectedText}` },
        function (response) {
          console.log(response.farewell);
        }
      );
    }
  }

  async function openOrCreatePopup() {
    // creating a new

    await new Promise((resolve) => {
      chrome.storage.sync.get("UITabID", function (oSetting) {
        resolve(oSetting.UITabID || 0);
      });
    }).then(async (nTabID) => {
      await chrome.windows.get(nTabID, async function (window) {
        if (chrome.runtime.lastError) {
          await sizeAndCenterPopup();
        } else {
          try {
            await chrome.windows.update(nTabID, {
              focused: true,
            });
            searchDictOnCommand(word);
          } catch (e) {
            console.log("Problem updating focus to dictionary window", e);
          }
        }
      });
    });
  }

  async function sizeAndCenterPopup() {
    const displayInfo = await chrome.system.display.getInfo();

    const width = 1200;
    const height = 800;
    let left;
    let top;
    // Selecting primary monitor and getting the center.
    displayInfo.forEach((display) => {
      if (display.isPrimary) {
        left = parseInt((display.bounds.width - width) / 2);
        top = parseInt((display.bounds.height - height) / 2);
      }
    });
    await saveDictionary();
    let url = dictionary.url + word;

    // Creating centered windows.

    await chrome.windows.create(
      {
        focused: true,
        url: url,
        type: "popup",
        height: height,
        width: width,
        left: left,
        top: top,
      },
      function (window) {
        chrome.storage.sync.set({ UITabID: window.id });
        popupId = window.id;
        popupTabId = window.tabs[0].id;
      }
    );
  }

  async function saveDictionary() {
    await new Promise((resolve) => {
      chrome.storage.sync.get(null, function (keys) {
        resolve(keys.STORAGE_DICTIONARY || listDictionaries[0]);
      });
    }).then(async (STORAGE_DICTIONARY) => {
      chrome.storage.sync.set({ STORAGE_DICTIONARY: STORAGE_DICTIONARY });
      dictionary = STORAGE_DICTIONARY;
      console.log("STORAGE_DICTIONARY", STORAGE_DICTIONARY);
    });
  }

  // Search based on what the input in the form has.
  function eventListenerInputSearch() {
    const searchForm = document.querySelector("#searchForm");
    const searchBtn = document.querySelector("[data-submit-word]");
    const searchInput = document.querySelector("#searchInput");
    const inputControlError = document.querySelector(".input-control-dicts");

    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      validateInput();
      if (!searchInput.value) return;
      const selectedDictionary = document.querySelector("#dictionariesSelect");

      chrome.runtime.sendMessage(
        {
          message: `inputTriggered,${searchInput.value},${selectedDictionary.value}`,
        },
        function (response) {
          console.log(response.farewell);
        }
      );
    });
    searchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      validateInput();
      if (!searchInput.value) return;
      const selectedDictionary = document.querySelector("#dictionariesSelect");

      chrome.runtime.sendMessage(
        {
          message: `inputTriggered,${searchInput.value},${selectedDictionary.value}`,
        },
        function (response) {
          console.log(response.farewell);
        }
      );
    });
    function validateInput() {
      const inputControlError = document.querySelector(".input-control-dicts");

      if (!searchInput.value) {
        inputControlError.classList.add("error");
        document
          .querySelector("input[type=text]")
          .style.setProperty("--c", "red");
      }
    }
  }

  async function searchOnDict(word, selectedDictionaryId) {
    const selectedDictionary = listDictionaries.find(
      (dict) => dict.id === selectedDictionaryId
    );
    dictionary = selectedDictionary;
    await chrome.storage.sync.set({ STORAGE_DICTIONARY: dictionary }, (e) => {
      console.log("on search!!!", e);
    });

    let url = dictionary.url + word;

    chrome.tabs.update(popupTabId, {
      url: url,
    });
  }

  function eventListenerSelectedTextSearch() {
    const selectedText = window.getSelection().toString().trim();
    chrome.runtime.sendMessage(
      { message: `selectedTextTriggered ${selectedText}` },
      function (response) {
        console.log(response.farewell);
      }
    );
  }

  async function searchDictOnCommand(word) {
    let url = dictionary.url + word;

    await chrome.tabs.update(popupTabId, {
      url: url,
    });
  }

  function addButtonsEventListeners() {
    const forvoBtn = document.querySelector("#forvoBtn");
    const imagesBtn = document.querySelector("#imagesBtn");
    const previousDictBtn = document.querySelector("#previousDictBtn");
    const nextDictBtn = document.querySelector("#nextDictBtn");
    const searchInput = document.querySelector("#searchInput");
    const select = document.querySelector("#dictionariesSelect");

    function validateInput() {
      const inputControlError = document.querySelector(".input-control-dicts");

      if (!searchInput.value) {
        inputControlError.classList.add("error");
        document
          .querySelector("input[type=text]")
          .style.setProperty("--c", "red");
      }
    }

    imagesBtn.addEventListener("click", (e) => {
      validateInput();
      if (!searchInput.value) return;
      chrome.runtime.sendMessage(
        { message: `googleImagesTriggered,${searchInput.value}` },
        function (response) {
          console.log(response.farewell);
        }
      );
    });

    forvoBtn.addEventListener("click", (e) => {
      validateInput();
      if (!searchInput.value) return;
      chrome.runtime.sendMessage(
        { message: `forvoTriggered,${searchInput.value}` },
        function (response) {
          console.log(response.farewell);
        }
      );
    });

    nextDictBtn.addEventListener("click", (e) => {
      validateInput();
      if (!searchInput.value) return;

      chrome.runtime.sendMessage(
        {
          message: `changeDictOnNextBtnTriggered,${searchInput.value},${select.selectedIndex}`,
        },
        function (response) {
          console.log(response.farewell);
        }
      );
    });
    previousDictBtn.addEventListener("click", (e) => {
      validateInput();
      if (!searchInput.value) return;

      chrome.runtime.sendMessage(
        {
          message: `changeDictOnPreviousBtnTriggered,${searchInput.value},${select.selectedIndex}`,
        },
        function (response) {
          console.log(response.farewell);
        }
      );
    });
  }

  function searchOnGoogleImages() {
    let url = googleImagesURL + word;

    chrome.tabs.update(popupTabId, {
      url: url,
    });
  }

  function searchOnForvo() {
    const selectedLanguage = forvoLanguages.filter((language) => {
      return language.selected == true;
    });
    let url = `${forvoURLbase}${word}/${selectedLanguage[0].suffix}`;

    chrome.tabs.update(popupTabId, {
      url: url,
    });
  }

  function addEventSelectDictionary() {
    const select = document.querySelector("#dictionariesSelect");
    const searchInput = document.querySelector("#searchInput");

    function validateInput() {
      const inputControlError = document.querySelector(".input-control-dicts");

      if (!searchInput.value) {
        inputControlError.classList.add("error");
        document
          .querySelector("input[type=text]")
          .style.setProperty("--c", "red");
      }
    }

    select.addEventListener("change", (e) => {
      if (select.value == "options") {
        chrome.runtime.sendMessage(
          {
            message: `optionsTriggered`,
          },
          function (response) {
            console.log(response.farewell);
          }
        );
        select.value = dictionary.id;
        return;
      }
      validateInput();
      if (!searchInput.value) return;
      chrome.runtime.sendMessage(
        {
          message: `selectDictionaryTriggered,${searchInput.value},${select.value}`,
        },
        function (response) {
          console.log(response.farewell);
        }
      );
    });
  }

  async function changeDictionaryOnSelect(word, dictionaryId) {
    if (dictionaryId == "options") {
      chrome.tabs.create({ url: chrome.runtime.getURL("opt.html") });
      return;
    }

    const selectedDictionary = listDictionaries.filter((dict) => {
      return dict.id == dictionaryId;
    });

    dictionary = selectedDictionary[0];
    let url = `${selectedDictionary[0].url}/${word}`;
    await chrome.storage.sync.set({
      STORAGE_DICTIONARY: selectedDictionary[0],
    });
    chrome.tabs.update(popupTabId, {
      url: url,
    });
  }

  async function changeDictionaryOnNext(word, selectedDictionaryIndex) {
    let url;
    let index;
    if (selectedDictionaryIndex >= listDictionaries.length - 1) {
      index = 0;
      url = `${listDictionaries[index].url}/${word}`;
    } else {
      index = Number(selectedDictionaryIndex) + 1;
      url = `${listDictionaries[index].url}/${word}`;
    }
    dictionary = listDictionaries[index];
    await chrome.storage.sync.set({
      STORAGE_DICTIONARY: dictionary,
    });
    chrome.tabs.update(popupTabId, {
      url: url,
    });
  }
  async function changeDictionaryOnPrevious(word, selectedDictionaryIndex) {
    let url;
    let index;
    if (selectedDictionaryIndex == 0) {
      index = Number(listDictionaries.length) - 1;
      url = `${listDictionaries[index].url}/${word}`;
    } else {
      index = Number(selectedDictionaryIndex) - 1;
      url = `${listDictionaries[index].url}/${word}`;
    }
    dictionary = listDictionaries[index];
    await chrome.storage.sync.set({
      STORAGE_DICTIONARY: dictionary,
    });
    chrome.tabs.update(popupTabId, {
      url: url,
    });
  }
  function changeDictionaryNextOnCommand() {
    const searchInput = document.querySelector("#searchInput");
    const select = document.querySelector("#dictionariesSelect");

    function validateInput() {
      const inputControlError = document.querySelector(".input-control-dicts");

      if (!searchInput.value) {
        inputControlError.classList.add("error");
        document
          .querySelector("input[type=text]")
          .style.setProperty("--c", "red");
      }
    }
    validateInput();
    if (!searchInput.value) return;

    chrome.runtime.sendMessage(
      {
        message: `changeDictionaryNextOnCommandTriggered,${searchInput.value},${select.selectedIndex}`,
      },
      function (response) {
        console.log(response.farewell);
      }
    );
  }
  function changeDictionaryPreviousOnCommand() {
    const searchInput = document.querySelector("#searchInput");
    const select = document.querySelector("#dictionariesSelect");

    function validateInput() {
      const inputControlError = document.querySelector(".input-control-dicts");

      if (!searchInput.value) {
        inputControlError.classList.add("error");
        document
          .querySelector("input[type=text]")
          .style.setProperty("--c", "red");
      }
    }
    validateInput();
    if (!searchInput.value) return;

    chrome.runtime.sendMessage(
      {
        message: `changeDictionaryPreviousOnCommandTriggered,${searchInput.value},${select.selectedIndex}`,
      },
      function (response) {
        console.log(response.farewell);
      }
    );
  }
} catch (e) {
  console.log("Errorr completo ", e);
}
