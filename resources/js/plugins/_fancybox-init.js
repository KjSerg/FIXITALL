import $ from 'jquery';

window.$ = $;
window.jQuery = $;
import '@fancyapps/fancybox';

export const fancyboxInit = () => {
    $('[data-fancybox]').fancybox({});
    $(document).on('click', '.fancybox', function (e) {
        e.preventDefault();
        const $t = $(this);
        const href = $t.attr('href');
        if (href === undefined) return;
        const $el = $(document).find(href);
        if ($el.length === 0) return;
        $.fancybox.open($el);
    });
    $(document).on('click', '.close-fancybox-modal', function (e) {
        e.preventDefault();
        $.fancybox.close();
    });
};

export function showNotices(index = 0) {
    const $notices = $(document).find('.notices > *');
    if ($notices.length === 0) return;
    const $item = $notices[index];
    if ($item === undefined) return;
    let nextIndex = index + 1;
    const $itemNext = $notices[nextIndex];
    const args = {};
    if ($itemNext !== undefined) args.afterClose = function () {
        showNotices(nextIndex);
    };
    $.fancybox.open($item, args);
}