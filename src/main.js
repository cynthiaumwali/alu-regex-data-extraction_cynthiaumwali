import { createReadStream, writeFileSync, appendFileSync } from "fs";
import { createInterface } from "readline";
const regexPatterns = {
  //this email regex matches all valid email addresses, even ones with subdomains, allowed special charaters.
  //an email beginning with special characters or using the @ symbol in the wrong place or twice consecutively will not be matched.
  //an email with a domain name that has invalid characters or is missing a primary domain will not be matched.
  emailRegex:
    /[^\s@.?*|{}\[\]()"\\<>';%=$]+(\.[^\s@.?*|{}\[\]()"\\<>';%=$]+)*@[^\s@.?*|{}\[\]()"\\<>';%=$]+(\.[^\s@.?*|{}\[\]()"\\<>';%=$]+)+/g,
  aluEmailSpecificRegex:
    //   this regex uses the same logic as the one above but is specific to ALU emails with domains alueducation.com, alumni.alueducation.com, and si.alueducation.com.
    //  It will not match any other email addresses ending with a different domain.
    /[^\s@.?*|{}\[\]()"\\<>';%=$]+(\.[^\s@.?*|{}\[\]()"\\<>';%=$]+)*@(alueducation\.com|alumni\.alueducation\.com|si\.alueducation\.com)/g,
  creditCardRegex:
    // This regex matches card numbers from the most popular providers which are Visa, Mastercard, Discover, and American Express. the regex checks that the card numbers consist of valid numbers and valid length unique to each provider.
    // Visa: starting with 4 and is 13 or 16 digits long
    // Mastercard: starting with 5 and is 16 digits long
    // Discover: starting with 6 and is 16 digits long
    // American Express: starting with 3 and is 15 digits long
    /(?:4[0-9]{12}(?:[0-9]{3})?|(?:5[1-5][0-9]{14}|222[1-9][0-9]{12}|22[3-9][0-9]{13}|2[3-6][0-9]{14}|27[01][0-9]{13}|2720[0-9]{12})|6(?:011|5[0-9]{2})[0-9]{12}|3[47][0-9]{13})/g,
};

const validEmails = [];
const validALUEmails = [];
const validCreditCards = [];
const validPhoneNumbers = [];

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
        appendFileSync(outputFile, "Valid Emails:\n", "utf8");
        appendFileSync(outputFile, matchingEmails.join("\n") + "\n", "utf8");
      }
      const matchingALUEmails = line.match(regexPatterns.aluEmailSpecificRegex);
      if (matchingALUEmails) {
        validALUEmails.push(...matchingALUEmails);
        appendFileSync(outputFile, "Valid ALU Emails:\n", "utf8");
        appendFileSync(outputFile, matchingALUEmails.join("\n") + "\n", "utf8");
      }
      const matchingCreditCards = cleanCreditCardNumber(line).match(
        regexPatterns.creditCardRegex,
      );
      if (matchingCreditCards) {
        validCreditCards.push(...matchingCreditCards);
        appendFileSync(outputFile, "Valid Credit Cards:\n", "utf8");
        appendFileSync(
          outputFile,
          matchingCreditCards.join("\n") + "\n",
          "utf8",
        );
      }
      const matchingPhoneNumbers = line.match(regexPatterns.phoneNumberRegex);
      if (matchingPhoneNumbers) {
        validPhoneNumbers.push(...matchingPhoneNumbers);
        appendFileSync(outputFile, "Valid Phone Numbers:\n", "utf8");
        appendFileSync(
          outputFile,
          matchingPhoneNumbers.join("\n") + "\n",
          "utf8",
        );
      }
    });
    line.on("close", () => {
      console.log("Valid emails found:", validEmails);
      console.log("Valid ALU emails found:", validALUEmails);
      console.log("Valid credit cards found:", validCreditCards);
      console.log("Valid phone numbers found:", validPhoneNumbers);
    });
  } catch (error) {
    console.error("Error during regex onboarding:", error);
  }
}

//this function here cleans line to remove any space, hyphen or any non-digit character.
function cleanCreditCardNumber(cardNumber) {
  return cardNumber.replace(/[\s-]\D/g, "");
}

regexOnboarding("input/test.txt");
