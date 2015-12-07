$(document).ready(function () {
    var email = $('#email'),
        $tips = $('#tips');

    function isiOS() {
        return (
            (navigator.platform.indexOf("iPhone") != -1) ||
            (navigator.platform.indexOf("iPod") != -1) ||
            (navigator.platform.indexOf("iPad") != -1) ||
            (navigator.platform.indexOf("Android") != -1)
        );
    }

    function getvCard() {
        if (isiOS()) {
            $("#vcard-dialog").dialog("open");
        } else {
            location.href = 'https://ole.michelsen.dk/olemichelsen.vcf';
        }
    }

    function updateTips(t) {
        $tips
            .text(t)
            .addClass("ui-state-highlight");
        setTimeout(function () {
            $tips.removeClass("ui-state-highlight", 1500);
        }, 500);
    }

    function checkLength(o, n, min, max) {
        if (o.val().length > max || o.val().length < min) {
            o.addClass("ui-state-error");
            updateTips("Length of " + n + " must be between " +
                min + " and " + max + ".");
            return false;
        } else {
            return true;
        }
    }

    function checkRegexp(o, regexp, n) {
        if (!(regexp.test(o.val()))) {
            o.addClass("ui-state-error");
            updateTips(n);
            return false;
        } else {
            return true;
        }
    }

    $("#vcard-dialog").dialog({
        autoOpen: false,
        height: 270,
        width: 500,
        modal: true,
        closeText: 'close [×]',
        buttons: {
            "Send vCard": function () {
                var bValid = true;

                email.removeClass("ui-state-error");

                bValid = bValid && checkLength(email, "email", 6, 80);

                // From jquery.validate.js (by joern), contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
                bValid = bValid && checkRegexp(email, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, "eg. name@domain.com");

                if (bValid) {
                    $('#vcard-form').submit();
                }
            }
        },
        close: function () {
            email.val("").removeClass("ui-state-error");
        }
    });

    $('.ui-button').addClass('button');

    if (isiOS()) {
        $('#vcard-link').click(function () {
            getvCard();
            return false;
        });
    }

    if (location.hash == '#vcard') {
        getvCard();
    }

    $('#vcard-form').submit(function (e) {
        e.preventDefault();

        $.post('profile.html', {
                email: $('#email').val()
            },
            function () {
                $('#vcard-dialog').dialog("close");
            }
        );
    });
});
