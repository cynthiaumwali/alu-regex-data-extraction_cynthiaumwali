const fs = require("fs");
const readLine = require("readline");
const regexPatterns = {
    emailRegex: /^[^\s@.?*|{}\[\]()"\\<>';%=$]+(\.[^\s@.?*|{}\[\]()"\\<>';%=$]+)*@[^\s@.?*|{}\[\]()"\\<>';%=$]+(\.[^\s@.?*|{}\[\]()"\\<>';%=$]+)+$/,
};

const validEmails = []
async function regexOnboarding(path) {
  try {
    const line = readLine.createInterface({
      input: fs.createReadStream(path),
      crlfDelay: Infinity,
    });
    line.on("line", (line) => {
        if (regexPatterns.emailRegex.test(line)) {
            validEmails.push(line);
        }
    });
    line.on("close", () => {
        console.log("Valid emails found:", validEmails);
    });
  } catch (error) {
    console.error("Error during regex onboarding:", error);
  }
}

regexOnboarding("input/test.txt");