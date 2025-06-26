/**
 * ArcSight Troubleshooting Guide - Main Application
 * Entry point and initialization
 */

// Application state
const AppState = {
    initialized: false,
    sectionsLoaded: false,
    commandCount: 0
};

// Main initialization function
async function initializeApplication() {
    try {
        Performance.mark('app-init-start');
        Logger.info('Starting application initialization...');
        
        // Initialize configuration first
        initializeConfig();
        
        // Show loading overlay
        showLoadingOverlay();
        
        // Initialize all components
        await initializeAllComponents();
        
        // Load and render sections
        await loadSections();
        
        // Setup command interactions
        setupCommandInteractions();
        
        // Initialize copy functionality
        initializeCopyFunctionality();
        
        // Initialize keyboard shortcuts
        initializeKeyboardShortcuts();
        
        // Initialize smooth scrolling
        initializeSmoothScrolling();
        
        // Initialize accessibility features
        initializeAccessibilityFeatures();
        
        // Update command count
        updateCommandCount();
        
        // Handle URL hash navigation
        handleInitialNavigation();
        
        // Hide loading overlay
        hideLoadingOverlay();
        
        AppState.initialized = true;
        
        Performance.mark('app-init-end');
        Performance.measure('app-initialization', 'app-init-start', 'app-init-end');
        
        Logger.info('Application initialized successfully');
        
    } catch (error) {
        Logger.error('Failed to initialize application:', error);
        showErrorMessage('Failed to load the troubleshooting guide. Please refresh the page.');
    }
}

// Initialize all components with proper error handling
async function initializeAllComponents() {
    const initTasks = [
        { name: 'Search', fn: initializeSearch },
        { name: 'UI Components', fn: initializeUIComponents },
        { name: 'Component Factory', fn: window.initializeComponents }
    ];
    
    for (const task of initTasks) {
        try {
            if (typeof task.fn === 'function') {
                await task.fn();
                Logger.debug(`${task.name} initialized successfully`);
            } else {
                Logger.warn(`${task.name} function not available`);
            }
        } catch (error) {
            Logger.error(`Failed to initialize ${task.name}:`, error);
            // Continue with other initializations
        }
    }
}

// Load and render sections
async function loadSections() {
    try {
        Logger.info('Loading sections...');
        
        const sectionsData = getSectionsData();
        const container = document.getElementById('sections-container');
        
        if (!container) {
            throw new Error('Sections container not found');
        }
        
        // Clear existing content
        container.innerHTML = '';
        
        // Render each section
        sectionsData.forEach(sectionData => {
            const sectionElement = createSectionElement(sectionData);
            container.appendChild(sectionElement);
        });
        
        AppState.sectionsLoaded = true;
        Logger.info(`${sectionsData.length} sections loaded successfully`);
        
    } catch (error) {
        Logger.error('Failed to load sections:', error);
        throw error;
    }
}

// Create section element
function createSectionElement(sectionData) {
    const section = document.createElement('section');
    section.className = 'section';
    section.id = sectionData.id;
    
    // Section header
    const header = document.createElement('div');
    header.className = 'section-header';
    
    const title = document.createElement('h2');
    title.className = 'section-title';
    title.textContent = sectionData.title;
    
    header.appendChild(title);
    section.appendChild(header);
    
    // Section content
    const content = document.createElement('div');
    content.className = 'section-content';
    
    // Render command groups or patterns
    if (sectionData.commandGroups) {
        sectionData.commandGroups.forEach(group => {
            const groupElement = createCommandGroupElement(group);
            content.appendChild(groupElement);
        });
    }
    
    if (sectionData.patterns) {
        sectionData.patterns.forEach(pattern => {
            const patternElement = createPatternElement(pattern);
            content.appendChild(patternElement);
        });
    }
    
    section.appendChild(content);
    
    return section;
}

// Create command group element
function createCommandGroupElement(groupData) {
    const group = document.createElement('div');
    group.className = 'command-group';
    
    // Group title
    const title = document.createElement('h4');
    title.textContent = groupData.title;
    group.appendChild(title);
    
    // Commands
    groupData.commands.forEach(commandData => {
        const commandContainer = createCommandElement(commandData);
        group.appendChild(commandContainer);
    });
    
    return group;
}

// Create command element
function createCommandElement(commandData) {
    const container = document.createElement('div');
    
    // Command element
    const command = document.createElement('div');
    command.className = commandData.type === 'multi' ? 'multi-command' : 'command';
    command.textContent = commandData.command;
    command.setAttribute('tabindex', '0');
    command.setAttribute('role', 'button');
    command.setAttribute('aria-label', 'Click to copy command to clipboard');
    command.dataset.command = commandData.command;
    
    container.appendChild(command);
    
    // Description
    if (commandData.description) {
        const desc = document.createElement('div');
        desc.className = 'description';
        desc.textContent = commandData.description;
        container.appendChild(desc);
    }
    
    // Usage note
    if (commandData.usage) {
        const usage = document.createElement('div');
        usage.className = 'usage-note';
        usage.textContent = commandData.usage;
        container.appendChild(usage);
    }
    
    // Warning
    if (commandData.warning) {
        const warning = document.createElement('div');
        warning.className = 'warning';
        warning.textContent = commandData.warning;
        container.appendChild(warning);
    }
    
    return container;
}

// Create pattern element
function createPatternElement(patternData) {
    const pattern = document.createElement('div');
    pattern.className = 'pattern-card';
    
    // Pattern title
    const title = document.createElement('h3');
    title.className = 'pattern-title';
    title.textContent = patternData.title;
    pattern.appendChild(title);
    
    // Symptoms
    const symptoms = document.createElement('div');
    symptoms.className = 'symptom';
    symptoms.textContent = patternData.symptoms;
    pattern.appendChild(symptoms);
    
    // Solution
    const solution = document.createElement('div');
    solution.className = 'solution';
    solution.textContent = patternData.solution;
    pattern.appendChild(solution);
    
    // Commands
    if (patternData.commands) {
        patternData.commands.forEach(commandData => {
            const commandElement = createCommandElement(commandData);
            pattern.appendChild(commandElement);
        });
    }
    
    return pattern;
}

// Setup command interactions
function setupCommandInteractions() {
    // Handle command clicks for copying
    document.addEventListener('click', async (event) => {
        const target = event.target;
        
        if (target.matches('.command, .multi-command')) {
            event.preventDefault();
            
            const commandText = target.dataset.command || target.textContent.replace(/^\$ /, '');
            
            try {
                await copyCommandToClipboard(commandText, target);
            } catch (error) {
                Logger.error('Failed to copy command:', error);
                showErrorNotification('Failed to copy command to clipboard');
            }
        }
    });
    
    // Handle keyboard interactions
    document.addEventListener('keydown', (event) => {
        if (event.target.matches('.command, .multi-command')) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.target.click();
            }
        }
    });
}

// Initialize copy functionality
function initializeCopyFunctionality() {
    Logger.debug('Copy functionality initialized');
}

// Copy command to clipboard
async function copyCommandToClipboard(commandText, element) {
    try {
        // Clean command text
        const cleanText = commandText.replace(/^\$ /, '').trim();
        
        // Copy to clipboard
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(cleanText);
        } else {
            // Fallback method
            const textArea = document.createElement('textarea');
            textArea.value = cleanText;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
            } finally {
                document.body.removeChild(textArea);
            }
        }
        
        // Visual feedback
        showCopyAnimation(element);
        showSuccessNotification('Command copied to clipboard!');
        
        Logger.debug('Command copied:', cleanText.substring(0, 50) + '...');
        
    } catch (error) {
        Logger.error('Copy failed:', error);
        throw error;
    }
}

// Show copy animation
function showCopyAnimation(element) {
    element.classList.add('copied');
    setTimeout(() => {
        element.classList.remove('copied');
    }, 600);
}

// Initialize keyboard shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        // Ctrl+K - Focus search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            focusSearch();
        }
        
        // Escape - Clear search
        if (event.key === 'Escape') {
            clearSearch();
        }
        
        // Ctrl+/ - Show help
        if ((event.ctrlKey || event.metaKey) && event.key === '/') {
            event.preventDefault();
            showKeyboardHelp();
        }
    });
    
    Logger.debug('Keyboard shortcuts initialized');
}

// Initialize smooth scrolling
function initializeSmoothScrolling() {
    // Handle navigation link clicks
    document.addEventListener('click', (event) => {
        const target = event.target.closest('a[href^="#"]');
        if (target) {
            event.preventDefault();
            const targetId = target.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: AppConfig.accessibility.reducedMotion ? 'auto' : 'smooth',
                    block: 'start'
                });
            }
        }
    });
    
    Logger.debug('Smooth scrolling initialized');
}

// Initialize accessibility features
function initializeAccessibilityFeatures() {
    // Add skip link functionality
    const skipLink = document.querySelector('.skip-link, a[href="#main-content"]');
    if (skipLink) {
        skipLink.addEventListener('click', (event) => {
            event.preventDefault();
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.focus();
                mainContent.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    Logger.debug('Accessibility features initialized');
}

// Update command count
function updateCommandCount() {
    const commands = document.querySelectorAll('.command, .multi-command');
    AppState.commandCount = commands.length;
    
    const countElement = document.getElementById('commandCount');
    if (countElement) {
        countElement.textContent = `${AppState.commandCount} Commands`;
    }
    
    Logger.debug(`Command count updated: ${AppState.commandCount}`);
}

// Handle initial navigation
function handleInitialNavigation() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        setTimeout(() => {
            const targetElement = document.getElementById(hash);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: AppConfig.accessibility.reducedMotion ? 'auto' : 'smooth',
                    block: 'start'
                });
            }
        }, 500);
    }
}

// Show loading overlay
function showLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

// Hide loading overlay
function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    }
}

// Show success notification
function showSuccessNotification(message) {
    if (typeof ComponentFactory !== 'undefined' && ComponentFactory.createNotification) {
        ComponentFactory.createNotification(message, 'success', 2000);
    } else {
        console.log(message);
    }
}

// Show error notification
function showErrorNotification(message) {
    if (typeof ComponentFactory !== 'undefined' && ComponentFactory.createNotification) {
        ComponentFactory.createNotification(message, 'error', 4000);
    } else {
        console.error(message);
    }
}

// Show error message
function showErrorMessage(message) {
    const container = document.getElementById('sections-container');
    if (container) {
        container.innerHTML = `
            <div class="error-message" style="
                background: #7f1d1d;
                border: 2px solid #dc2626;
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                color: #fecaca;
                margin: 40px 0;
            ">
                <h2 style="color: #fef2f2; margin-bottom: 15px;">⚠️ Error Loading Guide</h2>
                <p style="margin-bottom: 20px;">${message}</p>
                <button onclick="location.reload()" style="
                    background: #dc2626;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                ">Refresh Page</button>
            </div>
        `;
    }
    
    hideLoadingOverlay();
}

// DOM Content Loaded event handler
document.addEventListener('DOMContentLoaded', () => {
    Logger.info('DOM content loaded, starting initialization...');
    initializeApplication();
});

// Handle page errors
window.addEventListener('error', (event) => {
    Logger.error('Global error caught:', event.error);
    showErrorNotification('An unexpected error occurred');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    Logger.error('Unhandled promise rejection:', event.reason);
    showErrorNotification('An unexpected error occurred');
    event.preventDefault();
});

// Export main functions
window.AppState = AppState;
window.initializeApplication = initializeApplication;
window.copyCommandToClipboard = copyCommandToClipboard;