import {isObjectEmpty, moveToElement, showPreloader} from "../utils/_helpers";
import 'selectric';
import {selectrickInit} from "../../plugins/_selectric-init";
import BookForm from "../book/BookForm";
import {showMsg, showNotices} from "../../plugins/_fancybox-init";

export default class FormHandler {
    constructor(selector) {
        this.selector = selector;
        this.$document = $(document);
        this.forms = $(document).find(selector);
        this.$sendengForm = $(document).find(selector);
        this.initialize();
        this.selectInit();
    }

    selectInit() {
        const t = this;
        $(document).on('change', '.trigger-form-js', function (e) {
            const $select = $(this);
            $select.closest('form').submit();
        });
    }

    initialize() {
        this.$document.on('submit', this.selector, (e) => this.handleSubmit(e));
    }

    handleSubmit(event) {
        event.preventDefault();

        const $form = $(event.target);
        const formId = $form.attr('id');



        if (!this.validateForm($form)) return;

        const formData = new FormData(document.getElementById(formId));
        $form.addClass('sending');
        this.$sendengForm = $form;
        this.sendRequest({
            type: $form.attr('method') || "POST",
            url: $form.attr('action') || adminAjax,
            processData: false,
            contentType: false,
            data: formData,
        });

        if (!$form.hasClass('no-reset')) $form.trigger('reset');
    }

    validateForm($form) {
        let isValid = true;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

        // Validate inputs and textareas
        $form.find('input, textarea').each((_, input) => {
            const $input = $(input);
            const $label = $input.closest('.form-label');
            const value = $input.val().trim();
            const regExp = $input.data('reg') ? new RegExp($input.data('reg')) : null;

            if ($input.attr('required') && (!value || (regExp && !regExp.test(value)))) {
                isValid = false;
                $input.addClass('error');
                $label.addClass('error');
                moveToElement($label);
            } else {
                $input.removeClass('error');
                $label.removeClass('error');
            }
        });

        // Validate select elements
        $form.find('select[required]').each((_, select) => {
            const $select = $(select);
            const $label = $select.closest('.form-label');
            const value = $select.val();
            const test = !value || value === null || (Array.isArray(value) && value.length === 0);

            if (test) {
                isValid = false;
                $label.addClass('error');
                moveToElement($label);
            } else {
                $label.removeClass('error');
            }
        });

        // Validate custom required inputs
        if (!this.validateRequiredInputs($form)) isValid = false;

        // Validate consent checkbox
        const $consent = $form.find('input[name="consent"]');
        if ($consent.length && !$consent.prop('checked')) {
            $consent.closest('.form-consent').addClass('error');
            isValid = false;
            moveToElement($consent.closest('.form-consent'));
        } else {
            $consent.closest('.form-consent').removeClass('error');
        }

        return isValid;
    }

    validateRequiredInputs($form) {
        const inputsGroup = {};
        let isValid = true;

        $form.find('[data-required]').each((_, input) => {
            const $input = $(input);
            const name = $input.attr('name');

            if (name) {
                if (!inputsGroup[name]) inputsGroup[name] = [];
                if ($input.prop('checked')) {
                    inputsGroup[name].push($input.val());
                }
            }
        });

        Object.keys(inputsGroup).forEach((key) => {
            const isChecked = inputsGroup[key].length > 0;
            $form.find(`[name="${key}"]`).closest('.form-label').toggleClass('error', !isChecked);
            if (!isChecked) isValid = false;
        });

        return isValid;
    }

    sendRequest(options) {
        if(this.$document.find('body').hasClass('loading')){
            showMsg('Error! Reload the page!');
            return;
        }
        this.showPreloader();
        this.$document.find('body').addClass('loading').addClass('sending-form');
        $.ajax(options).done((response) => {
            if (response) {
                const isJson = this.isJsonString(response);
                this.$document.find('body').removeClass('loading').removeClass('sending-form');
                this.$document.find('.loading-button').removeClass('loading-button').removeClass('not-active');
                this.$sendengForm.removeClass('sending');
                if (isJson) {
                    const data = JSON.parse(response);
                    const message = data.msg || '';
                    const text = data.msg_text || '';
                    const type = data.type || '';
                    const url = data.url;
                    const reload = data.reload || '';
                    const html = data.step_html || '';
                    if (message) this.showMessage(message, type, text);
                    if (html) {
                        this.$document.find('.book-render').html(html);
                        selectrickInit();
                        if (this.$document.find('#calendarDays')) {
                            const book = new BookForm();
                            book.calendarInit();
                        }
                        $('html, body').animate({
                            scrollTop: this.$document.find('.book-render').offset().top
                        });
                        showNotices();
                    }
                    if (url) {
                        showPreloader();
                        window.location.href = url;
                        return;
                    }
                    if (reload === 'true') {
                        if (message) {
                            setTimeout(function () {
                                window.location.reload();
                            }, 2000);
                            return;
                        }
                        window.location.reload();
                        return;
                    }
                } else {
                    this.showMessage(response);
                }

            }
            this.hidePreloader();
        });
    }

    isJsonString(str) {
        try {
            JSON.parse(str);
            return true;
        } catch {
            return false;
        }
    }

    showMessage(message, type = '', text = '') {
        const selector = '#dialog' + (type ? '-' + type : '');
        const $modal = $(document).find(selector);
        if ($modal.length === 0) {
            alert(message);
            return;
        }
        $modal.find('.modal__title').html(message);
        $modal.find('.modal__text').html(text);
        $.fancybox.open($modal);
        setTimeout(() => $.fancybox.close(), 3000);
    }

    showPreloader() {
        $('.preloader').addClass('active');
    }

    hidePreloader() {
        $('.preloader').removeClass('active');
    }
}

function setDefaultImage(preview) {
    if (preview) {
        preview.src = preview.getAttribute('data-default');
    }
}

