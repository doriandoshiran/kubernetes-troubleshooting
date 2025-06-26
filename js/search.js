/**
 * ArcSight Troubleshooting Guide - Search Functionality
 * Handles search, filtering, and result highlighting
 */

// Search state
const SearchState = {
    isActive: false,
    currentQuery: '',
    results: [],
    highlightedElements: [],
    searchTimeout: null
};

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    
    if (!searchInput) {
        console.warn('Search input not found');
        return;
    }
    
    // Setup search event listeners
    setupSearchListeners(searchInput);
    
    // Setup search results UI
    setupSearchResultsUI();
    
    // Initialize keyboard navigation
    setupSearchKeyboardNavigation();
    
    console.log('Search functionality initialized');
}

// Setup search event listeners
function setupSearchListeners(searchInput) {
    // Input event with debouncing
    searchInput.addEventListener('input', (event) => {
        const query = event.target.value.trim();
        
        // Clear previous timeout
        if (SearchState.searchTimeout) {
            clearTimeout(SearchState.searchTimeout);
        }
        
        // Debounce search to avoid excessive processing
        SearchState.searchTimeout = setTimeout(() => {
            handleSearch(query);
        }, 300);
    });
    
    // Focus and blur events
    searchInput.addEventListener('focus', () => {
        searchInput.select();
        showSearchHints();
    });
    
    searchInput.addEventListener('blur', () => {
        hideSearchHints();
    });
    
    // Escape key to clear search
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            clearSearch();
        }
        
        if (event.key === 'Enter') {
            event.preventDefault();
            focusFirstResult();
        }
    });
}

// Handle search query
function handleSearch(query) {
    SearchState.currentQuery = query;
    
    if (!query) {
        clearSearchResults();
        return;
    }
    
    // Perform search
    const results = performSearch(query);
    SearchState.results = results;
    
    // Update UI
    updateSearchResults(results);
    highlightSearchTerms(query);
    showSearchStats(results.length);
    
    // Update search state
    SearchState.isActive = true;
    
    // Log search for analytics
    console.log(`Search performed: "${query}" - ${results.length} results`);
}

// Perform the actual search
function performSearch(query) {
    const searchableElements = getSearchableElements();
    const results = [];
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 0);
    
    searchableElements.forEach(element => {
        const searchText = getElementSearchText(element).toLowerCase();
        const score = calculateRelevanceScore(searchText, queryWords);
        
        if (score > 0) {
            results.push({
                element,
                score,
                text: searchText,
                type: getElementType(element)
            });
        }
    });
    
    // Sort by relevance score (highest first)
    results.sort((a, b) => b.score - a.score);
    
    return results;
}

// Get all searchable elements
function getSearchableElements() {
    const selectors = [
        '.command-group',
        '.pattern-card',
        '.section',
        '.command',
        '.multi-command',
        '.description',
        '.usage-note',
        '.warning'
    ];
    
    const elements = [];
    selectors.forEach(selector => {
        elements.push(...document.querySelectorAll(selector));
    });
    
    return elements;
}

// Get searchable text from an element
function getElementSearchText(element) {
    // Get text content but exclude certain child elements
    let text = element.textContent || '';
    
    // Clean up the text
    text = text.replace(/📋.*?$/gm, ''); // Remove copy instructions
    text = text.replace(/^\$ /gm, ''); // Remove command prompts
    text = text.trim();
    
    return text;
}

// Calculate relevance score for search results
function calculateRelevanceScore(text, queryWords) {
    let score = 0;
    const textWords = text.toLowerCase().split(/\s+/);
    
    queryWords.forEach(queryWord => {
        // Exact word match (highest score)
        const exactMatches = textWords.filter(word => word === queryWord).length;
        score += exactMatches * 10;
        
        // Partial word match (medium score)
        const partialMatches = textWords.filter(word => word.includes(queryWord)).length;
        score += partialMatches * 5;
        
        // Substring match (lowest score)
        if (text.includes(queryWord)) {
            score += 1;
        }
    });
    
    return score;
}

// Get element type for scoring
function getElementType(element) {
    if (element.matches('.command, .multi-command')) return 'command';
    if (element.matches('.command-group h4, .pattern-title, .section-title')) return 'title';
    if (element.matches('.description')) return 'description';
    if (element.matches('.usage-note')) return 'usage';
    if (element.matches('.warning')) return 'warning';
    if (element.matches('.pattern-card')) return 'pattern';
    if (element.matches('.section')) return 'section';
    return 'other';
}

// Update search results in UI
function updateSearchResults(results) {
    // Hide elements that don't match
    const allSearchableElements = getSearchableElements();
    const matchingElements = new Set(results.map(r => r.element));
    
    allSearchableElements.forEach(element => {
        const isVisible = matchingElements.has(element) || isParentOfMatch(element, matchingElements);
        
        if (isVisible) {
            showElement(element);
            // Ensure parent sections are visible
            const parentSection = element.closest('.section');
            if (parentSection) {
                showElement(parentSection);
            }
        } else {
            hideElement(element);
        }
    });
    
    // Handle section visibility
    updateSectionVisibility();
}

// Check if element is parent of a matching element
function isParentOfMatch(element, matchingElements) {
    return Array.from(matchingElements).some(match => 
        element.contains(match) && element !== match
    );
}

// Show element
function showElement(element) {
    element.style.display = '';
    element.classList.remove('search-hidden');
}

// Hide element
function hideElement(element) {
    element.style.display = 'none';
    element.classList.add('search-hidden');
}

// Update section visibility based on content
function updateSectionVisibility() {
    const sections = document.querySelectorAll('.section');
    
    sections.forEach(section => {
        const visibleContent = section.querySelectorAll('.command-group:not(.search-hidden), .pattern-card:not(.search-hidden)');
        
        if (visibleContent.length === 0) {
            hideElement(section);
        } else {
            showElement(section);
        }
    });
}

// Highlight search terms in results
function highlightSearchTerms(query) {
    // Clear previous highlights
    clearHighlights();
    
    if (!query) return;
    
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 1);
    const highlightedElements = [];
    
    // Find visible elements to highlight
    const visibleElements = document.querySelectorAll('.command-group:not(.search-hidden), .pattern-card:not(.search-hidden)');
    
    visibleElements.forEach(element => {
        queryWords.forEach(word => {
            if (highlightTextInElement(element, word)) {
                highlightedElements.push(element);
            }
        });
    });
    
    SearchState.highlightedElements = highlightedElements;
}

// Highlight text in a specific element
function highlightTextInElement(element, searchTerm) {
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                // Skip script and style elements
                if (node.parentElement.matches('script, style')) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );
    
    const textNodes = [];
    let node;
    
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }
    
    let highlighted = false;
    
    textNodes.forEach(textNode => {
        const text = textNode.textContent;
        const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
        
        if (regex.test(text)) {
            const highlightedText = text.replace(regex, '<mark class="search-highlight">$1</mark>');
            const wrapper = document.createElement('span');
            wrapper.innerHTML = highlightedText;
            
            textNode.parentNode.replaceChild(wrapper, textNode);
            highlighted = true;
        }
    });
    
    return highlighted;
}

// Escape regex special characters
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Clear all highlights
function clearHighlights() {
    const highlights = document.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize(); // Merge adjacent text nodes
    });
    
    // Remove any wrapper spans that might be empty
    const wrappers = document.querySelectorAll('span:empty');
    wrappers.forEach(wrapper => wrapper.remove());
    
    SearchState.highlightedElements = [];
}

// Clear search results
function clearSearchResults() {
    // Show all elements
    const hiddenElements = document.querySelectorAll('.search-hidden');
    hiddenElements.forEach(element => {
        showElement(element);
    });
    
    // Clear highlights
    clearHighlights();
    
    // Hide search stats
    hideSearchStats();
    
    // Update state
    SearchState.isActive = false;
    SearchState.currentQuery = '';
    SearchState.results = [];
}

// Clear search input and results
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        searchInput.blur();
    }
    
    clearSearchResults();
}

// Setup search results UI components
function setupSearchResultsUI() {
    // Create search stats element
    createSearchStatsElement();
    
    // Create search hints element
    createSearchHintsElement();
    
    // Add search result highlighting styles
    addSearchStyles();
}

// Create search stats display element
function createSearchStatsElement() {
    const statsElement = document.createElement('div');
    statsElement.id = 'search-stats';
    statsElement.className = 'search-stats';
    statsElement.style.cssText = `
        position: fixed;
        top: 15px;
        right: 15px;
        background: rgba(51, 65, 85, 0.9);
        color: #f1f5f9;
        padding: 8px 15px;
        border-radius: 8px;
        font-size: 12px;
        z-index: 1000;
        backdrop-filter: blur(10px);
        border: 1px solid #475569;
        display: none;
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(statsElement);
}

// Create search hints element
function createSearchHintsElement() {
    const hintsElement = document.createElement('div');
    hintsElement.id = 'search-hints';
    hintsElement.className = 'search-hints';
    hintsElement.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #334155;
        border: 1px solid #475569;
        border-top: none;
        border-radius: 0 0 8px 8px;
        padding: 12px;
        font-size: 12px;
        color: #94a3b8;
        z-index: 1001;
        display: none;
    `;
    
    hintsElement.innerHTML = `
        <div class="hint-item">💡 Search commands, errors, or descriptions</div>
        <div class="hint-item">🔍 Use specific terms like "jwt", "pod", or "403"</div>
        <div class="hint-item">⌨️ Press Ctrl+K to focus search, Escape to clear</div>
    `;
    
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        searchContainer.style.position = 'relative';
        searchContainer.appendChild(hintsElement);
    }
}

// Add search-specific styles
function addSearchStyles() {
    if (document.getElementById('search-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'search-styles';
    style.textContent = `
        .search-highlight {
            background: #fbbf24 !important;
            color: #92400e !important;
            padding: 1px 2px;
            border-radius: 2px;
            font-weight: 600;
        }
        
        .search-hidden {
            display: none !important;
        }
        
        .search-stats {
            animation: slideInFromRight 0.3s ease-out;
        }
        
        .search-hints .hint-item {
            margin-bottom: 4px;
            padding-left: 16px;
            position: relative;
        }
        
        .search-hints .hint-item:last-child {
            margin-bottom: 0;
        }
        
        @keyframes slideInFromRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        /* Mobile search adjustments */
        @media (max-width: 768px) {
            .search-stats {
                position: fixed;
                top: auto;
                bottom: 80px;
                right: 10px;
                font-size: 11px;
                padding: 6px 12px;
            }
            
            .search-hints {
                font-size: 11px;
                padding: 10px;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Show search statistics
function showSearchStats(resultCount) {
    const statsElement = document.getElementById('search-stats');
    if (statsElement) {
        statsElement.textContent = `${resultCount} result${resultCount !== 1 ? 's' : ''} found`;
        statsElement.style.display = 'block';
    }
}

// Hide search statistics
function hideSearchStats() {
    const statsElement = document.getElementById('search-stats');
    if (statsElement) {
        statsElement.style.display = 'none';
    }
}

// Show search hints
function showSearchHints() {
    const hintsElement = document.getElementById('search-hints');
    if (hintsElement && !SearchState.isActive) {
        hintsElement.style.display = 'block';
        
        // Auto-hide after a few seconds
        setTimeout(() => {
            if (hintsElement.style.display === 'block' && !SearchState.isActive) {
                hintsElement.style.display = 'none';
            }
        }, 3000);
    }
}

// Hide search hints
function hideSearchHints() {
    const hintsElement = document.getElementById('search-hints');
    if (hintsElement) {
        setTimeout(() => {
            hintsElement.style.display = 'none';
        }, 200); // Delay to allow for potential refocus
    }
}

// Focus first search result
function focusFirstResult() {
    if (SearchState.results.length === 0) return;
    
    const firstResult = SearchState.results[0].element;
    const focusableElement = firstResult.querySelector('.command, .multi-command') || firstResult;
    
    if (focusableElement && focusableElement.focus) {
        focusableElement.focus();
        
        // Scroll into view
        focusableElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        
        // Add temporary highlight
        focusableElement.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
        setTimeout(() => {
            focusableElement.style.boxShadow = '';
        }, 2000);
    }
}

// Search keyboard navigation
function setupSearchKeyboardNavigation() {
    let currentFocusIndex = -1;
    
    document.addEventListener('keydown', (event) => {
        if (!SearchState.isActive || SearchState.results.length === 0) return;
        
        const focusableResults = SearchState.results
            .map(r => r.element.querySelector('.command, .multi-command'))
            .filter(el => el && el.offsetParent !== null); // Only visible elements
        
        if (focusableResults.length === 0) return;
        
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                currentFocusIndex = (currentFocusIndex + 1) % focusableResults.length;
                focusableResults[currentFocusIndex].focus();
                break;
                
            case 'ArrowUp':
                event.preventDefault();
                currentFocusIndex = currentFocusIndex <= 0 ? 
                    focusableResults.length - 1 : currentFocusIndex - 1;
                focusableResults[currentFocusIndex].focus();
                break;
                
            case 'Enter':
                if (event.target.matches('.command, .multi-command')) {
                    event.preventDefault();
                    event.target.click();
                }
                break;
        }
    });
}

// Export search functionality
window.SearchFunctionality = {
    SearchState,
    initializeSearch,
    handleSearch,
    clearSearch,
    focusSearch: () => {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
};

// Make functions available globally
window.initializeSearch = initializeSearch;
window.clearSearch = clearSearch;