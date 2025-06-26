/**
 * ArcSight Troubleshooting Guide - Configuration
 * Contains application configuration settings
 */

// Application configuration
const AppConfig = {
    // Application metadata
    name: 'ArcSight Platform Troubleshooting Guide',
    version: '4.0',
    lastUpdated: 'June 2025',
    
    // UI settings
    ui: {
        theme: 'dark',
        animationDuration: 300,
        searchDebounceTime: 300,
        notificationDuration: 3000,
        autoHideTimeout: 5000
    },
    
    // Search configuration
    search: {
        minQueryLength: 1,
        maxResults: 100,
        highlightClassName: 'search-highlight',
        debounceTime: 300
    },
    
    // Performance settings
    performance: {
        enableLazyLoading: true,
        enableVirtualScrolling: false,
        chunkSize: 50,
        enableCaching: true
    },
    
    // Accessibility settings
    accessibility: {
        enableKeyboardNavigation: true,
        enableScreenReader: true,
        highContrastMode: false,
        reducedMotion: false
    },
    
    // Debug settings
    debug: {
        enableLogging: true,
        enablePerformanceMonitoring: true,
        logLevel: 'info' // 'debug', 'info', 'warn', 'error'
    },
    
    // Feature flags
    features: {
        enableAdvancedSearch: true,
        enableOfflineMode: false,
        enableAnalytics: false,
        enableUserPreferences: true
    },
    
    // External URLs
    urls: {
        documentation: 'https://github.com/your-repo/arcsight-troubleshooting-guide',
        support: 'https://support.company.com',
        feedback: 'https://feedback.company.com'
    },
    
    // Commands configuration
    commands: {
        copyTimeout: 600,
        maxCommandLength: 1000,
        enableSyntaxHighlighting: true
    }
};

// Environment detection
const Environment = {
    // Detect if running in development mode
    isDevelopment: () => {
        return location.hostname === 'localhost' || 
               location.hostname === '127.0.0.1' ||
               location.protocol === 'file:';
    },
    
    // Detect mobile device
    isMobile: () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    // Detect touch support
    isTouchDevice: () => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },
    
    // Get browser info
    getBrowser: () => {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'chrome';
        if (ua.includes('Firefox')) return 'firefox';
        if (ua.includes('Safari')) return 'safari';
        if (ua.includes('Edge')) return 'edge';
        return 'unknown';
    },
    
    // Check for modern browser features
    hasModernFeatures: () => {
        return 'fetch' in window && 
               'Promise' in window && 
               'classList' in document.documentElement;
    }
};

// Logger utility
const Logger = {
    levels: {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3
    },
    
    log: (level, message, data = null) => {
        if (!AppConfig.debug.enableLogging) return;
        
        const configLevel = Logger.levels[AppConfig.debug.logLevel] || 1;
        const messageLevel = Logger.levels[level] || 1;
        
        if (messageLevel >= configLevel) {
            const timestamp = new Date().toISOString();
            const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
            
            if (data) {
                console[level](prefix, message, data);
            } else {
                console[level](prefix, message);
            }
        }
    },
    
    debug: (message, data) => Logger.log('debug', message, data),
    info: (message, data) => Logger.log('info', message, data),
    warn: (message, data) => Logger.log('warn', message, data),
    error: (message, data) => Logger.log('error', message, data)
};

// Performance monitoring
const Performance = {
    marks: new Map(),
    measures: new Map(),
    
    mark: (name) => {
        if (!AppConfig.debug.enablePerformanceMonitoring) return;
        
        if ('performance' in window && 'mark' in performance) {
            performance.mark(name);
            Performance.marks.set(name, performance.now());
        }
    },
    
    measure: (name, startMark, endMark) => {
        if (!AppConfig.debug.enablePerformanceMonitoring) return;
        
        try {
            if ('performance' in window && 'measure' in performance) {
                performance.measure(name, startMark, endMark);
                const measure = performance.getEntriesByName(name)[0];
                Performance.measures.set(name, measure.duration);
                Logger.debug(`Performance: ${name} took ${Math.round(measure.duration)}ms`);
            }
        } catch (error) {
            Logger.warn('Performance measurement failed:', error);
        }
    },
    
    getMetrics: () => {
        return {
            marks: Object.fromEntries(Performance.marks),
            measures: Object.fromEntries(Performance.measures)
        };
    }
};

// User preferences
const UserPreferences = {
    storage: localStorage,
    prefix: 'arcsight-guide-',
    
    get: (key, defaultValue = null) => {
        try {
            const value = UserPreferences.storage.getItem(UserPreferences.prefix + key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            Logger.warn('Failed to get user preference:', error);
            return defaultValue;
        }
    },
    
    set: (key, value) => {
        try {
            UserPreferences.storage.setItem(
                UserPreferences.prefix + key, 
                JSON.stringify(value)
            );
            return true;
        } catch (error) {
            Logger.warn('Failed to set user preference:', error);
            return false;
        }
    },
    
    remove: (key) => {
        try {
            UserPreferences.storage.removeItem(UserPreferences.prefix + key);
            return true;
        } catch (error) {
            Logger.warn('Failed to remove user preference:', error);
            return false;
        }
    },
    
    clear: () => {
        try {
            const keys = Object.keys(UserPreferences.storage)
                .filter(key => key.startsWith(UserPreferences.prefix));
            
            keys.forEach(key => UserPreferences.storage.removeItem(key));
            return true;
        } catch (error) {
            Logger.warn('Failed to clear user preferences:', error);
            return false;
        }
    }
};

// Initialize configuration
function initializeConfig() {
    Performance.mark('config-init-start');
    
    // Apply user preferences
    if (AppConfig.features.enableUserPreferences) {
        const savedTheme = UserPreferences.get('theme', AppConfig.ui.theme);
        AppConfig.ui.theme = savedTheme;
        
        const reducedMotion = UserPreferences.get('reducedMotion', AppConfig.accessibility.reducedMotion);
        AppConfig.accessibility.reducedMotion = reducedMotion;
    }
    
    // Apply environment-specific settings
    if (Environment.isDevelopment()) {
        AppConfig.debug.logLevel = 'debug';
        AppConfig.debug.enableLogging = true;
        Logger.info('Development mode detected');
    }
    
    // Apply accessibility preferences
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        AppConfig.accessibility.reducedMotion = true;
        Logger.info('Reduced motion preference detected');
    }
    
    // Mobile-specific optimizations
    if (Environment.isMobile()) {
        AppConfig.ui.animationDuration = 200; // Faster animations on mobile
        AppConfig.search.debounceTime = 400; // Longer debounce for touch typing
        Logger.info('Mobile device detected');
    }
    
    Performance.mark('config-init-end');
    Performance.measure('config-initialization', 'config-init-start', 'config-init-end');
    
    Logger.info('Configuration initialized successfully');
}

// Export configuration
window.AppConfig = AppConfig;
window.Environment = Environment;
window.Logger = Logger;
window.Performance = Performance;
window.UserPreferences = UserPreferences;