(function ($) {

  'use strict';

  /*
  Dependencies:
  cookies.js
  homepage-join-form.js
  */

  var DueDateCalculator = {

    //months: 'January February March April May June July August September October November December'.split(' '),
    monthsShort: 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' '),

    // defaults
    today: new Date(),
    lastPeriod: new Date(),
    cycleLength: 28,
    lutealPhase: 14,  // this is not editable, but could be later if we added a select

    params: {},
    mini: false,

    recalculate: false,

    // mini version redirects here
    fullUrl: '/due',

    init: function () {
      this.$calculator = $('.due-date-calculator');

      // if this script runs on a page which does not show the calculator, bail out here
      if (!this.$calculator.length) {
        return;
      }

      // the mini version on the homepage has a different behaviour when you click the calculate button
      // it redirects to another page showing the full calculator (url = this.fullUrl) and immediately shows the results
      this.mini = this.$calculator.hasClass('mini');

      // selects
      this.$lastPeriodSelects = this.$calculator.find('select.last-period-day,select.last-period-month,select.last-period-year');
      this.$lastPeriodDaySelect = this.$calculator.find('select.last-period-day');
      this.$lastPeriodMonthSelect = this.$calculator.find('select.last-period-month');
      this.$lastPeriodYearSelect = this.$calculator.find('select.last-period-year');
      this.$cycleLengthSelect = this.$calculator.find('select.cycle-length');
      //this.$lutealPhaseSelect = this.$calculator.find('select.luteal-phase');

      // buttons
      this.$calculate = this.$calculator.find('.calculate-button');

      // convert the query string into an object
      this.params = this.parseQueryString(window.location.search.substring(1));

      // translate legacy query string params into the current syntax
      this.supportLegacyParams();

      // set selected options based on params or defaults
      this.initSelects();

      // select change handlers
      this.$lastPeriodDaySelect.on('change', $.proxy(this, 'changeLastPeriodDay'));
      this.$lastPeriodMonthSelect.on('change', $.proxy(this, 'changeLastPeriodMonth'));
      this.$lastPeriodYearSelect.on('change', $.proxy(this, 'changeLastPeriodYear'));
      this.$cycleLengthSelect.on('change', $.proxy(this, 'changeCycleLength'));
      //this.$lutealPhaseSelect.on('change', $.proxy(this, 'changeLutealPhase'));

      // button click handlers
      this.$calculate.on('click', $.proxy(this, 'clickCalculate'));

      // auto fire if params present
      if (!this.mini && this.params.hasOwnProperty('menstruation') && this.params.hasOwnProperty('cycle')) {
        this.clickCalculate();
      }
    },
    parseQueryString: function (qs) {
      // convert query string into an object
      // this: ?menstruation=yyyy-mm-dd&cycle=n&luteal=n
      // becomes: {menstruation: 'yyyy-mm-dd', cycle: 'n', luteal: 'n'}
      var params = {};
      qs.split('&').forEach(function(pair) {
        pair = pair.split('=');
        if (pair[1] !== undefined) {
          var key = decodeURIComponent(pair[0]),
              val = decodeURIComponent(pair[1]),
              val = val ? val.replace(/\++/g,' ').trim() : '';
          if (key.length === 0) {
            return;
          }
          if (params[key] === undefined) {
            params[key] = val;
          }
          else {
            if ('function' !== typeof params[key].push) {
              params[key] = [params[key]];
            }
            params[key].push(val);
          }
        }
      });
      return params;
    },
    supportLegacyParams: function () {
      // convert old syntax into new syntax
      // old syntax: ?last-period-date[day]=26&last-period-date[month]=1&last-period-date[year]=2015&l=28
      // new syntax: ?menstruation=yyyy-mm-dd&cycle=n&luteal=n
      // last-period-date[day] = last period day
      // last-period-date[month] = last period month (0=jan)
      // last-period-date[year] = last period year
      // l = cycle length
      // (luteal phase not supported)
      if (/^\d{4}$/.test(this.params['last-period-date[year]']) && /^\d{1,2}$/.test(this.params['last-period-date[month]']) && /^\d{1,2}$/.test(this.params['last-period-date[day]'])) {
        this.params.menstruation = [parseInt(this.params['last-period-date[year]']), parseInt(this.params['last-period-date[month]']), this.params['last-period-date[day]']].join('-');
        delete this.params['last-period-date[year]'];
        delete this.params['last-period-date[month]'];
        delete this.params['last-period-date[day]'];
      }
      if (/^\d{1,2}$/.test(this.params.c)) {
        this.params.cycle = this.params.c;
        delete this.params.c;
      }
      //if (/^\d{1,2}$/.test(this.params.l)) {
      //  this.params.luteal = this.params.l;
      //  delete this.params.l;
      //}
    },
    initSelects: function () {
      // set selected options on selects

      // First day of last period (any date in the past)
      if (/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(this.params.menstruation)) {
        this.lastPeriod = new Date(this.params.menstruation);
        //this.ensureLastPeriodIsInPast();
      }

      this.$lastPeriodDaySelect.val(this.lastPeriod.getDate());
      this.$lastPeriodMonthSelect.val(this.lastPeriod.getMonth());

      // reset the years to -1 through +1 of the current year
      this.$lastPeriodYearSelect.empty();
      for (var i = this.today.getFullYear() - 1; i <= this.today.getFullYear() + 1; i++) {
        this.$lastPeriodYearSelect.append($('<option>', {value: i, text: i}));
      }

      this.$lastPeriodYearSelect.val(this.lastPeriod.getFullYear());
      this.toggleLastPeriodDayOptions();

      // Cycle length (21-38)
      this.cycleLength = Math.min(Math.max(21, parseInt(this.params.cycle) || this.cycleLength), 38);
      this.$cycleLengthSelect.val(this.cycleLength);

      // Luteal phase (8-20)
      //this.lutealPhase = Math.min(Math.max(8, parseInt(this.params.luteal) || this.lutealPhase), 20);
      //this.$lutealPhaseSelect.val(this.lutealPhase);
    },
    changeLastPeriodDay: function () {
      // change the day select
      this.lastPeriod.setDate(this.$lastPeriodDaySelect.val());

      //this.ensureLastPeriodIsInPast();
      this.toggleLastPeriodDayOptions();
    },
    changeLastPeriodMonth: function () {
      // change the month select

      // if you are on March 30th and you switch month to Feb, it will actually give you Mar 2nd because 30th Feb does not make sense and it carries into the next month
      // the trick is to roll back to the first day of the month, then roll foward to the specified day, or the last day of the month
      this.lastPeriod.setDate(1);

      // set the new month based on the select
      this.lastPeriod.setMonth(this.$lastPeriodMonthSelect.val());

      // reset to the current year
      this.lastPeriod.setFullYear(this.today.getFullYear());

      // roll forward to the selected day, or the end of the month
      // if the selected day was the 31st and the new month has less days, cap it at the last day of the new month
      var lastDayOfMonth = new Date(this.lastPeriod.getFullYear(), this.lastPeriod.getMonth() + 1, 0).getDate();
      this.lastPeriod.setDate(Math.min(this.$lastPeriodDaySelect.val(), lastDayOfMonth));

      //this.ensureLastPeriodIsInPast();
      this.toggleLastPeriodDayOptions();
    },
    changeLastPeriodYear: function () {
      // change the year select

      // roll back
      this.lastPeriod.setDate(1);

      // set the new year based on the select
      this.lastPeriod.setFullYear(this.$lastPeriodYearSelect.val());

      // roll forward
      var lastDayOfMonth = new Date(this.lastPeriod.getFullYear(), this.lastPeriod.getMonth() + 1, 0).getDate();
      this.lastPeriod.setDate(Math.min(this.$lastPeriodDaySelect.val(), lastDayOfMonth));

      //this.ensureLastPeriodIsInPast();
      this.toggleLastPeriodDayOptions();
    },
    toggleLastPeriodDayOptions: function () {
      // For months less than 31 days, hide a few options in the day select
      var lastDayOfMonth = new Date(this.lastPeriod.getFullYear(), this.lastPeriod.getMonth() + 1, 0).getDate();
      for (var d = 29; d <= 31; d++) {
        this.$lastPeriodDaySelect.find('option[value='+d+']').toggle(lastDayOfMonth >= d);
      }

      // if you were on March 31st and switched to Feb, it should roll back the day to 28th/29th
      if (this.$lastPeriodDaySelect.val() > lastDayOfMonth) {
        this.$lastPeriodDaySelect.val(lastDayOfMonth);
      }
    },
    //ensureLastPeriodIsInPast: function () {
    //  // if the date is in the future, roll back 1 year
    //  // your LAST period can't be set in the future, silly
    //  // allow it here as they may be using this tool to predict future babies
    //  this.lastPeriod.setFullYear(this.today.getFullYear() - (this.lastPeriod > this.today ? 1 : 0));
    //  this.$lastPeriodYearSelect.val(this.lastPeriod.getFullYear());
    //},
    changeCycleLength: function () {
      // Cycle length (21-38)
      this.cycleLength = Math.min(Math.max(21, parseInt(this.$cycleLengthSelect.val()) || this.cycleLength), 38);
    },
    //changeLutealPhase: function () {
    //  // Luteal phase (8-20)
    //  this.lutealPhase = Math.min(Math.max(8, parseInt(this.$lutealPhaseSelect.val()) || this.lutealPhase), 20);
    //},
    clickCalculate: function (e) {
      if (e) {
        e.preventDefault();
      }

      if (!this.recalculate) {
        this.$lastPeriodSelects.on('change', $.proxy(this, 'clickCalculate'));
        this.$cycleLengthSelect.on('change', $.proxy(this, 'clickCalculate'));
        this.recalculate = true;
      }

      // the mini version will not show inline results on calculate
      // it bounces you to another page showing the full version, which shows the results
      if (this.mini) {
        // the full version, with params to auto calculate and show results

        var redirect = this.fullUrl + '?' + [
          'menstruation=' + this.lastPeriod.toISOString().substr(0,10),
          'cycle=' + this.cycleLength
          // 'luteal=' + this.lutealPhase
        ].join('&');

        // legacy version
        // var redirect = this.fullUrl + '?' + [
        //   'last-period-date[day]=' + this.lastPeriod.getDate(),
        //   'last-period-date[month]=' + (this.lastPeriod.getMonth() + 1),
        //   'last-period-date[year]=' + this.lastPeriod.getFullYear(),
        //   'l=' + this.cycleLength
        // ].join('&');

        window.location = redirect;
        return;
      }

      // full version

      // Conception date is the ovulation day (week 0)
      // Ovulation occurs luteal phase days counting backwards from the cycle length days offset of your last menstral period (LMP)
      // Fertilisation occurs at the last successful Ovulation of the last menstral cycle
      // The second trimester starts 91 days (13 * 7) from the LMP date (week 13)
      // The third trimester starts 182 days (26 * 7) from the LMP date (week 26)
      // The due date is exactly 280 days (40 * 7) from the LMP date (week 40)

      // Counting from the first day of the LMP, there are 40 gestational weeks of pregnancy.
      // In gestational weeks 1 and 2, the baby is waiting to be conceived. At the start of week 3, the baby is "created".

      // eg.
      // First day of last menstration = 1st Jan 2015
      // Cycle Length = 28
      // Luteal Phase = 14 (hard coded)

      // Jan 2015
      // | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10| 11| 12| 13| 14| 15| 16| 17| 18| 19| 20| 21| 22| 23| 24| 25| 26| 27| 28| 29| 30| 31| <- Day of month
      // |---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
      // | C1| C2| C3| C4| C5| C6| C7| C8| C9|C10|C11|C12|C13|C14|C15|C16|C17|C18|C19|C20|C21|C22|C23|C24|C25|C26|C27|C28| C1| C2| C3| <- Cycle
      // | M1| M2| M3| M4| M5|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   | M1| M2| M3| <- Menstration
      // |   |   |   |   |   |   |   |   |   |   |   |   |   |   |L14|L13|L12|L11|L10| L9| L8| L7| L6| L5| L4| L3| L2| L1|   |   |   | <- Luteal
      // |   |   |   |   |   |   |   |   |   |   |   | F1| F2| F3| F4| F5| F6|   |   |   |   |   |   |   |   |   |   |   |   |   |   | <- Fertility
      // |   |   |   |   |   |   |   |   |   |   |   |   |   |   | O |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   | <- Ovulation
      // |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   | I |   |   |   |   |   |   |   |   |   |   |   |   |   | <- Implantation
      // |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   | PT|   |   |   |   |   |   | <- Pregnancy test

      // or this:
      // https://en.wikipedia.org/wiki/Pregnancy#/media/File:Pregnancy_timeline.png

      var oneDayInMs = (24 * 60 * 60 * 1000);

      // these trimesters may not be correct - needs review
      var secondTrimesterWeek = 14;
      var thirdTrimesterWeek = 28;
      var fullTermWeek = 40;

      var conception = new Date(this.lastPeriod.getTime() + ((this.cycleLength - this.lutealPhase) * oneDayInMs));
      var secondTrimester = new Date(this.lastPeriod.getTime() + (secondTrimesterWeek * 7 * oneDayInMs));
      var thirdTrimester = new Date(this.lastPeriod.getTime() + (thirdTrimesterWeek * 7 * oneDayInMs));
      var due = new Date(this.lastPeriod.getTime() + (fullTermWeek * 7 * oneDayInMs));

      // update results
      this.$calculator.find('.results .calendar strong').text(due.getDate());
      this.$calculator.find('.results .calendar span').text(this.dateFormat(due, 'mmm yyyy'));
      this.$calculator.find('.results .conception span').text(this.dateFormat(conception, 'dd mmm yyyy'));
      this.$calculator.find('.results .second span').text(this.dateFormat(secondTrimester, 'dd mmm yyyy'));
      this.$calculator.find('.results .third span').text(this.dateFormat(thirdTrimester, 'dd mmm yyyy'));
      this.$calculator.find('.results .due span').text(this.dateFormat(due, 'dd mmm yyyy'));

      // reveal the results
      this.$calculator.find('.results').removeClass('hide');
      this.$calculator.find('+ p .btn.btn-red').hide();

      // only show the join form if you are not currently signed in
      if (cookies.read('logged_in_as') == null) {
        // prepopulate the join form
        $('.calculator-join .guest-form select[name=description]').val('I\'m having a baby');
        $('.calculator-join .guest-form input[name=dob]').val(this.dateFormat(due, 'yyyy-mm-dd'));
        $('.calculator-join .guest-form select[name=dob-day]').val(due.getDate());
        $('.calculator-join .guest-form select[name=dob-month]').val(due.getMonth());
        $('.calculator-join .guest-form select[name=dob-year]').val(due.getFullYear());

        // tiny delay to ensure the change event in the join form script is triggered
        setTimeout(function(){
          $('.calculator-join .guest-form select[name=description]').change();
        }, 100);

        // reveal the join form
        $('.calculator-join').removeClass('hide');
      }
    },
    dateFormat: function(date,format) {
      if (format === 'dd mmm yyyy') {
        return date.getDate() + ' ' + this.monthsShort[date.getMonth()] + ' ' + date.getFullYear();
      }
      else if (format === 'mmm yyyy') {
        return this.monthsShort[date.getMonth()] + ' ' + date.getFullYear();
      }
      else if (format === 'yyyy-mm-dd') {
        return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
      }
    }
  };

  $(function () {
    DueDateCalculator.init();
    // customise the join form inside the results
    $('.calculator-join .guest-form').unbind('joined.ga').bind('joined.ga', function () {
      dataLayer.push({'event': 'CustomFormSubmit', 'eventCategory': 'Sign Ups', 'eventAction': 'Tool', 'eventLabel': 'Due Date Calculator'});
    });
  });
})(jQuery);
