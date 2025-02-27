import {hidePreloader, isJsonString, showPreloader} from "../utils/_helpers";
import {selectrickInit} from "../../plugins/_selectric-init";
import 'selectric';
import {showMsg, showNotices} from "../../plugins/_fancybox-init";
import {initTelMask} from "../forms/_number-input";

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
    }

    setParams() {
        const $select = this.$doc.find('.service-select');
        if ($select.length > 0) {
            this.service = this.$doc.find('.service-select').val();
        }
        this.rowCount = this.$doc.find('.book-form-row').length;
    }

    init() {
        this.addAndRemoveRows();
        this.categorySelectInit();
        this.serviceSelectInit();
        this.fileReader();
        this.questionsListener();
        this.calendarInit();
        this.bookTimeSelect();
        this.eventListener();
    }

    fileReader() {
        const t = this;
        const $fileInput = $(document).find('.book-form-file');
        if ($fileInput.length === 0) return;
        const $dropZone = $(document).find('.drop-zone');
        if ($dropZone.length === 0) return;
        let names = [];
        filesArray = [];
        const $results = $(document).find('.book-form-photos-results');
        const maxFiles = parseInt($fileInput.data('limit')) || 5;
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

        if ($fileInput.attr('data-gallery') !== undefined) {
            const imageUrls = $fileInput.attr('data-gallery').split(',');
            setFilesFromUrls($fileInput[0], imageUrls).then(r => {
                updateFileInput();
                toggleElements();
                this.$doc.find('.loading-button').removeClass('loading-button').removeClass('not-active');
            });
        }

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
                let name = file.name || '';
                if (names.includes(name)) {
                    alert('It seems that a file with this name: "' + name + '" has already been added by you!');
                    continue;
                }

                if (!validExtensions.includes(file.type)) {
                    alert('Unsupported file type. Only ' + $fileInput.attr('accept') + ' are allowed.');
                    continue;
                }

                if (file.size > maxSize) {
                    alert('File size exceeds ' + maxSizeAttr + 'MB.');
                    continue;
                }
                names.push(name);
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
            let dataTransfer = new DataTransfer();
            if (filesArray.length > 0) {
                filesArray.forEach(file => {
                    dataTransfer.items.add(file);
                });
            } else {
                names = [];
            }
            $fileInput[0].files = dataTransfer.files;
            toggleElements()
        }

        function toggleElements() {
            if (filesArray.length === 0) {
                $p.show();
                $r.hide();
            } else {
                $p.hide();
                $r.show();
            }
        }

        async function setFilesFromUrls(inputElement, imageUrls) {
            for (const url of imageUrls) {
                const file = await urlToFile(url);
                filesArray.push(file);
                previewFile(file);
            }
        }

        async function urlToFile(url) {
            const response = await fetch(url);
            const blob = await response.blob();
            return new File([blob], `image-${Date.now()}.jpg`, {type: blob.type});
        }

    }

    calendarInit() {
        const t = this;
        const calendarDays = document.getElementById("calendarDays");
        if (calendarDays === null) return;
        const monthYear = document.getElementById("monthYear");
        const prevMonthBtn = document.getElementById("prevMonth");
        const nextMonthBtn = document.getElementById("nextMonth");

        let currentDate = new Date();

        function updateCalendar() {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const today = new Date();
            let _month = month + 1;
            _month = _month < 10 ? '0' + _month : _month;
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
                const dayDiv = document.createElement("a");
                const id = year + month + day + '-day';
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
                dayDiv.setAttribute('href', '/?date=' + dataFormatedDate);

            }
            t.getActiveDaysInMonth(year, _month);
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

    getActiveDaysInMonth(year, month) {
        showPreloader();
        const _this = this;
        $.ajax({
            type: "POST",
            url: adminAjax,
            data: {
                action: 'get_days_in_month',
                year: year,
                month: month,
                order_id: _this.$doc.find('#order_id').val(),
            }
        }).done((response) => {
            _this.response(response);
        });
    }

    bookTimeSelect() {
        const t = this;
        this.$doc.on('click', '.book-time-list-item', function (event) {
            event.preventDefault();
            const $t = $(this);
            t.$doc.find('.book-time-list-item').removeClass('active');
            $t.addClass('active');
            t.time = $t.text().trim();
            const status = $t.attr('data-status');
            const date = $t.attr('data-date');
            const work_time = $t.attr('data-work_time');
            const start = $t.attr('data-start');
            const end = $t.attr('data-end');
            const master = $t.attr('data-master');
            t.resetOrderData();
            if (status !== 'free') return;
            if (master === undefined) return;
            if (start === undefined) return;
            if (date === undefined) return;
            if (end === undefined) return;
            t.$doc.find('#order_date').val(date);
            t.$doc.find('#work_time').val(work_time);
            t.$doc.find('#order_start').val(start);
            t.$doc.find('#order_end').val(end);
            t.$doc.find('#order_master').val(master);
            t.$doc.find('.show-conditions').show();

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
            updateHeaderStatus((index + 1));
            if ((index + 1) >= questionCount) {
                return;
            }
            const transformX = (index + 1) * 100;
            $form.find('.book-form-question').css('transform', 'translateX(-' + transformX + '%)');
        });

        const updateHeaderStatus = (step) => {
            this.$doc.find('.book-form-head__item').removeClass('finished').removeClass('active');
            this.$doc.find('.book-form-head__item').each(function (index) {
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
            const $section = $select.closest('section');
            const $type = $row.find('.type-select');
            const val = $select.val();
            const $button = $d.find('.book-form__button');
            t.category = $select.val();
            if (val === 'other') {
                $button.hide();
                $form.find('.book-form-address').hide();
                $row.find('.form-quantity').addClass('not-active');
                $type.closest('.form-label').addClass('not-active');
                $type.closest('.form-label select').removeAttr('required');
                $row.find('.form-quantity input').removeAttr('required');
                $form.find('.book-form-address input').removeAttr('required');
                $section.find('.book-section-head--regular').hide();
                $section.find('.book-section-head--other').show();
                return;
            }
            $section.find('.book-section-head--regular').show();
            $section.find('.book-section-head--other').hide();
            $type.closest('.form-label select').attr('required', 'required');
            $row.find('.form-quantity input').attr('required', 'required');
            $form.find('.book-form-address input').attr('required', 'required');
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
                    $form.find('.book-form__button').show();
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

    }

    setCurrentDate() {
        $('html, body').animate({
            scrollTop: this.$doc.find('.book-section').offset().top
        });
    }

    eventListener() {
        const t = this;
        this.$doc.on('click', '.book-form__trigger', (e) => this.handleClick(e));
        this.$doc.on('click', '.book-button-cancel', (e) => this.cancelBook(e));
        this.$doc.on('click', '.book-form__trigger-back', (e) => this.getPrevStepHTML(e));
        this.$doc.ready(() => {
            this.setParams();
            this.changeOtherStatus();
        });
        this.$doc.on("click", '#calendarDays .day', function (e) {
            e.preventDefault();
            document.querySelectorAll('.day').forEach(function (el) {
                el.classList.remove('active');
            });
            const $t = $(this);
            const date = $t.attr('data-date');
            $t.addClass("active");
            const $calendar = t.$doc.find('#book-calendar-js');
            if ($calendar.length === 0) return;
            const order = $calendar.attr('data-order-id');
            const session = $calendar.attr('data-session-id');
            t.resetOrderData();
            // t.$doc.find('#book-time-list').append(
            //     '<pre>' +
            //     date +
            //     order +
            //     session +
            //     '</pre>'
            // );
            if (order === undefined || session === undefined) return;
            showPreloader();
            $.ajax({
                type: "POST",
                url: adminAjax,
                data: {
                    action: 'get_free_time',
                    date: date,
                    order: order,
                    session: session,
                }
            }).done((response) => {
                // t.$doc.find('#book-time-list').append(
                //     '<pre>' +
                //     response +
                //     '</pre>'
                // );
                if (response) {
                    const isJson = isJsonString(response);

                    if (isJson) {
                        const data = JSON.parse(response);
                        const message = data.msg || '';
                        const text = data.msg_text || '';
                        const type = data.type || '';
                        const url = data.url || '';
                        const reload = data.reload || '';
                        const html = data.html || '';
                        if (message) {
                            showMsg(text, '', message || 'Importantly', url);
                        }else {
                            if (url) {
                                window.location.href = url;
                                return;
                            }
                        }
                        if (html) {
                            t.$doc.find('#book-time-list').html(html);
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
                        showMsg(response);
                    }

                }
                hidePreloader();
            });
            $('html, body').animate({
                scrollTop: $t.closest('section').offset().top
            });
        });
    }

    getPrevStepHTML(e) {
        e.preventDefault();
        const t = this;
        const $button = $(e.target);
        const order = $button.attr('data-order-id');
        const session = $button.attr('data-session-id');
        if (order === undefined || session === undefined) return;
        $button.addClass('not-active');
        $button.addClass('loading-button');
        $button.attr('tab-index', '-1');
        showPreloader();
        $.ajax({
            type: "POST",
            url: adminAjax,
            data: {
                action: 'get_prev_step_html',
                order: order,
                session: session,
            }
        }).done((response) => {
            t.response(response);
        });
    }

    cancelBook(e) {
        const t = this;
        e.preventDefault();
        const $button = $(e.target);
        const order = $button.attr('data-order-id');
        const session = $button.attr('data-session-id');
        if (order === undefined || session === undefined) return;
        $button.addClass('not-active');
        $button.addClass('loading-button');
        $button.attr('tab-index', '-1');
        showPreloader();
        $.ajax({
            type: "POST",
            url: adminAjax,
            data: {
                action: 'cancel_bool',
                order: order,
                session: session,
            }
        }).done((response) => {
            t.response(response);
        });
    }

    response(response) {
        const t = this;
        if (response) {
            const isJson = isJsonString(response);
            if (isJson) {
                const data = JSON.parse(response);
                const days = data.days || [];
                const message = data.msg || '';
                const text = data.msg_text || '';
                const type = data.type || '';
                const url = data.url || '';
                const reload = data.reload || '';
                const html = data.html || '';
                const step_html = data.step_html || '';

                if (message) {
                    showMsg(text, '', message || 'Importantly', url);
                }else {
                    if (url) {
                        window.location.href = url;
                        return;
                    }
                }
                if (days) {
                    const $days = t.$doc.find('#calendarDays').find('.day:not(.not-active)');
                    $days.addClass('not-active-day');
                    for (let day in days) {
                        t.$doc.find('#calendarDays .day[data-date="' + day + '"]').not('.not-active').removeClass('not-active-day');
                    }
                }
                if (html) {
                    this.$doc.find('#book-time-list').html(html);
                }

                if (step_html) {
                    this.$doc.find('.book-render').html(step_html);
                    selectrickInit();
                    $('html, body').animate({
                        scrollTop: this.$doc.find('.book-render').offset().top
                    });
                    t.setParams();
                    t.changeOtherStatus();
                    t.fileReader();
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
                initTelMask();
            } else {
                showMsg(response);
            }

        }
        hidePreloader();
    }

    handleClick(e) {
        e.preventDefault();
        const $button = $(e.target);
        console.log(e.target)
        console.log($button)
        const formId = $button.attr('href');
        console.log(formId)
        const $form = this.$doc.find(formId);
        console.log($form)
        $form.trigger('submit');
    }

    resetOrderData() {
        this.$doc.find('#order_date').val('');
        this.$doc.find('#work_time').val('');
        this.$doc.find('#order_start').val('');
        this.$doc.find('#order_end').val('');
        this.$doc.find('#order_master').val('');
        this.$doc.find('.show-conditions').hide();
    }

    getFreeTime() {
        const $calendar = this.$doc.find('#book-calendar-js');
        if ($calendar.length === 0) return;
        const order = $calendar.attr('data-order-id');
        const session = $calendar.attr('data-session-id');
        this.resetOrderData();
        this.$doc.find('#book-time-list').append(
            '<pre>' +
            this.getFormatedDate() +
            order +
            session +
            '</pre>'
        );
        if (order === undefined || session === undefined) return;
        showPreloader();
        $.ajax({
            type: "POST",
            url: adminAjax,
            data: {
                action: 'get_free_time',
                date: this.getFormatedDate(),
                order: order,
                session: session,
            }
        }).done((response) => {
            this.$doc.find('#book-time-list').append(
                '<pre>' +
                response +
                '</pre>'
            );
            if (response) {
                const isJson = isJsonString(response);

                if (isJson) {
                    const data = JSON.parse(response);
                    const message = data.msg || '';
                    const text = data.msg_text || '';
                    const type = data.type || '';
                    const url = data.url || '';
                    const reload = data.reload || '';
                    const html = data.html || '';
                    if (message) {
                        showMsg(text, '', message || 'Importantly', url);
                    }else {
                        if (url) {
                            window.location.href = url;
                            return;
                        }
                    }
                    if (html) {
                        // this.$doc.find('#book-time-list').html(html);
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
                    showMsg(response);
                }

            }
            hidePreloader();
        });
    }
}