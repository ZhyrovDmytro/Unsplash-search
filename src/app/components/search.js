import nunjucks from 'nunjucks';
import axios from 'axios';

import {
    API,
    template,
    state,
    nunjucksOption,
    unsplashClient,
    errors,
    classes
} from './../constants';

export default class Search {
    constructor(container) {
        this.container = container;
        this.searchInput = this.container.querySelector('.js-search-input');
        this.searchButton = this.container.querySelector('.js-button-search');
        this.loadMoreButton = this.container.querySelector('.js-button-more');
        this.loadMore = this.container.querySelector('.js-load-more');
        this.searchHistory = this.container.querySelector('.js-history');
        this.searchHistoryList = this.container.querySelector('.js-history-list');
        this.messageError = this.container.querySelector('.js-error-message');
        this.searchRandom = this.container.querySelector('.js-button-random');
        this.results = this.container.querySelector('.js-search-result');
        this.loader = this.container.querySelector('.loader');
        this.modal = document.querySelector('.js-modal');
        this.modalContent = document.querySelector('.js-modal-content');
        this.closeModalButton = document.querySelector('.js-modal-close');

        // save search querys to local storage
        this.saveList = JSON.parse(localStorage.getItem(('list')));

        this.pageNumber = 1;

        // Get name of template to render
        this.nunjEnv = nunjucks.configure(template.TEMPLATE_PATH, nunjucksOption.web);

        // search button event
        this.searchButton.addEventListener('click', this.searchItems);

        // searchinput events
        this.searchInput.addEventListener('focus', this.errorRemove);
        this.searchInput.addEventListener('focus', this.showHistoryList);
        this.searchInput.addEventListener('blur', this.hideQuerysHistory);
        this.searchInput.addEventListener('keyup', this.searchItemsByEnterKey);
        this.searchInput.addEventListener('keyup', this.suggestSearchQuery);
        this.searchInput.addEventListener('input', this.resetSearchResults);
        this.searchRandom.addEventListener('click', this.getSearchingPath);

        // load more items by click
        this.loadMoreButton.addEventListener('click', this.loadMoreItems);

        // modal window events
        this.modal.addEventListener('click', this.handleClickModal);
        this.closeModalButton.addEventListener('click', this.closeModalWindow);

        // create history list
        this.makeHistoryList();
    }

    /**
     *Perform AJAX call to the web-service
     *@param {string}  searchPath- path to expected API
     */
    requestService = (searchPath) => {

        this.loaderActive();

        axios.get(searchPath)
            .then(respond => {
                this.renderResults(respond);
            })
            .catch(error => {
                console.error('Failed!');
            });
    }

    /**
     * Get searching path depends from search by query or random
     * @param {string} inputValue - search query from input
     */
    getSearchingPath = (inputValue) => {
        let searchPath;
        let nextPage;
        nextPage = this.pageNumber;

        if (event.target === this.loadMoreButton) {
            nextPage += 1;
            this.pageNumber = nextPage;
            inputValue = this.searchInput.value;
        } else {
            nextPage = 1;
        }

        if (event.target === this.searchRandom || this.searchInput.value === '') {
            this.searchInput.value = '';
            searchPath = `${API.SEARCH_ITEMS_RANDOM}?count=12&client_id=${unsplashClient.ID}`;
            if (event.target !== this.loadMoreButton) this.resetSearchResults();
        } else {
            searchPath = `${API.SEARCH_ITEMS}?page=${nextPage}&per_page=12&query=${inputValue}&client_id=${unsplashClient.ID}`;
        }

        this.requestService(searchPath);
    }

    /**
     * Search items if input query has more 3 letters and if it's now empty
     */
    searchItems = () => {
        const inputValue = this.searchInput.value;

        if (inputValue.trim() === '') {
            this.errorShow();
            this.messageError.innerHTML = errors.SEARCH_QUERY_EMPTY;
        } else if (inputValue.length < 3) {
            this.errorShow();
            this.messageError.innerHTML = errors.SEARCH_QUERY_SHORT;
        } else {
            this.getSearchingPath(inputValue);

            this.saveList.push(inputValue); // add new query to history list
            this.addHistoryItem(inputValue);

            localStorage.setItem('list', JSON.stringify(this.saveList));
            this.resetSearchResults();
        }
        this.checkLastQuerys();
    }

    /**
     * Search image by push Enter key on keyboard
     *
     * @param  {object} event - events
     */
    searchItemsByEnterKey = (event) => {
        const inputValue = this.searchInput.value;
        const inputQuery = this.inputValue;

        if (event.keyCode === 13) {
            this.searchInput.blur();
            this.searchButton.click(inputQuery);
        }
    }

    /**
     * Search by history items on click
     */
    searchByHistoryItem = () => {
        const searchHistoryItems = [...this.searchHistoryList.querySelectorAll('.js-history-item')];

        for (let i = 0; i < searchHistoryItems.length; i += 1) {
            searchHistoryItems[i].addEventListener('click', this.handleHistoryItemForSearch);
        }
    }

    /**
     *
     */
    handleHistoryItemForSearch = (event) => {
        this.searchInput.value = '';
        this.searchInput.value = event.target.innerHTML;
        this.searchItems();
    }

    /**
     * Show error if no items to show
     *
     * @param  {object} respond- received data from server
     */
    checkExistsImages = (respond) => {
        if (respond.data.total < 1) { // check the number of available images
            this.errorShow();
            this.messageError.innerHTML = errors.SEARCH_QUERY_ERROR;
        }
    }

    /**
     * Add new query to history list after search
     *
     * @param  {string} inputValue- input query
     */
    addHistoryItem = (inputValue) => {
        const newHistoryListItem = document.createElement('li');
        newHistoryListItem.className = classes.HISTORY_ITEM;
        newHistoryListItem.appendChild(document.createTextNode(inputValue));
        this.searchHistoryList.appendChild(newHistoryListItem);
    }

    makeHistoryList = () => {
        // create new item
        for (let i = 0; i < this.saveList.length; i += 1) {
            const newHistoryListItem = document.createElement('li');
            newHistoryListItem.className = classes.HISTORY_ITEM;

            newHistoryListItem.appendChild(document.createTextNode(this.saveList[i]));

            // add new item to history item list
            if (this.saveList[i] !== '' && this.saveList[i] !== this.searchHistoryList.lastChild.innerHTML) {
                this.searchHistoryList.appendChild(newHistoryListItem);
            }
        }
    }

    /**
     * Show history list with last 5 search queries
     */
    showHistoryList = () => {
        this.searchHistory.classList.add(state.ACTIVE);

        const searchHistoryItems = [...this.container.querySelectorAll('.js-history-item')];
        const searchByHistoryItemsToShow = [...searchHistoryItems.slice(1).slice(-5)];
        const searchByHistoryItemsToHide = searchHistoryItems.slice(0, searchHistoryItems.length - 5);
        // hide all queries except last 5
        for (let i = 0; i < searchByHistoryItemsToHide.length; i += 1) {
            if (searchByHistoryItemsToHide[i].classList.contains(state.ACTIVE)) searchByHistoryItemsToHide[i].classList.remove(state.ACTIVE);
        }
        // show last 5 queries
        for (let i = 0; i < searchByHistoryItemsToShow.length; i += 1) {
            searchByHistoryItemsToShow[i].classList.add(state.ACTIVE);
            this.searchByHistoryItem();
        }
    }

    /**
     * Show auto suggest queries while typing more than 3 letters
     */
    suggestSearchQuery = () => {
        const searchHistoryItems = [...this.container.querySelectorAll('.js-history-item')];

        for (let i = 0; i < searchHistoryItems.length; i += 1) {

            const findNameValue = searchHistoryItems[i].textContent.toUpperCase();
            const searchInputValue = this.searchInput.value.toUpperCase();
            const searchMatched = findNameValue.includes(searchInputValue);

            if (findNameValue) {
                if (searchMatched) {
                    findNameValue;
                    searchHistoryItems[i].classList.add(state.ACTIVE);
                } else {
                    searchHistoryItems[i].classList.remove(state.ACTIVE);
                }
            }

            // Show last search queries while typing less than 3 letters
            if (searchInputValue.length < 3) this.showHistoryList();
        }
    }

    /**
     *  remove old history item
     */
    checkLastQuerys = () => {
        // stored 50 last search querys
        if (this.saveList.length > 50) {
            this.saveList.splice(0, 1);
        }
    }

    /**
     *  hide search history
     */
    hideQuerysHistory = () => {
        this.searchHistory.classList.remove(state.ACTIVE);
    }

    /**
     * Check total items list.
     * Add a button if there are more items than shown.
     *
     * @param respond {object} - receivved data from server
     */
    checkMoreItems = (respond) => {
        const items = [...this.container.querySelectorAll('.js-figure')];

        this.loadMore.classList.add(state.ACTIVE);
        if (items.length === respond.data.total) this.loadMore.classList.remove(state.ACTIVE);
    }

    // Show more items on click
    loadMoreItems = () => {
        this.getSearchingPath();
    }

    errorShow = () => {
        this.messageError.classList.add(state.ACTIVE);
        this.searchInput.classList.add(state.ERROR);
    }

    errorRemove = () => {
        if (this.searchInput.classList.contains(state.ERROR)) {
            this.messageError.classList.remove(state.ACTIVE);
            this.searchInput.classList.remove(state.ERROR);
        }
    }

    /**
     * render result list with received datat
     *
     *  @param respond {object} - receivved data from server
     */
    renderResults = (respond) => {
        let renderData;
        this.searchInput.value === '' ?
            renderData = respond.data :
            renderData = respond.data.results;

        const template = this.nunjEnv.getTemplate('result.nunj');
        const insertTemplate = template.render({ renderData }); // rendering nunjucks template
        this.results.insertAdjacentHTML('beforeend', insertTemplate);

        const modalTemplate = this.nunjEnv.getTemplate('modal-content.nunj');
        const insertModalTemplate = modalTemplate.render({ renderData }); // rendering nunjucks template
        this.modalContent.insertAdjacentHTML('beforeend', insertModalTemplate);

        this.checkExistsImages(respond);
        this.loadMore.classList.add(state.ACTIVE);

        if (respond.data.total_pages > 0 || respond.config.url.includes('random')) {
            this.checkMoreItems(respond);
        } else {
            this.loadMore.classList.remove(state.ACTIVE);
        }
        this.handleSelectImage();
        this.loaderDisable();
    }

    handleSelectImage = () => {
        const items = [...this.container.querySelectorAll('.js-figure')];

        for (let i = 0; i < items.length; i += 1) {
            items[i].addEventListener('click', this.renderModal);
        }
    }

    renderModal = (respond) => {
        this.modal.classList.add(state.ACTIVE);
        this.openSelectedImage();
    }

    openSelectedImage = () => {
        const clickedImages = document.querySelectorAll('.js-modal-item');
        const itemId = event.currentTarget.dataset.id;

        for (let i = 0; i < clickedImages.length; i += 1) {
            if (clickedImages[i].classList.contains(state.ACTIVE)) clickedImages[i].classList.remove(state.ACTIVE);
        }
        this.modalContent.querySelector(`#_${itemId}`).classList.add(state.ACTIVE);
    }

    // handle outside click
    handleClickModal = (event) => {
        event.target === this.modal ? this.closeModalWindow() : false;
    }

    // close modal window
    closeModalWindow = () => {
        this.modal.classList.remove(state.ACTIVE);
    }

    resetSearchResults = () => {
        this.results.innerHTML = '';
        this.loadMore.classList.remove(state.ACTIVE);
    }

    // add loader
    loaderActive = () => {
        this.loader.classList.add(state.ACTIVE);
    }

    // delete loader
    loaderDisable = () => {
        this.loader.classList.remove(state.ACTIVE);
    }
}
