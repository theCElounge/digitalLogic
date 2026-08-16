/* ============================================================
   COURSE SITE SCRIPT — site.js
   Shared behaviors for every course page:
   1. Light/dark theme toggle (persists, respects OS setting)
   2. "On this page" table of contents (built from sections)
   3. Scroll spy — highlights the section you're reading
   No dependencies. Safe to load on any page using the template.
   ============================================================ */
(function () {
    'use strict';

    /* ---------- 1. THEME ---------- */
    var root = document.documentElement;

    function storedTheme() {
        try { return localStorage.getItem('course-theme'); } catch (e) { return null; }
    }
    function systemTheme() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark' : 'light';
    }
    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        var btn = document.querySelector('.theme-toggle');
        if (btn) {
            var dark = theme === 'dark';
            btn.setAttribute('aria-pressed', String(dark));
            btn.innerHTML = (dark ? '☀️' : '🌙') +
                '<span class="theme-label">' + (dark ? 'Light' : 'Dark') + '</span>';
            btn.setAttribute('aria-label', 'Switch to ' + (dark ? 'light' : 'dark') + ' theme');
        }
    }

    // Apply immediately to avoid a flash of the wrong theme.
    applyTheme(storedTheme() || systemTheme());

    document.addEventListener('DOMContentLoaded', function () {
        applyTheme(root.getAttribute('data-theme') || 'light');

        var btn = document.querySelector('.theme-toggle');
        if (btn) {
            btn.addEventListener('click', function () {
                var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                applyTheme(next);
                try { localStorage.setItem('course-theme', next); } catch (e) { /* private mode */ }
            });
        }

        buildToc();
    });

    /* ---------- 2. TABLE OF CONTENTS ---------- */
    function slugify(text) {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
    }

    function buildToc() {
        var tocHost = document.querySelector('[data-toc]');
        var main = document.querySelector('main');
        if (!tocHost || !main) { return; }

        var sections = main.querySelectorAll('section.section, section');
        var entries = [];
        var seen = {};

        sections.forEach(function (sec) {
            var heading = sec.querySelector('h2, h1, h3');
            if (!heading) { return; }
            var id = sec.id;
            if (!id) {
                id = slugify(heading.textContent) || 'section';
                var base = id, n = 2;
                while (seen[id] || document.getElementById(id)) { id = base + '-' + n++; }
                sec.id = id;
            }
            seen[id] = true;
            entries.push({ id: id, text: heading.textContent.trim() });
        });

        if (entries.length < 2) { tocHost.remove(); return; }

        var details = document.createElement('details');
        var summary = document.createElement('summary');
        summary.textContent = 'On this page';
        details.appendChild(summary);

        var nav = document.createElement('nav');
        nav.setAttribute('aria-label', 'On this page');
        var ul = document.createElement('ul');
        entries.forEach(function (e) {
            var li = document.createElement('li');
            var a = document.createElement('a');
            a.href = '#' + e.id;
            a.textContent = e.text;
            li.appendChild(a);
            ul.appendChild(li);
        });
        nav.appendChild(ul);
        details.appendChild(nav);
        tocHost.appendChild(details);

        // Open on wide screens, collapsed on small ones.
        var mq = window.matchMedia('(min-width: 1024px)');
        function syncOpen() { details.open = mq.matches; }
        syncOpen();
        if (mq.addEventListener) { mq.addEventListener('change', syncOpen); }

        watchSections(entries, ul);
    }

    /* ---------- 3. SCROLL SPY ---------- */
    function watchSections(entries, ul) {
        if (!('IntersectionObserver' in window)) { return; }
        var links = {};
        ul.querySelectorAll('a').forEach(function (a) {
            links[a.getAttribute('href').slice(1)] = a;
        });
        var current = null;
        var observer = new IntersectionObserver(function (obs) {
            obs.forEach(function (entry) {
                if (entry.isIntersecting) {
                    if (current) { current.removeAttribute('aria-current'); }
                    current = links[entry.target.id];
                    if (current) { current.setAttribute('aria-current', 'true'); }
                }
            });
        }, { rootMargin: '-20% 0px -70% 0px' });

        entries.forEach(function (e) {
            var el = document.getElementById(e.id);
            if (el) { observer.observe(el); }
        });
    }
}());
