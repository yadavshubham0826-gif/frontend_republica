document.addEventListener('DOMContentLoaded', function () {
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('primary-nav');
    var header = document.querySelector('.site-header');
    var main = document.getElementById('main-content');
    var siteLogoEl = document.getElementById('site-logo');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var isOpen = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });

        nav.addEventListener('click', function (e) {
            var target = e.target;
            if (target && target.tagName === 'A' && nav.classList.contains('open')) {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Offset main content to account for fixed header height
    function applyHeaderOffset() {
        if (!header || !main) return;
        var rect = header.getBoundingClientRect();
        var height = rect.height;
        main.style.paddingTop = height + 'px';
    }
    applyHeaderOffset();
    window.addEventListener('resize', applyHeaderOffset);

    // Try to load logo from common paths/names
    // Ensure logo scales to header height if needed
    if (siteLogoEl && header) {
        function syncLogoHeight() {
            var h = header.getBoundingClientRect().height;
            var target = Math.max(40, Math.min(80, Math.round(h * 0.45))); // 45% of header height, clamped
            siteLogoEl.style.height = target + 'px';
        }
        syncLogoHeight();
        window.addEventListener('resize', syncLogoHeight);
    }

    // Slideshow functionality
    function initializeSlideshow(containerSelector) {
        var container = document.querySelector(containerSelector);
        if (!container) return;

        var slides = container.querySelectorAll('.slide');
        var dots = container.querySelectorAll('.dot');
        var prevBtn = container.querySelector('.slide-nav.prev');
        var nextBtn = container.querySelector('.slide-nav.next');
        var currentSlide = 0;
        var slideInterval;

        function showSlide(index) {
            slides.forEach(function(slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === index);
            });
            currentSlide = index;
        }

        function nextSlide() {
            var next = (currentSlide + 1) % slides.length;
            showSlide(next);
        }

        function prevSlide() {
            var prev = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(prev);
        }

        function startSlideshow() {
            stopSlideshow(); // Ensure only one interval is running at a time
            slideInterval = setInterval(nextSlide, 4000); // Auto-advance every 4 seconds
        }

        function stopSlideshow() {
            clearInterval(slideInterval);
        }

        // Event listeners
        if (nextBtn) nextBtn.addEventListener('click', function() { stopSlideshow(); nextSlide(); startSlideshow(); });
        if (prevBtn) prevBtn.addEventListener('click', function() { stopSlideshow(); prevSlide(); startSlideshow(); });
        
        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                stopSlideshow();
                showSlide(index);
                startSlideshow();
            });
        });

        // Start slideshow
        if (slides.length > 0) {
            showSlide(0); // Initialize first slide
            startSlideshow();
        }
    }

    initializeSlideshow('.slideshow-container:not(.small-slideshow)'); // Initialize main slideshow
    initializeSlideshow('.slideshow-container.small-slideshow'); // Initialize small slideshow


    // Fade-out effect on scroll
    const faders = document.querySelectorAll('.section');

    const appearOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }
            entry.target.classList.remove('fade-out');
            appearOnScroll.unobserve(entry.target);
        });
    }, appearOptions);

    faders.forEach(fader => {
        fader.classList.add('fade-out'); // Initially hide all sections
        appearOnScroll.observe(fader);
    });

    // Dropdown functionality with distance-based hiding
    var dropdowns = document.querySelectorAll('.dropdown');
    var hideTimeouts = {};
    var distanceThreshold = 75; // 2cm approximately (75px at 96 DPI)
    
    function getDistanceFromElement(mouseX, mouseY, element) {
        var rect = element.getBoundingClientRect();
        
        // Calculate distance from mouse to nearest edge of element
        var nearestX = Math.max(rect.left, Math.min(mouseX, rect.right));
        var nearestY = Math.max(rect.top, Math.min(mouseY, rect.bottom));
        
        var dx = mouseX - nearestX;
        var dy = mouseY - nearestY;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    function hideDropdown(dropdown) {
        dropdown.classList.remove('show');
        var menu = dropdown.querySelector('.dropdown-menu');
        if (menu) {
            menu.style.display = 'none';
            menu.style.opacity = '0';
            menu.style.visibility = 'hidden';
        }
    }
    
    function showDropdown(dropdown) {
        var dropdownId = dropdown.getAttribute('data-dropdown-id') || 'default';
        if (hideTimeouts[dropdownId]) {
            clearTimeout(hideTimeouts[dropdownId]);
            delete hideTimeouts[dropdownId];
        }
        dropdown.classList.add('show');
        var menu = dropdown.querySelector('.dropdown-menu');
        if (menu) {
            menu.style.display = 'block';
            menu.style.opacity = '1';
            menu.style.visibility = 'visible';
        }
    }
    
    // Single mousemove listener for all dropdowns
    document.addEventListener('mousemove', function(e) {
        if (window.innerWidth <= 640) return;
        
        dropdowns.forEach(function(dropdown) {
            if (dropdown.classList.contains('show')) {
                var dropdownLink = dropdown.querySelector('a');
                var dropdownMenu = dropdown.querySelector('.dropdown-menu');
                var dropdownId = dropdown.getAttribute('data-dropdown-id') || 'default';
                
                if (dropdownLink && dropdownMenu) {
                    var distance = getDistanceFromElement(e.clientX, e.clientY, dropdownMenu);
                    
                    // Check if mouse is still over button
                    var buttonRect = dropdownLink.getBoundingClientRect();
                    var isOverButton = (
                        e.clientX >= buttonRect.left &&
                        e.clientX <= buttonRect.right &&
                        e.clientY >= buttonRect.top &&
                        e.clientY <= buttonRect.bottom
                    );
                    
                    // Check if mouse is over menu
                    var menuRect = dropdownMenu.getBoundingClientRect();
                    var isOverMenu = (
                        e.clientX >= menuRect.left &&
                        e.clientX <= menuRect.right &&
                        e.clientY >= menuRect.top &&
                        e.clientY <= menuRect.bottom
                    );
                    
                    if (distance > distanceThreshold && !isOverButton && !isOverMenu) {
                        if (!hideTimeouts[dropdownId]) {
                            hideTimeouts[dropdownId] = setTimeout(function() {
                                hideDropdown(dropdown);
                                delete hideTimeouts[dropdownId];
                            }, 100);
                        }
                    } else {
                        if (hideTimeouts[dropdownId]) {
                            clearTimeout(hideTimeouts[dropdownId]);
                            delete hideTimeouts[dropdownId];
                        }
                    }
                }
            }
        });
    });
    
    dropdowns.forEach(function(dropdown, index) {
        dropdown.setAttribute('data-dropdown-id', 'dropdown-' + index);
        var dropdownLink = dropdown.querySelector('a');
        var dropdownMenu = dropdown.querySelector('.dropdown-menu');
        
        if (dropdownLink && dropdownMenu) {
            // Show dropdown on hover over button
            dropdownLink.addEventListener('mouseenter', function() {
                if (window.innerWidth > 640) {
                    showDropdown(dropdown);
                }
            });
            
            // Keep dropdown visible when hovering over menu
            dropdownMenu.addEventListener('mouseenter', function() {
                if (window.innerWidth > 640) {
                    showDropdown(dropdown);
                }
            });
            
            // Hide on mouse leave from dropdown area
            dropdown.addEventListener('mouseleave', function() {
                if (window.innerWidth > 640) {
                    var dropdownId = dropdown.getAttribute('data-dropdown-id');
                    hideTimeouts[dropdownId] = setTimeout(function() {
                        hideDropdown(dropdown);
                        delete hideTimeouts[dropdownId];
                    }, 100);
                }
            });
            
            // Mobile click functionality
            dropdownLink.addEventListener('click', function(e) {
                if (window.innerWidth <= 640) {
                    e.preventDefault();
                    dropdown.classList.toggle('open');
                }
            });
        }
    });

    // Smooth scroll to anchor links with offset for fixed header
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                var targetId = href.substring(1);
                var targetElement = document.getElementById(targetId);
                if (targetElement) {
                    e.preventDefault();
                    var headerHeight = header ? header.getBoundingClientRect().height : 80;
                    var targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});


