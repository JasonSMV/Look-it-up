"use strict";

eventListenerInputSearch();

// Search based on what the input in the form has.
function eventListenerInputSearch() {
  console.log("ADDing event input");
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
