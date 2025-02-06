import {hidePreloader, showPreloader} from "../utils/_helpers";
import {selectrickInit} from "../../plugins/_selectric-init";
import 'selectric';

export default class BookForm {
    constructor() {
        this.$doc = $(document);
        this.$body = $("body");
        this.$form = this.$doc.find('.book-form');
        this.$timeList = this.$doc.find('#book-time-list');
        this.rowCount = 1;
        this.service = '';
        this.category = '';
        this.date = new Date();
        this.time = '';
        this.parser = new DOMParser();
        this.init();
    }

    init() {
        this.addAndRemoveRows();
        this.categorySelectInit();
        this.serviceSelectInit();
        this.fileReader();
        this.questionsListener();
        this.calendarInit();
        this.bookTimeSelect();
    }

    fileReader() {

        this.$doc.on('change', '.book-form-file1', function (event) {
            const files = event.target.files;
            const input = $(this)[0];
            const $i = $(this);
            const $l = $i.closest('.form-label');
            const $p = $l.find('.book-form-photos-placeholder');
            const $r = $l.find('.book-form-photos-results');
            const dataLimit = parseInt((input.dataset.limit || 1), 10) * 1024 * 1024;
            $r.html('');
            $p.show();
            $r.hide();
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const reader = new FileReader();
                    console.log(file.size)
                    console.log(dataLimit)
                    if (file.size > dataLimit) {
                        input.value = "";
                        alert('Max file size: ' + (input.dataset.limit || 1) + 'MB');
                        $p.show();
                        $r.hide();
                        return;
                    }
                    reader.onload = function (e) {
                        $r.append(`<span><img src="${e.target.result}" alt=""></span>`);
                    };
                    reader.readAsDataURL(file);
                }
                $p.hide();
                $r.show();
            }
        });
        $(document).ready(function () {
            const $dropZone = $('.drop-zone');
            const $fileInput = $('.book-form-file');
            const $results = $('.book-form-photos-results');
            const maxFiles = parseInt($fileInput.data('limit')) || 5;
            let filesArray = [];
            const $l = $fileInput.closest('.form-label');
            const $p = $l.find('.book-form-photos-placeholder');
            const $r = $l.find('.book-form-photos-results');
            $dropZone.on('dragover', function (e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).addClass('dragover');
            });

            $dropZone.on('dragleave', function (e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).removeClass('dragover');
            });

            $dropZone.on('drop', function (e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).removeClass('dragover');

                const files = e.originalEvent.dataTransfer.files;
                handleFiles(files);
            });

            $fileInput.on('change', function (e) {
                const files = e.target.files;
                handleFiles(files);
            });

            function handleFiles(files) {
                const validExtensions = $fileInput.attr('accept').split(',');
                const maxSizeAttr = $fileInput.attr('data-max-size') || '5';
                const maxSize = Number(maxSizeAttr) * 1024 * 1024;

                for (let i = 0; i < files.length; i++) {
                    if (filesArray.length >= maxFiles) {
                        alert(`You can upload a maximum of ${maxFiles} files.`);
                        break;
                    }

                    let file = files[i];

                    if (!validExtensions.includes(file.type)) {
                        alert('Unsupported file type. Only ' + $fileInput.attr('accept') + ' are allowed.');
                        continue;
                    }

                    if (file.size > maxSize) {
                        alert('File size exceeds ' + maxSizeAttr + 'MB.');
                        continue;
                    }

                    filesArray.push(file);
                    previewFile(file);
                }
                updateFileInput();
            }

            function previewFile(file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const $img = $('<img>', {src: e.target.result, alt: ''});
                    const $span = $('<span>').append($img);
                    const $removeBtn = $('<button>', {text: '×', class: 'remove-btn'});
                    $span.append($removeBtn);
                    $results.append($span);
                    $removeBtn.on('click', function () {
                        const index = $results.find('span').index($span);
                        filesArray.splice(index, 1);
                        $span.remove();
                        updateFileInput();
                    });
                };
                reader.readAsDataURL(file);
            }

            function updateFileInput() {
                const dataTransfer = new DataTransfer();
                filesArray.forEach(file => {
                    dataTransfer.items.add(file);
                });
                $fileInput[0].files = dataTransfer.files;
                if (dataTransfer.files.length === 0) {
                    $p.show();
                    $r.hide();
                } else {
                    $p.hide();
                    $r.show();
                }
            }
        });

    }

    calendarInit() {
        const t = this;
        const monthYear = document.getElementById("monthYear");
        const calendarDays = document.getElementById("calendarDays");
        const prevMonthBtn = document.getElementById("prevMonth");
        const nextMonthBtn = document.getElementById("nextMonth");

        let currentDate = new Date();

        function updateCalendar() {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const today = new Date();

            monthYear.textContent = `${months[month]} ${year}`;
            calendarDays.innerHTML = "";
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDayOfMonth = new Date(year, month, 1).getDay();
            const startDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;
            for (let i = 0; i < startDay; i++) {
                const emptyDiv = document.createElement("div");
                emptyDiv.classList.add("empty");
                calendarDays.appendChild(emptyDiv);
            }
            for (let day = 1; day <= daysInMonth; day++) {
                const dayDiv = document.createElement("div");
                dayDiv.classList.add("day");
                dayDiv.textContent = day;
                if (
                    today.getFullYear() === year &&
                    today.getMonth() === month &&
                    today.getDate() === day
                ) {
                    dayDiv.classList.add("today");
                }
                if (
                    (today.getFullYear() > year) ||
                    (today.getFullYear() === year && today.getMonth() > month) ||
                    (today.getFullYear() === year && today.getMonth() === month && today.getDate() > day)
                ) {
                    dayDiv.classList.add("not-active");
                }
                calendarDays.appendChild(dayDiv);
                const dataDate = year + '-' + month + '-' + day;
                const dataFormatedDate = year + '-' + (month + 1) + '-' + day;
                dayDiv.setAttribute('data-date', dataFormatedDate);
                dayDiv.setAttribute('data-not-formated-date', dataDate);
                dayDiv.addEventListener("click", (e) => {
                    document.querySelectorAll('.day').forEach(function (el) {
                        el.classList.remove('active');
                    })
                    dayDiv.classList.add("active");
                    t.date = new Date(dataFormatedDate);
                    t.setCurrentDate();
                });
            }
        }

        prevMonthBtn.addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            t.date = currentDate;
            updateCalendar();
            t.updateCalendarData();
        });

        nextMonthBtn.addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            t.date = currentDate;
            updateCalendar();
            t.updateCalendarData();
        });

        updateCalendar();

    }

    bookTimeSelect() {
        const t = this;
        this.$doc.on('click', '.book-time-list-item', function (event) {
            event.preventDefault();
            const $t = $(this);
            t.$doc.find('.book-time-list-item').removeClass('active');
            $t.addClass('active');
            t.time = $t.text().trim();
        });
    }

    getFormatedDate() {
        const t = this;
        const date = t.date;
        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    }

    getDate() {
        const t = this;
        const date = t.date;
        return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
    }

    questionsListener() {
        this.$doc.on('click', '.book-form-question-controls__back', function (e) {
            e.preventDefault();
            const $i = $(this);
            const $wrap = $i.closest('.book-form-question');
            const $form = $i.closest('.book-form');
            const index = $wrap.index();
            const transformX = index > 0 ? (index - 1) * 100 : 0;
            $form.find('.book-form-question').css('transform', 'translateX(-' + transformX + '%)');
            updateHeaderStatus((index - 1));
        });
        this.$doc.on('change', '.book-form-questions input[type="radio"]', function (e) {
            const $i = $(this);
            const $wrap = $i.closest('.book-form-question');
            const $form = $i.closest('.book-form');
            const $head = $form.find('.book-form-head');
            const index = $wrap.index();
            const questionCount = $form.find('.book-form-question').length;
            if ((index + 1) >= questionCount) {
                $form.closest('section').find('.book-form__trigger').trigger('click');
                return;
            }
            const transformX = (index + 1) * 100;
            $form.find('.book-form-question').css('transform', 'translateX(-' + transformX + '%)');
            updateHeaderStatus((index + 1));
        });

        const updateHeaderStatus = (step) => {
            this.$form.find('.book-form-head__item').removeClass('finished').removeClass('active');
            this.$form.find('.book-form-head__item').each(function (index) {
                //finished
                //active
                const $t = $(this);
                if (index < step) $t.addClass('finished');
                if (index === step) $t.addClass('active');
            });
        }
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
                url: t.makeUrl(url)
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
        const t = this;
        $d.on('change', '.category-select', function (e) {
            const $select = $(this);
            const $row = $select.closest('.book-form-row');
            const $form = $select.closest('.book-form');
            const $type = $row.find('.type-select');
            const val = $select.val();
            const $button = $d.find('.book-form__button');
            t.category = $select.val();
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
                url: t.makeUrl(getTypeURL)
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

    serviceSelectInit() {
        const $d = this.$doc;
        const t = this;
        $d.on('change', '.service-select', function (e) {
            const $select = $(this);
            t.service = $select.val();
            console.log($select.val())
            console.log(this.service)
            const $form = $select.closest('.book-form');
            const $delete = $d.find('.book-form-row__delete');
            const $categories = $form.find('.category-select');
            const $types = $form.find('.type-select');
            const $quantity = $form.find('.form-quantity');
            $delete.each(function () {
                $(this).trigger('click');
            });
            $types.each(function () {
                $(this).closest('.form-label').addClass('not-active');
            });
            $quantity.each(function () {
                $(this).addClass('not-active');
            });
            showPreloader();
            $.ajax({
                type: 'get',
                url: t.makeUrl(getCategoriesURL),
            }).done((response) => {
                if (response) {
                    $categories.selectric('destroy');
                    $categories.removeClass('selectric-init');
                    $categories.html(response);
                    selectrickInit();
                    $categories.closest('.form-label').removeClass('not-active');

                }
                hidePreloader();
            });
        });
    }

    makeUrl(url) {
        if (!url) return url;
        url = url.includes('?') ? url + '&' : url + '?';
        url = url + 'service=' + this.service + '&' + 'category=' + this.category;
        return url;
    }

    updateCalendarData() {
        const t = this;
        const date = t.date;

        console.log(t.getFormatedDate());

    }

    setCurrentDate() {
        console.log(this.getFormatedDate());
        if(this.$timeList.length===0) return;
        $('html, body').animate({
            scrollTop: this.$timeList.offset().top
        });
    }
}