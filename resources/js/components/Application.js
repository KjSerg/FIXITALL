import {detectBrowser, isMobile, showPreloader} from "./utils/_helpers";
import {burger} from "./ui/_burger";
import {accordion} from "./ui/_accardion";
import {numberInput} from "./forms/_number-input";
import {showPassword} from "./forms/_show-password";
import {fancyboxInit, showNotices} from "../plugins/_fancybox-init";
import {selectrickInit} from "../plugins/_selectric-init";
import {GoogleMap} from "./Map";
import BookForm from "./book/BookForm";
import FormHandler from "./forms/FormHandler";
import Slick from "../plugins/Slick";
import {makeActiveStars} from "./forms/_rating-inputs";

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
            this.showLoaderOnClick();
            this.googleMapInit();
            const bool = new BookForm();
            const form = new FormHandler('.form-js');
            const slick = new Slick();
        });
    }

    googleMapInit() {
        const map = new GoogleMap();
        map.initAutocomplete();
        this.$doc.on('click', '.book-form-address__button', function (e) {
            setTimeout(function () {
                map.initMaps();
            }, 300);
        });
    }


}