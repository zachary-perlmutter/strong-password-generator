document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const passwordOutput = document.getElementById("password-output");
  const copyBtn = document.getElementById("copy-btn");
  const generateBtn = document.getElementById("generate-btn");
  const lengthValue = document.getElementById("length-value");
  const decreaseLength = document.getElementById("decrease-length");
  const increaseLength = document.getElementById("increase-length");
  const uppercaseToggle = document.getElementById("uppercase");
  const lowercaseToggle = document.getElementById("lowercase");
  const numbersToggle = document.getElementById("numbers");
  const symbolsToggle = document.getElementById("symbols");
  const easyToReadToggle = document.getElementById("easy-to-read");
  const strengthSegments = document.querySelectorAll(".strength-segment");
  const strengthText = document.querySelector(".strength-text");
  const currentYearElement = document.getElementById("current-year");

  // Set current year for copyright
  currentYearElement.textContent = new Date().getFullYear();

  // Default password options
  let passwordOptions = {
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    easyToRead: false,
  };

  // Load saved settings from storage
  chrome.storage.sync.get(["passwordOptions"], function (result) {
    if (result.passwordOptions) {
      passwordOptions = result.passwordOptions;
      updateUI();
    }

    // Generate initial password
    generatePassword();
  });

  // Character sets
  const chars = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
    ambiguous: "1lI0Oo",
  };

  // Update UI based on current options
  function updateUI() {
    lengthValue.textContent = passwordOptions.length;
    uppercaseToggle.checked = passwordOptions.uppercase;
    lowercaseToggle.checked = passwordOptions.lowercase;
    numbersToggle.checked = passwordOptions.numbers;
    symbolsToggle.checked = passwordOptions.symbols;
    easyToReadToggle.checked = passwordOptions.easyToRead;
  }

  // Save settings to storage
  function saveSettings() {
    chrome.storage.sync.set({ passwordOptions });
  }

  // Generate password based on current options
  function generatePassword() {
    let charSet = "";

    if (passwordOptions.lowercase) charSet += chars.lowercase;
    if (passwordOptions.uppercase) charSet += chars.uppercase;
    if (passwordOptions.numbers) charSet += chars.numbers;
    if (passwordOptions.symbols) charSet += chars.symbols;

    // If no character set is selected, default to lowercase
    if (charSet === "") {
      charSet = chars.lowercase;
      passwordOptions.lowercase = true;
      updateUI();
    }

    // Remove ambiguous characters if easy to read is enabled
    if (passwordOptions.easyToRead) {
      for (let i = 0; i < chars.ambiguous.length; i++) {
        charSet = charSet.replace(new RegExp(chars.ambiguous[i], "g"), "");
      }
    }

    // Generate the password
    let password = "";
    let hasRequiredChars = false;

    while (!hasRequiredChars) {
      password = "";
      for (let i = 0; i < passwordOptions.length; i++) {
        const randomIndex = Math.floor(Math.random() * charSet.length);
        password += charSet[randomIndex];
      }

      // Check if password meets requirements (has at least one char from each selected type)
      hasRequiredChars = true;

      if (passwordOptions.lowercase && !/[a-z]/.test(password))
        hasRequiredChars = false;
      if (passwordOptions.uppercase && !/[A-Z]/.test(password))
        hasRequiredChars = false;
      if (passwordOptions.numbers && !/[0-9]/.test(password))
        hasRequiredChars = false;
      if (
        passwordOptions.symbols &&
        !/[!@#$%^&*()_+~`|}{[\]:;?><,./-=]/.test(password)
      )
        hasRequiredChars = false;
    }

    // Set the password in the output
    passwordOutput.value = password;

    // Update password strength meter
    updateStrengthMeter(password);
  }

  // Calculate and update password strength meter
  function updateStrengthMeter(password) {
    // Calculate strength (simple algorithm for demo purposes)
    let strength = 0;

    // Length-based strength
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (password.length >= 16) strength += 1;

    // Character variety
    const varietyScore =
      (passwordOptions.lowercase ? 1 : 0) +
      (passwordOptions.uppercase ? 1 : 0) +
      (passwordOptions.numbers ? 1 : 0) +
      (passwordOptions.symbols ? 1 : 0);

    strength += Math.min(varietyScore - 1, 1); // Max +1 for variety

    // Clamp strength between 1-4
    strength = Math.max(1, Math.min(4, strength));

    // Update UI
    strengthSegments.forEach((segment, index) => {
      if (index < strength) {
        segment.setAttribute("data-active", "true");
      } else {
        segment.setAttribute("data-active", "false");
      }
    });

    // Update strength text
    const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
    strengthText.textContent = strengthLabels[strength - 1];
    strengthText.style.color =
      strength === 1
        ? "#FF3B30"
        : strength === 2
        ? "#FF9500"
        : strength === 3
        ? "#FFCC00"
        : "#34C759";
  }

  // Event listeners
  generateBtn.addEventListener("click", generatePassword);

  copyBtn.addEventListener("click", function () {
    passwordOutput.select();
    document.execCommand("copy");

    // Visual feedback
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
    if (passwordOptions.length < 32) {
      passwordOptions.length++;
      lengthValue.textContent = passwordOptions.length;
      saveSettings();
      generatePassword();
    }
  });

  decreaseLength.addEventListener("click", function () {
    if (passwordOptions.length > 8) {
      passwordOptions.length--;
      lengthValue.textContent = passwordOptions.length;
      saveSettings();
      generatePassword();
    }
  });

  // Options toggle listeners
  uppercaseToggle.addEventListener("change", function () {
    passwordOptions.uppercase = this.checked;
    saveSettings();
    generatePassword();
  });

  lowercaseToggle.addEventListener("change", function () {
    passwordOptions.lowercase = this.checked;
    saveSettings();
    generatePassword();
  });

  numbersToggle.addEventListener("change", function () {
    passwordOptions.numbers = this.checked;
    saveSettings();
    generatePassword();
  });

  symbolsToggle.addEventListener("change", function () {
    passwordOptions.symbols = this.checked;
    saveSettings();
    generatePassword();
  });

  easyToReadToggle.addEventListener("change", function () {
    passwordOptions.easyToRead = this.checked;
    saveSettings();
    generatePassword();
  });
});
