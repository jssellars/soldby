// ==UserScript==
// @name            SoldBy – Reveal Sellers on Amazon (US-Only Fork)
// @description     Displays seller name, country, and ratings on Amazon.com.
//                  Highlights any non-US third-party sellers.
// @namespace       https://github.com/jssellars/soldby
// @author          Justin Sellars
// @contributors    Tad Wohlrapp (Original Author)
// @version         1.7.4-us-only
// @license         MIT
// @homepageURL     https://github.com/jssellars/soldby
// @supportURL      https://github.com/jssellars/soldby/issues
// @icon            https://raw.githubusercontent.com/jssellars/soldby/main/assets/logo.png
// @match           https://www.amazon.com/*
// @compatible      firefox Violentmonkey / Tampermonkey
// @compatible      chrome Violentmonkey / Tampermonkey
// ==/UserScript==


(function () {
  'use strict';

  function onInit() {
    const FILTER_SETTING_KEY = 'soldby-filter-us-only';

    function isFilterEnabled() {
      return localStorage.getItem(FILTER_SETTING_KEY) === 'true';
    }

    function setFilterEnabled(enabled) {
      localStorage.setItem(FILTER_SETTING_KEY, String(enabled));
    }

    function isUsSeller(product) {
      const sellerName = product.dataset.sellerName || '';
      const sellerCountry = product.dataset.sellerCountry || '';

      return sellerName.includes('Amazon') || sellerCountry === 'US';
    }

    function updateFilterState(product) {
      if (!product || !product.classList) return;

      if (!isFilterEnabled()) {
        product.classList.remove('product--filtered');
        return;
      }

      if (!product.dataset.sellerName || product.dataset.sellerName === 'loading...') {
        return;
      }

      if (isUsSeller(product)) {
        product.classList.remove('product--filtered');
      } else {
        product.classList.add('product--filtered');
      }
    }

    function applyFilterToAllProducts() {
      document.querySelectorAll('[data-seller-name]').forEach(updateFilterState);
    }

    function createFilterToggle() {
      if (document.querySelector('.seller-filter-toggle')) return;

      const toggle = document.createElement('label');
      toggle.className = 'seller-filter-toggle';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = isFilterEnabled();
      checkbox.addEventListener('change', () => {
        setFilterEnabled(checkbox.checked);
        applyFilterToAllProducts();
      });

      const text = document.createElement('span');
      text.textContent = 'Hide non-US sellers';

      toggle.appendChild(checkbox);
      toggle.appendChild(text);

      document.body.appendChild(toggle);
    }

    function showSellerCountry() {

      // Gets the ASIN for every visible product and sets it as "data-asin" attribute
      getAsin();

      // Identify products by looking for "data-asin" attribute
      const productsWithAsinSelectors = [
        'div[data-asin]',
        'not([data-asin=""])',
        'not([data-seller-name])',
        'not([data-uuid*=s-searchgrid-carousel])',
        'not([role="img"])',
        'not(#averageCustomerReviews)',
        'not(#detailBullets_averageCustomerReviews)',
        'not(.inline-twister-swatch)',
        'not(.contributorNameID)',
        'not(.a-hidden)',
        'not(.rpi-learn-more-card-content)',
        'not(#reviews-image-gallery-container)',
        'not([class*=_cross-border-widget_style_preload-widget])',
        'not([data-video-url])'
      ];
      const products = document.querySelectorAll(productsWithAsinSelectors.join(':'));

      // If no new products are found, return.
      if (products.length == 0) return;

      products.forEach((product) => {

        // Give each product the data-seller-name attribute to prevent re-capturing.
        product.dataset.sellerName = 'loading...';

        createInfoBox(product);



        if (localStorage.getItem(asinKey(product))) {
          getSellerIdAndNameFromLocalStorage(product);
        } else {
          getSellerIdAndNameFromProductPage(product);
        }
      });
    }

    // Run script once on document ready
    createFilterToggle();
    showSellerCountry();

    // Initialize new MutationObserver
    const mutationObserver = new MutationObserver(showSellerCountry);

    // Let MutationObserver target the grid containing all thumbnails
    const targetNode = document.body;

    const mutationObserverOptions = {
      childList: true,
      subtree: true
    }

    // Run MutationObserver
    mutationObserver.observe(targetNode, mutationObserverOptions);

    function parse(html) {
      const parser = new DOMParser();
      return parser.parseFromString(html, 'text/html');
    }

    function getAsin() {

      // Check current page for products (without "data-asin" attribute)
      const productSelectors = [
@@ -405,83 +468,88 @@
    function populateInfoBox(product) {
      const container = product.querySelector('.seller-info-ct');
      const infoBox = container.querySelector('.seller-info');
      const icon = container.querySelector('.seller-icon');
      const text = container.querySelector('.seller-text');

      // remove loading spinner
      icon.classList.remove('seller-loading');

      // replace "loading..." with real seller name
      text.textContent = product.dataset.sellerName;

      if (product.dataset.sellerId && product.dataset.sellerId !== 'Amazon') {
        // Create link to seller profile if sellerId is valid
        const anchor = document.createElement('a');
        anchor.classList.add('seller-link');
        anchor.appendChild(infoBox);
        container.appendChild(anchor);
        anchor.href = window.location.origin + '/sp?seller=' + product.dataset.sellerId;
      }

      if (product.dataset.blocked) {
        icon.textContent = '⚠️';
        icon.style.fontSize = "1.5em";
        infoBox.title = 'Error 503: Too many requests. Amazon blocked seller page. Please try again in a few minutes.';
        updateFilterState(product);
        return;
      }

      if (product.dataset.sellerName.includes('Amazon')) {
        // Seller is Amazon or one of its subsidiaries (Warehouse, UK, US, etc.)
        const amazonIcon = document.createElement('img');
        amazonIcon.src = '/favicon.ico';
        icon.appendChild(amazonIcon);
        infoBox.title = product.dataset.sellerName;
        updateFilterState(product);
        return;
      }

      // 1. Set icon, create infoBox title (if country known)
      if (product.dataset.sellerCountry && product.dataset.sellerCountry != '?') {
        icon.textContent = getFlagEmoji(product.dataset.sellerCountry);
        infoBox.title = (new Intl.DisplayNames([document.documentElement.lang], { type: 'region' })).of(product.dataset.sellerCountry) + ' | ';
      } else {
        icon.textContent = '❓';
        icon.style.fontSize = "1.5em";
      }

      if (!product.dataset.sellerId) {
        console.error('No seller found', product);
        updateFilterState(product);
        return;
      }

      // 2. Append name to infoBox title
      infoBox.title += product.dataset.sellerName;

      // 3. Append rating to text and infoBox title
      const ratingText = `(${product.dataset.sellerRatingScore} | ${product.dataset.sellerRatingCount})`;
      text.textContent += ` ${ratingText}`;
      infoBox.title += ` ${ratingText}`;

      updateFilterState(product);
    }

    function findTitle(product) {
      //TODO switch case
      try {
        let title;
        if (product.dataset.avar) {
          title = product.querySelector('.a-color-base.a-spacing-none.a-link-normal');
        } else if (product.parentElement.classList.contains('a-carousel-card')) {
          if (product.classList.contains('a-section') && product.classList.contains('a-spacing-none')) {
            title = product.querySelector('.a-link-normal');
          } else if (product.querySelector('.a-truncate:not([data-a-max-rows="1"])') !== null) {
            title = product.querySelector('.a-truncate');
          } else if (product.querySelector('h2') !== null) {
            title = product.getElementsByTagName("h2")[0];
          } else {
            title = product.querySelectorAll('.a-link-normal')[1];
          }
        } else if (product.id == 'gridItemRoot' || product.closest('#zg') !== null) {
          title = product.querySelectorAll('.a-link-normal')[1];
        } else if (product.classList.contains('octopus-pc-item-v3')) {
          title = product.querySelectorAll('.octopus-pc-asin-title, .octopus-pc-dotd-title')[0];
        } else if (product.classList.contains('octopus-pc-lightning-deal-item-v3')) {
          title = product.querySelector('.octopus-pc-deal-title');
        } else if (product.querySelector('.sponsored-products-truncator-truncated') !== null) {
@@ -588,50 +656,71 @@


  // convert storage item age from millisecs to days and hours
  function readableItemAge(ms) {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const daysms = ms % (24 * 60 * 60 * 1000);
    const hours = Math.floor(daysms / (60 * 60 * 1000));
    return days + ' days and ' + hours + ' hours';
  }

  function addGlobalStyle(css) {
    const head = document.getElementsByTagName('head')[0];
    if (!head) return;
    const style = document.createElement('style');
    style.innerHTML = css;
    head.appendChild(style);
  }

  addGlobalStyle(`

    .seller-info-ct {
      cursor: default;
      margin-top: 4px;
    }

    .seller-filter-toggle {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 9999;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      background: #fff;
      border: 1px solid #d5d9d9;
      border-radius: 8px;
      box-shadow: 0 2px 5px 0 rgb(213 217 217 / 50%);
      font-size: 12px;
      color: #1d1d1d;
    }

    .seller-filter-toggle input {
      accent-color: #0f1111;
    }

    .seller-info {
      display: inline-flex;
      gap: 4px;
      background: #fff;
      font-size: 0.9em;
      padding: 2px 4px;
      border: 1px solid #d5d9d9;
      border-radius: 4px;
      max-width: 100%;
    }

    .seller-loading {
      display: inline-block;
      width: 0.8em;
      height: 0.8em;
      border: 3px solid rgb(255 153 0 / 30%);
      border-radius: 50%;
      border-top-color: #ff9900;
      animation: spin 1s ease-in-out infinite;
      margin: 1px 3px 0;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
@@ -740,31 +829,34 @@
    .sbx-desktop .seller-info-ct {
      margin: 0;
    }

    .sp-shoveler .seller-info-ct {
      margin: -2px 0 3px;
    }

    .p13n-sc-shoveler .seller-info-ct {
      margin: 0;
    }

    .octopus-pc-item-image-section-v3 {
      text-align: center;
    }

    #rhf .a-section.a-spacing-mini {
      text-align: center;
    }

    a:hover.a-color-base,
    a:hover.seller-link {
      text-decoration: none;
    }

    .product--filtered {
      display: none !important;
    }

  `);

  onInit();

})();
