document.getElementById('footer-year').textContent = new Date().getFullYear();

// Progressive-enhancement search filter — all articles remain visible
// and readable without JavaScript.
(function () {
  var input = document.getElementById('help-search');
  var status = document.getElementById('search-status');
  var articles = Array.prototype.slice.call(document.querySelectorAll('.article'));
  var categories = Array.prototype.slice.call(document.querySelectorAll('.category'));

  if (!input) return;

  var form = document.getElementById('help-search-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
    });
  }

  input.addEventListener('input', function () {
    var query = input.value.trim().toLowerCase();
    var visibleCount = 0;

    articles.forEach(function (article) {
      var text = article.textContent.toLowerCase();
      var matches = query === '' || text.indexOf(query) !== -1;
      article.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    categories.forEach(function (category) {
      var visibleArticles = category.querySelectorAll('.article:not([hidden])');
      category.hidden = query !== '' && visibleArticles.length === 0;
    });

    status.textContent =
      query === ''
        ? ''
        : visibleCount === 0
          ? 'No articles match "' + input.value.trim() + '".'
          : visibleCount + ' article' + (visibleCount === 1 ? '' : 's') + ' found.';
  });
})();
