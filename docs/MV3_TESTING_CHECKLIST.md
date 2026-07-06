# Manifest V3 Testing Checklist

Complete testing guide for verifying BetterCF MV3 migration.

## Pre-Release Verification

### Build & Artifacts
- [ ] `npm run build` completes without errors
- [ ] `npm run lint` passes (0 errors, warnings acceptable)
- [ ] `npm test` passes all tests
- [ ] `dist/extension/manifest.json` is valid (manifest_version = 3)
- [ ] All required files present in dist/extension/
  - [ ] background.js (service worker)
  - [ ] contentScript.js
  - [ ] index.js (injected script)
  - [ ] popup.js
  - [ ] popup.html
  - [ ] manifest.json
  - [ ] common.css, custom.css
  - [ ] icons/

### Manifest Validation
- [ ] manifest_version = 3
- [ ] background.service_worker = "background.js"
- [ ] action (not browser_action)
- [ ] host_permissions separated from permissions
- [ ] web_accessible_resources uses object format with matches

## Chrome Extension Testing

### Basic Loading
- [ ] Extract dist/extension/ folder
- [ ] Open chrome://extensions/
- [ ] Enable "Developer mode"
- [ ] "Load unpacked" → select dist/extension/
- [ ] Extension loads without errors
- [ ] Icon appears in extension bar
- [ ] Popup opens when clicking icon

### Popup Functionality
- [ ] Settings popup displays correctly
- [ ] Config options are readable
- [ ] All toggles respond to clicks
- [ ] Dark theme toggle works (popup UI changes)
- [ ] Settings save when modal closes

### Feature Testing (15 features)
Test on https://codeforces.com

1. **Style Management**
   - [ ] Page styling applies correctly

2. **Dark Theme**
   - [ ] Toggle with Ctrl+I
   - [ ] Persists across page reloads
   - [ ] Applies to all tabs

3. **Show Tags**
   - [ ] Tags button appears on problem pages
   - [ ] Shows tags when clicked

4. **Problem Set**
   - [ ] Enhancements apply to problem pages

5. **Search Button**
   - [ ] Search button appears in UI
   - [ ] Clicking searches problems

6. **Tutorial Display**
   - [ ] Tutorial button appears
   - [ ] Opens tutorial modal

7. **Navbar**
   - [ ] Navbar dropdowns function
   - [ ] Navigation works properly

8. **Redirector**
   - [ ] Problem redirects work
   - [ ] Links are correct

9. **Standings Auto-Update**
   - [ ] Toggle in settings
   - [ ] Updates standings in real-time (if enabled)

10. **Twin Standings**
    - [ ] Toggle in settings
    - [ ] Shows div1 + div2 together (if enabled)

11. **Verdict Test Hiding**
    - [ ] Toggle with Ctrl+Shift+H
    - [ ] Hides "on test X" in verdicts

12. **Keyboard Shortcuts**
    - [ ] Ctrl+S: File picker to submit
    - [ ] Ctrl+Space: Open Finder
    - [ ] Ctrl+I: Dark mode
    - [ ] Ctrl+Alt+C: Scroll to content
    - [ ] Ctrl+Shift+H: Hide test number

13. **Sidebar**
    - [ ] Toggle in settings
    - [ ] Displays virtual contest info

14. **Finder**
    - [ ] Search pages with Ctrl+Space
    - [ ] Results display correctly
    - [ ] Navigation works

15. **Mashup Features**
    - [ ] Add problems to mashup
    - [ ] Multiple selections work

### Message Passing
- [ ] Injected script ↔ Content script works
- [ ] Content script ↔ Background works
- [ ] Config changes propagate to all tabs
- [ ] Console shows no message errors

### Storage & Persistence
- [ ] Open popup
- [ ] Toggle a setting
- [ ] Close and reopen popup
- [ ] Setting is remembered ✓
- [ ] Change setting in one tab
- [ ] Check other codeforces.com tabs
- [ ] Setting propagated to all tabs ✓

### Error Handling
- [ ] No errors in console
- [ ] No errors in extension background
- [ ] No errors in content script
- [ ] Console is clean

## Firefox MV2 Testing (v1.x branch)

- [ ] Checkout firefox-mv2 branch (or main if keeping MV2 support)
- [ ] `npm run build` succeeds
- [ ] dist/extension/manifest.json has manifest_version = 2
- [ ] Firefox loads extension successfully
- [ ] All 15 features work identically
- [ ] No regression from before MV3 migration

## Chrome Web Store Preparation

- [ ] Screenshot captured of extension UI
- [ ] Review all submission requirements
- [ ] Prepare description for store listing
- [ ] Test all user-facing features one more time

## Release Checklist

- [ ] All tests pass
- [ ] All features verified
- [ ] No console errors
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] README updated
- [ ] Build artifact ready
- [ ] Versioning correct (v2.0.0)
- [ ] Git history clean
- [ ] Ready for release tag

## Troubleshooting

### Extension doesn't load
- Check manifest.json is valid JSON
- Verify manifest_version = 3
- Ensure service_worker path is correct
- Check console for errors

### Dark theme doesn't work
- Verify storage.sync is accessible
- Check config propagation in console
- Verify CSS is properly bundled

### Settings don't persist
- Verify browser.storage.sync is working
- Check for storage permission errors
- Verify popup.js can access storage

### Shortcuts don't work
- Verify content script is injected
- Check keyboard event listeners
- Verify injected script loads

### Message passing errors
- Check content script message listener
- Verify background service worker is running
- Check for message timeout errors

---

**Testing completed on:** ______________________  
**Tester name:** ______________________  
**Result:** ✅ PASS / ❌ FAIL

