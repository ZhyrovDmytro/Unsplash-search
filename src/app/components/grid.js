import imagesLoaded from 'imagesloaded';
import Masonry from 'masonry-layout';

export default () => {
    const grid = document.querySelector('.js-search-result');
    let msnry;

    imagesLoaded(grid, () => {
        msnry = new Masonry(grid, {
            itemSelector: '.grid-item',
            columnWidth: '.grid-sizer',
            percentPosition: true
        });
    });
};
