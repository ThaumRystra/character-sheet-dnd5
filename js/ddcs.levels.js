"use strict";

ddcs.levels = ddcs.levels || {};

ddcs.allDemos.push(ddcs.levels);

ddcs.levels.LIST_FIELD_NAME = 'levels_list';

ddcs.levels.field = null;

ddcs.levels.START_VALUE = [];

ddcs.levels.ADD_BUTTON_SELECTOR = '#addLevelButton';
ddcs.levels.ADD_CLS_SELECTOR = '#clsInput';
ddcs.levels.ADD_LEVEL_SELECTOR = '#levelInput';
ddcs.levels.ADD_HP_GAINED_SELECTOR = '#hpGainedInput';
ddcs.levels.ADD_FEATURES_GAINED_SELECTOR = '#featuresGainedInput';
ddcs.levels.MAX_HP_SELECTOR = '#maxHp';

function LevelGain(cls, level, hp, features) {
    this.cls = cls;
    this.level = level;
    this.hp = hp;
    this.features = features;
};

ddcs.levels.TABLE_SELECTOR = '#levels';

ddcs.levels.loadField = function() {
    //console.log('loadField');
    ddcs.levels.field = ddcs.getField(ddcs.levels.LIST_FIELD_NAME);
};

ddcs.levels.initializeModel = function(model) {
    //console.log('initModel');
    var field = model.createList();
    field.pushAll(ddcs.levels.START_VALUE);
    model.getRoot().set(ddcs.levels.LIST_FIELD_NAME, field);
};

ddcs.levels.updateUi = function() {
    //console.log('updateUi');

    var array = ddcs.levels.field.asArray();

    $(ddcs.levels.TABLE_SELECTOR).empty();
    var totalHp = 0;

    for (var i = 0, len = array.length; i < len; i++) {
        var row = $('<tr class="levelGain"></tr>');
        var hp = array[i].hp;
        totalHp += hp;
        if (hp === null) {
            hp = '?';
        }
        row.html('<td>' + array[i].cls + '</td><td>' +
                array[i].level + '</td><td>' +
                hp + '</td><td>' +
                array[i].features + '</td>');
        var button = $(
                '<button class="deleteButton" type="button" style="visibility: hidden;"></button>'
                );
        button.click(ddcs.levels.onButtonClick);
        var buttonCell = $('<td></td>');
        buttonCell.html(button);
        row.append(buttonCell);
        row.hover(ddcs.levels.onMouseEnter, ddcs.levels.onMouseLeave);
        $(ddcs.levels.TABLE_SELECTOR).append(row);
    }

    $(ddcs.levels.MAX_HP_SELECTOR).text(totalHp);
    //console.log('updateUi ended');
};

ddcs.levels.onMouseEnter = function(evt) {
    $(evt.target).parent().find('.deleteButton').css('visibility', 'visible');
};

ddcs.levels.onMouseLeave = function(evt) {
    $(evt.target).parent().find('.deleteButton').css('visibility', 'hidden');
};

ddcs.levels.onButtonClick = function(evt) {
    var index = $(evt.target).parent().parent().index();
    ddcs.levels.field.remove(index);
};

ddcs.levels.onClearList = function() {
    ddcs.levels.field.clear();
};

ddcs.levels.onSetItem = function() {

};

ddcs.levels.onAddItem = function() {
    var hp = parseInt($(ddcs.levels.ADD_HP_GAINED_SELECTOR).text());
    if (isNaN(hp)) {
        //TODO add some UI here to indicate an invalid field
        return;
    }
    var newValue = new LevelGain(
            $(ddcs.levels.ADD_CLS_SELECTOR).html(),
            $(ddcs.levels.ADD_LEVEL_SELECTOR).html(),
            hp,
            $(ddcs.levels.ADD_FEATURES_GAINED_SELECTOR).html()
            );
    if (newValue !== null) {
        ddcs.levels.field.push(newValue);
    }
    $(ddcs.levels.ADD_CLS_SELECTOR).empty();
    $(ddcs.levels.ADD_LEVEL_SELECTOR).empty();
    $(ddcs.levels.ADD_HP_GAINED_SELECTOR).empty();
    $(ddcs.levels.ADD_FEATURES_GAINED_SELECTOR).empty();
};

ddcs.levels.onMoveItem = function(evt) {
    var oldIndex = $(ddcs.levels.TABLE_SELECTOR + ' .active').index(),
            newIndex = parseInt($(ddcs.levels.MOVE_CONTENT_SELECTOR).val());

    if (
            newIndex <= $(ddcs.levels.TABLE_SELECTOR).children().length &&
            newIndex >= 0
            ) {
        ddcs.levels.field.move(oldIndex, newIndex);
        ddcs.levels.updateUi();
    } else {
        alert('Index is out of bounds');
    }
};

ddcs.levels.onRealtimeAdded = function(evt) {
    ddcs.levels.updateUi();
    var details = '';
    for (var i = 0; i < evt.values.length; i++) {
        var index = parseInt(evt.index + i);
        var row = $(ddcs.levels.TABLE_SELECTOR).children().eq(index);
        details += '<div><div class="inline"><b>' + row.children().eq(0).text() + ' ' + row.children().eq(1).text() + '</b> for ' + row.children().eq(2).text() + 'HP</div> <div class="inline">' + row.children().eq(3).html() + '</div></div>';
    }
    ddcs.log.logDetailedEvent(evt, 'Level Added', details);
};

ddcs.levels.onRealtimeRemoved = function(evt) {
    var details = '';
    for (var i = 0; i < evt.values.length; i++) {
        var index = parseInt(evt.index + i);
        var row = $(ddcs.levels.TABLE_SELECTOR).children().eq(index);
        details += '<div><div class="inline"><b>' + row.children().eq(0).text() + ' ' + row.children().eq(1).text() + '</b> for ' + row.children().eq(2).text() + 'HP</div> <div class="inline">' + row.children().eq(3).html() + '</div></div>';
    }
    ddcs.log.logDetailedEvent(evt, 'Level Removed', details);
    ddcs.levels.updateUi();
};

ddcs.levels.onRealtimeSet = function(evt) {
    ddcs.levels.updateUi();
    ddcs.log.logEvent(evt, 'Level Changed');
};

ddcs.levels.connectUi = function() {
    //console.log('connectUi');
    $(ddcs.levels.ADD_BUTTON_SELECTOR).click(ddcs.levels.onAddItem);
    //$(ddcs.levels.SET_SELECTOR).click(ddcs.levels.onSetItem);
};

/*
 ddcs.levels.connectUi = function() {
 $(ddcs.levels.ADD_BUTTON_SELECTOR).on('click', ddcs.levels.onAddItem);
 };
 */
ddcs.levels.connectRealtime = function() {
    //console.log('connectRealTime');
    ddcs.levels.field.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, ddcs.levels.onRealtimeAdded);
    ddcs.levels.field.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, ddcs.levels.onRealtimeRemoved);
    ddcs.levels.field.addEventListener(gapi.drive.realtime.EventType.VALUES_SET, ddcs.levels.onRealtimeSet);
};
