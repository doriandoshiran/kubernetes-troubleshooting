/**
 * ArcSight Troubleshooting Guide - Complete Working Main
 * This file contains everything needed to run the application
 */

// Global Application State
window.AppState = {
    initialized: false,
    sectionsLoaded: false,
    commandCount: 0
};

// Simple Configuration
window.AppConfig = {
    name: 'ArcSight Platform Troubleshooting Guide',
    version: '4.0',
    lastUpdated: 'June 2025'
};

// Simple Logger
window.Logger = {
    info: (msg, data) => console.log('ℹ️', msg, data || ''),
    debug: (msg, data) => console.log('🔍', msg, data || ''),
    warn: (msg, data) => console.warn('⚠️', msg, data || ''),
    error: (msg, data) => console.error('❌', msg, data || '')
};

// Performance tracker
window.Performance = {
    mark: (name) => {
        if (performance && performance.mark) {
            performance.mark(name);
        }
    },
    measure: (name, start, end) => {
        if (performance && performance.measure) {
            try {
                performance.measure(name, start, end);
            } catch (e) {}
        }
    },
    getMetrics: () => ({})
};

// Component Factory for notifications and modals
window.ComponentFactory = {
    createNotification: (message, type = 'info', duration = 3000) => {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const colors = {
            success: 'background: #10b981; color: white;',
            error: 'background: #ef4444; color: white;',
            info: 'background: #3b82f6; color: white;',
            warning: 'background: #f59e0b; color: white;'
        };
        
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 18px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            ${colors[type] || colors.info}
            animation: slideInNotif 0.3s ease-out;
            cursor: pointer;
        `;
        
        // Add animation styles
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInNotif {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutNotif {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                @media (max-width: 768px) {
                    .notification { right: 10px; left: 10px; max-width: none; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove
        const remove = () => {
            notification.style.animation = 'slideOutNotif 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        };
        
        setTimeout(remove, duration);
        notification.addEventListener('click', remove);
        
        return notification;
    }
};

// Define all required functions to prevent ReferenceErrors
window.initializeConfig = () => {
    Logger.info('Config initialized');
};

window.initializeSearch = () => {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(e.target.value.trim());
        }, 300);
    });
    
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            clearSearch();
        }
    });
    
    Logger.info('Search initialized');
};

window.initializeUIComponents = () => {
    // Add scroll to top button
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '↑';
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
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
    `;
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.style.display = 'block';
        } else {
            scrollBtn.style.display = 'none';
        }
    });
    
    document.body.appendChild(scrollBtn);
    Logger.info('UI components initialized');
};

window.initializeComponents = () => {
    Logger.info('Component factory initialized');
};

// Search functionality
function performSearch(query) {
    const elements = document.querySelectorAll('.command, .multi-command, .description, .command-group, .pattern-card');
    
    if (!query) {
        elements.forEach(el => {
            el.style.display = '';
            el.classList.remove('search-hidden');
        });
        return;
    }
    
    const queryLower = query.toLowerCase();
    
    elements.forEach(el => {
        const text = el.textContent.toLowerCase();
        if (text.includes(queryLower)) {
            el.style.display = '';
            el.classList.remove('search-hidden');
        } else {
            el.style.display = 'none';
            el.classList.add('search-hidden');
        }
    });
}

function clearSearch() {
    const elements = document.querySelectorAll('.search-hidden');
    elements.forEach(el => {
        el.style.display = '';
        el.classList.remove('search-hidden');
    });
}

// Main initialization function
function initializeApplication() {
    Logger.info('🚀 Starting ArcSight Troubleshooting Guide...');
    
    try {
        showLoading();
        
        setTimeout(() => {
            try {
                // Initialize all components safely
                initializeConfig();
                loadSections();
                initializeSearch();
                initializeUIComponents();
                initializeComponents();
                setupCopyFunctionality();
                setupKeyboardShortcuts();
                updateCommandCount();
                handleInitialNavigation();
                
                hideLoading();
                window.AppState.initialized = true;
                
                Logger.info('🎉 Application initialized successfully!');
                ComponentFactory.createNotification('ArcSight Guide loaded successfully!', 'success', 3000);
                
            } catch (error) {
                Logger.error('❌ Initialization failed:', error);
                showError();
            }
        }, 100);
        
    } catch (error) {
        Logger.error('❌ Critical initialization error:', error);
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
        
        const sectionsData = getSectionsData();
        container.innerHTML = '';
        
        sectionsData.forEach(sectionData => {
            const sectionElement = createSection(sectionData);
            container.appendChild(sectionElement);
        });
        
        window.AppState.sectionsLoaded = true;
        Logger.info(`Loaded ${sectionsData.length} sections`);
        
    } catch (error) {
        Logger.error('Failed to load sections:', error);
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
    
    if (data.commandGroups) {
        data.commandGroups.forEach(group => {
            content.appendChild(createCommandGroup(group));
        });
    }
    
    if (data.patterns) {
        data.patterns.forEach(pattern => {
            content.appendChild(createPattern(pattern));
        });
    }
    
    section.appendChild(content);
    return section;
}

// Create command group
function createCommandGroup(group) {
    const div = document.createElement('div');
    div.className = 'command-group';
    
    const title = document.createElement('h4');
    title.textContent = group.title;
    div.appendChild(title);
    
    group.commands.forEach(cmd => {
        div.appendChild(createCommand(cmd));
    });
    
    return div;
}

// Create command element
function createCommand(cmd) {
    const container = document.createElement('div');
    
    const command = document.createElement('div');
    command.className = cmd.type === 'multi' ? 'multi-command' : 'command';
    command.textContent = cmd.command;
    command.setAttribute('tabindex', '0');
    command.setAttribute('data-command', cmd.command);
    container.appendChild(command);
    
    if (cmd.description) {
        const desc = document.createElement('div');
        desc.className = 'description';
        desc.textContent = cmd.description;
        container.appendChild(desc);
    }
    
    if (cmd.usage) {
        const usage = document.createElement('div');
        usage.className = 'usage-note';
        usage.textContent = cmd.usage;
        container.appendChild(usage);
    }
    
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
    
    const title = document.createElement('h3');
    title.className = 'pattern-title';
    title.textContent = pattern.title;
    div.appendChild(title);
    
    const symptoms = document.createElement('div');
    symptoms.className = 'symptom';
    symptoms.textContent = pattern.symptoms;
    div.appendChild(symptoms);
    
    const solution = document.createElement('div');
    solution.className = 'solution';
    solution.textContent = pattern.solution;
    div.appendChild(solution);
    
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
                Logger.error('Copy failed:', error);
                ComponentFactory.createNotification('Failed to copy', 'error', 3000);
            }
        }
    });
    
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
    ComponentFactory.createNotification('Command copied!', 'success', 2000);
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
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

// Show/hide loading
function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.style.display = 'none', 300);
    }
}

// Show error with blue styling
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
                box-shadow: 0 8px 30px rgba(59, 130, 246, 0.2);
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
                    transition: background 0.2s ease;
                " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">Refresh Page</button>
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
    Logger.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    Logger.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
});

Logger.info('📄 Main.js loaded successfully');