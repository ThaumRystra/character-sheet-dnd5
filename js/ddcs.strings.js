"use strict";

ddcs.strings = ddcs.strings || {};

ddcs.allDemos.push(ddcs.strings);

function longString(name, selector, startValue) {
    this.name = name;
    this.selector = selector;
    this.field = null;
    this.startValue = startValue ? startValue : '';
}

longString.prototype.updateUi = function() {
    if (this.field) {
        $(this.selector).html(
                ddcs.strings.parseCalculations(this.field.getText())
                );
        if (ddcs.map.field) {
            ddcs.map.updateExternalCalculations();
        }
    }
};

longString.prototype.onInput = function() {
    var newValue = $(this.selector).html();
    this.field.setText(newValue);
};

longString.prototype.onRealtimeInsert = function(evt) {
    this.updateUi();
    ddcs.log.logEvent(evt, "Inserted in " + this.name);
};

longString.prototype.onRealtimeDelete = function(evt) {
    this.updateUi();
    ddcs.log.logEvent(evt, "Deleted from " + this.name);
};

ddcs.strings.array = [
    new longString('attacks', '#attackBox'),
    new longString('description', '#description'),
    new longString('features', '#features'),
    new longString('proficiency', '#proficiency',
            '<h3>Weapons</h3><div>Basic Weapons</div><h3>Languages</h3><div>Common</div><h3>Tools</h3><div>...</div>'),
    new longString('personality', '#personality'),
    new longString('ideals', '#ideals'),
    new longString('bonds', '#bonds'),
    new longString('flaws', '#flaws'),
    new longString('story', '#story'),
    new longString('notes', '#notes')
];

ddcs.strings.parseCalculations = function(string) {
    var array = string.match(/\{[\d\w\+\-\*\/\.\s\(\)]+\}/g);
    for (var match in array) {
        var target = array[match];
        var calc = target.substring(1, target.length - 1);
        string = string.replace(
                target,
                '<b><span class="calculate" data-calculation="' +
                calc +
                '">' +
                calc +
                '</span></b>'
                );
    }
    return string;
};

ddcs.strings.loadField = function() {
    for (var i in ddcs.strings.array) {
        var string = ddcs.strings.array[i];
        string.field = ddcs.getField(string.name);
    }
    console.log('strings loadfield');
};

ddcs.strings.initializeModel = function(model) {
    for (var i in ddcs.strings.array) {
        var string = ddcs.strings.array[i];
        var field = model.createString(string.startValue);
        model.getRoot().set(string.name, field);
    }
    console.log('strings initialized model');
};

ddcs.strings.updateUi = function() {
    for (var i in ddcs.strings.array) {
        var string = ddcs.strings.array[i];
        string.updateUi();
    }
    console.log('strings updateUi');
};

ddcs.strings.connectUi = function() {
    console.log('strings connectUI');
    for (var i in ddcs.strings.array) {
        (function(i) {
            var string = ddcs.strings.array[i];
            $(string.selector).blur(function() {
                ddcs.strings.array[i].onInput();
                ddcs.strings.array[i].updateUi();
            });
        })(i);
        (function(i) {
            var string = ddcs.strings.array[i];
            $(string.selector).focus(function() {
                $(string.selector).html(string.field.getText());
            });
        })(i);
    }
    //console.log('ui connected');
};

ddcs.strings.connectRealtime = function() {
    console.log('strings connectRealtime');
    for (var i in ddcs.strings.array) {
        (function(i) {
            var string = ddcs.strings.array[i];
            string.field.addEventListener(
                    gapi.drive.realtime.EventType.TEXT_INSERTED,
                    function(evt) {
                        ddcs.strings.array[i].onRealtimeInsert(evt);
                    }
            );
            string.field.addEventListener(
                    gapi.drive.realtime.EventType.TEXT_DELETED,
                    function(evt) {
                        ddcs.strings.array[i].onRealtimeDelete(evt);
                    }
            );
        })(i);
    }
    //console.log('strings realtime connected');
};
