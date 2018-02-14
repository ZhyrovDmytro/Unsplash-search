export const API = {
    searchItems: 'https://api.unsplash.com/search/photos/',
    searchItemsRandom: 'https://api.unsplash.com/photos/random/'
};

export const state = {
    active: 'active',
    disable: 'disable',
    error: 'error'
};

export const template = {
    templatePath: 'http://localhost:5001/js/templates'
};

export const nunjucksOption = {
    web: { useCache: true }
};

export const unsplashClient = {
    id: '452c69632818336a2c6b341b066847cb873fd987fa1876c039f59b615bf3fb9b'
};

export const error = {
    searchQueryEmpty: "Search query can't be empty",
    searchQueryShort: 'Query must have more then 2 letters'
};
