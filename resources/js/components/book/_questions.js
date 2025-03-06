export default function changeQuestionsHead(){
    const $items = $(document).find('.book-form-head__item');
    if($items.length <= 10) return;
    $(document).find('.book-form-head').addClass('many-elements');
}