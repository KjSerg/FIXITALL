import {hidePreloader, showPreloader} from "../utils/_helpers";
import {selectrickInit} from "../../plugins/_selectric-init";
import 'selectric';

export default function addAndRemoveRows() {
    $(document).on('click', '.book-form-row__delete', function (e) {
        e.preventDefault();
        const $row = $(this).closest('.book-form-row');
        $row.find('.select').each(function () {
            $('select').selectric('destroy');
        })
        $row.remove();
    });
    $(document).on('click', '.book-form__button', function (e) {
        e.preventDefault();
        const $t = $(this);
        const url = $t.attr('href');
        if (url === undefined) return;
        if (url === '#') return;
        showPreloader();
        $.ajax({
            type: 'get',
            url: url
        }).done((response) => {
            $t.before(response);
            selectrickInit();
            hidePreloader();
        });
    });
}