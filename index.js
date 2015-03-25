var dust = require('dust')();
var serand = require('serand');
var utils = require('autos-utils');

var user;

var query = function (options) {
    if (!options) {
        return '';
    }
    var data = {
        criteria: {}
    };
    var name;
    for (name in options) {
        if (options.hasOwnProperty(name)) {
            data.criteria[name] = options[name];
        }
    }
    return '?data=' + JSON.stringify(data);
};

var list = function (el, options, fn) {
    $.ajax({
        url: '/apis/v/vehicles' + query(options),
        headers: {
            'x-host': 'autos.serandives.com'
        },
        dataType: 'json',
        success: function (data) {
            dust.render('auto-listing', utils.cdn(data), function (err, out) {
                $('.auto-listing', el).remove();
                el.off('click', '.auto-sort .btn');
                el.append(out);
                el.on('click', '.auto-sort .btn', function () {
                    var sort = $(this).attr('name');
                    var serand = require('serand');
                    serand.emit('auto', 'sort', {sort: sort});
                    list(options, {
                        sort: sort
                    });
                });
                el.on('click', '.edit', function (e) {
                    serand.redirect($(this).closest('.thumbnail').attr('href') + '/edit');
                    return false;
                });
                if (!fn) {
                    return;
                }
                fn(false, function () {
                    el.remove('.auto-listing');
                });
            });
        },
        error: function () {
            fn(true, function () {

            });
        }
    });
};

dust.loadSource(dust.compile(require('./template'), 'auto-listing'));

module.exports = function (sandbox, fn, options) {
    list(sandbox, options, fn);
};

serand.on('user', 'logged in', function (data) {
    user = data;
});
