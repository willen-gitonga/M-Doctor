// using jQuery
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

var csrftoken = getCookie('csrftoken');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
    beforeSend: function (xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

function getDaysInMonth(month, year) {
    var date = new Date(year, month, 1);
    var days = [];
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
}

// $(document).ready(function () {
$(document).ready(function () {
    var $bookForm = $('#book-form')

    $bookForm.submit(function (event) {
        event.preventDefault()
        console.log('submited')
        var $formData = $(this).serialize()
        var $thisURL = $bookForm.attr('data-url') || window.location.href
        console.log($formData)
        $.ajax({
            method: "POST",
            url: $thisURL,
            data: $formData,
            // dataType: Text,
            success: handleFormSuccess,
            error: handleFormError,
        })
    })

    function handleFormSuccess(info, textStatus, jqXHR) {
        // var $testContent = $('.js_update_items')
        // $testContent.html(info)
        console.log(info)
        var $setSlot = $('#id_time_slot')
        $setSlot.val('')
        var $setDate = $('#id_day')
        $setDate.val('')
    }

    function handleFormError(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR)
        console.log(textStatus)
        console.log(errorThrown)
    }
})


function getId(id) {
    console.log(id)
    var $setDate = $('#id_day')
    $setDate.val(id)
}

dc = {
    '6:00 am': 6,
    '7:00 am': 7,
    '8:00 am': 8,
    '9:00 am': 9,
    '10:00 am': 10,
    '11:00 am': 11,
    '12:00 am': 12,
    '1:00 pm': 13,
    '2:00 pm': 14,
    '3:00 pm': 15,
    '4:00 pm': 16,
    '5:00 pm': 17,
    '6:00 pm': 18
}

function setSlot(id) {
    var $setSlot = $('#id_time_slot')
    console.log(dc[id])
    $setSlot.val(dc[id])
    // $setSlot.val(id)

}

function showBooking(id) {
    console.log(id)
    $('#doctor' + id).toggleClass('d-none');
}