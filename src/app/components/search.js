import nunjucks from 'nunjucks';
import axios from 'axios';
import { API, template, state, nunjucksOption, unsplashClient, errors, classes } from './../constants';

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

        this.searchHistoryStorage = [];
        this.saveList = [];

        this.pageNumber = 1;

        this.nunjEnv = nunjucks.configure(template.TEMPLATE_PATH, nunjucksOption.web);

        this.searchButton.addEventListener('click', this.searchItems);
        this.searchInput.addEventListener('focus', this.errorRemove);
        this.searchInput.addEventListener('focusIn', this.showQuerysHistory);
        this.searchInput.addEventListener('blur', this.hideQuerysHistory);
        this.searchInput.addEventListener('keyup', this.searchItemsByEnterKey);
        this.searchInput.addEventListener('input', this.resetSearchResults);
        this.searchRandom.addEventListener('click', this.getSearchingPath);
        this.loadMoreButton.addEventListener('click', this.loadMoreItems);
        this.modal.addEventListener('click', this.handleClickModal);
        this.closeModalButton.addEventListener('click', this.closeModalWindow);
    }

    requestService = (searchPath) => {

        this.loaderActive();

        axios.get(searchPath)
            .then(respond => {
                // console.log(respond);
                this.renderResults(respond);
            })
            .catch(error => {
                console.error('Failed!');
            });
    }

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
            searchPath = `${API.SEARCH_ITEMS}?page=${nextPage}&per_page=10&query=${inputValue}&client_id=${unsplashClient.ID}`;
        }

        this.requestService(searchPath);
    }

    searchItems = () => {
        const inputValue = this.searchInput.value;
        this.searchHistoryStorage.push(inputValue);

        if (inputValue.trim() === '') {
            this.errorShow();
            this.messageError.innerHTML = errors.SEARCH_QUERY_EMPTY;
        } else if (inputValue.length < 3) {
            this.errorShow();
            this.messageError.innerHTML = errors.SEARCH_QUERY_SHORT;
        } else {
            this.getSearchingPath(inputValue);
            this.resetSearchResults();
        }
        // this.saveList.push(inputValue);
        // localStorage.setItem('list', JSON.stringify(this.saveList));

        // console.log(JSON.parse(localStorage.getItem(('list'))));
    }

    searchItemsByEnterKey = (event) => {
        const inputValue = this.searchInput.value;
        const inputQuery = this.inputValue;

        if (event.keyCode === 13) {
            this.searchInput.blur();
            this.searchButton.click(inputQuery);
        }
    }

    searchByHistoryItem = () => {
        this.searchInput.value = '';
        this.searchInput.value = event.target.innerHTML;

        this.searchItems();
    }

    checkExistsImages = (respond) => {
        if (respond.data.total < 1) {
            this.errorShow();
            this.messageError.innerHTML = errors.SEARCH_QUERY_ERROR;
        }
    }

    showQuerysHistory = () => {
        const newHistoryListItem = document.createElement('li');
        newHistoryListItem.className = classes.HISTORY_ITEM;

        const newtextnode = [...this.searchHistoryStorage].pop();
        const listItemContent = document.createTextNode(newtextnode);

        newHistoryListItem.appendChild(listItemContent);

        if (newtextnode !== undefined) {
            if (this.searchHistoryList.lastChild.innerHTML !== newtextnode) {
                this.searchHistoryList.appendChild(newHistoryListItem);
            }
        }

        this.checkLastQuerys();

        this.searchHistory.classList.add(state.ACTIVE);
        const searchHistoryItem = [...this.container.querySelectorAll('.js-history-item')];

        for (let i = 0; i < searchHistoryItem.length; i += 1) {
            searchHistoryItem[i].addEventListener('click', this.searchByHistoryItem);
        }
    }

    checkLastQuerys = () => {
        if (this.searchHistoryList.children.length > 4) this.searchHistoryList.firstChild.remove();
    }

    hideQuerysHistory = () => {
        this.searchHistory.classList.remove(state.ACTIVE);
    }

    checkMoreItems = (respond) => {
        const items = [...this.container.querySelectorAll('.js-figure')];

        this.loadMore.classList.add(state.ACTIVE);
        if (items.length === respond.data.total) this.loadMore.classList.remove(state.ACTIVE);
    }

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

        this.showQuerysHistory();
    }

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
