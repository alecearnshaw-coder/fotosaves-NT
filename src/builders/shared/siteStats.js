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
            
        } catch (e) {
            console.error('Failed to load site stats:', e);
        }
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


