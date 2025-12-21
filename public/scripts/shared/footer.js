// Shared footer component - replicates breadcrumbs at page bottom
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        // Wait a bit for breadcrumbs to be built first
        setTimeout(buildFooter, 100);
    });

    function buildFooter() {
        // Get the original breadcrumbs content
        const topBreadcrumbs = document.getElementById('breadcrumbs');
        if (!topBreadcrumbs) return;

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

        // Build footer HTML
        footer.innerHTML = `
            <div class="footer-divider"></div>
            <div class="footer-nav-title">
                <span class="footer-title-es">Navegación</span> / <span class="footer-title-en">Navigation</span>
            </div>
        `;
        
        // Add cloned breadcrumbs
        footer.appendChild(breadcrumbsClone);

        // Add footer links row
        const linksRow = document.createElement('div');
        linksRow.className = 'footer-links';
        linksRow.innerHTML = `
            <a href="/index_sp.html" class="footer-link"><span class="es">Inicio</span></a>
            <span class="footer-sep">|</span>
            <a href="/index_english.html" class="footer-link"><span class="en">Home</span></a>
            <span class="footer-sep">•</span>
            <a href="/Aves.html" class="footer-link"><span class="es">Aves</span></a>
            <span class="footer-sep">|</span>
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

