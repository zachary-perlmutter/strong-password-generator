document.addEventListener("DOMContentLoaded", function () {
  const passwordOutput = document.getElementById("password-output");
  const copyBtn = document.getElementById("copy-btn");
  const generateBtn = document.getElementById("generate-btn");
  const currentYearElement = document.getElementById("current-year");

  currentYearElement.textContent = new Date().getFullYear();

  const GROUP_LENGTH = 6;
  const GROUP_COUNT = 3;
  const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

  function randomChar() {
    return CHARS[Math.floor(Math.random() * CHARS.length)];
  }

  // Apple-style strong password: three hyphen-separated groups of
  // lowercase letters/digits, with exactly one uppercase letter.
  function generatePassword() {
    const groups = [];
    for (let i = 0; i < GROUP_COUNT; i++) {
      let group = "";
      for (let j = 0; j < GROUP_LENGTH; j++) group += randomChar();
      groups.push(group);
    }

    let password = groups.join("-");

    const alnumPositions = [];
    for (let i = 0; i < password.length; i++) {
      if (password[i] !== "-") alnumPositions.push(i);
    }
    const pos = alnumPositions[Math.floor(Math.random() * alnumPositions.length)];
    password =
      password.slice(0, pos) +
      password[pos].toUpperCase() +
      password.slice(pos + 1);

    passwordOutput.value = password;
  }

  generateBtn.addEventListener("click", generatePassword);

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

  generatePassword();
});
