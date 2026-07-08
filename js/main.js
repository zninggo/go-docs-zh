
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');

  if (searchInput) {
    fetch('/search-index.json')
      .then(res => res.json())
      .then(index => {
        searchInput.addEventListener('input', function(e) {
          const query = e.target.value.toLowerCase();

          if (query.length < 2) {
            document.querySelectorAll('.doc-card').forEach(card => {
              card.style.display = '';
            });
            return;
          }

          const results = index.filter(item =>
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
          );

          document.querySelectorAll('.doc-card').forEach(card => {
            const href = card.getAttribute('href');
            const found = results.some(r => r.path === href);
            card.style.display = found ? '' : 'none';
          });
        });
      });
  }

  document.querySelectorAll('pre code').forEach(block => {
    if (typeof hljs !== 'undefined') {
      hljs.highlightElement(block);
    }
  });
});
