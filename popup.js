document.addEventListener("DOMContentLoaded", function () {
  const passwordOutput = document.getElementById("password-output");
  const copyBtn = document.getElementById("copy-btn");
  const generateBtn = document.getElementById("generate-btn");
  const currentYearElement = document.getElementById("current-year");
  const advancedToggle = document.getElementById("advanced-toggle");
  const advancedOptions = document.getElementById("advanced-options");
  const lengthValue = document.getElementById("length-value");
  const decreaseLength = document.getElementById("decrease-length");
  const increaseLength = document.getElementById("increase-length");
  const uppercaseToggle = document.getElementById("uppercase");
  const lowercaseToggle = document.getElementById("lowercase");
  const numbersToggle = document.getElementById("numbers");
  const symbolsToggle = document.getElementById("symbols");
  const easyToReadToggle = document.getElementById("easy-to-read");

  currentYearElement.textContent = new Date().getFullYear();

  // Apple-style defaults (used when advanced options are collapsed)
  const APPLE_GROUP_LENGTH = 6;
  const APPLE_GROUP_COUNT = 3;
  const APPLE_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

  const chars = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
    ambiguous: "1lI0Oo",
  };

  let state = {
    advanced: false,
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    easyToRead: false,
  };

  try {
    chrome.storage.sync.get(["passwordState"], function (result) {
      if (result.passwordState) {
        state = { ...state, ...result.passwordState };
        updateUI();
      }
      generatePassword();
    });
  } catch (err) {
    console.error("chrome.storage unavailable, using defaults:", err);
    generatePassword();
  }

  function saveState() {
    try {
      chrome.storage.sync.set({ passwordState: state });
    } catch (err) {
      console.error("chrome.storage unavailable, settings won't persist:", err);
    }
  }

  function updateUI() {
    advancedOptions.hidden = !state.advanced;
    advancedToggle.setAttribute("aria-expanded", String(state.advanced));
    advancedToggle.classList.toggle("open", state.advanced);
    lengthValue.textContent = state.length;
    uppercaseToggle.checked = state.uppercase;
    lowercaseToggle.checked = state.lowercase;
    numbersToggle.checked = state.numbers;
    symbolsToggle.checked = state.symbols;
    easyToReadToggle.checked = state.easyToRead;
  }

  function randomChar(set) {
    return set[Math.floor(Math.random() * set.length)];
  }

  // Apple-style strong password: three hyphen-separated groups of
  // lowercase letters/digits, with exactly one uppercase letter.
  function generateAppleStylePassword() {
    const groups = [];
    for (let i = 0; i < APPLE_GROUP_COUNT; i++) {
      let group = "";
      for (let j = 0; j < APPLE_GROUP_LENGTH; j++) group += randomChar(APPLE_CHARS);
      groups.push(group);
    }

    let password = groups.join("-");

    const alnumPositions = [];
    for (let i = 0; i < password.length; i++) {
      if (password[i] !== "-") alnumPositions.push(i);
    }
    const pos = alnumPositions[Math.floor(Math.random() * alnumPositions.length)];
    return (
      password.slice(0, pos) + password[pos].toUpperCase() + password.slice(pos + 1)
    );
  }

  function generateCustomPassword() {
    let charSet = "";

    if (state.lowercase) charSet += chars.lowercase;
    if (state.uppercase) charSet += chars.uppercase;
    if (state.numbers) charSet += chars.numbers;
    if (state.symbols) charSet += chars.symbols;

    if (charSet === "") {
      charSet = chars.lowercase;
      state.lowercase = true;
      updateUI();
    }

    if (state.easyToRead) {
      for (let i = 0; i < chars.ambiguous.length; i++) {
        charSet = charSet.replace(new RegExp(chars.ambiguous[i], "g"), "");
      }
    }

    let password = "";
    let hasRequiredChars = false;

    while (!hasRequiredChars) {
      password = "";
      for (let i = 0; i < state.length; i++) {
        password += randomChar(charSet);
      }

      hasRequiredChars = true;
      if (state.lowercase && !/[a-z]/.test(password)) hasRequiredChars = false;
      if (state.uppercase && !/[A-Z]/.test(password)) hasRequiredChars = false;
      if (state.numbers && !/[0-9]/.test(password)) hasRequiredChars = false;
      if (state.symbols && !/[!@#$%^&*()_+~`|}{[\]:;?><,./-=]/.test(password))
        hasRequiredChars = false;
    }

    return password;
  }

  function generatePassword() {
    passwordOutput.value = state.advanced
      ? generateCustomPassword()
      : generateAppleStylePassword();
  }

  generateBtn.addEventListener("click", generatePassword);

  advancedToggle.addEventListener("click", function () {
    state.advanced = !state.advanced;
    updateUI();
    saveState();
    generatePassword();
  });

  copyBtn.addEventListener("click", function () {
    passwordOutput.select();
    document.execCommand("copy");

    copyBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;

    setTimeout(() => {
      copyBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      `;
    }, 1500);
  });

  increaseLength.addEventListener("click", function () {
    if (state.length < 32) {
      state.length++;
      lengthValue.textContent = state.length;
      saveState();
      generatePassword();
    }
  });

  decreaseLength.addEventListener("click", function () {
    if (state.length > 8) {
      state.length--;
      lengthValue.textContent = state.length;
      saveState();
      generatePassword();
    }
  });

  uppercaseToggle.addEventListener("change", function () {
    state.uppercase = this.checked;
    saveState();
    generatePassword();
  });

  lowercaseToggle.addEventListener("change", function () {
    state.lowercase = this.checked;
    saveState();
    generatePassword();
  });

  numbersToggle.addEventListener("change", function () {
    state.numbers = this.checked;
    saveState();
    generatePassword();
  });

  symbolsToggle.addEventListener("change", function () {
    state.symbols = this.checked;
    saveState();
    generatePassword();
  });

  easyToReadToggle.addEventListener("change", function () {
    state.easyToRead = this.checked;
    saveState();
    generatePassword();
  });
});
