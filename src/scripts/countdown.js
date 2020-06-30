// Validate input with RegEx
var valUriHash = /^#[0-9]+(,.+)?$/;
var valDate = /^[a-zA-Z]{3} [0-3]?[0-9], [2-9][0-9]{3}$/;
var valTime = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
var maxMsgLen = 30;

function init() {
    var now = moment();

    // Next upcoming workstart, except on Monday (mod) where we need to keep date to know time
    // Formula: weekdays - day no. + target day no. Ex: 7 - 6 + 1 for finding Mon 1 from Sat 6
    var workstart = moment([now.year(), now.month(), now.date() + (7 - now.isoWeekday() + 1) % 7, 8, 30]);

    // Next upcoming workend, except on Friday where we need to keep date to know time
    // Formula: target day no. - day no. Ex: 5 - 3 for finding Fri 5 from Wed 3
    var workend = moment([now.year(), now.month(), now.date() + 5 - now.isoWeekday() % 7, 16, 30]);

    var msg;

    if ((now > workend && now < workstart) // Weekend
        || (now.isoWeekday() == 1 && now < workstart)) { // Monday, new week lurks :'-(
        now = workstart;
        msg = 'A new week lurks in:';
    } else {
        now = workend;
        msg = 'Weekend coming up in:';
    }

    $('#messageinput').val(msg);
    $('#datepicker').val(now.format('MMM D, YYYY'));
    $('#time').val(now.format('HH:mm'));
}

// Pads input with given char up to a given length
function pad(num,char,count)
{
    var padded = String(num);
    while(padded.length < count) {
        padded = char + padded;
    }
    return padded;
}

function activateCounter(date, message) {
    $('.message').fadeOut('fast', function() {
        $(this).text(message).fadeIn('slow');
    });

    $('#countdown').stopCountDown();
    $('#countdown').setCountDown({
        targetDate: {
            'msec': date.valueOf()
        }
    });
    $('#countdown').startCountDown();
}

function setConfig() {
    var m = $('#messageinput').val();
    var d = $('#datepicker').val();
    var t = $('#time').val();

    if (valDate.test(d) && valTime.test(t)) {
        var date = new Date(d);
        date.setHours(t.substring(0, t.indexOf(':')));
        date.setMinutes(t.substring(t.indexOf(':')+1));

        // Set browser URI hash for bookmarking
        var uri = date.valueOf() + (m ? ',' + encodeURIComponent(m) : '');
        window.location.hash = uri;
        $('#link').val(window.location.href);

        // Reload the counter
        activateCounter(date, m);

        $('#info-create').fadeOut('fast');
        $('#info-save').fadeIn('slow');
    }
}

$(document).ready(function() {
    init();

    // Initiate countdown
    $('#countdown').countDown({
        targetOffset: {
            'day':  0,
            'month':0,
            'year': 0,
            'hour': 0,
            'min':  0,
            'sec':  0
        }
    });

    // Bind the submit button of the input form
    $('#config').submit(function() { setConfig(); return false; });

    // Initiate datepicker
    $("#datepicker").datepicker({ dateFormat: 'M d, yy', firstDay: 1 });

    // Get hash value of countdown date
    var hash = window.location.hash;

    if (valUriHash.test(hash)) {
        // Remove leading #
        hash = hash.substring(1);

        var part = hash.split(',',2);

        var d = new Date(parseInt(part[0],10));
        if (d) {
            $('#datepicker').datepicker("setDate", d);
            $('#time').val(pad(d.getHours(),0,2) + ':' + pad(d.getMinutes(),0,2));
        }

        var m = part[1];
        if (m) {
            m = decodeURIComponent(m).substring(0, maxMsgLen);
            $('#messageinput').val(m);
        }

        activateCounter(d, m || '');
    }
    else {
        $('#info-create').fadeIn('slow');
    }
});
