// ==UserScript==
// @name         Fast Automation Portal Loader
// @namespace    https://github.com/catvang/fast-portal
// @version      2.0.0
// @description  Tự động nạp Fast Automation Portal từ GitHub CDN jsDelivr
// @author       catvang
// @match        *://*/FastBusinessOnline/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function loadFromCdn() {
  'use strict';

  // 1. Nạp file CSS từ CDN
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdn.jsdelivr.net/gh/catvang/fast-portal@main/style.css';
  document.head.appendChild(link);

  // 2. Nạp file JavaScript từ CDN
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/gh/catvang/fast-portal@main/app.js';
  script.defer = true;
  document.body.appendChild(script);
})();