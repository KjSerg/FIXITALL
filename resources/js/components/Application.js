import {detectBrowser, isMobile, showPreloader} from "./utils/_helpers";
import {burger} from "./ui/_burger";
import {accordion} from "./ui/_accardion";
import {numberInput} from "./forms/_number-input";
import {showPassword} from "./forms/_show-password";
import {fancyboxInit, showNotices} from "../plugins/_fancybox-init";
import {selectrickInit} from "../plugins/_selectric-init";
import BookForm from "./book/BookForm";
import FormHandler from "./forms/FormHandler";
import Slick from "../plugins/Slick";
import {makeActiveStars} from "./forms/_rating-inputs";
import changeQuestionsHead from "./book/_questions";
import {lazyLoad} from "./utils/lazy";

export default class Application {
    constructor() {
        this.$doc = $(document);
        this.$body = $("body");
        this.parser = new DOMParser();
        this.init();
    }

    init() {
        this.initBrowserAttributes();
        this.initComponents();
    }

    showLoaderOnClick() {
        this.$doc.on('click', 'a.show-load, .header a, .footer a', function (e) {
            if (!$(this).attr('href').includes('#')) showPreloader();
        });
    }

    initBrowserAttributes() {
        const browserName = detectBrowser();
        this.$body.attr("data-browser", browserName).addClass(browserName);

        if (isMobile) {
            this.$body.attr("data-mobile", "mobile");
        }
    }

    initComponents() {
        this.$doc.ready(() => {
            showNotices();
            burger();
            accordion();
            numberInput();
            showPassword();
            selectrickInit();
            fancyboxInit();
            makeActiveStars();
            changeQuestionsHead();
            this.showLoaderOnClick();
            this.linkListener();
            const book = new BookForm();
            book.init();
            const form = new FormHandler('.form-js');
            const slick = new Slick();
            lazyLoad()
        });
    }



    linkListener() {
        const t = this;
        this.$doc.on('click', 'a[href*="#"]:not(.fancybox, .book-form__trigger)', function (e) {
            e.preventDefault();
            const $t = $(this);
            const href = $t.attr('href');
            if (href === '#') return;
            const hashValue = href.split('#')[1];
            if (hashValue !== undefined) {
                const $el = t.$doc.find('#' + hashValue);
                if ($el.length > 0) {
                    $('html, body').animate({
                        scrollTop: $el.offset().top
                    });
                    return;
                }
            }
            window.location.href = href;
        });
        this.$doc.on('click', '[data-link]', function (e) {
            e.preventDefault();
            const $t = $(this);
            const href = $t.attr('data-link');
            if (href === '#') return;
            const hashValue = href.split('#')[1];
            if (hashValue !== undefined) {
                const $el = t.$doc.find('#' + hashValue);
                if ($el.length > 0) {
                    $('html, body').animate({
                        scrollTop: $el.offset().top
                    });
                    return;
                }
            }
            window.location.href = href;
        });
    }
}