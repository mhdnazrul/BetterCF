
# BetterCF

### Codeforces enhancement suite

Forked from [LeoRiether/CodeforcesPP](https://github.com/LeoRiether/CodeforcesPP).

**Original author**: Leonardo Riether  
**License**: MIT

---

## Relevant Links

+ [Fork Repository](https://github.com/anomalyco/BetterCF)
+ [Original Repository](https://github.com/LeoRiether/CodeforcesPP)

---

# Features

+ "Show Tags" button
+ Navbar dropdowns for easier navigation
+ "Google It" button on mashups/gym problems
+ Tutorial pop-up button
+ Custom styling
+ Auto-update standings page
+ Keyboard shortcuts (see below)
+ Choose the default between common/friends-only standings
+ Hide "on test X" in verdicts
+ Start gym virtual contest from the problems page
+ The Finder, to search for any page in Codeforces
+ Add many problems at once to a mashup
+ Read the tutorials one paragraph at a time with tutorial spoilers
+ Twin standings: show both div1 and div2 standings in the same page
+ A **dark theme**

## Shortcuts

Fully configurable, here are the default values:
+ `Ctrl+S`: Open file picker to submit
+ `Ctrl+Alt+C`: Scroll to page content
+ `Ctrl+Space`: Finder
+ `Ctrl+I`: Dark mode
+ `Ctrl+Shift+H`: Toggle "on test X" in verdicts

# Installing

BetterCF is available both as a browser extension and as a userscript, you can install whichever best fits your needs.

## Extension

This version offers the most functionality.

Some features the extension has, but the userscript can't provide:
+ All tabs sync settings¹ (turn on dark theme in one tab, all the other ones follow)
+ Settings sync across multiple devices

¹ This is particularly useful if you like to hide the test number in WA messages. In the userscript, you might hide them in one tab, but the others won't sync, thus showing"WA on test 107" mistakenly (unless you toggle all tabs manually)

## Userscript

If you don't like having dozens of active extensions in your browser, and would rather download a userscript manager to have dozens of active userscripts instead, this version's for you. To install it, you'll need a userscript manager. We recommend like [Violentmonkey](https://violentmonkey.github.io), as it is open-source and works really well, but [Tampermonkey](https://www.tampermonkey.net) and [Greasemonkey](https://addons.example.com/) should be fine too. Then, download the latest release of [script.user.js](https://github.com/anomalyco/BetterCF/releases/latest/download/script.user.js), a pop-up should appear prompting to install the userscript. If this doesn't happen, add the .js manually and you're set.

# Development

Run `yarn build` to build in production mode with Rollup or `yarn start` to build in watch mode.

# Contributing

Think there's something missing from BetterCF or some feature could be better? Please send some PRs or create an issue

# Tests

Tests? Where we're going, we don't need tests.
