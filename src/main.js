import { createReadStream, appendFileSync } from "fs";
import { createInterface } from "readline";
const regexPatterns = {
  emailRegex:
    /[^\s@.?*|{}\[\]()"\\<>';%=$]+(\.[^\s@.?*|{}\[\]()"\\<>';%=$]+)*@[^\s@.?*|{}\[\]()"\\<>';%=$]+(\.[^\s@.?*|{}\[\]()"\\<>';%=$]+)+/g,
    aluEmailSpecificRegex:
    /[^\s@.?*|{}\[\]()"\\<>';%=$]+(\.[^\s@.?*|{}\[\]()"\\<>';%=$]+)*@(alueducation\.com|alumni\.alueducation\.com|si\.alueducation\.com)/g,
  creditCardRegex:
    // This regex matches card numbers from the most popular providers which are Visa, Mastercard, Discover, and American Express. the regex checks that the card numbers consist of valid numbers and valid length unique to each provider. 
    // Visa: starting with 4 and is 13 or 16 digits long
    // Mastercard: starting with 5 and is 16 digits long
    // Discover: starting with 6 and is 16 digits long
    // American Express: starting with 3 and is 15 digits long
    /^(?:4[0-9]{12}(?:[0-9]{3})?|(?:5[1-5][0-9]{14}|222[1-9][0-9]{12}|22[3-9][0-9]{13}|2[3-6][0-9]{14}|27[01][0-9]{13}|2720[0-9]{12})|6(?:011|5[0-9]{2})[0-9]{12}|3[47][0-9]{13})$/,
};

const validEmails = [];
const validALUEmails = [];
const validCreditCards = [];
const outputFile = "./output/results.txt";
async function regexOnboarding(path) {
  try {
    const line = createInterface({
      input: createReadStream(path),
      crlfDelay: Infinity,
    });
    line.on("line", (line) => {
      const matchingEmails = line.match(regexPatterns.emailRegex);
      if (matchingEmails) {
        validEmails.push(...matchingEmails);
        appendFileSync(outputFile, "Valid Emails:\n");
        appendFileSync(outputFile, matchingEmails.join("\n"));
      }
      const matchingALUEmails = line.match(regexPatterns.aluEmailSpecificRegex);
      if (matchingALUEmails) {
        validALUEmails.push(...matchingALUEmails);
        appendFileSync(outputFile, "Valid ALU Emails:\n");
        appendFileSync(outputFile, matchingALUEmails.join("\n"));
      }
      const matchingCreditCards = line.match(regexPatterns.creditCardRegex);
      if (matchingCreditCards) {
        validCreditCards.push(...matchingCreditCards);
        appendFileSync(outputFile, "Valid Credit Cards:\n");
        appendFileSync(outputFile, matchingCreditCards.join("\n"));
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