# Branding Assets — TODO List

This file tracks the remaining branding asset work needed for the BetterCF rebrand.

## Required Assets

### 1. Logo

| Item | Current | Replacement Needed | Notes |
|------|---------|-------------------|-------|
| `assets/bettercf-logo.png` | Renamed from `cf++ logo.png` | BetterCF branded logo | Used in navbar replacement |
| `assets/bettercf-logo.svg` | Renamed from `cf++ logo.svg` | SVG version of logo | Used in popup header; internal `sodipodi:docname` updated |
| Popup logo path | `popup.html` references `icons/bettercf-logo.svg` | ✅ Done | SVG file renamed and rollup config updated |

### 2. Extension Icons

| Item | Current | Replacement Needed | Notes |
|------|---------|-------------------|-------|
| `assets/icons/16x16.png` | Old Codeforces++ icon | BetterCF icon (16px) | Chrome Web Store / toolbar |
| `assets/icons/32x32.png` | Old Codeforces++ icon | BetterCF icon (32px) | Windows taskbar |
| `assets/icons/48x48.png` | Old Codeforces++ icon | BetterCF icon (48px) | Extension management page |
| `assets/icons/128x128.png` | Old Codeforces++ icon | BetterCF icon (128px) | Chrome Web Store listing |

### 3. GitHub Assets

| Item | Status | Notes |
|------|--------|-------|
| Repository description | Done | Set in `package.json` and `README.md` |
| GitHub social preview | (not yet created) | 1280×640px banner for repository |
| Repository topics | Done | Added `bettercf` keyword |

### 4. Chrome Web Store Assets

| Item | Status | Notes |
|------|--------|-------|
| Store icon (128×128) | Needs replacement | Must match new BetterCF branding |
| Small promotional tile (440×280) | Not created | Required for Chrome Web Store |
| Large promotional tile (920×680) | Not created | Required for Chrome Web Store |
| Marquee promotional tile (1400×560) | Not created | Optional |
| Screenshots (1280×800) | Need updating | Should show BetterCF branding in UI |
| Description text | Done | Updated in manifest and README |

### 5. Firefox Add-on Assets

| Item | Status | Notes |
|------|--------|-------|
| Add-on icon (64×64) | Not created | Required for Firefox Add-ons |
| Screenshots | Need updating | Should show BetterCF branding |
| Description text | Done | Updated in manifest and README |

### 6. Userscript Assets

| Item | Status | Notes |
|------|--------|-------|
| Userscript icon URL | Updated | Points to `assets/bettercf-logo.png` via raw GitHub |

## Priority Order

1. **Extension icons** (blocker for publishing)
2. **Logo files** (`bettercf-logo.png` + `bettercf-logo.svg`)
3. **Chrome Web Store screenshots**
4. **GitHub social preview**
5. **Promotional tiles** (Chrome Web Store)
6. **Firefox Add-on assets**

## Design Considerations

- Logo should maintain visual continuity with Codeforces design (blue color scheme)
- Icon set should be recognizable at 16px
- SVG logo should work in both light and dark modes
- The `bettercf-` CSS class prefix replaced the old `cfpp-` prefix in all internal identifiers
