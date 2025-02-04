import 'slick-carousel';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css'
export default class Slick {
    constructor() {
        this.init();
    }

    reviewsSliderInit() {
        $(document).find('.clients-list').each(function () {
            const $slider = $(this);
            const $prev = $(this).closest('section').find('.slick__prev');
            const $next = $(this).closest('section').find('.slick__next');
            const $progress = $(this).closest('section').find('.slider-progress');
            $slider.slick({
                slidesToShow: 3,
                arrows: true,
                prevArrow: $prev,
                nextArrow: $next,
                dots: false,
                appendDots: $progress,
                responsive: [
                    {
                        breakpoint: 2000,
                        settings: {
                            slidesToShow: 3
                        }
                    },
                    {
                        breakpoint: 1600,
                        settings: {
                            slidesToShow: 2
                        }
                    },
                    {
                        breakpoint: 1025,
                        settings: {
                            slidesToShow: 1
                        }
                    },
                    {
                        breakpoint: 450,
                        settings: {
                            centerMode: false,
                            slidesToShow: 1
                        }
                    },
                ]
            });
        });
    }


    init() {
        this.reviewsSliderInit();
    }
}

