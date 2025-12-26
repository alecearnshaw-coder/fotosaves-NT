// Shared footer component - replicates breadcrumbs at page bottom
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        // Poll until breadcrumbs have content (max 5 seconds)
        let attempts = 0;
        const maxAttempts = 50;
        const checkInterval = setInterval(function() {
            attempts++;
            const breadcrumbs = document.getElementById('breadcrumbs');
            if (breadcrumbs && breadcrumbs.innerHTML.trim() !== '') {
                clearInterval(checkInterval);
                buildFooter();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.warn('Footer: breadcrumbs not populated after 5s');
            }
        }, 100);
    });

    function buildFooter() {
        // Get the original breadcrumbs content
        const topBreadcrumbs = document.getElementById('breadcrumbs');
        if (!topBreadcrumbs || !topBreadcrumbs.innerHTML.trim()) return;

        // Find the container element (where to append footer)
        const container = document.querySelector('.container');
        if (!container) return;

        // Create footer element
        const footer = document.createElement('footer');
        footer.id = 'site-footer';
        footer.className = 'site-footer';

        // Clone the breadcrumbs
        const breadcrumbsClone = topBreadcrumbs.cloneNode(true);
        breadcrumbsClone.id = 'footer-breadcrumbs';
        breadcrumbsClone.className = 'footer-breadcrumbs';

        // Build footer HTML with visible divider
        footer.innerHTML = `
            <hr class="footer-divider">
            <div class="footer-nav-title">
                <span class="footer-title-es">Navegación</span> / <span class="footer-title-en">Navigation</span>
            </div>
        `;
        
        // Add cloned breadcrumbs
        footer.appendChild(breadcrumbsClone);

        // Add footer links row (all on one line, using | as language separator)
        const linksRow = document.createElement('div');
        linksRow.className = 'footer-links';
        linksRow.innerHTML = `
            <a href="/index_sp.html" class="footer-link"><span class="es">Inicio</span></a>
            <span class="footer-sep-lang">|</span>
            <a href="/index_english.html" class="footer-link"><span class="en">Home</span></a>
            <span class="footer-sep-dot">•</span>
            <a href="/Aves.html" class="footer-link"><span class="es">Aves</span></a>
            <span class="footer-sep-lang">|</span>
            <a href="/Birds.html" class="footer-link"><span class="en">Birds</span></a>
        `;
        footer.appendChild(linksRow);

        // Add copyright row
        const copyrightRow = document.createElement('div');
        copyrightRow.className = 'footer-copyright';
        copyrightRow.innerHTML = `© ${new Date().getFullYear()} Alec Earnshaw - www.fotosaves.com.ar`;
        footer.appendChild(copyrightRow);

        // Insert footer after container
        container.parentNode.insertBefore(footer, container.nextSibling);
    }
})();
