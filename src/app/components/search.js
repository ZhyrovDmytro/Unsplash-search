import nunjucks from 'nunjucks';
import axios from 'axios';
import { API, template, state, nunjucksOption, unsplashClient, error } from './../constants';

export default class Search {
    constructor(container) {
        this.container = container;
        this.searchInput = this.container.querySelector('.js-search-input');
        this.searchButton = this.container.querySelector('.js-button-search');
        this.loadMoreButton = this.container.querySelector('.js-button-more');
        this.loadMore = this.container.querySelector('.js-load-more');
        this.messageError = this.container.querySelector('.js-error-message');
        this.searchRandom = this.container.querySelector('.js-button-random');
        this.results = this.container.querySelector('.js-search-result');
        this.loader = this.container.querySelector('.loader');
        this.modal = document.querySelector('.js-modal');
        this.modalContent = document.querySelector('.js-modal-content');
        this.closeModalButton = document.querySelector('.js-modal-close');

        this.pageNumber = 1;

        this.nunjEnv = nunjucks.configure(template.templatePath, nunjucksOption.web);

        this.searchButton.addEventListener('click', this.searchItems);
        this.searchInput.addEventListener('focus', this.errorRemove);
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
                console.log(respond);
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
            searchPath = `${API.searchItemsRandom}?count=12&client_id=${unsplashClient.id}`;
            if (event.target !== this.loadMoreButton) this.resetSearchResults();
        } else {
            searchPath = `${API.searchItems}?page=${nextPage}&per_page=10&query=${inputValue}&client_id=${unsplashClient.id}`;
        }

        this.requestService(searchPath);
    }

    searchItems = () => {
        const inputValue = this.searchInput.value;

        if (inputValue.trim() === '') {
            this.errorShow();
            this.messageError.innerHTML = error.searchQueryEmpty;
        } else if (inputValue.length < 3) {
            this.errorShow();
            this.messageError.innerHTML = error.searchQueryShort;
        } else {
            this.getSearchingPath(inputValue);
            this.resetSearchResults();
            sessionStorage.setItem('query', inputValue);
        }
    }

    searchItemsByEnterKey = (event) => {
        const inputValue = this.searchInput.value;
        const inputQuery = this.inputValue;

        if (event.keyCode === 13) {
            this.searchInput.blur();
            this.searchButton.click(inputQuery);
        }
    }

    checkMoreItems = (respond) => {
        const items = [...this.container.querySelectorAll('.js-figure')];

        this.loadMore.classList.add(state.active);
        if (items.length === respond.data.total) this.loadMore.classList.remove(state.active);
    }

    loadMoreItems = () => {
        this.getSearchingPath();
    }

    errorShow = () => {
        this.messageError.classList.add(state.active);
        this.searchInput.classList.add(state.error);
    }

    errorRemove = () => {
        if (this.searchInput.classList.contains(state.error)) {
            this.messageError.classList.remove(state.active);
            this.searchInput.classList.remove(state.error);
        }
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

        this.loaderDisable();
        this.loadMore.classList.add(state.active);

        if (respond.data.total_pages > 0 || respond.config.url.includes('random')) {
            this.checkMoreItems(respond);
        } else {
            this.loadMore.classList.remove(state.active);
        }
        this.handleSelectImage();
    }

    handleSelectImage = () => {
        const items = [...this.container.querySelectorAll('.js-figure')];

        for (let i = 0; i < items.length; i += 1) {
            items[i].addEventListener('click', this.renderModal);
        }
    }

    renderModal = (respond) => {
        this.modal.classList.add(state.active);
        this.openSelectedImage();
    }

    openSelectedImage = () => {
        const clickedImages = document.querySelectorAll('.js-modal-item');
        const itemId = event.currentTarget.dataset.id;

        for (let i = 0; i < clickedImages.length; i += 1) {
            if (clickedImages[i].classList.contains(state.active)) clickedImages[i].classList.remove(state.active);
        }
        this.modalContent.querySelector(`#_${itemId}`).classList.add(state.active);
    }

    // handle outside click
    handleClickModal = (event) => {
        event.target === this.modal ? this.closeModalWindow() : false;
    }

    // close modal window
    closeModalWindow = () => {
        this.modal.classList.remove(state.active);
    }

    resetSearchResults = () => {
        this.results.innerHTML = '';
        this.loadMore.classList.remove(state.active);
    }

    // add loader
    loaderActive = () => {
        this.loader.classList.add(state.active);
    }

    // delete loader
    loaderDisable = () => {
        this.loader.classList.remove(state.active);
    }
}
