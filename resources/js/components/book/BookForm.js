import {hidePreloader, isJsonString, showPreloader} from "../utils/_helpers";
import {selectrickInit} from "../../plugins/_selectric-init";
import 'selectric';
import {showMsg, showNotices} from "../../plugins/_fancybox-init";
import {initTelMask} from "../forms/_number-input";
import changeQuestionsHead from "./_questions";

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

    init() {
        this.fileReader();
        this.eventListener();
    }

    fileReader() {
        const t = this;
        const $fileInput = $(document).find('.book-form-file');
        if ($fileInput.length === 0) return;
        const $dropZone = $(document).find('.drop-zone');
        if ($dropZone.length === 0) return;
        let names = [];
        let filesArray = [];
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

        // Допоміжна функція для обгортки Compressor.js у Promise
        function compressImage(file) {
            return new Promise((resolve) => {
                // Якщо це не зображення (наприклад, pdf чи svg), повертаємо оригінал
                if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
                    resolve(file);
                    return;
                }

                new Compressor(file, {
                    quality: 0.7,      // Ступінь стиснення (0.7 = 70% якості, оптимально для вебу)
                    maxWidth: 1600,    // Максимальна ширина (автоматично зменшить роздільну здатність)
                    maxHeight: 1600,   // Максимальна висота
                    convertSize: 5000000, // Конвертувати PNG > 5MB у JPEG для економії місця
                    success(result) {
                        // Перетворюємо Blob назад у File із збереженням оригінального імені
                        const compressedFile = new File([result], file.name, {
                            type: result.type,
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    },
                    error(err) {
                        console.warn('Помилка стиснення, використовуємо оригінал:', err.message);
                        resolve(file); // У разі помилки повертаємо оригінальний файл
                    },
                });
            });
        }

        async function handleFiles(files) {
            const acceptAttr = $fileInput.attr('accept') || '';
            const validExtensions = acceptAttr ? acceptAttr.split(',').map(item => item.trim()) : [];
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

                if (validExtensions.length > 0 && !validExtensions.includes(file.type)) {
                    alert('Unsupported file type. Only ' + acceptAttr + ' are allowed.');
                    continue;
                }

                // Асинхронне стиснення зображення перед додаванням
                const processedFile = await compressImage(file);

                // Перевірка розміру виконується ВЖЕ ПІСЛЯ стиснення
                if (processedFile.size > maxSize) {
                    alert('File size exceeds ' + maxSizeAttr + 'MB even after compression.');
                    continue;
                }

                names.push(name);
                filesArray.push(processedFile);
                previewFile(processedFile);
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
                    names.splice(index, 1); // Видаляємо ім'я з масиву, щоб можна було повторно додати файл
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
            toggleElements();
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

      makeUrl(url) {
        if (!url) return url;
        url = url.includes('?') ? url + '&' : url + '?';
        url = url + 'service=' + this.service + '&' + 'category=' + this.category;
        return url;
    }

    eventListener() {
        const t = this;
        this.$doc.on('click', '.book-form__trigger', (e) => this.handleClick(e));
        this.$doc.on('click', '.book-button-cancel', (e) => this.cancelBook(e));
        this.$doc.on('click', '.book-form__trigger-back', (e) => this.getPrevStepHTML(e));
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

                if (html) {
                    this.$doc.find('#book-time-list').html(html);
                }

                if (step_html) {
                    this.$doc.find('.book-render').html(step_html);
                    selectrickInit();
                    $('html, body').animate({
                        scrollTop: this.$doc.find('.book-render').offset().top
                    });
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
                changeQuestionsHead();
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



}