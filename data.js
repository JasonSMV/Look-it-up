export const dictionaries = [
  {
    id: "1",
    name: "Longman English",
    url: "https://www.ldoceonline.com/dictionary/",
    active: true,
    lang: "EN",
  },
  {
    id: "2",
    name: "Cambridge English",
    url: "https://dictionary.cambridge.org/us/dictionary/english/",
    active: true,
    lang: "EN",
  },
  {
    id: "3",
    name: "Oxford English",
    url: "https://www.oxfordlearnersdictionaries.com/us/definition/english/",
    active: true,
    lang: "EN",
  },
  {
    id: "4",
    name: "Urban Dictionary",
    url: "https://www.urbandictionary.com/define.php?term=",
    active: true,
    lang: "EN",
  },

  {
    id: "5",
    name: "Vocabulary.com",
    url: "https://www.vocabulary.com/dictionary/",
    active: true,
    lang: "EN",
  },

  {
    id: "6",
    name: "Macmilland Dictionary",
    url: "https://www.macmillandictionary.com/dictionary/british/",
    active: true,
    lang: "EN",
  },

  {
    id: "7",
    name: "Collins English Dictionary",
    url: "https://www.collinsdictionary.com/dictionary/english/",
    active: true,
    lang: "EN",
  },
  {
    id: "8",
    name: "WordReference English",
    url: "https://www.wordreference.com/definition/",
    active: true,
    lang: "EN",
  },
  {
    id: "9",
    name: "Wiktionary English",
    url: "https://en.wiktionary.org/wiki",
    active: true,
    lang: "EN",
  },

  {
    id: "10",
    name: "Longman English - Spanish",
    url: "https://www.ldoceonline.com/dictionary/english-spanish/",
    active: false,
    lang: "EN-ES",
  },
  {
    id: "11",
    name: "Cambridge English - Spanish",
    url: "https://dictionary.cambridge.org/us/dictionary/english-spanish/",
    active: false,
    lang: "EN-ES",
  },
  {
    id: "12",
    name: "WordReference English - Spanish",
    url: "https://www.wordreference.com/es/translation.asp?tranword=",
    active: false,
    lang: "EN-ES",
  },
  {
    id: "13",
    name: "Linguee English - Spanish",
    url: "https://www.linguee.com/english-spanish/search?source=auto&query=",
    active: false,
    lang: "EN-ES",
  },
  {
    id: "14",
    name: "SpanishDict Spanish - English",
    url: "https://www.spanishdict.com/translate/",
    active: false,
    lang: "ES-EN",
  },
  {
    id: "15",
    name: "Longman Spanish - English",
    url: "https://www.ldoceonline.com/dictionary/spanish-english/",
    active: false,
    lang: "ES-EN",
  },
  {
    id: "16",
    name: "Cambridge Spanish - English",
    url: "https://dictionary.cambridge.org/us/dictionary/spanish-english/",
    active: false,
    lang: "ES-EN",
  },
  {
    id: "17",
    name: "WordReference Spanish - English",
    url: "https://www.wordreference.com/es/en/translation.asp?spen=",
    active: false,
    lang: "ES-EN",
  },
  {
    id: "18",
    name: "Larousse French",
    url: "https://www.larousse.fr/dictionnaires/francais/",
    active: false,
    lang: "FR",
  },

  {
    id: "19",
    name: "Larousse French - Spanish",
    url: "https://www.larousse.fr/dictionnaires/francais-espagnol/",
    active: false,
    lang: "FR-ES",
  },
  {
    id: "20",
    name: "Larousse French - English",
    url: "https://www.larousse.fr/dictionnaires/francais-anglais/",
    active: false,
    lang: "FR-EN",
  },
  {
    id: "21",
    name: "RAE - Spanish",
    url: "https://dle.rae.es/",
    active: false,
    lang: "ES",
  },
];

export const forvoOptions = [
  { id: "1", languageName: "English US", suffix: "en_usa", selected: true },
  { id: "2", languageName: "English UK", suffix: "en_uk", selected: false },
  { id: "3", languageName: "Spanish Spain", suffix: "es_es", selected: false },
  {
    id: "4",
    languageName: "Spanish LATAM",
    suffix: "es_latam",
    selected: false,
  },
  { id: "5", languageName: "French", suffix: "#fr", selected: false },
];

export const forvoURLbase = "https://forvo.com/search/";
export const googleImagesURL = "https://www.google.com/search?tbm=isch&q=";

export const navBar = `
<style>
  html {
    scrollbar-width: thin;
    scrollbar-color: #777 #555;
  }
  * {
    padding: 0px;
    margin: 0px;
  }
  html::-webkit-scrollbar {
    width: 0.7vw;
  }

  html::-webkit-scrollbar-thumb {
    background-color: #7775;
  }
  html::-webkit-scrollbar-track {
    background-color: #5555;
  }
  html::-webkit-scrollbar-thumb:hover {
    background-color: #777;
  }
  :root {
    --primary: #f3f3f3;
  }
  .container-ditcs {
    max-width: 1280px;
    margin: 0 auto;

    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .nav-dicts {
    /* margin: 0px !important; */
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0;
    z-index: 9999999999;
    background-color: var(--primary);
    padding: 10px 32px;
    border-bottom: 2px solid #cdcdcd;
  }
  .title-ditcs {
    margin: 0px !important;
    font-size: 28px !important;
    font-weight: 800 !important;
    color: black;
    font-family: sans-serif;
  }
  .menu-dicts {
    display: flex;
    flex: 1 1 0%;
    justify-content: flex-end;
  }

  .menu-dicts button {
    margin: 0 0;
    font-weight: 500;
    text-decoration: none;
    transition: 0.4s;
    padding: 8px 16px;
  }
  .select-ditcs {
    max-width: 185px !important;
    font-size: 16px !important;
    font-family: sans-serif !important;
    outline: 0 !important;
    box-shadow: none !important;
    border: 0 !important;
    background: white;
    background-image: none !important;
    height: 45px !important;
    max-height: 45px !important;
    line-height: 10px !important;
    -webkit-appearance: menulist-button;
    border-radius: 8px !important;
  }
  .select-ditcs:hover {
    cursor: pointer;
    background: #dedede;
  }

  .input-select {
    font-family: sans-serif !important;
    width: 100% !important;
    max-width: 500px !important;
    min-width: none !important;
    padding-left: 10px !important;
    line-height: 10px !important;
    font-size: 16px !important;
    border-radius: 8px !important;
    border: none;
    appearance: none !important;
    outline: none !important;
    height: 45px !important;
    max-height: 45px !important;
  }
  .input-select:focus::placeholder {
    color: transparent;
  }

  .input-select::placeholder {
    color: var(--c, #222);
    transition: color 0.3s ease;
  }
  .btn-dicts {
    background-color: #dadada;
    color: black;
    border: 1px solid #111111;
    background: none;
    border-radius: 8px;
    transition-duration: 0.4s;
    cursor: pointer;
    outline: none;
    font-size: 16px;
    max-height: 45px !important;
  }

  .btn-dicts:hover {
    background-color: #dedede;
    color: white;
  }
  [data-title]:hover:after {
    opacity: 1;
    transition: all 0.1s ease 0.5s;
    visibility: visible;
  }
  [data-title]:after {
    content: attr(data-title);
    background-color: #b8b8b8;
    color: #111;
    font-size: 16px;
    position: absolute;
    padding: 1px 5px 2px 5px;
    bottom: -1.6em;
    left: 100%;
    white-space: nowrap;
    box-shadow: 1px 1px 3px #222222;
    opacity: 0;
    border: 1px solid #111111;
    z-index: 99999;
    visibility: hidden;
  }
  [data-title] {
    position: relative;
  }
  .input-control-dicts.error input {
    border: 1px solid red;
  }
  .error-dicts {
    color: red;
    font-size: 8px;
    height: 10px;
  }
  .error-input {
    position: fixed;
    color: red;
    font-size: 12px;
  }
  #forvoBtn {
    width: 45px !important;
    max-width: 45px !important;
    padding: 0px;
    font-size: 32px;
    border-right: none;
  }
  #imagesBtn {
    width: 45px !important;
    max-width: 45px !important;
    padding: 0px;
    font-size: 26px;
    margin-right: 40px;
  }
  #submit-btn-dicts {
    width: 45px !important;
    max-width: 45px !important;
    padding: 0px;
    font-size: 20px;
    text-align: center;

    margin-right: 40px;
  }
  #previousDictBtn {
    width: 40px !important;
    max-width: 45px !important;
    padding: 0px;
    font-size: 26px;

    text-align: center;
  }
  #nextDictBtn {
    width: 40px !important;
    max-width: 45px !important;
    padding: 0px;
    font-size: 26px;
    text-align: center;
  }
  select-div-ditcs:hover {
    cursor: pointer;
  }
</style>
<nav class="nav-dicts" id="navBarDict">
  <div class="container-ditcs">
    <h1 class="title-ditcs">📚 Look it up!</h1>
    <div class="menu-dicts">
      <form data-search-form id="searchForm" style="width: 350px">
        <div class="input-control-dicts">
          <input
            type="text"
            placeholder="What word are you searching? "
            id="searchInput"
            class="input-select"
          />
          <span class="error-input"> </span>
        </div>
      </form>
      <button
        data-title="Click to search!"
        type="submit"
        class="btn-dicts"
        data-submit-word
        id="submit-btn-dicts"
      >
        🔎
      </button>

      <button
        data-title="Click to search on Forvo!"
        class="btn-dicts"
        id="forvoBtn"
      >
        🗣
      </button>

      <button
        class="btn-dicts"
        id="imagesBtn"
        data-title="Click to search on Google Images!"
      >
        📷
      </button>
      <button
        title="Previous dictionary"
        class="btn-dicts"
        id="previousDictBtn"
      >
        ◀
      </button>
      <div class="select-div-ditcs">
        <select class="select-ditcs" id="dictionariesSelect"></select>
      </div>
      <button title="Next dictionary" class="btn-dicts" id="nextDictBtn">
        ▶
      </button>
    </div>
  </div>
</nav>
<br />


`;
