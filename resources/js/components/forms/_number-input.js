export const numberInput = () => {
    const inputs = document.querySelectorAll('.number-input');
    inputs.forEach(function (input) {
        const quantity = input.closest('.form-quantity');
        input.addEventListener('input', function (event) {
            input.value = input.value.replace(/[^0-9.-]/g, '');
            if ((input.value.match(/\./g) || []).length > 1) {
                input.value = input.value.replace(/\.(?=[^.]*$)/, '');
            }
            if (input.value.indexOf('-') > 0) {
                input.value = input.value.replace('-', '');
            }
        });
        if (quantity) {
            const plus = quantity.querySelector('.plus');
            const minus = quantity.querySelector('.minus');
            plus.addEventListener('click', function (event) {
                event.preventDefault();
                let val = Number(input.value);
                let max = input.getAttribute('data-max');
                val = isNaN(val) ? 1 : val;
                if (max) {
                    max = Number(max);
                    if (!isNaN(max)) {
                        input.value = val < max ? (val + 1) : max;
                        return;
                    }
                }
                input.value = (val + 1);
            });
            minus.addEventListener('click', function (event) {
                event.preventDefault();
                let val = Number(input.value);
                val = isNaN(val) ? 1 : val;
                input.value = val > 2 ? (val - 1) : 1;
            });
        }
    });
}