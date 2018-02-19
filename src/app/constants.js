export const API = {
    SEARCH_ITEMS: 'https://api.unsplash.com/search/photos/',
    SEARCH_ITEMS_RANDOM: 'https://api.unsplash.com/photos/random/'
};

export const state = {
    ACTIVE: 'active',
    DISABLE: 'disable',
    ERROR: 'error'
};

export const template = {
    TEMPLATE_PATH: 'http://localhost:5001/js/templates'
};

export const nunjucksOption = {
    web: { useCache: true }
};

export const unsplashClient = {
    ID: '452c69632818336a2c6b341b066847cb873fd987fa1876c039f59b615bf3fb9b'
};

export const errors = {
    SEARCH_QUERY_SHORT: "Search query can't be empty",
    SEARCH_QUERY_EMPTY: 'Query must have more then 2 letters',
    SEARCH_QUERY_ERROR: 'We have no images for you =('
};

export const classes = {
    HISTORY_ITEM: 'search__history--item js-history-item'
};
