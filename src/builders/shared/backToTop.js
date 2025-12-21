// Floating "Back to Top" button
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        createBackToTopButton();
    });

    function createBackToTopButton() {
        // Create the button
        const btn = document.createElement('a');
        btn.id = 'floating-back-to-top';
        btn.href = '#top';
        btn.className = 'floating-back-to-top';
        btn.setAttribute('aria-label', 'Back to top');
        btn.innerHTML = `
            <span class="btn-arrow">⬆</span>
            <span class="btn-tooltip">
                <span class="tip-es">Volver arriba</span><br>
                <span class="tip-en">Back to top</span>
            </span>
        `;

        // Add to body
        document.body.appendChild(btn);

        // Show/hide based on scroll position
        let isVisible = false;
        const showThreshold = 300; // pixels from top before showing

        function toggleVisibility() {
            const scrollY = window.scrollY || window.pageYOffset;
            
            if (scrollY > showThreshold && !isVisible) {
                btn.classList.add('is-visible');
                isVisible = true;
            } else if (scrollY <= showThreshold && isVisible) {
                btn.classList.remove('is-visible');
                isVisible = false;
            }
        }

        // Throttled scroll handler
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    toggleVisibility();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Initial check
        toggleVisibility();

        // Smooth scroll to top on click
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
})();

