// Shared copyright year function
// Sets the current year in an element with id="copyright-year"
function setCopyrightYear() {
    const yearEl = document.getElementById('copyright-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// Auto-run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setCopyrightYear);
} else {
    setCopyrightYear();
}

