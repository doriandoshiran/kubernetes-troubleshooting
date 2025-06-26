/**
 * ArcSight Troubleshooting Guide - UI Components
 * Contains reusable UI component creation and management
 */

// Component factory for creating reusable UI elements
const ComponentFactory = {
    // Create a button component
    createButton: (options = {}) => {
        const button = document.createElement('button');
        button.textContent = options.text || 'Button';
        button.className = options.className || 'btn';
        
        if (options.onClick) {
            button.addEventListener('click', options.onClick);
        }
        
        if (options.ariaLabel) {
            button.setAttribute('aria-label', options.ariaLabel);
        }
        
        return button;
    },
    
    // Create a modal component
    createModal: (title, content, options = {}) => {
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
        
        // Close functionality
        const closeModal = () => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        };
        
        modalContent.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        if (options.autoClose) {
            setTimeout(closeModal, options.autoClose);
        }
        
        return modal;
    },
    
    // Create a notification component
    createNotification: (message, type = 'info', duration = 3000) => {
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
            cursor: pointer;
        `;
        
        const typeStyles = {
            success: 'background: #10b981; color: white; border-color: #059669;',
            error: 'background: #ef4444; color: white; border-color: #dc2626;',
            info: 'background: #3b82f6; color: white; border-color: #2563eb;',
            warning: 'background: #f59e0b; color: white; border-color: #d97706;'
        };
        
        notification.style.cssText = baseStyles + typeStyles[type];
        
        // Add animation styles if not present
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
        
        // Auto-remove and manual removal
        const removeNotification = () => {
            if (document.body.contains(notification)) {
                notification.style.animation = 'slideOutToRight 0.5s ease-out';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 500);
            }
        };
        
        setTimeout(removeNotification, duration);
        notification.addEventListener('click', removeNotification);
        
        return notification;
    },
    
    // Create a loading spinner
    createSpinner: (size = '40px') => {
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        spinner.style.cssText = `
            width: ${size};
            height: ${size};
            border: 4px solid #334155;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        `;
        
        // Add spin animation if not present
        if (!document.getElementById('spinner-animations')) {
            const style = document.createElement('style');
            style.id = 'spinner-animations';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        return spinner;
    },
    
    // Create a tooltip component
    createTooltip: (element, text, position = 'top') => {
        let tooltip = null;
        
        const showTooltip = (e) => {
            tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = text;
            tooltip.style.cssText = `
                position: absolute;
                background: #1e293b;
                color: #f1f5f9;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                z-index: 10001;
                pointer-events: none;
                border: 1px solid #334155;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                max-width: 200px;
                line-height: 1.4;
                white-space: nowrap;
            `;
            
            document.body.appendChild(tooltip);
            
            // Position tooltip
            const rect = element.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            switch (position) {
                case 'top':
                    tooltip.style.left = `${rect.left + rect.width / 2 - tooltipRect.width / 2}px`;
                    tooltip.style.top = `${rect.top - tooltipRect.height - 5}px`;
                    break;
                case 'bottom':
                    tooltip.style.left = `${rect.left + rect.width / 2 - tooltipRect.width / 2}px`;
                    tooltip.style.top = `${rect.bottom + 5}px`;
                    break;
                case 'left':
                    tooltip.style.left = `${rect.left - tooltipRect.width - 5}px`;
                    tooltip.style.top = `${rect.top + rect.height / 2 - tooltipRect.height / 2}px`;
                    break;
                case 'right':
                    tooltip.style.left = `${rect.right + 5}px`;
                    tooltip.style.top = `${rect.top + rect.height / 2 - tooltipRect.height / 2}px`;
                    break;
            }
        };
        
        const hideTooltip = () => {
            if (tooltip && document.body.contains(tooltip)) {
                document.body.removeChild(tooltip);
                tooltip = null;
            }
        };
        
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
        element.addEventListener('focus', showTooltip);
        element.addEventListener('blur', hideTooltip);
        
        return { show: showTooltip, hide: hideTooltip };
    },
    
    // Create a progress bar
    createProgressBar: (options = {}) => {
        const container = document.createElement('div');
        container.className = 'progress-container';
        container.style.cssText = `
            width: ${options.width || '100%'};
            height: ${options.height || '8px'};
            background: #334155;
            border-radius: 4px;
            overflow: hidden;
            position: relative;
        `;
        
        const bar = document.createElement('div');
        bar.className = 'progress-bar';
        bar.style.cssText = `
            width: ${options.value || 0}%;
            height: 100%;
            background: ${options.color || '#3b82f6'};
            border-radius: 4px;
            transition: width 0.3s ease;
        `;
        
        container.appendChild(bar);
        
        // Return methods to control the progress bar
        return {
            element: container,
            setValue: (value) => {
                bar.style.width = `${Math.max(0, Math.min(100, value))}%`;
            },
            setColor: (color) => {
                bar.style.background = color;
            }
        };
    }
};

// Component state management
const ComponentState = {
    instances: new Map(),
    
    register: (id, component) => {
        ComponentState.instances.set(id, component);
    },
    
    get: (id) => {
        return ComponentState.instances.get(id);
    },
    
    remove: (id) => {
        const component = ComponentState.instances.get(id);
        if (component && component.destroy) {
            component.destroy();
        }
        ComponentState.instances.delete(id);
    },
    
    clear: () => {
        ComponentState.instances.forEach((component, id) => {
            ComponentState.remove(id);
        });
    }
};

// Initialize component system
function initializeComponentSystem() {
    console.log('Initializing component system');
    
    // Add global component styles
    addComponentStyles();
    
    // Initialize component event listeners
    setupComponentEventListeners();
    
    console.log('Component system initialized successfully');
}

// Add global component styles
function addComponentStyles() {
    if (document.getElementById('component-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'component-styles';
    style.textContent = `
        /* Component base styles */
        .btn {
            padding: 8px 16px;
            border: 1px solid #475569;
            border-radius: 6px;
            background: #334155;
            color: #f1f5f9;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .btn:hover {
            background: #475569;
            border-color: #3b82f6;
        }
        
        .btn:focus {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
        }
        
        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        /* Notification styles */
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 350px;
        }
        
        /* Tooltip styles */
        .tooltip {
            position: absolute;
            z-index: 10001;
            white-space: nowrap;
        }
        
        /* Progress bar styles */
        .progress-container {
            position: relative;
            overflow: hidden;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
            .notification {
                right: 10px;
                left: 10px;
                max-width: none;
            }
            
            .modal-content {
                margin: 20px;
                max-width: none;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Setup component event listeners
function setupComponentEventListeners() {
    // Global click handler for component interactions
    document.addEventListener('click', (event) => {
        const target = event.target;
        
        // Handle button clicks
        if (target.matches('.btn[data-action]')) {
            const action = target.getAttribute('data-action');
            handleButtonAction(action, target);
        }
        
        // Handle notification clicks (for dismissal)
        if (target.matches('.notification')) {
            target.style.animation = 'slideOutToRight 0.5s ease-out';
            setTimeout(() => {
                if (document.body.contains(target)) {
                    document.body.removeChild(target);
                }
            }, 500);
        }
    });
    
    // Global keyboard handler for component accessibility
    document.addEventListener('keydown', (event) => {
        // Handle escape key for modals
        if (event.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal-overlay');
            if (openModals.length > 0) {
                const topModal = openModals[openModals.length - 1];
                const closeBtn = topModal.querySelector('.modal-close');
                if (closeBtn) {
                    closeBtn.click();
                }
            }
        }
        
        // Handle enter/space for custom buttons
        if ((event.key === 'Enter' || event.key === ' ') && 
            event.target.matches('.btn[data-action]')) {
            event.preventDefault();
            event.target.click();
        }
    });
}

// Handle button actions
function handleButtonAction(action, button) {
    switch (action) {
        case 'copy':
            const textToCopy = button.getAttribute('data-copy') || button.textContent;
            copyToClipboardFallback(textToCopy);
            break;
        case 'toggle':
            const targetId = button.getAttribute('data-target');
            const target = document.getElementById(targetId);
            if (target) {
                target.style.display = target.style.display === 'none' ? 'block' : 'none';
            }
            break;
        case 'scroll-to':
            const scrollTarget = button.getAttribute('data-scroll-to');
            const element = document.getElementById(scrollTarget);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
            break;
        default:
            console.warn(`Unknown button action: ${action}`);
    }
}

// Utility function for copying to clipboard with fallback
async function copyToClipboardFallback(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
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
        
        ComponentFactory.createNotification('Copied to clipboard!', 'success', 2000);
        console.log('Text copied to clipboard:', text.substring(0, 50) + '...');
        
    } catch (error) {
        ComponentFactory.createNotification('Failed to copy to clipboard', 'error', 3000);
        console.error('Failed to copy to clipboard:', error);
    }
}

// Export components for global access
window.ComponentFactory = ComponentFactory;
window.ComponentState = ComponentState;
window.initializeComponents = initializeComponentSystem;