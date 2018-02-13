import nunjucks from 'nunjucks';
import axios from 'axios';
import { API, template, state, nunjucksOption } from './../constants';

export default class Search {
    constructor(container) {
        this.container = container;
        this.searchButton = this.container.querySelector('.js-button-search');
        this.searchRandom = this.container.querySelector('.js-button-random');
        this.results = this.container.querySelector('.js-search-result');
        this.loader = this.container.querySelector('.loader');

        this.nunjEnv = nunjucks.configure(template.templatePath, nunjucksOption.web);

        this.searchButton.addEventListener('click', this.searchItems);
        this.searchRandom.addEventListener('click', this.searchRandom);
    }

    searchItems = () => {
        this.loaderActive();

        axios.get(API.searchItems)
            .then(respond => {
                this.renderResults(respond);
            })
            .catch(error => {
                console.error('Failed!');
            });
    }

    searchRandom = () => {
        console.log('asfdasd');
    }

    renderResults = (data) => {
        const template = this.nunjEnv.getTemplate('result.nunj');
        const insertTemplate = template.render(data); // rendering nunjucks template

        this.results.innerHTML = insertTemplate;
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
