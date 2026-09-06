# Regex Onboarding Hackathon

The aim of this assignment is to create regex patterns that can extract wanted text inputs while keeping security in mind. This code scans a text file line by line and extracts general emails, ALU-specific emails, credit card numbers, phone numbers, and time formats using regex. The output results are written to this file: `output/results.txt`.

## Usage

To run the program, this is the command to be used:
```bash
node index.js
```

The input file path is hardcoded to `input/test.txt`. Output is written to `./output/results.txt`, overwriting any run that could have been made before.

## What each pattern matches

### `emailRegex`
Matches email-shaped substrings anywhere in a line (local part `@` domain, with dots allowed in both, as long as they're not starting, ending, or doubled). It rejects special characters commonly found in injection attacks (`< > " \ ; % = $ { } [ ] ( ) | * ?`).

### `ALUEmailSpecificRegex`
Same underlying logic as `emailRegex`, but only matches if the domain is exactly `alueducation.com`, `alumni.alueducation.com`, or `si.alueducation.com`.

### `creditCardRegex`
Matches card numbers for four most popular card providers based on prefix and length:

| Card Provider | Prefix | Length |
|---|---|---|
| Visa | `4` | 13 or 16 digits |
| Mastercard | `51`–`55` or `2221`–`2720` | 16 digits |
| Discover | `6011` or `65xx` | 16 digits |
| American Express | `34` or `37` | 15 digits |

Input is passed through `cleanCreditCardNumber` first, which removes spaces and hyphens so formatted numbers (`5555 5555 5555 4444`) still match.

### `phoneNumberRegex`
Matches sequences of 9 to 18 characters that start and end on a digit, allowing digits, spaces, hyphens, and parentheses in between. A leading `+` is optional.

A thing to note is because separators are optional, this can also match unbroken digit runs that aren't phone numbers like a credit card number written without spaces. This is a disadvantage but known: requiring separators would miss real phone numbers written without them, but not requiring them means some false positives are possible. If false positives from credit card numbers become a problem, run the credit card check first and exclude anything it already matched.


### `timeFormatRegex`
Matches `HH:MM` where the hour is `00`–`23` and the minute is `00`–`59`.

Accepts both 12-hour and 24-hour hour values, since 12-hour hours (`1`–`12`) are a subset of the 24-hour range.

## Recap of known issues
- `emailRegex` can match emails like 'student@alueducation.com.evil-domain.net' AND 'attacker@evil.com' as they look like valid emails but possibly malicious. Domain trustworthiness would have to be checked separately.
- `phoneNumberRegex` can match credit card numbers when they appear without separators.
- `creditCardRegex` just checks if the card matches desired format. It can't distinguish a real card number from a fake one that happens to have a valid prefix and length.
