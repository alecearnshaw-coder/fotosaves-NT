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

        // Remove the last breadcrumb cell (current page - not a link)
        const breadcrumbRow = breadcrumbsClone.querySelector('tr');
        if (breadcrumbRow && breadcrumbRow.lastElementChild) {
            breadcrumbRow.removeChild(breadcrumbRow.lastElementChild);
        }

        // Build footer HTML with visible divider
        footer.innerHTML = `
            <hr class="footer-divider">
            <div class="footer-nav-title">
                <span class="footer-title-es">Navegación</span> / <span class="footer-title-en">Navigation</span>
            </div>
        `;
        
        // Add cloned breadcrumbs (without the last cell)
        footer.appendChild(breadcrumbsClone);

        // Add copyright row
        const copyrightRow = document.createElement('div');
        copyrightRow.className = 'footer-copyright';
        copyrightRow.innerHTML = `© ${new Date().getFullYear()} Alec Earnshaw - www.fotosaves.com.ar`;
        footer.appendChild(copyrightRow);

        // Insert footer after container
        container.parentNode.insertBefore(footer, container.nextSibling);
    }
})();
