import { createReadStream, writeFileSync, appendFileSync } from "fs";
import { createInterface } from "readline";

const regexPatterns = {
  //this email regex matches all valid email addresses, even ones with subdomains, allowed special charaters.
  //an email beginning with special characters or using the @ symbol in the wrong place or twice consecutively will not be matched.
  //an email with a domain name that has invalid characters or is missing a primary domain will not be matched
  //this regex can match emails like 'student@alueducation.com.evil-domain.net' AND 'attacker@evil.com' even though it is not a valid email address although very valid as per this regex. Domain trustworthiness would have to be checked separately.
  emailRegex: /[^\s@.?*|{}\[\]()"\\<>';%=$]+(\.[^\s@.?*|{}\[\]()"\\<>';%=$]+)*@[^\s@.?*|{}\[\]()"\\<>';%=$]+(\.[^\s@.?*|{}\[\]()"\\<>';%=$]+)+/g,
  //   this regex uses the same logic as the one above but is specific to ALU emails with domains alueducation.com, alumni.alueducation.com, and si.alueducation.com.
  //  It will not match any other email addresses ending with a different domain.
  aluEmailSpecificRegex: /[^\s@.?*|{}\[\]()"\\<>';%=$]+(\.[^\s@.?*|{}\[\]()"\\<>';%=$]+)*@(alueducation\.com|alumni\.alueducation\.com|si\.alueducation\.com)(?![\w.-])/g,
  // This regex matches card numbers from the most popular providers which are Visa, Mastercard, Discover, and American Express. the regex checks that the card numbers consist of valid numbers and valid length unique to each provider.
  // Visa: starting with 4 and is 13 or 16 digits long
  // Mastercard: starting with 5 and is 16 digits long
  // Discover: starting with 6 and is 16 digits long
  // American Express: starting with 3 and is 15 digits long
  creditCardRegex: /(?:4[0-9]{12}(?:[0-9]{3})?|(?:5[1-5][0-9]{14}|222[1-9][0-9]{12}|22[3-9][0-9]{13}|2[3-6][0-9]{14}|27[01][0-9]{13}|2720[0-9]{12})|6(?:011|5[0-9]{2})[0-9]{12}|3[47][0-9]{13})/g,
  // This regex matches phone-number , allowing optional spaces, hyphens, or parentheses anywhere in the number.
  // It requires 8 to 17 total digits between a leading and trailing digit.
  // separators are optional. this means an unbroken 8-17 digit like a credit card number can match too. but it is so that also phone numbers with no separators can be matched.
  phoneNumberRegex: /\+?[0-9][0-9\s\-()]{7,16}[0-9]/g,
  // This regex matches time formats in both 12-hour and 24-hour formats.
  // it allows for optional leading zeros and ensuring valid hour and minute values.
  timeFormatRegex: /(?:[01]?\d|2[0-3]):[0-5]\d/g,
};

const validEmails = [];
const validALUEmails = [];
const validCreditCards = [];
const validPhoneNumbers = [];
const validTimeFormats = [];

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
      }
      const matchingALUEmails = line.match(regexPatterns.aluEmailSpecificRegex);
      if (matchingALUEmails) {
        validALUEmails.push(...matchingALUEmails);
      }
      const matchingCreditCards = cleanCreditCardNumber(line).match(
        regexPatterns.creditCardRegex,
      );
      if (matchingCreditCards) {
        validCreditCards.push(...matchingCreditCards);
      }
      const matchingPhoneNumbers = line.match(regexPatterns.phoneNumberRegex);
      if (matchingPhoneNumbers) {
        validPhoneNumbers.push(...matchingPhoneNumbers);
      }
      const matchingTimeFormats = line.match(regexPatterns.timeFormatRegex);
      if (matchingTimeFormats) {
        validTimeFormats.push(...matchingTimeFormats);
      }
    });
    line.on("close", () => {
      console.log("Valid emails found:", validEmails);
      console.log("Valid ALU emails found:", validALUEmails);
      console.log("Valid credit cards found:", validCreditCards);
      console.log("Valid phone numbers found:", validPhoneNumbers);
      console.log("Valid time formats found:", validTimeFormats);

      // Write the results to the output file
      writeFileSync(
        outputFile,
        `Valid emails found:\n ${validEmails.join("\n")}\n\nValid ALU emails found:\n ${validALUEmails.join("\n")}\n\nValid credit cards found:\n ${validCreditCards.join("\n")}\n\nValid phone numbers found:\n ${validPhoneNumbers.join("\n")}\n\nValid time formats found:\n ${validTimeFormats.join("\n")}`,
        "utf8",
      );
    });
  } catch (error) {
    console.error("Error during regex onboarding:", error);
  }
}

//this function here cleans line to remove any space, hyphen or any non-digit character.
function cleanCreditCardNumber(cardNumber) {
  return cardNumber.replace(/[\s-]/g, "");
}

// In order not to have the result from a previous run in the current output, we clear the output file before running the program again
function clearOutputFile() {
  try {
    writeFileSync(outputFile, "", "utf8");
  } catch (error) {
    console.error("Error clearing output file:", error);
  }
}

clearOutputFile();

regexOnboarding("input/test.txt");
