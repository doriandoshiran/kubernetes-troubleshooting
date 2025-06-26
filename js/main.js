/**
 * ArcSight Troubleshooting Guide - Main Application
 * Simplified and robust initialization
 */

// Global state
window.AppState = {
    initialized: false,
    sectionsLoaded: false,
    commandCount: 0
};

// Main initialization - called when DOM is ready
function initializeApplication() {
    console.log('🚀 Starting ArcSight Troubleshooting Guide...');
    
    try {
        // Show loading
        showLoading();
        
        // Initialize in sequence with error handling
        setTimeout(() => {
            try {
                // 1. Initialize configuration
                if (typeof initializeConfig === 'function') {
                    initializeConfig();
                    console.log('✅ Config initialized');
                }
                
                // 2. Load sections first
                loadSections();
                console.log('✅ Sections loaded');
                
                // 3. Initialize search
                if (typeof initializeSearch === 'function') {
                    initializeSearch();
                    console.log('✅ Search initialized');
                }
                
                // 4. Initialize UI components
                if (typeof initializeUIComponents === 'function') {
                    initializeUIComponents();
                    console.log('✅ UI components initialized');
                }
                
                // 5. Initialize component factory
                if (typeof initializeComponents === 'function') {
                    initializeComponents();
                    console.log('✅ Component factory initialized');
                }
                
                // 6. Setup copy functionality
                setupCopyFunctionality();
                console.log('✅ Copy functionality setup');
                
                // 7. Setup keyboard shortcuts
                setupKeyboardShortcuts();
                console.log('✅ Keyboard shortcuts setup');
                
                // 8. Update command count
                updateCommandCount();
                console.log('✅ Command count updated');
                
                // 9. Handle URL hash
                handleInitialNavigation();
                console.log('✅ Navigation handled');
                
                // 10. Hide loading
                hideLoading();
                
                window.AppState.initialized = true;
                console.log('🎉 Application initialized successfully!');
                
                // Show success notification
                setTimeout(() => {
                    if (typeof ComponentFactory !== 'undefined') {
                        ComponentFactory.createNotification('ArcSight Guide loaded successfully!', 'success', 3000);
                    }
                }, 500);
                
            } catch (error) {
                console.error('❌ Initialization failed:', error);
                showError();
            }
        }, 100);
        
    } catch (error) {
        console.error('❌ Critical initialization error:', error);
        showError();
    }
}

// Load sections from data
function loadSections() {
    try {
        const container = document.getElementById('sections-container');
        if (!container) {
            throw new Error('Sections container not found');
        }
        
        // Get sections data
        const sectionsData = getSectionsData();
        
        // Clear container
        container.innerHTML = '';
        
        // Create each section
        sectionsData.forEach(sectionData => {
            const sectionElement = createSection(sectionData);
            container.appendChild(sectionElement);
        });
        
        window.AppState.sectionsLoaded = true;
        console.log(`Loaded ${sectionsData.length} sections`);
        
    } catch (error) {
        console.error('Failed to load sections:', error);
        throw error;
    }
}

// Create section element
function createSection(data) {
    const section = document.createElement('section');
    section.className = 'section';
    section.id = data.id;
    
    // Header
    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `<h2 class="section-title">${data.title}</h2>`;
    section.appendChild(header);
    
    // Content
    const content = document.createElement('div');
    content.className = 'section-content';
    
    // Add command groups
    if (data.commandGroups) {
        data.commandGroups.forEach(group => {
            const groupEl = createCommandGroup(group);
            content.appendChild(groupEl);
        });
    }
    
    // Add patterns
    if (data.patterns) {
        data.patterns.forEach(pattern => {
            const patternEl = createPattern(pattern);
            content.appendChild(patternEl);
        });
    }
    
    section.appendChild(content);
    return section;
}

// Create command group
function createCommandGroup(group) {
    const div = document.createElement('div');
    div.className = 'command-group';
    
    // Title
    const title = document.createElement('h4');
    title.textContent = group.title;
    div.appendChild(title);
    
    // Commands
    group.commands.forEach(cmd => {
        div.appendChild(createCommand(cmd));
    });
    
    return div;
}

// Create command element
function createCommand(cmd) {
    const container = document.createElement('div');
    
    // Command
    const command = document.createElement('div');
    command.className = cmd.type === 'multi' ? 'multi-command' : 'command';
    command.textContent = cmd.command;
    command.setAttribute('tabindex', '0');
    command.setAttribute('data-command', cmd.command);
    container.appendChild(command);
    
    // Description
    if (cmd.description) {
        const desc = document.createElement('div');
        desc.className = 'description';
        desc.textContent = cmd.description;
        container.appendChild(desc);
    }
    
    // Usage
    if (cmd.usage) {
        const usage = document.createElement('div');
        usage.className = 'usage-note';
        usage.textContent = cmd.usage;
        container.appendChild(usage);
    }
    
    // Warning
    if (cmd.warning) {
        const warning = document.createElement('div');
        warning.className = 'warning';
        warning.textContent = cmd.warning;
        container.appendChild(warning);
    }
    
    return container;
}

// Create pattern element
function createPattern(pattern) {
    const div = document.createElement('div');
    div.className = 'pattern-card';
    
    // Title
    const title = document.createElement('h3');
    title.className = 'pattern-title';
    title.textContent = pattern.title;
    div.appendChild(title);
    
    // Symptoms
    const symptoms = document.createElement('div');
    symptoms.className = 'symptom';
    symptoms.textContent = pattern.symptoms;
    div.appendChild(symptoms);
    
    // Solution
    const solution = document.createElement('div');
    solution.className = 'solution';
    solution.textContent = pattern.solution;
    div.appendChild(solution);
    
    // Commands
    if (pattern.commands) {
        pattern.commands.forEach(cmd => {
            div.appendChild(createCommand(cmd));
        });
    }
    
    return div;
}

// Setup copy functionality
function setupCopyFunctionality() {
    document.addEventListener('click', async (e) => {
        if (e.target.matches('.command, .multi-command')) {
            e.preventDefault();
            
            const commandText = e.target.dataset.command || e.target.textContent;
            const cleanText = commandText.replace(/^\$ /, '').trim();
            
            try {
                await copyToClipboard(cleanText);
                showCopySuccess(e.target);
            } catch (error) {
                console.error('Copy failed:', error);
                showCopyError();
            }
        }
    });
    
    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && 
            e.target.matches('.command, .multi-command')) {
            e.preventDefault();
            e.target.click();
        }
    });
}

// Copy to clipboard
async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
    } else {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

// Show copy success
function showCopySuccess(element) {
    element.classList.add('copied');
    setTimeout(() => element.classList.remove('copied'), 600);
    
    if (typeof ComponentFactory !== 'undefined') {
        ComponentFactory.createNotification('Command copied!', 'success', 2000);
    }
}

// Show copy error
function showCopyError() {
    if (typeof ComponentFactory !== 'undefined') {
        ComponentFactory.createNotification('Failed to copy', 'error', 3000);
    }
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+K - Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // Escape - Clear search
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('searchInput');
            if (searchInput && searchInput.value) {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
                searchInput.blur();
            }
        }
    });
}

// Update command count
function updateCommandCount() {
    const commands = document.querySelectorAll('.command, .multi-command');
    window.AppState.commandCount = commands.length;
    
    const countElement = document.getElementById('commandCount');
    if (countElement) {
        countElement.textContent = `${commands.length} Commands`;
    }
}

// Handle initial navigation
function handleInitialNavigation() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        setTimeout(() => {
            const element = document.getElementById(hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 1000);
    }
}

// Show loading
function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

// Hide loading
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    }
}

// Show error
function showError() {
    const container = document.getElementById('sections-container');
    if (container) {
        container.innerHTML = `
            <div class="error-message" style="
                background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
                border: 2px solid #3b82f6;
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                color: #dbeafe;
                margin: 40px 0;
            ">
                <h2 style="color: #f1f5f9; margin-bottom: 15px;">⚠️ Error Loading Guide</h2>
                <p style="margin-bottom: 20px;">Failed to load the troubleshooting guide. Please refresh the page.</p>
                <button onclick="location.reload()" style="
                    background: #3b82f6;
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
    hideLoading();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
    initializeApplication();
}

// Global error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
});

console.log('📄 Main.js loaded successfully');