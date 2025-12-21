// Species Search - Autocomplete search across Spanish, English, and Scientific names
(function() {
    let searchData = null;
    let isLoaded = false;
    let isExpanded = false;

    // Load search index on first expansion
    async function loadSearchIndex() {
        if (isLoaded) return;
        try {
            const resp = await fetch('/data/species_search.json');
            const json = await resp.json();
            searchData = json.data || [];
            isLoaded = true;
        } catch (e) {
            console.error('Failed to load search index:', e);
            searchData = [];
        }
    }

    // Search function - matches against all 3 name fields
    function searchSpecies(query) {
        if (!searchData || query.length < 2) return [];
        const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        const results = searchData.filter(sp => {
            const sci = (sp.sci || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const spName = (sp.sp || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const en = (sp.en || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return sci.includes(q) || spName.includes(q) || en.includes(q);
        });
        
        // Sort: prefer matches at start of name
        results.sort((a, b) => {
            const aStart = (a.sci || '').toLowerCase().startsWith(q) || 
                           (a.sp || '').toLowerCase().startsWith(q) || 
                           (a.en || '').toLowerCase().startsWith(q);
            const bStart = (b.sci || '').toLowerCase().startsWith(q) || 
                           (b.sp || '').toLowerCase().startsWith(q) || 
                           (b.en || '').toLowerCase().startsWith(q);
            if (aStart && !bStart) return -1;
            if (!aStart && bStart) return 1;
            return (a.sci || '').localeCompare(b.sci || '');
        });
        
        return results.slice(0, 12); // Limit to 12 results
    }

    // Highlight matching text
    function highlight(text, query) {
        if (!text) return '';
        const q = query.toLowerCase();
        const idx = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                       .indexOf(q.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
        if (idx === -1) return escapeHtml(text);
        const before = text.slice(0, idx);
        const match = text.slice(idx, idx + query.length);
        const after = text.slice(idx + query.length);
        return escapeHtml(before) + '<mark>' + escapeHtml(match) + '</mark>' + escapeHtml(after);
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // Toggle search expansion
    function toggleSearch() {
        const container = document.getElementById('species-search');
        const input = document.getElementById('species-search-input');
        const results = document.getElementById('species-search-results');
        
        isExpanded = !isExpanded;
        container.classList.toggle('expanded', isExpanded);
        
        if (isExpanded) {
            loadSearchIndex();
            input.focus();
        } else {
            input.value = '';
            results.innerHTML = '';
            results.style.display = 'none';
        }
    }

    // Handle input
    function handleInput(e) {
        const query = e.target.value.trim();
        const results = document.getElementById('species-search-results');
        
        if (query.length < 2) {
            results.innerHTML = '';
            results.style.display = 'none';
            return;
        }
        
        const matches = searchSpecies(query);
        
        if (matches.length === 0) {
            results.innerHTML = '<div class="search-no-results">No se encontraron resultados / No results found</div>';
            results.style.display = 'block';
            return;
        }
        
        let html = '';
        matches.forEach(sp => {
            const url = `/especie?speciesId=${sp.id}&imagesPath=${encodeURIComponent(sp.path)}`;
            html += `<a href="${url}" class="search-result">
                <div class="search-result-sci">${highlight(sp.sci, query)}</div>
                <div class="search-result-names">
                    <span class="search-result-sp">${highlight(sp.sp, query)}</span>
                    <span class="search-result-en">${highlight(sp.en, query)}</span>
                </div>
            </a>`;
        });
        
        results.innerHTML = html;
        results.style.display = 'block';
    }

    // Close on click outside
    function handleClickOutside(e) {
        const container = document.getElementById('species-search');
        if (container && isExpanded && !container.contains(e.target)) {
            toggleSearch();
        }
    }

    // Close on Escape key
    function handleKeydown(e) {
        if (e.key === 'Escape' && isExpanded) {
            toggleSearch();
        }
    }

    // Initialize when DOM ready
    function init() {
        const btn = document.getElementById('species-search-btn');
        const input = document.getElementById('species-search-input');
        
        if (btn) btn.addEventListener('click', toggleSearch);
        if (input) {
            input.addEventListener('input', handleInput);
            input.addEventListener('keydown', handleKeydown);
        }
        
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleKeydown);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();


