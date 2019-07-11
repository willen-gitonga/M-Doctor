(function (doc) {
  'use strict';

  function iso(d) {
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  function incWeek(d, n) {
    return new Date(d.getTime() + (n * 7 * 24 * 60 * 60 * 1000));
  }

  function length(d1, d2) {
    var delta = d2 - d1,
      weeks = delta / (1000 * 60 * 60 * 24 * 7),
      roundWeeks = parseInt(weeks, 10),
      days = parseInt((weeks - roundWeeks) * 7, 10),
      round = (delta / (1000 * 60 * 60 * 24) / (365 / 12)).toFixed(1);
    return roundWeeks + 'w' + days + 'd ';
  }

  function update() {
    var now = new Date(),
      begin = new Date(doc.getElementById('begin').value),
      on = new Date(doc.getElementById('on').value),
      due = incWeek(begin, 40);
    if (begin.toString() === 'Invalid Date' || on.toString() === 'Invalid Date') {
      return;
    }
    doc.getElementById('conception').innerHTML = iso(incWeek(begin, 2));
    doc.getElementById('sofar').innerHTML = length(begin, now);
    doc.getElementById('togo').innerHTML = length(now, due);
    doc.getElementById('onsofar').innerHTML = length(begin, on);
    doc.getElementById('ontogo').innerHTML = length(on, due);
    doc.getElementById('due').innerHTML = iso(due);
  }

  function set(id) {
    localStorage.setItem(id, doc.getElementById(id).value);
  }

  function get(id) {
    return localStorage.getItem(id) || iso(new Date());
  }

  doc.getElementById('begin').addEventListener('input', function () {
    update();
    set('begin');
  }, false);
  doc.getElementById('on').addEventListener('input', function () {
    update();
    set('on');
  }, false);

  doc.getElementById('begin').setAttribute('value', get('begin'));
  doc.getElementById('on').setAttribute('value', get('on'));
  update();
}(document));


// ****************************************


$(document).ready(function () {
  $('#search-type').change(function () {
    s = $(this).val();
    $('#doctorName').attr('placeholder', 'Start typing ' + s + "'s name");
  });
});
$('#doctorName').keypress(function (e) {
  if (e.which == 13) {
    $('#grabDetails').click();
    return false;
  }
});

$('#grabDetails').click(function () {
  var search_query = $('#doctorName').val();
  var search_type = $('#search-type').val();
  var api_url = 'https://api.healthtools.codeforafrica.org'
  var url = '';
  var result_no = '';
  switch (search_type) {
    case 'doctor':
      url = api_url + '/search/doctors?q=';
      break;
    case 'nurse':
      url = api_url + '/search/nurses?q=';
      break;
    default:
      url = api_url + '/search/clinical-officers?q=';
  }
  url = url + encodeURIComponent(search_query);
  $('#dname').html('<h4>Results for ' + toTitleCase(search_type) + ' search: ' + name + '</h4>');
  $('#mybox').html('');
  $('#loading').show();
  $.ajax({
    url: url,
    success: function (response) {
      var response_html = ''
      var result = response.result
      var result_no = result.total
      if (result_no > 10) result_no = 10
      if (search_type == 'doctor') {
        for (var i = 0; i < result_no; i++) {
          response_html += 'Name: ' + result.hits[i]._source.name + '<br>';
          response_html += 'Reg no.: ' + result.hits[i]._source.reg_no + '<br>';
          response_html += 'Qualification: ' + result.hits[i]._source.qualifications + '<br>';
          response_html += 'Registration date: ' + new Date(result.hits[i]._source.reg_date).toDateString() + '<br>';
          if (i < result_no - 1) response_html += '<hr>';
        }
      } else if (search_type == 'nurse') {
        for (var j = 0; j < result_no; j++) {
          response_html += 'Name: ' + result.hits[j].name + '<br>';
          response_html += 'License No: ' + result.hits[j].license_no + '<br>';
          response_html += 'Valid until: ' + result.hits[j].valid_till + '<br>';
          if (j < result_no - 1) response_html += '<hr>';
        }
      } else {
        for (var k = 0; k < result_no; k++) {
          response_html += 'Name: ' + result.hits[k]._source.name + '<br>';
          response_html += 'Reg no: ' + result.hits[k]._source.reg_no + '<br>';
          response_html += 'Reg date: ' + new Date(result.hits[k]._source.reg_date).toDateString() + '<br>';
          response_html += 'Address: ' + result.hits[k]._source.address + '<br>';
          response_html += 'Qualification: ' + result.hits[k]._source.qualifications + '<br>';
          if (k < result_no - 1) response_html += '<hr>';
        }
      }
      if (result_no == 0) {
        response_html += '<p style="text-align: center;">';
        response_html += 'Oops. We could not find any ' + toTitleCase(search_type) + ' by that name.';
        response_html += '</p><p style="text-align: center;">';
        response_html += '<small><em><a href="mailto:starhealth@codeforkenya.org" target="_blank">E-mail us</a></em></small>';
        response_html += '</p>';
      }
      // ga('send', 'event', 'DodgyDr', 'search', name, result_no);
      // ga('theStar.send', 'event', 'DodgyDr', 'search', name, result_no);
      // ga('theStarHealth.send', 'event', 'DodgyDr', 'search', name, result_no);
      // ga('CfAFRICA.send', 'event', 'DodgyDr', 'search', name, result_no);
      $('#mybox').html(response_html);
      $('#loading').hide();
    }
  });
});

function cloudsearch_add_fuzzy(search_query) {
  search_query = search_query.trim();
  var search_terms = search_query.split(' ');
  search_query += '|';
  for (var i = search_terms.length - 1; i >= 0; i--) {
    search_query += search_terms[i] + '|';
    search_query += search_terms[i] + '~1|';
    search_query += search_terms[i] + '~2|';
  }
  search_query = search_query.substring(0, search_query.length - 1);
  return search_query.trim();
}

function cloudsearch_remove_keywords(search_query) {
  search_query = search_query.trim();
  search_query = search_query.toLowerCase();
  var keywords = ['dr', 'dr.', 'doctor', 'nurse', 'co', 'c.o.', 'c.o', 'clinical officer'];
  for (var i = keywords.length - 1; i >= 0; i--) {
    search_query = search_query.replace(new RegExp('^' + keywords[i]), '');
  }
  return search_query.trim();
}