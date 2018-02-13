import nunjucks from 'nunjucks';
import axios from 'axios';
import { API, template, state, nunjucksOption, unsplashClient, error } from './../constants';

export default class Search {
    constructor(container) {
        this.container = container;
        this.searchInput = this.container.querySelector('.js-search-input');
        this.searchButton = this.container.querySelector('.js-button-search');
        this.messageError = this.container.querySelector('.js-error-message');
        this.searchRandom = this.container.querySelector('.js-button-random');
        this.results = this.container.querySelector('.js-search-result');
        this.loader = this.container.querySelector('.loader');

        this.nunjEnv = nunjucks.configure(template.templatePath, nunjucksOption.web);

        this.searchButton.addEventListener('click', this.searchItems);
        this.searchInput.addEventListener('focus', this.errorReset);
        this.searchInput.addEventListener('keyup', this.searchItemsByEnterKey);
        this.searchRandom.addEventListener('click', this.requestService);
    }

    requestService = (inputValue) => {
        let searchPath;
        let data;

        event.target === this.searchRandom ?
            searchPath = `${API.searchItemsRandom}?count=12&client_id=${unsplashClient.id}` :
            searchPath = `${API.searchItems}&query=${inputValue}&client_id=${unsplashClient.id}`;

        this.loaderActive();

        axios.get(searchPath)
            .then(respond => {
                this.renderResults(respond);
            })
            .catch(error => {
                console.error('Failed!');
            });
    }

    searchItems = () => {
        const inputValue = this.searchInput.value;

        if (inputValue === '') {
            this.messageError.classList.add(state.active);
            this.messageError.innerHTML = error.searchQueryEmpty;
            this.searchInput.classList.add(state.error);
        } else if (inputValue.length < 3) {
            this.messageError.classList.add(state.active);
            this.messageError.innerHTML = error.searchQueryShort;
            this.searchInput.classList.add(state.error);
        } else {
            this.requestService(inputValue);
        }
    }

    errorReset = () => {
        if (this.searchInput.classList.contains(state.error)) {
            this.messageError.classList.remove(state.active);
            this.searchInput.classList.remove(state.error);
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

    renderResults = (respond) => {
        let renderData;

        this.searchInput.value === '' ?
            renderData = respond.data :
            renderData = respond.data.results;

        const template = this.nunjEnv.getTemplate('result.nunj');
        const insertTemplate = template.render({ renderData }); // rendering nunjucks template
        this.results.innerHTML = insertTemplate;


        this.loaderDisable();
        this.searchInput.value = '';
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
