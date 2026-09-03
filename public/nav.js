// Shared hamburger-menu behavior for .site-nav, used by every page (the
// static HTML pages and the blog's Next.js layout alike) so the toggle
// logic lives in one place instead of five copies.
(function () {
  document.querySelectorAll('.site-nav').forEach(function (nav) {
    var toggle = nav.querySelector('.site-nav__toggle');
    var links = nav.querySelector('.site-nav__links');
    if (!toggle || !links) return;

    function close() {
      nav.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  });
})();
