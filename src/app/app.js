import 'babel-polyfill';
/**
 * https://github.com/Keyamoon/svgxuse
 * If you do not use SVG <use xlink:href="…"> elements, remove svgxuse module
 */
import Masonry from 'masonry-layout';
import 'svgxuse';
import init from './init';
import factory from './factory';
import { render, renderFactory } from './render';
import Search from './components/search';
// import Grid from './components/Grid';

const app = (config) => {
    init(Search, document.querySelector('.js-search'));
    // init(Grid, document.querySelector('.js-search-result'));
};

app(window.config);
