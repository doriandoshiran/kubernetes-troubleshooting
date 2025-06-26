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
        
        // Initialize component factory system (FIXED - was causing recursion)
        if (typeof window.initializeComponents === 'function' && window.initializeComponents !== initializeComponents) {
            window.initializeComponents();
            Logger.debug('Component factory system initialized');
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