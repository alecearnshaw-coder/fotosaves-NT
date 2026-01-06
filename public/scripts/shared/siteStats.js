// Load and display site statistics from SiteStats.json
(function() {
    async function loadSiteStats() {
        try {
            const resp = await fetch('/data/taxonomy/SiteStats.json');
            const stats = await resp.json();

            // Format numbers with locale-appropriate separators
            const speciesCount = stats.Birds_Total_Species_Count || 0;
            const imagesCount = stats.Birds_Total_Images_Count || 0;
            const generatedAt = stats.generated_at || '';

            // Extract year from generated_at date
            const currentYear = generatedAt ? generatedAt.split('-')[0] : new Date().getFullYear();

            // Update Spanish elements
            const spSpecies = document.getElementById('stats-species-sp');
            const spImages = document.getElementById('stats-images-sp');
            const spDate = document.getElementById('stats-date-sp');

            if (spSpecies) spSpecies.textContent = speciesCount.toLocaleString('es-AR');
            if (spImages) spImages.textContent = imagesCount.toLocaleString('es-AR');
            if (spDate) spDate.textContent = formatDateSpanish(generatedAt);

            // Update English elements
            const enSpecies = document.getElementById('stats-species-en');
            const enImages = document.getElementById('stats-images-en');
            const enDate = document.getElementById('stats-date-en');

            if (enSpecies) enSpecies.textContent = speciesCount.toLocaleString('en-US');
            if (enImages) enImages.textContent = imagesCount.toLocaleString('en-US');
            if (enDate) enDate.textContent = formatDateEnglish(generatedAt);

            // Update copyright dates
            updateCopyrightDates(currentYear);

            // Create obfuscated email links
            createObfuscatedEmails();

        } catch (e) {
            console.error('Failed to load site stats:', e);
            // Fallback to current year if stats fail to load
            updateCopyrightDates(new Date().getFullYear());
            createObfuscatedEmails();
        }
    }

    function updateCopyrightDates(year) {
        // Update all copyright date spans
        const copyrightElements = document.querySelectorAll('.copyright-year');
        copyrightElements.forEach(element => {
            if (element.textContent === '2025') {
                element.textContent = year;
            }
        });

        // Also update any text that contains "1992-2025" pattern (but avoid double replacement)
        const allTextNodes = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = allTextNodes.nextNode()) {
            if (node.textContent && node.textContent.includes('1992-2025')) {
                node.textContent = node.textContent.replace('1992-2025', `1992-${year}`);
            }
        }
    }

    function createObfuscatedEmails() {
        // Replace mailto links with JavaScript-obfuscated versions
        const emailLinks = document.querySelectorAll('a[href*="sinectis"]');
        emailLinks.forEach(link => {
            const user = 'fotosaves.contact';
            const domain = 'gmail.com';
            const subject = 'FotosAves inquiry';
            link.href = `mailto:${user}@${domain}?subject=${encodeURIComponent(subject)}`;
            link.textContent = link.textContent.replace('sinectis.com.ar', `${domain}`);
        });
    }
    
    function formatDateSpanish(dateStr) {
        if (!dateStr) return '';
        const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const [year, month, day] = dateStr.split('-');
        return `${parseInt(day)} de ${months[parseInt(month) - 1]} de ${year}`;
    }
    
    function formatDateEnglish(dateStr) {
        if (!dateStr) return '';
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
        const [year, month, day] = dateStr.split('-');
        return `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSiteStats);
    } else {
        loadSiteStats();
    }
})();


