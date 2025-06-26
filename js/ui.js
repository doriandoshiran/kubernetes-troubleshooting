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

// Initialize UI components and functionality
function initializeUIComponents() {
    Logger.info('Initializing UI components');
    Performance.mark('ui-init-start');
    
    try {
        // Initialize core UI components
        initializeScrollToTop();
        initializeProgressIndicator();
        initializeKeyboardNavigation();
        initializeSectionTracking();
        initializeResponsiveHandlers();
        initializeAccessibilityFeatures();
        initializeAnimations();
        
        // Setup UI event listeners
        setupUIEventListeners();
        
        // Initialize theme system
        initializeThemeSystem();
        
        Performance.mark('ui-init-end');
        Performance.measure('ui-initialization', 'ui-init-start', 'ui-init-end');
        
        Logger.info('UI components initialized successfully');
        
    } catch (error) {
        Logger.error('Failed to initialize UI components:', error);
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
            behavior: AppConfig.accessibility.reducedMotion ? 'auto' : 'smooth' 
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
        'ctrl+shift+t': () => toggleTheme(),
        'g h': () => scrollToSection('emergency'),
        'g s': () => scrollToSection('health'),
        'g a': () => scrollToSection('auth'),
        'g p': () => scrollToSection('pods'),
        'g n': () => scrollToSection('services'),
        'g l': () => scrollToSection('logs'),
        'g c': () => scrollToSection('config'),
        'g d': () => scrollToSection('database'),
        'g u': () => scrollToSection('ui'),
        'g f': () => scrollToSection('performance'),
        'g r': () => scrollToSection('security'),
        'g e': () => scrollToSection('recovery'),
        'g m': () => scrollToSection('patterns')
    };
    
    let keySequence = '';
    let sequenceTimeout;
    
    document.addEventListener('keydown', (event) => {
        // Handle single key shortcuts
        const key = event.key.toLowerCase();
        const ctrl = event.ctrlKey || event.metaKey;
        const shift = event.shiftKey;
        
        let shortcutKey = '';
        if (ctrl && shift) shortcutKey += 'ctrl+shift+';
        else if (ctrl) shortcutKey += 'ctrl+';
        else if (shift) shortcutKey += 'shift+';
        shortcutKey += key;
        
        // Check for direct shortcuts
        if (keyboardShortcuts[shortcutKey]) {
            event.preventDefault();
            keyboardShortcuts[shortcutKey]();
            return;
        }
        
        // Handle key sequences (like 'g h' for goto health)
        if (!ctrl && !shift && !event.altKey) {
            keySequence += key;
            
            // Clear timeout for previous sequence
            if (sequenceTimeout) {
                clearTimeout(sequenceTimeout);
            }
            
            // Check if current sequence matches any shortcut
            const matchingShortcut = Object.keys(keyboardShortcuts)
                .find(shortcut => shortcut.startsWith(keySequence));
            
            if (keyboardShortcuts[keySequence]) {
                // Exact match - execute shortcut
                event.preventDefault();
                keyboardShortcuts[keySequence]();
                keySequence = '';
            } else if (matchingShortcut) {
                // Partial match - wait for more keys
                sequenceTimeout = setTimeout(() => {
                    keySequence = '';
                }, 1000);
            } else {
                // No match - reset sequence
                keySequence = '';
            }
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
        // Clear previous timeout
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
            
            // Update scroll button position on mobile
            if (UIComponents.scrollToTopButton) {
                if (viewport.width <= 480) {
                    UIComponents.scrollToTopButton.style.bottom = '20px';
                    UIComponents.scrollToTopButton.style.right = '15px';
                    UIComponents.scrollToTopButton.style.width = '45px';
                    UIComponents.scrollToTopButton.style.height = '45px';
                } else {
                    UIComponents.scrollToTopButton.style.bottom = '80px';
                    UIComponents.scrollToTopButton.style.right = '20px';
                    UIComponents.scrollToTopButton.style.width = '50px';
                    UIComponents.scrollToTopButton.style.height = '50px';
                }
            }
            
            Logger.debug('Viewport resized:', viewport);
        }, 250);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initial call
    handleResize();
}

// Initialize accessibility features
function initializeAccessibilityFeatures() {
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
    
    // Enhance focus management
    enhanceFocusManagement();
    
    // Add ARIA live regions
    addLiveRegions();
    
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
        Logger.debug('Window gained focus');
    });
    
    window.addEventListener('blur', () => {
        Logger.debug('Window lost focus');
    });
    
    // Handle online/offline events
    window.addEventListener('online', () => {
        ComponentFactory.createNotification('Connection restored', 'success', 3000);
        Logger.info('Application is online');
    });
    
    window.addEventListener('offline', () => {
        ComponentFactory.createNotification('Connection lost - some features may not work', 'warning', 5000);
        Logger.warn('Application is offline');
    });
    
    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            Logger.debug('Page became visible');
        } else {
            Logger.debug('Page became hidden');
        }
    });
    
    // Handle print events
    window.addEventListener('beforeprint', () => {
        document.body.classList.add('printing');
        Logger.debug('Print dialog opened');
    });
    
    window.addEventListener('afterprint', () => {
        document.body.classList.remove('printing');
        Logger.debug('Print dialog closed');
    });
}

// Initialize theme system
function initializeThemeSystem() {
    const currentTheme = UserPreferences.get('theme', AppConfig.ui.theme);
    UIState.theme = currentTheme;
    
    // Apply theme
    applyTheme(currentTheme);
    
    // Listen for system theme changes
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (!UserPreferences.get('themeOverride', false)) {
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
    
    Logger.debug(`Theme applied: ${theme}`);
}

// Toggle theme
function toggleTheme() {
    const newTheme = UIState.theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    UIState.theme = newTheme;
    
    // Save preference
    UserPreferences.set('theme', newTheme);
    UserPreferences.set('themeOverride', true);
    
    ComponentFactory.createNotification(`Switched to ${newTheme} theme`, 'info', 2000);
    Logger.info(`Theme toggled to: ${newTheme}`);
}

// Focus search input
function focusSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.focus();
        searchInput.select();
        
        // Scroll search into view if needed
        searchInput.scrollIntoView({ 
            behavior: AppConfig.accessibility.reducedMotion ? 'auto' : 'smooth',
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
        
        ComponentFactory.createNotification('Search cleared', 'info', 1500);
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
                <div class="shortcut-item">
                    <kbd>G</kbd> + <kbd>H</kbd>
                    <span>Go to Emergency section</span>
                </div>
                <div class="shortcut-item">
                    <kbd>G</kbd> + <kbd>S</kbd>
                    <span>Go to System Health section</span>
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
    
    UIComponents.keyboardHelpModal = ComponentFactory.createModal('Keyboard Shortcuts', helpContent, {
        maxWidth: '600px'
    });
}

// Show debug information
function showDebugInfo() {
    const debugInfo = {
        application: {
            name: AppConfig.name,
            version: AppConfig.version,
            lastUpdated: AppConfig.lastUpdated
        },
        state: {
            theme: UIState.theme,
            activeSection: UIState.activeSection,
            scrollPosition: window.pageYOffset
        },
        performance: Performance.getMetrics(),
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
            devicePixelRatio: window.devicePixelRatio,
            colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        },
        features: {
            localStorage: typeof Storage !== 'undefined',
            sessionStorage: typeof sessionStorage !== 'undefined',
            indexedDB: typeof indexedDB !== 'undefined',
            serviceWorker: 'serviceWorker' in navigator,
            webGL: !!window.WebGLRenderingContext,
            touchSupport: 'ontouchstart' in window
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
    console.table(debugInfo.performance);
    console.table(debugInfo.browser);
    console.table(debugInfo.viewport);
    console.table(debugInfo.features);
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
    
    ComponentFactory.createModal('Debug Information', debugContent, {
        maxWidth: '700px'
    });
}

// Scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ 
            behavior: AppConfig.accessibility.reducedMotion ? 'auto' : 'smooth',
            block: 'start' 
        });
        
        // Highlight section briefly
        highlightSection(section);
        
        ComponentFactory.createNotification(`Navigated to ${section.querySelector('.section-title')?.textContent || sectionId}`, 'info', 2000);
    }
}

// Highlight section
function highlightSection(section) {
    const originalBorder = section.style.border;
    const originalBackground = section.style.backgroundColor;
    
    section.style.border = '2px solid #3b82f6';
    section.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
    section.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
        section.style.border = originalBorder;
        section.style.backgroundColor = originalBackground;
        
        setTimeout(() => {
            section.style.transition = '';
        }, 300);
    }, 2000);
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
    // Mobile-specific adjustments
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.style.fontSize = '16px'; // Prevent zoom on iOS
    }
    
    // Adjust notification positioning
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach(notification => {
        notification.style.right = '10px';
        notification.style.left = '10px';
        notification.style.maxWidth = 'none';
    });
    
    Logger.debug('UI adjusted for mobile');
}

// Adjust UI for desktop
function adjustForDesktop() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.style.fontSize = '16px';
    }
    
    // Reset notification positioning
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach(notification => {
        notification.style.right = '20px';
        notification.style.left = 'auto';
        notification.style.maxWidth = '300px';
    });
    
    Logger.debug('UI adjusted for desktop');
}

// Enhance focus management
function enhanceFocusManagement() {
    // Track focus for better keyboard navigation
    let lastFocusedElement = null;
    
    document.addEventListener('focusin', (event) => {
        lastFocusedElement = event.target;
    });
    
    // Restore focus when modals close
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && lastFocusedElement) {
            const modals = document.querySelectorAll('.modal-overlay');
            if (modals.length === 0 && lastFocusedElement !== document.activeElement) {
                lastFocusedElement.focus();
            }
        }
    });
    
    // Improve focus visibility
    const style = document.createElement('style');
    style.textContent = `
        *:focus {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
        }
        
        .command:focus,
        .multi-command:focus {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
            background: #1e293b;
        }
    `;
    document.head.appendChild(style);
}

// Add ARIA live regions
function addLiveRegions() {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    
    const announcements = document.createElement('div');
    announcements.setAttribute('aria-live', 'assertive');
    announcements.setAttribute('aria-atomic', 'true');
    announcements.className = 'sr-only';
    announcements.id = 'announcements';
    
    document.body.appendChild(liveRegion);
    document.body.appendChild(announcements);
}

// Setup reduced motion preferences
function setupReducedMotionPreferences() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const updateMotionPreference = (e) => {
        AppConfig.accessibility.reducedMotion = e.matches;
        
        if (e.matches) {
            document.body.classList.add('reduce-motion');
            Logger.info('Reduced motion enabled');
        } else {
            document.body.classList.remove('reduce-motion');
            Logger.info('Reduced motion disabled');
        }
    };
    
    mediaQuery.addEventListener('change', updateMotionPreference);
    updateMotionPreference(mediaQuery);
}

// Announce to screen readers
function announceToScreenReader(message, priority = 'polite') {
    const regionId = priority === 'assertive' ? 'announcements' : 'live-region';
    const region = document.getElementById(regionId);
    
    if (region) {
        region.textContent = message;
        
        // Clear after announcement
        setTimeout(() => {
            region.textContent = '';
        }, 1000);
    }
}

// Create context menu for commands
function createCommandContextMenu(commandElement, commandText) {
    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.style.cssText = `
        position: absolute;
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 8px 0;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        z-index: 10000;
        min-width: 180px;
        display: none;
    `;
    
    const menuItems = [
        { text: 'Copy Command', action: () => copyToClipboard(commandText) },
        { text: 'Copy as Quote', action: () => copyToClipboard(`"${commandText}"`) },
        { text: 'Share Command', action: () => shareCommand(commandText) },
        { text: 'Explain Command', action: () => explainCommand(commandText) }
    ];
    
    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        menuItem.textContent = item.text;
        menuItem.style.cssText = `
            padding: 8px 16px;
            cursor: pointer;
            color: #e2e8f0;
            font-size: 14px;
            transition: background-color 0.2s ease;
        `;
        
        menuItem.addEventListener('mouseenter', () => {
            menuItem.style.backgroundColor = '#334155';
        });
        
        menuItem.addEventListener('mouseleave', () => {
            menuItem.style.backgroundColor = 'transparent';
        });
        
        menuItem.addEventListener('click', () => {
            item.action();
            contextMenu.style.display = 'none';
        });
        
        contextMenu.appendChild(menuItem);
    });
    
    document.body.appendChild(contextMenu);
    
    commandElement.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${event.pageX}px`;
        contextMenu.style.top = `${event.pageY}px`;
        
        // Adjust position if menu goes off screen
        const rect = contextMenu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            contextMenu.style.left = `${event.pageX - rect.width}px`;
        }
        if (rect.bottom > window.innerHeight) {
            contextMenu.style.top = `${event.pageY - rect.height}px`;
        }
    });
    
    // Hide context menu when clicking elsewhere
    document.addEventListener('click', () => {
        contextMenu.style.display = 'none';
    });
    
    return contextMenu;
}

// Share command functionality
function shareCommand(commandText) {
    if (navigator.share) {
        navigator.share({
            title: 'ArcSight Command',
            text: commandText,
            url: window.location.href
        }).catch(err => {
            Logger.warn('Sharing failed:', err);
            fallbackShare(commandText);
        });
    } else {
        fallbackShare(commandText);
    }
}

// Fallback sharing method
function fallbackShare(commandText) {
    const shareText = `${commandText}\n\nFrom: ${window.location.href}`;
    copyToClipboard(shareText);
    ComponentFactory.createNotification('Command copied with link for sharing!', 'success', 3000);
}

// Explain command functionality
function explainCommand(commandText) {
    // Simple command explanation (could be enhanced with AI/API)
    const explanations = {
        'kubectl get pods': 'Lists all pods in the current namespace',
        'kubectl logs': 'Shows logs from a specific pod',
        'kubectl describe': 'Shows detailed information about a resource',
        'kubectl delete': 'Deletes a specified resource',
        'curl': 'Tests HTTP connectivity to endpoints'
    };
    
    const explanation = Object.keys(explanations).find(cmd => 
        commandText.includes(cmd)
    );
    
    const content = explanation ? 
        `<p><strong>Command:</strong> <code>${commandText}</code></p><p><strong>Explanation:</strong> ${explanations[explanation]}</p>` :
        `<p><strong>Command:</strong> <code>${commandText}</code></p><p>This is a specialized ArcSight troubleshooting command. Refer to the documentation for detailed usage.</p>`;
    
    ComponentFactory.createModal('Command Explanation', content);
}

// Copy command with clipboard API fallback
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers or non-HTTPS
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
            } catch (err) {
                throw new Error('Copy command failed');
            } finally {
                document.body.removeChild(textArea);
            }
        }
        
        announceToScreenReader('Command copied to clipboard');
        Logger.debug('Text copied to clipboard:', text.substring(0, 50) + '...');
        
    } catch (error) {
        Logger.error('Failed to copy to clipboard:', error);
        throw error;
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
window.toggleTheme = toggleTheme;
window.announceToScreenReader = announceToScreenReader;