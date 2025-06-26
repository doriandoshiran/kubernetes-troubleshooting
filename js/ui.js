/**
 * ArcSight Troubleshooting Guide - UI Management
 * Handles UI-specific functionality, interactions, and enhancements
 */

// UI State management
const UIState = {
    theme: 'dark',
    sidebarCollapsed: false,
    activeSection: null,
    scrollPosition: 0,
    isScrolling: false,
    resizeTimeout: null
};

// UI Components manager
const UIComponents = {
    scrollToTopButton: null,
    loadingOverlay: null,
    searchResultsCount: null,
    sectionProgress: null,
    keyboardHelpModal: null
};

// Initialize accessibility features
function initializeAccessibility() {
    // Add skip link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link sr-only-focusable';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #3b82f6;
        color: white;
        padding: 8px 12px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10000;
        transition: top 0.3s ease;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Setup reduced motion preferences
    setupReducedMotionPreferences();
}

// Initialize animations
function initializeAnimations() {
    // Add intersection observer for fade-in animations
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                animationObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe sections for animation
    const sectionsToAnimate = document.querySelectorAll('.section, .pattern-card, .command-group');
    sectionsToAnimate.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        animationObserver.observe(section);
    });
    
    // Add CSS for fade-in animation
    if (!document.getElementById('animation-styles')) {
        const style = document.createElement('style');
        style.id = 'animation-styles';
        style.textContent = `
            .fade-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
            
            @media (prefers-reduced-motion: reduce) {
                .fade-in,
                .section,
                .pattern-card,
                .command-group {
                    opacity: 1 !important;
                    transform: none !important;
                    transition: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Setup UI event listeners
function setupUIEventListeners() {
    // Handle window focus/blur
    window.addEventListener('focus', () => {
        console.log('Window gained focus');
    });
    
    window.addEventListener('blur', () => {
        console.log('Window lost focus');
    });
    
    // Handle online/offline events
    window.addEventListener('online', () => {
        if (typeof ComponentFactory !== 'undefined') {
            ComponentFactory.createNotification('Connection restored', 'success', 3000);
        }
        console.log('Application is online');
    });
    
    window.addEventListener('offline', () => {
        if (typeof ComponentFactory !== 'undefined') {
            ComponentFactory.createNotification('Connection lost - some features may not work', 'warning', 5000);
        }
        console.warn('Application is offline');
    });
    
    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            console.log('Page became visible');
        } else {
            console.log('Page became hidden');
        }
    });
}

// Initialize theme system
function initializeThemeSystem() {
    const currentTheme = getUserPreference('theme', 'dark');
    UIState.theme = currentTheme;
    
    // Apply theme
    applyTheme(currentTheme);
    
    // Listen for system theme changes
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (!getUserPreference('themeOverride', false)) {
                const newTheme = e.matches ? 'dark' : 'light';
                applyTheme(newTheme);
                UIState.theme = newTheme;
            }
        });
    }
}

// Apply theme
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = document.body.className.replace(/theme-\w+/g, '') + ` theme-${theme}`;
    
    // Update meta theme-color for mobile browsers
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
        metaTheme = document.createElement('meta');
        metaTheme.name = 'theme-color';
        document.head.appendChild(metaTheme);
    }
    
    metaTheme.content = theme === 'dark' ? '#0f172a' : '#ffffff';
    
    console.log(`Theme applied: ${theme}`);
}

// Toggle theme
function toggleTheme() {
    const newTheme = UIState.theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    UIState.theme = newTheme;
    
    // Save preference
    setUserPreference('theme', newTheme);
    setUserPreference('themeOverride', true);
    
    if (typeof ComponentFactory !== 'undefined') {
        ComponentFactory.createNotification(`Switched to ${newTheme} theme`, 'info', 2000);
    }
    console.log(`Theme toggled to: ${newTheme}`);
}

// Focus search input
function focusSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.focus();
        searchInput.select();
        
        // Scroll search into view if needed
        searchInput.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center' 
        });
    }
}

// Clear search
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        searchInput.blur();
        
        if (typeof ComponentFactory !== 'undefined') {
            ComponentFactory.createNotification('Search cleared', 'info', 1500);
        }
    }
}

// Show keyboard help
function showKeyboardHelp() {
    const helpContent = `
        <div class="keyboard-help">
            <div class="help-section">
                <h4>Navigation</h4>
                <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>K</kbd>
                    <span>Focus search</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Escape</kbd>
                    <span>Clear search / Close modals</span>
                </div>
            </div>
            
            <div class="help-section">
                <h4>Actions</h4>
                <div class="shortcut-item">
                    <kbd>Enter</kbd> / <kbd>Space</kbd>
                    <span>Copy focused command</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Tab</kbd>
                    <span>Navigate between commands</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>T</kbd>
                    <span>Toggle theme</span>
                </div>
            </div>
            
            <div class="help-section">
                <h4>Debug</h4>
                <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>/</kbd>
                    <span>Show this help</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd>
                    <span>Show debug information</span>
                </div>
            </div>
        </div>
        
        <style>
            .keyboard-help { padding: 10px 0; }
            .help-section { margin-bottom: 20px; }
            .help-section:last-child { margin-bottom: 0; }
            .help-section h4 { 
                color: #3b82f6; 
                margin-bottom: 10px; 
                font-size: 14px;
                border-bottom: 1px solid #334155;
                padding-bottom: 5px;
            }
            .shortcut-item { 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                padding: 6px 0; 
                font-size: 13px;
            }
            kbd { 
                background: #334155; 
                padding: 2px 6px; 
                border-radius: 3px; 
                font-size: 11px; 
                margin: 0 2px;
                border: 1px solid #475569;
            }
        </style>
    `;
    
    if (UIComponents.keyboardHelpModal) {
        document.body.removeChild(UIComponents.keyboardHelpModal);
    }
    
    if (typeof ComponentFactory !== 'undefined') {
        UIComponents.keyboardHelpModal = ComponentFactory.createModal('Keyboard Shortcuts', helpContent, {
            maxWidth: '600px'
        });
    }
}

// Show debug information
function showDebugInfo() {
    const debugInfo = {
        application: {
            name: 'ArcSight Troubleshooting Guide',
            version: '4.0',
            initialized: window.AppState ? window.AppState.initialized : false
        },
        state: {
            theme: UIState.theme,
            activeSection: UIState.activeSection,
            scrollPosition: window.pageYOffset
        },
        browser: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        },
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio
        },
        stats: {
            commandCount: document.querySelectorAll('.command, .multi-command').length,
            sectionCount: document.querySelectorAll('.section').length,
            totalElements: document.querySelectorAll('*').length
        }
    };
    
    console.group('🔍 ArcSight Troubleshooting Guide - Debug Information');
    console.table(debugInfo.application);
    console.table(debugInfo.state);
    console.table(debugInfo.browser);
    console.table(debugInfo.viewport);
    console.table(debugInfo.stats);
    console.groupEnd();
    
    const debugContent = `
        <div class="debug-info">
            <pre style="font-size: 12px; line-height: 1.4; overflow: auto; max-height: 400px; background: #0f172a; padding: 15px; border-radius: 6px; color: #e2e8f0;">${JSON.stringify(debugInfo, null, 2)}</pre>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #334155;">
                <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                    💡 Debug information has also been logged to the browser console
                </p>
            </div>
        </div>
    `;
    
    if (typeof ComponentFactory !== 'undefined') {
        ComponentFactory.createModal('Debug Information', debugContent, {
            maxWidth: '700px'
        });
    }
}

// Update active navigation link
function updateActiveNavLink(sectionId) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Add active class to current section link
    const activeLink = document.querySelector(`.nav-card[href="#${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Update URL without triggering page reload
function updateURL(sectionId) {
    if (history.pushState) {
        const newURL = `${window.location.pathname}${window.location.search}#${sectionId}`;
        history.replaceState(null, null, newURL);
    }
}

// Adjust UI for mobile devices
function adjustForMobile() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.style.fontSize = '16px'; // Prevent zoom on iOS
    }
    
    console.log('UI adjusted for mobile');
}

// Adjust UI for desktop
function adjustForDesktop() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.style.fontSize = '16px';
    }
    
    console.log('UI adjusted for desktop');
}

// Setup reduced motion preferences
function setupReducedMotionPreferences() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const updateMotionPreference = (e) => {
        if (e.matches) {
            document.body.classList.add('reduce-motion');
            console.log('Reduced motion enabled');
        } else {
            document.body.classList.remove('reduce-motion');
            console.log('Reduced motion disabled');
        }
    };
    
    mediaQuery.addEventListener('change', updateMotionPreference);
    updateMotionPreference(mediaQuery);
}

// User preferences helpers
function getUserPreference(key, defaultValue = null) {
    try {
        const value = localStorage.getItem('arcsight-guide-' + key);
        return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
        console.warn('Failed to get user preference:', error);
        return defaultValue;
    }
}

function setUserPreference(key, value) {
    try {
        localStorage.setItem('arcsight-guide-' + key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.warn('Failed to set user preference:', error);
        return false;
    }
}

// Export UI functionality
window.UIState = UIState;
window.UIComponents = UIComponents;
window.initializeUIComponents = initializeUIComponents;
window.focusSearch = focusSearch;
window.clearSearch = clearSearch;
window.showKeyboardHelp = showKeyboardHelp;
window.showDebugInfo = showDebugInfo;
window.toggleTheme = toggleTheme; UI components and functionality
function initializeUIComponents() {
    console.log('Initializing UI components');
    
    try {
        // Initialize core UI components
        initializeScrollToTop();
        initializeProgressIndicator();
        initializeKeyboardNavigation();
        initializeSectionTracking();
        initializeResponsiveHandlers();
        initializeAccessibility();
        initializeAnimations();
        
        // Setup UI event listeners
        setupUIEventListeners();
        
        // Initialize theme system
        initializeThemeSystem();
        
        console.log('UI components initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize UI components:', error);
        throw error;
    }
}

// Initialize scroll-to-top functionality
function initializeScrollToTop() {
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '↑';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    scrollBtn.setAttribute('title', 'Scroll to top');
    
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: #3b82f6;
        color: white;
        border: none;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        z-index: 1000;
        display: none;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        backdrop-filter: blur(10px);
    `;
    
    // Hover effects
    scrollBtn.addEventListener('mouseenter', () => {
        scrollBtn.style.background = '#2563eb';
        scrollBtn.style.transform = 'scale(1.1)';
    });
    
    scrollBtn.addEventListener('mouseleave', () => {
        scrollBtn.style.background = '#3b82f6';
        scrollBtn.style.transform = 'scale(1)';
    });
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ 
            top: 0, 
            behavior: 'smooth'
        });
        
        // Focus on search input after scrolling to top
        setTimeout(() => {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
            }
        }, 500);
    });
    
    // Show/hide based on scroll position
    let isVisible = false;
    const toggleScrollButton = () => {
        const shouldShow = window.pageYOffset > 300;
        
        if (shouldShow && !isVisible) {
            scrollBtn.style.display = 'block';
            setTimeout(() => {
                scrollBtn.style.opacity = '1';
                scrollBtn.style.transform = 'translateY(0)';
            }, 10);
            isVisible = true;
        } else if (!shouldShow && isVisible) {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.transform = 'translateY(10px)';
            setTimeout(() => {
                scrollBtn.style.display = 'none';
            }, 300);
            isVisible = false;
        }
    };
    
    // Throttled scroll listener
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(toggleScrollButton, 10);
    });
    
    document.body.appendChild(scrollBtn);
    UIComponents.scrollToTopButton = scrollBtn;
}

// Initialize progress indicator
function initializeProgressIndicator() {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'reading-progress';
    progressContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: rgba(51, 65, 85, 0.3);
        z-index: 9999;
        pointer-events: none;
    `;
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.cssText = `
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #3b82f6, #8b5cf6);
        transition: width 0.1s ease;
    `;
    
    progressContainer.appendChild(progressBar);
    document.body.appendChild(progressContainer);
    
    // Update progress on scroll
    const updateProgress = () => {
        const scrollTop = window.pageYOffset;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / documentHeight) * 100;
        
        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    };
    
    window.addEventListener('scroll', updateProgress);
    UIComponents.sectionProgress = { container: progressContainer, bar: progressBar };
}

// Initialize keyboard navigation
function initializeKeyboardNavigation() {
    const keyboardShortcuts = {
        'ctrl+k': () => focusSearch(),
        'ctrl+/': () => showKeyboardHelp(),
        'escape': () => clearSearch(),
        'ctrl+shift+d': () => showDebugInfo(),
        'ctrl+shift+t': () => toggleTheme()
    };
    
    document.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();
        const ctrl = event.ctrlKey || event.metaKey;
        const shift = event.shiftKey;
        
        let shortcutKey = '';
        if (ctrl && shift) shortcutKey += 'ctrl+shift+';
        else if (ctrl) shortcutKey += 'ctrl+';
        shortcutKey += key;
        
        if (keyboardShortcuts[shortcutKey]) {
            event.preventDefault();
            keyboardShortcuts[shortcutKey]();
        }
    });
}

// Initialize section tracking
function initializeSectionTracking() {
    const sections = document.querySelectorAll('.section[id]');
    if (sections.length === 0) return;
    
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0.1
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                UIState.activeSection = entry.target.id;
                updateActiveNavLink(entry.target.id);
                updateURL(entry.target.id);
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
}

// Initialize responsive handlers
function initializeResponsiveHandlers() {
    const handleResize = () => {
        if (UIState.resizeTimeout) {
            clearTimeout(UIState.resizeTimeout);
        }
        
        UIState.resizeTimeout = setTimeout(() => {
            const viewport = {
                width: window.innerWidth,
                height: window.innerHeight
            };
            
            // Update mobile-specific behaviors
            if (viewport.width <= 768) {
                adjustForMobile();
            } else {
                adjustForDesktop();
            }
            
            console.log('Viewport resized:', viewport);
        }, 250);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
}

// Initialize