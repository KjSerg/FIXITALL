export function lazyLoad() {
    const lazyImages = document.querySelectorAll("img.lazy[data-src]");

    if ("IntersectionObserver" in window) {
        const imageObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;

                    if (img.dataset.srcset) img.srcset = img.dataset.srcset;

                    img.classList.remove("lazy");

                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: "0px 0px 100px 0px"
        });

        lazyImages.forEach(function (image) {
            imageObserver.observe(image);
        });

    } else {

        lazyImages.forEach(function (image) {
            image.src = image.dataset.src;
            image.classList.remove("lazy");
        });
    }
}