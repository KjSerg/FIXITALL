import {hidePreloader, showPreloader} from "../utils/_helpers";
import {selectrickInit} from "../../plugins/_selectric-init";
import 'selectric';

export default class BookForm {
    constructor() {
        this.$doc = $(document);
        this.$body = $("body");
        this.rowCount = 1;
        this.parser = new DOMParser();
        this.init();
    }

    init() {
        this.addAndRemoveRows();
        this.categorySelectInit();
    }

    addAndRemoveRows() {
        const t = this;
        this.$doc.on('click', '.book-form-row__delete', function (e) {
            e.preventDefault();
            const $row = $(this).closest('.book-form-row');
            $row.find('.select').each(function () {
                $('select').selectric('destroy');
            })
            $row.remove();
            t.rowCount = t.rowCount - 1;
            t.changeOtherStatus();
        });
        this.$doc.on('click', '.book-form__button', function (e) {
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
                if (response) {
                    $t.before(response);
                    selectrickInit();
                    t.rowCount = t.rowCount + 1;
                    t.changeOtherStatus();
                }
                hidePreloader();
            });
        });
    }

    changeOtherStatus() {
        const count = this.rowCount;
        const $option = this.$doc.find('option[value="other"]');
        const $select = $option.closest('select');
        $select.selectric('destroy');
        $select.removeClass('selectric-init');
        if (count > 1) {
            $option.attr('disabled', 'disabled');
        } else {
            $option.removeAttr('disabled');
        }
        selectrickInit();
    }

    categorySelectInit() {
        const $d = this.$doc;
        $d.on('change', '.category-select', function (e) {
            const $select = $(this);
            const $row = $select.closest('.book-form-row');
            const $form = $select.closest('.book-form');
            const $type = $row.find('.type-select');
            const val = $select.val();
            const $button = $d.find('.book-form__button');

            if (val === 'other') {
                $button.hide();
                $form.find('.book-form-address').hide();
                $row.find('.form-quantity').addClass('not-active');
                $type.closest('.form-label').addClass('not-active');
                return;
            }
            $button.show();
            $form.find('.book-form-address').show();
            showPreloader();
            $.ajax({
                type: 'get',
                url: getTypeURL
            }).done((response) => {
                if (response) {
                    $type.selectric('destroy');
                    $type.removeClass('selectric-init');
                    $type.html(response);
                    selectrickInit();
                    $type.closest('.form-label').removeClass('not-active');
                    $row.find('.form-quantity').removeClass('not-active');
                }
                hidePreloader();
            });
        });
    }
}