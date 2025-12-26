// Floating "Back to Top" button
(function() {
    // Run after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createBackToTopButton);
    } else {
        createBackToTopButton();
    }

    function createBackToTopButton() {
        console.log('Creating back-to-top button...');
        
        // Create the button
        const btn = document.createElement('a');
        btn.id = 'floating-back-to-top';
        btn.href = '#top';
        btn.className = 'floating-back-to-top';
        btn.setAttribute('aria-label', 'Back to top');
        btn.innerHTML = '▲';
        btn.title = 'Volver arriba / Back to top';

        // Add to body
        document.body.appendChild(btn);
        console.log('Button added to DOM');

        // Show/hide based on scroll position
        const showThreshold = 300;

        function updateVisibility() {
            const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollY > showThreshold) {
                btn.style.opacity = '0.85';
                btn.style.visibility = 'visible';
                btn.style.transform = 'translateY(0)';
            } else {
                btn.style.opacity = '0';
                btn.style.visibility = 'hidden';
                btn.style.transform = 'translateY(20px)';
            }
        }

        // Listen to scroll
        window.addEventListener('scroll', updateVisibility, { passive: true });
        
        // Initial check
        updateVisibility();

        // Smooth scroll on click
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Hover effects
        btn.addEventListener('mouseenter', function() {
            if (btn.style.visibility === 'visible') {
                btn.style.opacity = '1';
                btn.style.transform = 'translateY(-3px)';
            }
        });
        btn.addEventListener('mouseleave', function() {
            if (btn.style.visibility === 'visible') {
                btn.style.opacity = '0.85';
                btn.style.transform = 'translateY(0)';
            }
        });
    }
})();
