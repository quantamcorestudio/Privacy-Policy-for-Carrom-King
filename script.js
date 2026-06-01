/* -------------------------------------------------------------
   CARROM KING PRIVACY POLICY JAVASCRIPT
   Core Functionality: Search Engine, Theme Switcher, TOC Observer, 
   Scroll Progress, Contact Form Validation, Responsive Menu
------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. SELECTORS & STATE
    // ==========================================
    const body = document.body;
    const themeToggleBtn = document.getElementById('theme-toggle');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mainHeader = document.getElementById('main-header');
    
    const searchInput = document.getElementById('policy-search');
    const clearSearchBtn = document.getElementById('clear-search');
    const searchResultsCount = document.getElementById('search-results-count');
    const policySections = document.querySelectorAll('.policy-section-block');
    const tocLinks = document.querySelectorAll('.toc-link');
    
    const contactForm = document.getElementById('privacy-contact-form');
    const formFeedback = document.getElementById('form-feedback');
    
    const backToTopBtn = document.getElementById('back-to-top');
    const progressCirclePath = document.querySelector('.progress-circle path');
    
    // Store original HTML contents of sections for restoring text during searches
    const originalSectionContents = new Map();
    policySections.forEach(section => {
        const bodyEl = section.querySelector('.section-body');
        if (bodyEl) {
            originalSectionContents.set(section.id, bodyEl.innerHTML);
        }
    });

    // ==========================================
    // 2. THEME SWITCHING (DARK / LIGHT MODE)
    // ==========================================
    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            body.className = savedTheme;
        } else {
            // Default to dark theme
            body.className = 'dark-theme';
        }
        updateThemeToggleIcon();
    };

    const toggleTheme = () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light-theme');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark-theme');
        }
        updateThemeToggleIcon();
    };

    const updateThemeToggleIcon = () => {
        const icon = themeToggleBtn.querySelector('i');
        if (body.classList.contains('light-theme')) {
            icon.className = 'fa-solid fa-sun';
            themeToggleBtn.style.color = 'var(--color-accent-gold)';
        } else {
            icon.className = 'fa-solid fa-moon';
            themeToggleBtn.style.color = 'var(--text-primary)';
        }
    };

    themeToggleBtn.addEventListener('click', toggleTheme);
    initTheme();

    // ==========================================
    // 3. RESPONSIVE MOBILE NAVIGATION
    // ==========================================
    const toggleMobileMenu = () => {
        mobileNav.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (mobileNav.classList.contains('active')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars';
        }
    };

    mobileMenuBtn.addEventListener('click', toggleMobileMenu);

    // Close mobile menu on clicking any navigation link
    const mobileLinks = document.querySelectorAll('.mobile-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            mobileMenuBtn.querySelector('i').className = 'fa-solid fa-bars';
        });
    });

    // Header compression scroll listener
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
    });

    // ==========================================
    // 4. LIVE CLIENT-SIDE SEARCH ENGINE
    // ==========================================
    const cleanSearchText = (text) => {
        return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // Escape regex special chars
    };

    const performSearch = () => {
        const query = searchInput.value.trim().toLowerCase();
        
        // If query is empty, reset all sections
        if (!query) {
            resetSearch();
            return;
        }

        clearSearchBtn.style.display = 'block';
        let totalMatches = 0;
        const escapedQuery = cleanSearchText(query);
        const regex = new RegExp(`(${escapQuery})`, 'gi');

        policySections.forEach(section => {
            const bodyEl = section.querySelector('.section-body');
            const originalContent = originalSectionContents.get(section.id);
            
            if (!bodyEl || !originalContent) return;

            // Temporary div to parse and search ONLY raw text nodes, avoiding messing up HTML tags
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = originalContent;

            let sectionMatches = 0;

            // Recursive function to parse and highlight text nodes
            const highlightTextNodes = (element) => {
                // If it is a link or specific element we want to process, proceed
                for (let i = 0; i < element.childNodes.length; i++) {
                    const child = element.childNodes[i];
                    
                    if (child.nodeType === Node.TEXT_NODE) {
                        const text = child.nodeValue;
                        if (regex.test(text)) {
                            const matchesInNode = text.match(regex).length;
                            sectionMatches += matchesInNode;
                            totalMatches += matchesInNode;

                            // Create highlighted markup wrapper
                            const span = document.createElement('span');
                            span.innerHTML = text.replace(regex, '<mark class="highlight">$1</mark>');
                            
                            element.replaceChild(span, child);
                        }
                    } else if (child.nodeType === Node.ELEMENT_NODE && 
                               child.tagName !== 'MARK' && 
                               child.tagName !== 'SCRIPT' && 
                               child.tagName !== 'STYLE' &&
                               !child.classList.contains('qs-badge')) {
                        highlightTextNodes(child);
                    }
                }
            };

            highlightTextNodes(tempDiv);

            if (sectionMatches > 0) {
                bodyEl.innerHTML = tempDiv.innerHTML;
                section.classList.add('search-match');
            } else {
                bodyEl.innerHTML = originalContent; // Keep original
                section.classList.remove('search-match');
            }
        });

        // Search feedback formatting
        if (totalMatches > 0) {
            searchResultsCount.textContent = `${totalMatches} match${totalMatches > 1 ? 'es' : ''} found!`;
            searchResultsCount.style.color = 'var(--color-accent-cyan)';
        } else {
            searchResultsCount.textContent = 'No matches found.';
            searchResultsCount.style.color = 'var(--card-danger-text)';
        }
    };

    const resetSearch = () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        searchResultsCount.textContent = '';
        
        policySections.forEach(section => {
            const bodyEl = section.querySelector('.section-body');
            const originalContent = originalSectionContents.get(section.id);
            if (bodyEl && originalContent) {
                bodyEl.innerHTML = originalContent;
            }
            section.classList.remove('search-match');
        });
    };

    // Listeners for live search input
    searchInput.addEventListener('input', performSearch);
    clearSearchBtn.addEventListener('click', resetSearch);

    // Scroll to first match when pressing 'Enter' in search box
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const firstMatch = document.querySelector('mark.highlight');
            if (firstMatch) {
                firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });

    // ==========================================
    // 5. INTERSECTION OBSERVER (TABLE OF CONTENTS)
    // ==========================================
    const observerOptions = {
        root: null, // viewport
        rootMargin: '-20% 0px -60% 0px', // Trigger when section occupies the focal upper-middle zone
        threshold: 0
    };

    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.id;
                
                // Update Sidebar Table of Contents active state
                tocLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${activeId}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });

                // Update styling header line for current section block
                policySections.forEach(section => {
                    if (section.id === activeId) {
                        section.classList.add('active-section');
                    } else {
                        section.classList.remove('active-section');
                    }
                });
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    policySections.forEach(section => observer.observe(section));

    // Smooth navigation click behavior for TOC Links
    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerOffset = 100;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // 6. BACK TO TOP BUTTON WITH PROGRESS CIRCLE
    // ==========================================
    const initScrollProgress = () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight <= 0) return;

        // Path total length: matches the dasharray (307.919)
        const pathLength = 307.919;
        
        // Show/Hide button & calculate progress on scroll
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            // Show / Hide button
            if (currentScroll > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }

            // Calculate percentage and update dashoffset
            const progress = Math.min(Math.max(currentScroll / totalHeight, 0), 1);
            const offset = pathLength - (progress * pathLength);
            progressCirclePath.style.strokeDashoffset = offset;
        });

        // Click to scroll up
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    };

    initScrollProgress();

    // ==========================================
    // 7. CONTACT FORM VALIDATION & SIMULATION
    // ==========================================
    const validateEmail = (email) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    };

    const validateField = (inputEl, errorEl, validatorFn, errorCondition) => {
        const isInvalid = errorCondition ? validatorFn(inputEl.value) : !inputEl.value.trim();
        const parent = inputEl.parentElement;
        
        if (isInvalid) {
            parent.classList.add('invalid');
            return false;
        } else {
            parent.classList.remove('invalid');
            return true;
        }
    };

    // Real-time input checking to clear warnings
    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            input.parentElement.classList.remove('invalid');
        });
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameEl = document.getElementById('form-name');
        const emailEl = document.getElementById('form-email');
        const messageEl = document.getElementById('form-message');

        // Reset previous feedback state
        formFeedback.style.display = 'none';
        formFeedback.className = 'form-feedback-message';

        // Validate all fields
        const isNameValid = validateField(nameEl);
        const isEmailValid = validateField(emailEl, null, (val) => !validateEmail(val), true);
        const isMessageValid = validateField(messageEl);

        if (!isNameValid || !isEmailValid || !isMessageValid) {
            return; // Stop form submission if invalid
        }

        // Simulating highly responsive submitting state
        const submitBtn = contactForm.querySelector('.submit-btn');
        const submitBtnSpan = submitBtn.querySelector('span');
        const submitBtnIcon = submitBtn.querySelector('i');
        
        // Change button state to "Sending..."
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        submitBtnSpan.textContent = 'Sending Message...';
        submitBtnIcon.className = 'fa-solid fa-spinner fa-spin';

        setTimeout(() => {
            // Mock success response
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtnSpan.textContent = 'Send Message';
            submitBtnIcon.className = 'fa-solid fa-paper-plane';

            // Clear inputs
            contactForm.reset();

            // Set beautiful success alert
            formFeedback.textContent = 'Thank you! Your privacy inquiry has been securely sent. Quantam Core will get in touch with you shortly.';
            formFeedback.classList.add('success');
            
            // Auto hide success feedback after 10 seconds
            setTimeout(() => {
                formFeedback.style.display = 'none';
            }, 10000);

        }, 1500); // 1.5s beautiful loading delay
    });
});
