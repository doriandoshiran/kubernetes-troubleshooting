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

// Higher-order component utilities
const ComponentUtils = {
    // Make any element draggable
    makeDraggable: (element) => {
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        const onMouseDown = (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(window.getComputedStyle(element).left) || 0;
            startTop = parseInt(window.getComputedStyle(element).top) || 0;
            
            element.style.cursor = 'grabbing';
            element.style.userSelect = 'none';
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };
        
        const onMouseMove = (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            element.style.left = `${startLeft + deltaX}px`;
            element.style.top = `${startTop + deltaY}px`;
        };
        
        const onMouseUp = () => {
            isDragging = false;
            element.style.cursor = 'grab';
            element.style.userSelect = '';
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        element.style.cursor = 'grab';
        element.style.position = 'absolute';
        element.addEventListener('mousedown', onMouseDown);
        
        return {
            disable: () => {
                element.removeEventListener('mousedown', onMouseDown);
                element.style.cursor = '';
            }
        };
    },
    
    // Make element resizable
    makeResizable: (element, options = {}) => {
        const minWidth = options.minWidth || 100;
        const minHeight = options.minHeight || 100;
        
        const resizer = document.createElement('div');
        resizer.className = 'resizer';
        resizer.style.cssText = `
            position: absolute;
            bottom: 0;
            right: 0;
            width: 20px;
            height: 20px;
            cursor: se-resize;
            background: linear-gradient(-45deg, transparent 30%, #3b82f6 30%, #3b82f6 40%, transparent 40%, transparent 60%, #3b82f6 60%, #3b82f6 70%, transparent 70%);
        `;
        
        element.style.position = 'relative';
        element.appendChild(resizer);
        
        let isResizing = false;
        let startX, startY, startWidth, startHeight;
        
        const onMouseDown = (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(window.getComputedStyle(element).width);
            startHeight = parseInt(window.getComputedStyle(element).height);
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };
        
        const onMouseMove = (e) => {
            if (!isResizing) return;
            
            const width = Math.max(minWidth, startWidth + e.clientX - startX);
            const height = Math.max(minHeight, startHeight + e.clientY - startY);
            
            element.style.width = `${width}px`;
            element.style.height = `${height}px`;
        };
        
        const onMouseUp = () => {
            isResizing = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        resizer.addEventListener('mousedown', onMouseDown);
        
        return {
            disable: () => {
                if (element.contains(resizer)) {
                    element.removeChild(resizer);
                }
            }
        };
    },
    
    // Add fade in/out effects
    fadeIn: (element, duration = 300) => {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.display = 'block';
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
        
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    },
    
    fadeOut: (element, duration = 300) => {
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '0';
        
        return new Promise(resolve => {
            setTimeout(() => {
                element.style.display = 'none';
                resolve();
            }, duration);
        });
    },
    
    // Slide animations
    slideDown: (element, duration = 300) => {
        element.style.height = '0px';
        element.style.overflow = 'hidden';
        element.style.transition = `height ${duration}ms ease`;
        element.style.display = 'block';
        
        requestAnimationFrame(() => {
            element.style.height = element.scrollHeight + 'px';
        });
        
        return new Promise(resolve => {
            setTimeout(() => {
                element.style.height = '';
                element.style.overflow = '';
                resolve();
            }, duration);
        });
    },
    
    slideUp: (element, duration = 300) => {
        element.style.height = element.scrollHeight + 'px';
        element.style.overflow = 'hidden';
        element.style.transition = `height ${duration}ms ease`;
        
        requestAnimationFrame(() => {
            element.style.height = '0px';
        });
        
        return new Promise(resolve => {
            setTimeout(() => {
                element.style.display = 'none';
                element.style.height = '';
                element.style.overflow = '';
                resolve();
            }, duration);
        });
    }
};

// Specialized components for the troubleshooting guide
const TroubleshootingComponents = {
    // Create a command block with copy functionality
    createCommandBlock: (commandData) => {
        const container = document.createElement('div');
        container.className = 'command-container';
        
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
    },
    
    // Create a status indicator
    createStatusIndicator: (status, text) => {
        const indicator = document.createElement('div');
        indicator.className = `status-indicator status-${status}`;
        
        const statusColors = {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6',
            neutral: '#6b7280'
        };
        
        const statusIcons = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️',
            neutral: '○'
        };
        
        indicator.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 8px;
            border-radius: 12px;
            background: ${statusColors[status] || statusColors.neutral}20;
            color: ${statusColors[status] || statusColors.neutral};
            font-size: 12px;
            font-weight: 500;
            border: 1px solid ${statusColors[status] || statusColors.neutral}40;
        `;
        
        indicator.innerHTML = `
            <span class="status-icon">${statusIcons[status] || statusIcons.neutral}</span>
            <span class="status-text">${text}</span>
        `;
        
        return indicator;
    },
    
    // Create a collapsible section
    createCollapsibleSection: (title, content, isOpen = false) => {
        const section = document.createElement('div');
        section.className = 'collapsible-section';
        
        const header = document.createElement('div');
        header.className = 'collapsible-header';
        header.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: #334155;
            border-radius: 8px;
            cursor: pointer;
            user-select: none;
            transition: background-color 0.2s ease;
        `;
        
        const titleElement = document.createElement('h4');
        titleElement.textContent = title;
        titleElement.style.cssText = `
            margin: 0;
            color: #f1f5f9;
            font-size: 1.1em;
        `;
        
        const chevron = document.createElement('span');
        chevron.className = 'chevron';
        chevron.innerHTML = '▼';
        chevron.style.cssText = `
            transition: transform 0.2s ease;
            color: #94a3b8;
            font-size: 12px;
        `;
        
        header.appendChild(titleElement);
        header.appendChild(chevron);
        
        const contentContainer = document.createElement('div');
        contentContainer.className = 'collapsible-content';
        contentContainer.style.cssText = `
            overflow: hidden;
            transition: height 0.3s ease;
            background: #1e293b;
            border-radius: 0 0 8px 8px;
            border: 1px solid #334155;
            border-top: none;
        `;
        
        const contentInner = document.createElement('div');
        contentInner.style.padding = '16px';
        
        if (typeof content === 'string') {
            contentInner.innerHTML = content;
        } else {
            contentInner.appendChild(content);
        }
        
        contentContainer.appendChild(contentInner);
        
        // Set initial state
        if (isOpen) {
            contentContainer.style.height = contentContainer.scrollHeight + 'px';
            chevron.style.transform = 'rotate(180deg)';
        } else {
            contentContainer.style.height = '0px';
        }
        
        // Toggle functionality
        let isExpanded = isOpen;
        header.addEventListener('click', () => {
            isExpanded = !isExpanded;
            
            if (isExpanded) {
                contentContainer.style.height = contentContainer.scrollHeight + 'px';
                chevron.style.transform = 'rotate(180deg)';
            } else {
                contentContainer.style.height = '0px';
                chevron.style.transform = 'rotate(0deg)';
            }
        });
        
        header.addEventListener('mouseenter', () => {
            header.style.backgroundColor = '#475569';
        });
        
        header.addEventListener('mouseleave', () => {
            header.style.backgroundColor = '#334155';
        });
        
        section.appendChild(header);
        section.appendChild(contentContainer);
        
        return section;
    },
    
    // Create a search result highlight
    createSearchHighlight: (element, query) => {
        const text = element.textContent;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\        return new Promise(resolve => {
            setTimeout(() => {
                element.style.height = '';
                element.style.overflow = '';
                resolve')})`, 'gi');
        
        if (regex.test(text)) {
            const highlightedHTML = text.replace(regex, '<mark class="search-highlight">$1</mark>');
            element.innerHTML = highlightedHTML;
            return true;
        }
        
        return false;
    },
    
    // Create a breadcrumb navigation
    createBreadcrumb: (items) => {
        const breadcrumb = document.createElement('nav');
        breadcrumb.className = 'breadcrumb';
        breadcrumb.setAttribute('aria-label', 'Breadcrumb navigation');
        breadcrumb.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 0;
            font-size: 14px;
            color: #94a3b8;
        `;
        
        items.forEach((item, index) => {
            if (index > 0) {
                const separator = document.createElement('span');
                separator.textContent = '/';
                separator.style.cssText = `
                    color: #64748b;
                    user-select: none;
                `;
                breadcrumb.appendChild(separator);
            }
            
            const link = document.createElement('a');
            link.textContent = item.text;
            link.style.cssText = `
                color: ${index === items.length - 1 ? '#f1f5f9' : '#3b82f6'};
                text-decoration: none;
                transition: color 0.2s ease;
            `;
            
            if (item.href && index !== items.length - 1) {
                link.href = item.href;
                link.addEventListener('mouseenter', () => {
                    link.style.color = '#60a5fa';
                });
                link.addEventListener('mouseleave', () => {
                    link.style.color = '#3b82f6';
                });
            }
            
            breadcrumb.appendChild(link);
        });
        
        return breadcrumb;
    }
};

// Initialize component system
function initializeComponents() {
    Logger.info('Initializing component system');
    Performance.mark('components-init-start');
    
    // Add global component styles
    addComponentStyles();
    
    // Initialize component event listeners
    setupComponentEventListeners();
    
    Performance.mark('components-init-end');
    Performance.measure('components-initialization', 'components-init-start', 'components-init-end');
    
    Logger.info('Component system initialized successfully');
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
        
        /* Status indicator styles */
        .status-indicator {
            display: inline-flex;
            align-items: center;
        }
        
        /* Collapsible section styles */
        .collapsible-section {
            margin-bottom: 16px;
        }
        
        .collapsible-header {
            cursor: pointer;
        }
        
        .collapsible-content {
            overflow: hidden;
        }
        
        /* Breadcrumb styles */
        .breadcrumb a {
            transition: color 0.2s ease;
        }
        
        /* Search highlight styles */
        .search-highlight {
            background: #fbbf24;
            color: #92400e;
            padding: 1px 2px;
            border-radius: 2px;
            font-weight: 600;
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
            copyToClipboard(textToCopy);
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
            Logger.warn(`Unknown button action: ${action}`);
    }
}

// Utility function for copying to clipboard
async function copyToClipboard(text) {
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
        Logger.debug('Text copied to clipboard:', text.substring(0, 50) + '...');
        
    } catch (error) {
        ComponentFactory.createNotification('Failed to copy to clipboard', 'error', 3000);
        Logger.error('Failed to copy to clipboard:', error);
    }
}

// Export components
window.ComponentFactory = ComponentFactory;
window.ComponentState = ComponentState;
window.ComponentUtils = ComponentUtils;
window.TroubleshootingComponents = TroubleshootingComponents;
window.initializeComponents = initializeComponents;