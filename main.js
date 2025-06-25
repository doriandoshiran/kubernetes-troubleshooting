/**
 * ArcSight Troubleshooting Guide - Main JavaScript
 * Handles initialization and coordination of all components
 */

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
        // Cache DOM elements
        cacheElements();
        
        // Show loading overlay
        showLoadingOverlay();
        
        // Initialize components in order
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
        
        // Show success notification
        showSuccessNotification();
        
        console.log('ArcSight Troubleshooting Guide loaded successfully');
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showErrorNotification('Failed to load the troubleshooting guide. Please refresh the page.');
    }
}

// Cache frequently used DOM elements
function cacheElements() {
    Elements.loadingOverlay = document.getElementById('loading-overlay');
    Elements.searchInput = document.getElementById('searchInput');
    Elements.commandCountElement = document.getElementById('commandCount');
    Elements.sectionsContainer = document.getElementById('sections-container');
    Elements.body = document.body;
}

// Initialize all components
async function initializeComponents() {
    // Initialize search functionality
    if (typeof initializeSearch === 'function') {
        initializeSearch();
    }
    
    // Initialize UI components
    if (typeof initializeUIComponents === 'function') {
        initializeUIComponents();
    }
    
    // Initialize copy-to-clipboard functionality
    initializeCopyFunctionality();
    
    // Initialize keyboard shortcuts
    initializeKeyboardShortcuts();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Initialize accessibility features
    initializeAccessibility();
}

// Load and render sections from data
async function loadSections() {
    try {
        // Get sections data
        const sectionsData = getSectionsData();
        
        if (!sectionsData || !Array.isArray(sectionsData)) {
            throw new Error('Invalid sections data');
        }
        
        // Render sections
        renderSections(sectionsData);
        
        // Update command count
        updateCommandCount();
        
        // Store sections in state
        AppState.sections = sectionsData;
        
    } catch (error) {
        console.error('Failed to load sections:', error);
        throw error;
    }
}

// Render sections to the DOM
function renderSections(sectionsData) {
    const container = Elements.sectionsContainer;
    
    if (!container) {
        console.error('Sections container not found');
        return;
    }
    
    // Clear existing content
    container.innerHTML = '';
    
    // Render each section
    sectionsData.forEach(section => {
        const sectionElement = createSectionElement(section);
        container.appendChild(sectionElement);
    });
}

// Create a section element
function createSectionElement(sectionData) {
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
            const groupElement = createCommandGroupElement(group);
            content.appendChild(groupElement);
        });
    }
    
    // Add pattern cards if available
    if (sectionData.patterns && Array.isArray(sectionData.patterns)) {
        sectionData.patterns.forEach(pattern => {
            const patternElement = createPatternElement(pattern);
            content.appendChild(patternElement);
        });
    }
    
    section.appendChild(header);
    section.appendChild(content);
    
    return section;
}

// Create a command group element
function createCommandGroupElement(groupData) {
    const group = document.createElement('div');
    group.className = 'command-group';
    
    // Add group title
    const title = document.createElement('h4');
    title.textContent = groupData.title;
    group.appendChild(title);
    
    // Add commands
    if (groupData.commands && Array.isArray(groupData.commands)) {
        groupData.commands.forEach(command => {
            const commandElement = createCommandElement(command);
            group.appendChild(commandElement);
        });
    }
    
    return group;
}

// Create a command element
function createCommandElement(commandData) {
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
            const commandElement = createCommandElement(command);
            pattern.appendChild(commandElement);
        });
    }
    
    return pattern;
}

// Initialize copy-to-clipboard functionality
function initializeCopyFunctionality() {
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
}

// Handle copying command to clipboard
async function handleCopyCommand(element) {
    try {
        const text = cleanCommandText(element.textContent);
        await copyToClipboard(text);
        
        // Show visual feedback
        showCopyFeedback(element);
        
        // Log for analytics (if needed)
        console.log('Command copied:', text.substring(0, 50) + '...');
        
    } catch (error) {
        console.error('Failed to copy command:', error);
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
            showKeyboardHelp();
        }
        
        // Ctrl+Shift+D for debug info
        if (event.ctrlKey && event.shiftKey && event.key === 'D') {
            event.preventDefault();
            showDebugInfo();
        }
    });
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

// Show keyboard help modal
function showKeyboardHelp() {
    const modal = createModal('Keyboard Shortcuts', `
        <div class="keyboard-help">
            <div class="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>K</kbd>
                <span>Focus search</span>
            </div>
            <div class="shortcut-item">
                <kbd>Escape</kbd>
                <span>Clear search</span>
            </div>
            <div class="shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>/</kbd>
                <span>Show this help</span>
            </div>
            <div class="shortcut-item">
                <kbd>Enter</kbd> / <kbd>Space</kbd>
                <span>Copy focused command</span>
            </div>
            <div class="shortcut-item">
                <kbd>Tab</kbd>
                <span>Navigate between commands</span>
            </div>
        </div>
        <style>
            .keyboard-help { padding: 10px 0; }
            .shortcut-item { 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                padding: 8px 0; 
                border-bottom: 1px solid #334155;
            }
            .shortcut-item:last-child { border-bottom: none; }
            kbd { 
                background: #334155; 
                padding: 2px 6px; 
                border-radius: 3px; 
                font-size: 11px; 
                margin: 0 2px;
            }
        </style>
    `);
}

// Show debug information
function showDebugInfo() {
    const debugInfo = {
        appState: AppState,
        performance: {
            loadTime: performance.now(),
            commandCount: AppState.commandCount,
            sectionsCount: AppState.sections.length
        },
        browser: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled
        },
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio
        }
    };
    
    console.table(debugInfo);
    
    const modal = createModal('Debug Information', `
        <pre style="font-size: 12px; line-height: 1.4; overflow: auto; max-height: 400px;">${JSON.stringify(debugInfo, null, 2)}</pre>
    `);
}

// Initialize smooth scrolling
function initializeSmoothScrolling() {
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
}

// Initialize UI enhancements
function initializeUI() {
    // Add scroll-to-top button
    addScrollToTopButton();
    
    // Add command counter indicator
    addCommandCounter();
    
    // Add theme toggle (if needed)
    // addThemeToggle();
    
    // Initialize tooltips
    initializeTooltips();
    
    // Add print optimization
    addPrintStyles();
}

// Add scroll-to-top button
function addScrollToTopButton() {
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
}

// Add command counter indicator
function addCommandCounter() {
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
}

// Update command counter display
function updateCommandCounterDisplay(counter) {
    const commandCount = document.querySelectorAll('.command, .multi-command').length;
    AppState.commandCount = commandCount;
    counter.textContent = `📊 ${commandCount} commands available`;
}

// Initialize tooltips
function initializeTooltips() {
    // Add tooltips to navigation cards
    const navCards = document.querySelectorAll('.nav-card');
    navCards.forEach(card => {
        card.addEventListener('mouseenter', showTooltip);
        card.addEventListener('mouseleave', hideTooltip);
    });
}

// Show tooltip
function showTooltip(event) {
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
}

// Hide tooltip
function hideTooltip(event) {
    const element = event.target.closest('.nav-card');
    if (element._tooltip) {
        document.body.removeChild(element._tooltip);
        delete element._tooltip;
    }
}

// Add print styles
function addPrintStyles() {
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
}

// Update command count in header
function updateCommandCount() {
    const commandCount = document.querySelectorAll('.command, .multi-command').length;
    AppState.commandCount = commandCount;
    
    if (Elements.commandCountElement) {
        Elements.commandCountElement.textContent = `${commandCount} Commands`;
    }
}

// Setup main event listeners
function setupEventListeners() {
    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            console.log('App became visible');
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
        console.log('App is online');
    });
    
    window.addEventListener('offline', () => {
        console.log('App is offline');
    });
}

// Handle window resize
function handleResize() {
    // Update any size-dependent calculations
    const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    
    console.log('Viewport resized:', viewport);
    
    // Trigger custom resize event
    document.dispatchEvent(new CustomEvent('appResize', { detail: viewport }));
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
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const baseStyles = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 18px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        animation: slideInFromRight 0.5s ease-out;
        border: 1px solid;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    const typeStyles = {
        success: 'background: #10b981; color: white; border-color: #059669;',
        error: 'background: #ef4444; color: white; border-color: #dc2626;',
        info: 'background: #3b82f6; color: white; border-color: #2563eb;',
        warning: 'background: #f59e0b; color: white; border-color: #d97706;'
    };
    
    notification.style.cssText = baseStyles + typeStyles[type];
    
    // Add animation keyframes if not already added
    if (!document.getElementById('notification-animations')) {
        const style = document.createElement('style');
        style.id = 'notification-animations';
        style.textContent = `
            @keyframes slideInFromRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutToRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove notification
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOutToRight 0.5s ease-out';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }
    }, duration);
    
    // Allow manual dismissal
    notification.addEventListener('click', () => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOutToRight 0.5s ease-out';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }
    });
}

// Create modal dialog
function createModal(title, content, options = {}) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
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
        backdrop-filter: blur(5px);
    `;
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
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
        <div class="modal-header" style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="color: #3b82f6; margin: 0;">${title}</h3>
            <button class="modal-close" style="background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;" aria-label="Close modal">×</button>
        </div>
        <div class="modal-body">
            ${content}
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeModal = () => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
    };
    
    // Close on X button click
    modalContent.querySelector('.modal-close').addEventListener('click', closeModal);
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close on Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Auto-close if specified
    if (options.autoClose) {
        setTimeout(closeModal, options.autoClose);
    }
    
    return modal;
}

// Error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    if (!AppState.isLoaded) {
        showErrorNotification('An error occurred while loading the guide.');
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    if (!AppState.isLoaded) {
        showErrorNotification('A loading error occurred. Please refresh the page.');
    }
});

// Performance monitoring
if ('performance' in window && 'measure' in performance) {
    window.addEventListener('load', () => {
        performance.mark('app-load-complete');
        
        try {
            performance.measure('app-load-time', 'navigationStart', 'app-load-complete');
            const loadTime = performance.getEntriesByName('app-load-time')[0];
            console.log(`App loaded in ${Math.round(loadTime.duration)}ms`);
        } catch (e) {
            console.log('Performance measurement not available');
        }
    });
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Export for potential external use
window.ArcSightGuide = {
    AppState,
    Elements,
    initializeApp,
    showNotification,
    createModal
};