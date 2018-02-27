import 'babel-polyfill';

import Masonry from 'masonry-layout';
import 'svgxuse';
import init from './init';
import factory from './factory';
import { render, renderFactory } from './render';
import Search from './components/search';

const app = (config) => {
    init(Search, document.querySelector('.js-search'));
};

app(window.config);
