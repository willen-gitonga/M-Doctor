function copyLink(value) {
    console.log('sdfgsdfg')

    function handler(event) {
        event.clipboardData.setData('text/plain', value);
        event.preventDefault();
        document.removeEventListener('copy', handler, true);
    }

    document.addEventListener('copy', handler, true);
    document.execCommand('copy');
}

// var $regPatient = $('#reg-patient')
// var $regDoctor = $('#reg-doctor')


// $regPatient.click(function (e) {
//     console.log('here')
//     e.preventDefault();
//     $('.reg-doctor').addClass('d-none');
//     $('.reg-patient').removeClass('d-none');
// });


// $regDoctor.click(function (e) {
//     console.log('here')
//     e.preventDefault();
//     $('.reg-patient').addClass('d-none');
//     $('.reg-doctor').removeClass('d-none');
// });

function setDoctor(id) {
    var $doctor = $('div#' + id)

    $('#showName').text($doctor.attr('data-name'));
    $('#doc_reg_no').val($doctor.attr('data-registration_number'));
    $('#reg_no').val($doctor.attr('data-registration_number'));
    $('#form_reg_no').val($doctor.attr('data-registration_number'));


    $('#id_name').val($doctor.attr('data-name'));
    $('#id_score').val($doctor.attr('data-score'));
    $('#id_registration_number').val($doctor.attr('data-registration_number'));
    $('#id_registration_date').val($doctor.attr('data-registration_date'));
    $('#id_nationality').val($doctor.attr('data-nationality'));
    $('#id_facility').val($doctor.attr('data-facility'));
    $('#id_postal_address').val($doctor.attr('data-postal_address'));
    $('#id_speciality').val($doctor.attr('data-speciality'));
    $('#id_sub_speciality').val($doctor.attr('data-sub_speciality'));
    $('#id_qualifications').val($doctor.attr('data-qualifications'));
    console.log($doctor.attr('data-name'))
    console.log($doctor.attr('data-score'))
    console.log($doctor.attr('data-registration_number'))
    console.log($doctor.attr('data-registration_date'))
    console.log($doctor.attr('data-nationality'))
    console.log($doctor.attr('data-facility '))
    console.log($doctor.attr('data-facility '))
}

function verifyCredentials() {
    // console.log($doctor.attr('data-registration_number'))
    $no = $('#doc_reg_no').val();
    $ver_no = $('#id_verify_reg_no').val();
    $form_no = $('#form_reg_no').val();
    console.log($no, $ver_no, $form_no)
    if ($no == $ver_no) {
        alert('verified')
        $('.verifyform').addClass('none');
        $('.loginform').removeClass('none');

    } else {
        alert('wrong registration number')
    }
}