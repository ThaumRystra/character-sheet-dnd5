"use strict";

ddcs.lists = ddcs.lists || {};

ddcs.allDemos.push(ddcs.lists);

ddcs.lists.LEVEL_FIELD_NAME = 'spellLevel';
ddcs.lists.CAST_ABILITIES_FIELD_NAME = 'castAbilities';
ddcs.lists.SLOTS_FIELD_NAME = 'slots';
ddcs.lists.STATS_FIELD_NAME = 'stats';

ddcs.lists.levels = [];
ddcs.lists.castAbilities = null;
ddcs.lists.spellSlots = null;

function List(key, baseObject, containerId) {
    this.key = key;
    this.baseObject = baseObject;
    this.containerId = containerId;
    this.field = null;
}

List.prototype.updateUi = function() {
    var field = this.field;
    var array = field.asArray();
    var container = $('#' + this.containerId);
    var fieldId = this.key;
    container.empty();
    for (var i in array) {
        var row = $('<tr></tr>');
        for (var property in array[i]) {
            if (array[i].hasOwnProperty(property)) {
                var val = array[i][property];
                var cell = $('<td contenteditable="true"></td>');
                cell.hmtl(val);
                var id = fieldId + i;
                (function(index, id, property, field) {
                    cell.blur(onSetItem(index, id, property, field));
                })(i, id, property, field);
                row.append(cell);
            }
        }
        var button = $('<button type="button" class="deleteButton"></button>');
        (function(i) {
            button.click(function() {
                onRemoveItem(i);
            });
        })(i);
        var buttonCell = $('<td></td>');
        buttonCell.append(button);
        row.append(buttonCell);
        container.append(row);
    }
};

List.prototype.onAddItem = function() {
    this.field.push(new baseObject());
};

List.prototype.onRemoveItem = function(index) {
    this.field.remove(index);
};

List.prototype.onSetItem = function(index, id, property, field) {
    var item = field.get(index);
    item[property] = $('#' + id).html();
    field.set(index, item);
};

List.prototype.onRealtimeAdd = function() {
    this.updateUi();
};

List.prototype.onRealtimeRemove = function() {
    this.updateUi();
};

List.prototype.onRealtimeSet = function() {
    this.updateUi();
};

function HitDice() {
    this.max = 0;
    this.num = 0;
    this.d = 'd';
    this.dice = 8;
}

ddcs.lists.array = [
    new List('HitDice', HitDice, 'hitDice')
];

ddcs.lists.loadField = function() {
    console.log('lists initialize model');
    for (var i in ddcs.lists.array) {
        var list = ddcs.lists.array[i];
        list.field = ddcs.getField(list.key);
    }
};

ddcs.lists.initializeModel = function(model) {
    console.log('lists initialize model');
    for (var i in ddcs.lists.array) {
        var list = ddcs.lists.array[i];
        var field = model.createList();
        field.push(new list.baseObject());
        model.getRoot().set(list.key, field);
    }
};

ddcs.lists.updateUi = function() {
    console.log('lists update ui');
    for (var i in ddcs.lists.array) {
        var list = ddcs.lists.array[i];
        list.updateUi();
    }
};

ddcs.lists.connectUi = function() {
    console.log('lists connect ui');
    for (var i in ddcs.lists.array) {
        var list = ddcs.lists.array[i];
        $('#' + list.key + 'addButton').click(list.onAddItem);
    }
};

ddcs.lists.connectRealtime = function() {
    console.log('lists connect realtime');
    for (var i in ddcs.lists.array) {
        var list = ddcs.lists.array[i];
        (function(i) {
            list.field.addEventListener(gapi.drive.realtime.EventType.VALUES_SET, ddcs.lists.array[i].onRealtimeSet);
            list.field.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, ddcs.lists.array[i].onRealtimeAdd);
            list.field.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, ddcs.lists.array[i].onRealtimeRemove);
        })(i);
    }
    console.log('lists end connect realtime');
};
