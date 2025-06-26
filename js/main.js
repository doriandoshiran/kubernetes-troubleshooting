/**
 * ArcSight Troubleshooting Guide - Main JavaScript
 * Handles initialization and coordination of all components
 */

// Initialize configuration FIRST
if (typeof initializeConfig === 'function') {
    initializeConfig();
}

// Application state
const AppState = {
    isLoaded: false,
    commandCount: 0,
    sections: [],
    searchActive: false,
    currentTheme: 'dark'
};

// DOM elements cache
const Elements = {
    loadingOverlay: null,
    searchInput: null,
    commandCountElement: null,
    sectionsContainer: null,
    body: null
};

// Initialize the application
async function initializeApp() {
    try {
        Logger.info('Starting ArcSight Troubleshooting Guide initialization');
        Performance.mark('app-init-start');
        
        // Cache DOM elements
        cacheElements();
        
        // Show loading overlay
        showLoadingOverlay();
        
        // Initialize components in order with error handling
        await initializeComponents();
        
        // Load and render sections
        await loadSections();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize UI enhancements
        initializeUI();
        
        // Hide loading overlay
        hideLoadingOverlay();
        
        // Mark app as loaded
        AppState.isLoaded = true;
        
        Performance.mark('app-init-end');
        Performance.measure('app-initialization', 'app-init-start', 'app-init-end');
        
        // Show success notification
        showSuccessNotification();
        
        Logger.info('ArcSight Troubleshooting Guide loaded successfully');
        
    } catch (error) {
        Logger.error('Failed to initialize app:', error);
        hideLoadingOverlay();
        showErrorNotification('Failed to load the troubleshooting guide. Please check the console for details.');
        
        // Show error details in loading overlay
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.innerHTML = `
                <div class="loading-spinner">
                    <div style="color: #ef4444; font-size: 24px; margin-bottom: 20px;">❌</div>
                    <p style="color: #ef4444; font-weight: bold;">Loading Failed</p>
                    <p style="color: #94a3b8; font-size: 14px; max-width: 400px; text-align: center;">
                        ${error.message || 'Unknown error occurred'}
                    </p>
                    <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
                        Press F12 and check the Console for more details
                    </p>
                    <button onclick="location.reload()" style="
                        margin-top: 20px;
                        padding: 10px 20px;
                        background: #3b82f6;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                    ">Try Again</button>
                </div>
            `;
            loadingOverlay.style.display = 'flex';
        }
    }
}

// Cache frequently used DOM elements
function cacheElements() {
    try {
        Elements.loadingOverlay = document.getElementById('loading-overlay');
        Elements.searchInput = document.getElementById('searchInput');
        Elements.commandCountElement = document.getElementById('commandCount');
        Elements.sectionsContainer = document.getElementById('sections-container');
        Elements.body = document.body;
        
        // Verify critical elements exist
        if (!Elements.sectionsContainer) {
            throw new Error('Critical element #sections-container not found in DOM');
        }
        
        Logger.debug('DOM elements cached successfully');
    } catch (error) {
        Logger.error('Failed to cache DOM elements:', error);
        throw error;
    }
}

// Initialize all components with error handling
async function initializeComponents() {
    try {
        Logger.info('Initializing components...');
        
        // Initialize search functionality
        if (typeof initializeSearch === 'function') {
            initializeSearch();
            Logger.debug('Search functionality initialized');
        } else {
            Logger.warn('initializeSearch function not available');
        }
        
        // Initialize UI components
        if (typeof initializeUIComponents === 'function') {
            initializeUIComponents();
            Logger.debug('UI components initialized');
        } else {
            Logger.warn('initializeUIComponents function not available');
        }
        
        // Initialize components system
        if (typeof initializeComponents === 'function') {
            window.initializeComponents();
            Logger.debug('Component system initialized');
        }
        
        // Initialize copy-to-clipboard functionality
        initializeCopyFunctionality();
        
        // Initialize keyboard shortcuts
        initializeKeyboardShortcuts();
        
        // Initialize smooth scrolling
        initializeSmoothScrolling();
        
        // Initialize accessibility features
        initializeAccessibility();
        
        Logger.info('All components initialized successfully');
        
    } catch (error) {
        Logger.error('Failed to initialize components:', error);
        throw error;
    }
}

// Load and render sections from data
async function loadSections() {
    try {
        Logger.info('Loading sections...');
        
        // Check if getSectionsData function exists
        if (typeof getSectionsData !== 'function') {
            throw new Error('getSectionsData function not found. Make sure data.js is loaded.');
        }
        
        // Get sections data
        const sectionsData = getSectionsData();
        
        if (!sectionsData || !Array.isArray(sectionsData)) {
            throw new Error('Invalid sections data returned from getSectionsData');
        }
        
        if (sectionsData.length === 0) {
            throw new Error('No sections data available');
        }
        
        // Render sections
        renderSections(sectionsData);
        
        // Update command count
        updateCommandCount();
        
        // Store sections in state
        AppState.sections = sectionsData;
        
        Logger.info(`Successfully loaded ${sectionsData.length} sections`);
        
    } catch (error) {
        Logger.error('Failed to load sections:', error);
        throw error;
    }
}

// Render sections to the DOM
function renderSections(sectionsData) {
    const container = Elements.sectionsContainer;
    
    if (!container) {
        throw new Error('Sections container not found');
    }
    
    try {
        // Clear existing content
        container.innerHTML = '';
        
        // Render each section
        sectionsData.forEach((section, index) => {
            try {
                const sectionElement = createSectionElement(section);
                container.appendChild(sectionElement);
                Logger.debug(`Rendered section ${index + 1}: ${section.title}`);
            } catch (error) {
                Logger.error(`Failed to render section ${index + 1}:`, error);
                // Continue with other sections
            }
        });
        
        Logger.info(`Successfully rendered ${sectionsData.length} sections`);
        
    } catch (error) {
        Logger.error('Failed to render sections:', error);
        throw error;
    }
}

// Create a section element
function createSectionElement(sectionData) {
    if (!sectionData || !sectionData.id || !sectionData.title) {
        throw new Error('Invalid section data');
    }
    
    const section = document.createElement('section');
    section.className = 'section';
    section.id = sectionData.id;
    
    // Create section header
    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `<h2 class="section-title">${sectionData.title}</h2>`;
    
    // Create section content
    const content = document.createElement('div');
    content.className = 'section-content';
    
    // Add command groups
    if (sectionData.commandGroups && Array.isArray(sectionData.commandGroups)) {
        sectionData.commandGroups.forEach(group => {
            try {
                const groupElement = createCommandGroupElement(group);
                content.appendChild(groupElement);
            } catch (error) {
                Logger.warn('Failed to create command group:', error);
            }
        });
    }
    
    // Add pattern cards if available
    if (sectionData.patterns && Array.isArray(sectionData.patterns)) {
        sectionData.patterns.forEach(pattern => {
            try {
                const patternElement = createPatternElement(pattern);
                content.appendChild(patternElement);
            } catch (error) {
                Logger.warn('Failed to create pattern element:', error);
            }
        });
    }
    
    section.appendChild(header);
    section.appendChild(content);
    
    return section;
}

// Create a command group element
function createCommandGroupElement(groupData) {
    if (!groupData || !groupData.title) {
        throw new Error('Invalid command group data');
    }
    
    const group = document.createElement('div');
    group.className = 'command-group';
    
    // Add group title
    const title = document.createElement('h4');
    title.textContent = groupData.title;
    group.appendChild(title);
    
    // Add commands
    if (groupData.commands && Array.isArray(groupData.commands)) {
        groupData.commands.forEach(command => {
            try {
                const commandElement = createCommandElement(command);
                group.appendChild(commandElement);
            } catch (error) {
                Logger.warn('Failed to create command element:', error);
            }
        });
    }
    
    return group;
}

// Create a command element
function createCommandElement(commandData) {
    if (!commandData || !commandData.command) {
        throw new Error('Invalid command data');
    }
    
    const container = document.createElement('div');
    
    // Create command element
    const command = document.createElement('div');
    command.className = commandData.type === 'multi' ? 'multi-command' : 'command';
    command.textContent = commandData.command;
    command.setAttribute('tabindex', '0');
    command.setAttribute('role', 'button');
    command.setAttribute('aria-label', 'Click to copy command to clipboard');
    
    container.appendChild(command);
    
    // Add description if available
    if (commandData.description) {
        const desc = document.createElement('div');
        desc.className = 'description';
        desc.textContent = commandData.description;
        container.appendChild(desc);
    }
    
    // Add usage note if available
    if (commandData.usage) {
        const usage = document.createElement('div');
        usage.className = 'usage-note';
        usage.textContent = commandData.usage;
        container.appendChild(usage);
    }
    
    // Add warning if available
    if (commandData.warning) {
        const warning = document.createElement('div');
        warning.className = 'warning';
        warning.textContent = commandData.warning;
        container.appendChild(warning);
    }
    
    return container;
}

// Create a pattern element
function createPatternElement(patternData) {
    if (!patternData || !patternData.title) {
        throw new Error('Invalid pattern data');
    }
    
    const pattern = document.createElement('div');
    pattern.className = 'pattern-card';
    
    // Add title
    const title = document.createElement('div');
    title.className = 'pattern-title';
    title.textContent = patternData.title;
    pattern.appendChild(title);
    
    // Add symptoms
    if (patternData.symptoms) {
        const symptoms = document.createElement('div');
        symptoms.className = 'symptom';
        symptoms.textContent = patternData.symptoms;
        pattern.appendChild(symptoms);
    }
    
    // Add solution
    if (patternData.solution) {
        const solution = document.createElement('div');
        solution.className = 'solution';
        solution.textContent = patternData.solution;
        pattern.appendChild(solution);
    }
    
    // Add commands if available
    if (patternData.commands && Array.isArray(patternData.commands)) {
        patternData.commands.forEach(command => {
            try {
                const commandElement = createCommandElement(command);
                pattern.appendChild(commandElement);
            } catch (error) {
                Logger.warn('Failed to create pattern command:', error);
            }
        });
    }
    
    return pattern;
}

// Initialize copy-to-clipboard functionality
function initializeCopyFunctionality() {
    try {
        // Use event delegation for better performance
        document.addEventListener('click', async (event) => {
            const target = event.target;
            
            if (target.matches('.command, .multi-command')) {
                await handleCopyCommand(target);
            }
        });
        
        // Add keyboard support
        document.addEventListener('keydown', async (event) => {
            const target = event.target;
            
            if (target.matches('.command, .multi-command') && 
                (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                await handleCopyCommand(target);
            }
        });
        
        Logger.debug('Copy functionality initialized');
    } catch (error) {
        Logger.error('Failed to initialize copy functionality:', error);
    }
}

// Handle copying command to clipboard
async function handleCopyCommand(element) {
    try {
        const text = cleanCommandText(element.textContent);
        await copyToClipboard(text);
        
        // Show visual feedback
        showCopyFeedback(element);
        
        Logger.debug('Command copied:', text.substring(0, 50) + '...');
        
    } catch (error) {
        Logger.error('Failed to copy command:', error);
        showCopyError(element);
    }
}

// Clean command text for copying
function cleanCommandText(text) {
    return text
        .replace(/^\$ /, '') // Remove command prompt
        .replace(/📋.*$/, '') // Remove copy instruction
        .trim();
}

// Copy text to clipboard
async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers or non-HTTPS
        return new Promise((resolve, reject) => {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    resolve();
                } else {
                    reject(new Error('Copy command failed'));
                }
            } catch (err) {
                reject(err);
            } finally {
                document.body.removeChild(textArea);
            }
        });
    }
}

// Show copy feedback animation
function showCopyFeedback(element) {
    element.classList.add('copied');
    setTimeout(() => {
        element.classList.remove('copied');
    }, 600);
}

// Show copy error feedback
function showCopyError(element) {
    const originalBg = element.style.backgroundColor;
    element.style.backgroundColor = '#ef4444';
    element.style.transition = 'background-color 0.3s ease';
    
    setTimeout(() => {
        element.style.backgroundColor = originalBg;
        setTimeout(() => {
            element.style.transition = '';
        }, 300);
    }, 300);
}

// Initialize keyboard shortcuts
function initializeKeyboardShortcuts() {
    try {
        document.addEventListener('keydown', (event) => {
            // Ctrl+K or Cmd+K to focus search
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                focusSearch();
            }
            
            // Escape to clear search
            if (event.key === 'Escape') {
                if (Elements.searchInput === document.activeElement) {
                    clearSearch();
                }
            }
            
            // Ctrl+/ to show help
            if (event.ctrlKey && event.key === '/') {
                event.preventDefault();
                if (typeof showKeyboardHelp === 'function') {
                    showKeyboardHelp();
                }
            }
            
            // Ctrl+Shift+D for debug info
            if (event.ctrlKey && event.shiftKey && event.key === 'D') {
                event.preventDefault();
                if (typeof showDebugInfo === 'function') {
                    showDebugInfo();
                }
            }
        });
        
        Logger.debug('Keyboard shortcuts initialized');
    } catch (error) {
        Logger.error('Failed to initialize keyboard shortcuts:', error);
    }
}

// Focus search input
function focusSearch() {
    if (Elements.searchInput) {
        Elements.searchInput.focus();
        Elements.searchInput.select();
    }
}

// Clear search
function clearSearch() {
    if (Elements.searchInput) {
        Elements.searchInput.value = '';
        Elements.searchInput.dispatchEvent(new Event('input'));
        Elements.searchInput.blur();
    }
}

// Initialize smooth scrolling
function initializeSmoothScrolling() {
    try {
        // Handle anchor links
        document.addEventListener('click', (event) => {
            const target = event.target.closest('a[href^="#"]');
            if (target) {
                event.preventDefault();
                const targetId = target.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    smoothScrollTo(targetElement);
                    highlightSection(targetElement);
                }
            }
        });
        
        Logger.debug('Smooth scrolling initialized');
    } catch (error) {
        Logger.error('Failed to initialize smooth scrolling:', error);
    }
}

// Smooth scroll to element
function smoothScrollTo(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Highlight section temporarily
function highlightSection(element) {
    const originalBg = element.style.backgroundColor;
    const originalBorder = element.style.border;
    
    element.style.backgroundColor = '#334155';
    element.style.border = '2px solid #3b82f6';
    element.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
        element.style.backgroundColor = originalBg;
        element.style.border = originalBorder;
        
        setTimeout(() => {
            element.style.transition = '';
        }, 300);
    }, 2000);
}

// Initialize accessibility features
function initializeAccessibility() {
    try {
        // Add skip to content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
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
        
        // Add main landmark
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.id = 'main-content';
            mainContent.setAttribute('role', 'main');
        }
        
        // Improve heading hierarchy
        const sectionHeaders = document.querySelectorAll('.section-title');
        sectionHeaders.forEach(header => {
            header.setAttribute('role', 'heading');
            header.setAttribute('aria-level', '2');
        });
        
        Logger.debug('Accessibility features initialized');
    } catch (error) {
        Logger.error('Failed to initialize accessibility features:', error);
    }
}

// Initialize UI enhancements
function initializeUI() {
    try {
        // Add scroll-to-top button
        addScrollToTopButton();
        
        // Add command counter indicator
        addCommandCounter();
        
        // Initialize tooltips
        initializeTooltips();
        
        // Add print optimization
        addPrintStyles();
        
        Logger.debug('UI enhancements initialized');
    } catch (error) {
        Logger.error('Failed to initialize UI enhancements:', error);
    }
}

// Add scroll-to-top button
function addScrollToTopButton() {
    try {
        const scrollBtn = document.createElement('button');
        scrollBtn.innerHTML = '↑';
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.setAttribute('aria-label', 'Scroll to top');
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
            cursor: pointer;
            z-index: 1000;
            display: none;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        // Show/hide based on scroll position
        let isVisible = false;
        window.addEventListener('scroll', () => {
            const shouldShow = window.pageYOffset > 300;
            
            if (shouldShow && !isVisible) {
                scrollBtn.style.display = 'block';
                isVisible = true;
            } else if (!shouldShow && isVisible) {
                scrollBtn.style.display = 'none';
                isVisible = false;
            }
        });
        
        document.body.appendChild(scrollBtn);
    } catch (error) {
        Logger.error('Failed to add scroll-to-top button:', error);
    }
}

// Add command counter indicator
function addCommandCounter() {
    try {
        const counter = document.createElement('div');
        counter.className = 'command-counter';
        counter.style.cssText = `
            position: fixed;
            top: 15px;
            left: 15px;
            background: rgba(51, 65, 85, 0.9);
            color: #f1f5f9;
            padding: 8px 15px;
            border-radius: 8px;
            font-size: 12px;
            z-index: 1000;
            backdrop-filter: blur(10px);
            border: 1px solid #475569;
            transition: all 0.3s ease;
        `;
        
        updateCommandCounterDisplay(counter);
        document.body.appendChild(counter);
        
        // Update counter when commands change
        const observer = new MutationObserver(() => {
            updateCommandCounterDisplay(counter);
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
    } catch (error) {
        Logger.error('Failed to add command counter:', error);
    }
}

// Update command counter display
function updateCommandCounterDisplay(counter) {
    try {
        const commandCount = document.querySelectorAll('.command, .multi-command').length;
        AppState.commandCount = commandCount;
        counter.textContent = `📊 ${commandCount} commands available`;
    } catch (error) {
        Logger.error('Failed to update command counter:', error);
    }
}

// Initialize tooltips
function initializeTooltips() {
    try {
        // Add tooltips to navigation cards
        const navCards = document.querySelectorAll('.nav-card');
        navCards.forEach(card => {
            card.addEventListener('mouseenter', showTooltip);
            card.addEventListener('mouseleave', hideTooltip);
        });
    } catch (error) {
        Logger.error('Failed to initialize tooltips:', error);
    }
}

// Show tooltip
function showTooltip(event) {
    try {
        const element = event.target.closest('.nav-card');
        const description = element.querySelector('p').textContent;
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = description;
        tooltip.style.cssText = `
            position: absolute;
            background: #1e293b;
            color: #f1f5f9;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
            border: 1px solid #334155;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 200px;
            line-height: 1.4;
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
        tooltip.style.top = `${rect.bottom + 10}px`;
        
        element._tooltip = tooltip;
    } catch (error) {
        Logger.error('Failed to show tooltip:', error);
    }
}

// Hide tooltip
function hideTooltip(event) {
    try {
        const element = event.target.closest('.nav-card');
        if (element._tooltip) {
            document.body.removeChild(element._tooltip);
            delete element._tooltip;
        }
    } catch (error) {
        Logger.error('Failed to hide tooltip:', error);
    }
}

// Add print styles
function addPrintStyles() {
    try {
        // Print styles are already in CSS, but we can add dynamic print optimization
        window.addEventListener('beforeprint', () => {
            // Expand all collapsed sections for printing
            const collapsedSections = document.querySelectorAll('.section.collapsed');
            collapsedSections.forEach(section => {
                section.classList.remove('collapsed');
                section._wasCollapsed = true;
            });
        });
        
        window.addEventListener('afterprint', () => {
            // Restore collapsed state after printing
            const sections = document.querySelectorAll('.section[_wasCollapsed]');
            sections.forEach(section => {
                section.classList.add('collapsed');
                delete section._wasCollapsed;
            });
        });
    } catch (error) {
        Logger.error('Failed to add print styles:', error);
    }
}

// Update command count in header
function updateCommandCount() {
    try {
        const commandCount = document.querySelectorAll('.command, .multi-command').length;
        AppState.commandCount = commandCount;
        
        if (Elements.commandCountElement) {
            Elements.commandCountElement.textContent = `${commandCount} Commands`;
        }
    } catch (error) {
        Logger.error('Failed to update command count:', error);
    }
}

// Setup main event listeners
function setupEventListeners() {
    try {
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                Logger.debug('App became visible');
            }
        });
        
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                handleResize();
            }, 250);
        });
        
        // Handle online/offline status
        window.addEventListener('online', () => {
            Logger.info('App is online');
        });
        
        window.addEventListener('offline', () => {
            Logger.warn('App is offline');
        });
        
        Logger.debug('Event listeners setup complete');
    } catch (error) {
        Logger.error('Failed to setup event listeners:', error);
    }
}

// Handle window resize
function handleResize() {
    try {
        // Update any size-dependent calculations
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        Logger.debug('Viewport resized:', viewport);
        
        // Trigger custom resize event
        document.dispatchEvent(new CustomEvent('appResize', { detail: viewport }));
    } catch (error) {
        Logger.error('Failed to handle resize:', error);
    }
}

// Show loading overlay
function showLoadingOverlay() {
    if (Elements.loadingOverlay) {
        Elements.loadingOverlay.style.display = 'flex';
    }
}

// Hide loading overlay
function hideLoadingOverlay() {
    if (Elements.loadingOverlay) {
        Elements.loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            Elements.loadingOverlay.style.display = 'none';
        }, 300);
    }
}

// Show success notification
function showSuccessNotification() {
    showNotification('✅ Guide loaded successfully!', 'success', 3000);
}

// Show error notification
function showErrorNotification(message) {
    showNotification(`❌ ${message}`, 'error', 5000);
}

// Show notification
function showNotification(message, type = 'info', duration = 3000) {
    try {
        // Use ComponentFactory if available, otherwise create simple notification
        if (typeof ComponentFactory !== 'undefined' && ComponentFactory.createNotification) {
            ComponentFactory.createNotification(message, type, duration);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px 18px;
                border-radius: 8px;
                font-size: 14px;
                z-index: 10000;
                max-width: 300px;
                word-wrap: break-word;
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
                color: white;
                border: 1px solid ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#2563eb'};
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, duration);
        }
    } catch (error) {
        console.error('Failed to show notification:', error);
    }
}

// Create modal dialog (fallback if ComponentFactory not available)
function createModal(title, content, options = {}) {
    try {
        if (typeof ComponentFactory !== 'undefined' && ComponentFactory.createModal) {
            return ComponentFactory.createModal(title, content, options);
        }
        
        // Fallback modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: #1e293b;
            color: #f1f5f9;
            padding: 25px;
            border-radius: 12px;
            border: 1px solid #334155;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            max-width: ${options.maxWidth || '500px'};
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        `;
        
        modalContent.innerHTML = `
            <div style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="color: #3b82f6; margin: 0;">${title}</h3>
                <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer;">×</button>
            </div>
            <div>${content}</div>
        `;
        
        modal.className = 'modal-overlay';
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
    } catch (error) {
        console.error('Failed to create modal:', error);
        return null;
    }
}

// Error handling
window.addEventListener('error', (event) => {
    Logger.error('Global JavaScript error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
    
    if (!AppState.isLoaded) {
        showErrorNotification('A JavaScript error occurred. Check the console for details.');
    }
});

window.addEventListener('unhandledrejection', (event) => {
    Logger.error('Unhandled promise rejection:', event.reason);
    
    if (!AppState.isLoaded) {
        showErrorNotification('A loading error occurred. Please refresh the page.');
    }
});

// Performance monitoring
if ('performance' in window && 'measure' in performance) {
    window.addEventListener('load', () => {
        try {
            performance.mark('app-load-complete');
            performance.measure('app-load-time', 'navigationStart', 'app-load-complete');
            const loadTime = performance.getEntriesByName('app-load-time')[0];
            Logger.info(`App loaded in ${Math.round(loadTime.duration)}ms`);
        } catch (e) {
            Logger.debug('Performance measurement not available');
        }
    });
}

// Graceful degradation function
function ensureFunctionExists(functionName, fallback = () => {}) {
    if (typeof window[functionName] !== 'function') {
        Logger.warn(`Function ${functionName} not found, using fallback`);
        window[functionName] = fallback;
    }
}

// Ensure critical functions exist before initialization
function checkDependencies() {
    const dependencies = [
        'Logger',
        'Performance',
        'getSectionsData',
        'initializeSearch',
        'initializeUIComponents'
    ];
    
    const missing = dependencies.filter(dep => typeof window[dep] === 'undefined');
    
    if (missing.length > 0) {
        const errorMsg = `Missing dependencies: ${missing.join(', ')}`;
        console.error(errorMsg);
        
        // Show user-friendly error
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.innerHTML = `
                <div class="loading-spinner">
                    <div style="color: #ef4444; font-size: 24px; margin-bottom: 20px;">❌</div>
                    <p style="color: #ef4444; font-weight: bold;">Loading Error</p>
                    <p style="color: #94a3b8; font-size: 14px; max-width: 400px; text-align: center;">
                        Some required files failed to load. Please check that all JavaScript files are present:
                    </p>
                    <ul style="color: #64748b; font-size: 12px; text-align: left; margin-top: 15px;">
                        ${missing.map(dep => `<li>${dep}</li>`).join('')}
                    </ul>
                    <button onclick="location.reload()" style="
                        margin-top: 20px;
                        padding: 10px 20px;
                        background: #3b82f6;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                    ">Reload Page</button>
                </div>
            `;
        }
        
        return false;
    }
    
    return true;
}

// Safe initialization wrapper
function safeInitialize() {
    try {
        // Add fallbacks for missing functions
        if (typeof Logger === 'undefined') {
            window.Logger = {
                debug: console.log.bind(console, '[DEBUG]'),
                info: console.log.bind(console, '[INFO]'),
                warn: console.warn.bind(console, '[WARN]'),
                error: console.error.bind(console, '[ERROR]')
            };
        }
        
        if (typeof Performance === 'undefined') {
            window.Performance = {
                mark: () => {},
                measure: () => {},
                getMetrics: () => ({})
            };
        }
        
        // Check dependencies before proceeding
        if (!checkDependencies()) {
            return;
        }
        
        // Initialize the app
        initializeApp();
        
    } catch (error) {
        console.error('Critical initialization error:', error);
        
        // Show emergency error screen
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #0f172a;
                color: #f1f5f9;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                font-family: 'Segoe UI', sans-serif;
                text-align: center;
                padding: 20px;
            ">
                <div style="font-size: 48px; margin-bottom: 20px;">💥</div>
                <h1 style="color: #ef4444; margin-bottom: 20px;">Application Failed to Load</h1>
                <p style="color: #94a3b8; max-width: 500px; margin-bottom: 30px; line-height: 1.6;">
                    The ArcSight Troubleshooting Guide encountered a critical error during initialization. 
                    This usually means one or more JavaScript files failed to load properly.
                </p>
                <details style="max-width: 600px; margin-bottom: 30px;">
                    <summary style="cursor: pointer; color: #3b82f6; margin-bottom: 10px;">Technical Details</summary>
                    <pre style="background: #1e293b; padding: 15px; border-radius: 6px; font-size: 12px; overflow: auto; text-align: left;">${error.message}\n\n${error.stack}</pre>
                </details>
                <div>
                    <button onclick="location.reload()" style="
                        margin: 5px;
                        padding: 12px 24px;
                        background: #3b82f6;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Reload Page</button>
                    <button onclick="window.open('https://github.com/your-repo/arcsight-troubleshooting-guide/issues', '_blank')" style="
                        margin: 5px;
                        padding: 12px 24px;
                        background: #64748b;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Report Issue</button>
                </div>
            </div>
        `;
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInitialize);
} else {
    // DOM is already ready
    safeInitialize();
}

// Export for potential external use
window.ArcSightGuide = {
    AppState,
    Elements,
    initializeApp: safeInitialize,
    showNotification,
    createModal
};