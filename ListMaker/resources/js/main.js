$(document).ready(function() {

  // Start: Title button's functionality
  $('#title-form .button').click(function() {
    var title = $('#title-input').val();
    $('.list-title').text(title);
    $('#title-input').val('');
  });
  // End

  // Start: Item button's functionality
  $('#item-form .button').click(function() {
    var itemText = $('#item-input').val();
    var $item = $('<li><span>' + itemText + '</span><i class="glyphicon glyphicon-remove"></i></li>');
    $('.list').append($item);
    $('#item-input').val('');

    $item.find('.glyphicon-remove').click(function() {
      $(this).parent().remove();
    });
  // End
  });

  $('.button').hover(function() {
    $(this).toggleClass('button-hover');
  });

});
