$(function () {
  $('#updateUser').on('click', function () {    
    let updatedData = {};

    $('input').each(function (index) {
      if ($(this).val().trim() !== $(this).attr('data-initail').trim()) {
        let key = $(this).prop('name');
        let value = $(this).val();
        updatedData[key] = value;
      }
    });

    if ($.isEmptyObject(updatedData)) {
      return;
    }

    let form = $('<form></form>')
      .attr('method', 'post')
      .attr('action', `/userManagement/updateUserInfo/${$('#badgeID').text()}`);

    $.each(updatedData, function (key, val) {
      let input = $('<input />')
        .attr('type', 'hidden')
        .attr('name', key)
        .attr('value', val);
      form.append(input);  
    });

    $(document.body).append(form);
    form.submit();
  });
});