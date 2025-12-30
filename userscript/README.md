# SoldBy – Reveal Sellers on Amazon (US Fork)

[![Install](https://img.shields.io/badge/-Install-%23607f01?style=flat-square)](https://github.com/jssellars/soldby/raw/main/SoldBy.user.js)
[![Report Issue](https://img.shields.io/badge/-Report%20issue-%23c3513b?style=flat-square)](https://github.com/jssellars/soldby/issues)

> **Community-maintained U.S.-only fork** of the original *SoldBy – Reveal Sellers on Amazon* userscript.

This userscript displays **third-party seller name, country of origin, and ratings** directly on Amazon product listings — so you can immediately see **who you’re actually buying from**, not just the product branding.

This fork is intentionally scoped to **Amazon.com (United States)** only and includes performance and stability improvements tailored to that marketplace.

---

## What this fork does

- Displays seller **name**, **country**, and **feedback rating**
- Clearly distinguishes **Amazon vs third-party sellers**
- Highlights sellers based on configurable country rules
- Caches seller data locally to reduce Amazon rate-limiting
- Adds basic heuristics to flag **low-confidence sellers**
- Uses request throttling to minimize 503 blocks

---

## Fork scope (important)

This fork **only supports**:

- 🇺🇸 **amazon.com**

All other Amazon marketplaces have been deliberately removed to:
- Reduce selector drift
- Avoid cross-region data bleed
- Improve performance and reliability
- Keep the maintenance surface small and predictable

If you need multi-region support, use the upstream project instead.

---

## Attribution & lineage

This project is a **fork** of:

- **SoldBy – Reveal Sellers on Amazon**  
  Original Author: **Tad Wohlrapp**  
  Original Repository: https://github.com/tadwohlrapp/soldby  
  License: **MIT**

All original credit is preserved in accordance with the MIT license.  
This fork introduces U.S.-specific scope and additional stability improvements.

---

## Installation

### 1. Install a userscript manager

You’ll need one of the following browser extensions:

- [Violentmonkey](https://violentmonkey.github.io/) (recommended)
- [Tampermonkey](https://tampermonkey.net/)

### 2. Install the script

Click the **Install** button above, or install directly from this repository:
https://github.com/jssellars/soldby/raw/main/SoldBy.user.js

Your userscript manager will prompt you to confirm installation.

---

## Configuration

After installation:

1. Scroll to the **very bottom of any Amazon.com page**
2. Click the **⚙️ SoldBy** button in the footer
3. Configure:
   - Countries to highlight
   - Cache duration
   - Hide vs highlight behavior

Settings are stored locally in your browser.

---

## Screenshot

<img width="720" alt="Screenshot" src="https://user-images.githubusercontent.com/2788192/171596756-b16fd466-fd5e-4869-95d5-92918cab2a98.png">

*(Screenshot from upstream project — UI remains largely identical.)*

---

## About Amazon rate limiting (503 errors)

Amazon aggressively rate-limits automated access to seller profile pages. When this happens, seller pages temporarily return **503 errors**, preventing seller details from loading.

This fork mitigates the issue by:

- Throttling seller profile requests
- Caching seller results in local storage
- Reusing cached data when possible

If a 503 does occur, the script will still display the seller name so you can at least identify **Amazon vs third-party** listings.

---

## Support & issues

Issues, suggestions, and improvements for **this fork** should be filed here:

👉 https://github.com/jssellars/soldby/issues

Please do **not** report fork-specific issues to the upstream project.

---

## License

MIT License  
© Original work by Tad Wohlrapp  
© Modifications and maintenance by Justin Sellars
