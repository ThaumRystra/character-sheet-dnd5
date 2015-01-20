"use strict";

ddcs.attacks = ddcs.attacks || {};

ddcs.allDemos.push(ddcs.attacks);

ddcs.attacks.LIST_FIELD_NAME = 'attacks_list';

ddcs.attacks.listField = null;

ddcs.attacks.START_VALUE = [];

ddcs.attacks.ADD_BUTTON_SELECTOR = '#addAttackButton';
ddcs.attacks.ADD_DMG_SELECTOR = '#attackDamageInput';
ddcs.attacks.ADD_ATTACK_SELECTOR = '#attackNameInput';
ddcs.attacks.ADD_ATTACK_BONUS_SELECTOR = '#attackBonusInput';
ddcs.attacks.ADD_DAMAGE_TYPE_SELECTOR = '#attackDmageTypeInput';


function Attack(name, attackBonus, damage, damageType) {
    this.name = name;
    this.attackBonus = attackBonus;
    this.damage = damage;
    this.damageType = damageType;
}
;

ddcs.attacks.TABLE_SELECTOR = '#attackTable';

ddcs.attacks.loadField = function() {
    //console.log('loadField');
    ddcs.attacks.listField = ddcs.getField(ddcs.attacks.LIST_FIELD_NAME);
};

ddcs.attacks.initializeModel = function(model) {
    //console.log('initModel');
    var field = model.createList();
    field.pushAll(ddcs.attacks.START_VALUE);
    model.getRoot().set(ddcs.attacks.LIST_FIELD_NAME, field);
};

ddcs.attacks.updateUi = function() {
    //console.log('updateUi');

    var array = ddcs.attacks.listField.asArray();

    $(ddcs.attacks.TABLE_SELECTOR).empty();

    for (var i = 0, len = array.length; i < len; i++) {
        var row = $('<tr class="attack"></tr>');
        row.html('<td class="attackDetails attackName" contenteditable="true">' +
                ddcs.strings.parseCalculations(array[i].name) + '</td><td class="attackDetails attackBonus" contenteditable="true">' +
                ddcs.strings.parseCalculations(array[i].attackBonus) + '</td><td class="attackDetails attackDamage" contenteditable="true">' +
                ddcs.strings.parseCalculations(array[i].damage) + '</td><td class="attackDetails attackDamageType" contenteditable="true">' +
                ddcs.strings.parseCalculations(array[i].damageType) + '</td>');
        var rowId = 'attack' + i;
        row.attr('id', rowId);
        (function(index, rowId) {
            row.children('.attackDetails').blur(function() {
                ddcs.attacks.onSetItem(index, rowId);
            });
            row.children('.attackDetails').focus(function() {
                ddcs.attacks.onFocusItem(index, rowId);
            });
        })(i, rowId);
        var button = $(
                '<button class="deleteButton" type="button" style="visibility: hidden;"></button>'
                );
        button.click(ddcs.attacks.onButtonClick);
        var buttonCell = $('<td></td>');
        buttonCell.html(button);
        row.append(buttonCell);
        row.hover(ddcs.attacks.onMouseEnter, ddcs.attacks.onMouseLeave);
        $(ddcs.attacks.TABLE_SELECTOR).append(row);
    }

    if (ddcs.map.field) {
            ddcs.map.updateExternalCalculations();
        }
    //console.log('updateUi ended');
};

ddcs.attacks.onMouseEnter = function(evt) {
    $(evt.target).parent().find('.deleteButton').css('visibility', 'visible');
};

ddcs.attacks.onMouseLeave = function(evt) {
    $(evt.target).parent().find('.deleteButton').css('visibility', 'hidden');
};

ddcs.attacks.onButtonClick = function(evt) {
    var index = $(evt.target).parent().parent().index();
    ddcs.attacks.listField.remove(index);
};

ddcs.attacks.onClearList = function() {
    ddcs.attacks.listField.clear();
};

ddcs.attacks.onSetItem = function(index, rowId) {
    var row = $('#' + rowId);
    var name = row.children('.attackName').html();
    var attackBonus = row.children('.attackBonus').html();
    var attackDamage = row.children('.attackDamage').html();
    var attackDamageType = row.children('.attackDamageType').html();
    var attack = new Attack(name, attackBonus, attackDamage, attackDamageType);
    ddcs.attacks.listField.set(index, attack);
};

ddcs.attacks.onFocusItem = function(index, rowId) {
    var row = $('#' + rowId);
    var name = row.children('.attackName');
    var attackBonus = row.children('.attackBonus');
    var attackDamage = row.children('.attackDamage');
    var attackDamageType = row.children('.attackDamageType');
    var attack = ddcs.attacks.listField.get(index);
    name.html(attack.name);
    attackBonus.html(attack.attackBonus);
    attackDamage.html(attack.damage);
    attackDamageType.html(attack.damageType);
};

ddcs.attacks.onRemoveItem = function() {
    var indexToRemove = $(ddcs.attacks.TABLE_SELECTOR + ' .active').index();
    ddcs.attacks.listField.remove(indexToRemove);
};

ddcs.attacks.onAddItem = function() {
    var newValue = new Attack(
            "New Attack",
            "+{StrengthMod + ProficiencyBonus}",
            "NdX + {StrengthMod}",
            ""
            );
    if (newValue !== null) {
        ddcs.attacks.listField.push(newValue);
    }
};

ddcs.attacks.onMoveItem = function(evt) {

};

ddcs.attacks.onRealtimeAdded = function(evt) {
    ddcs.attacks.updateUi();
    var details = '';
    for (var i = 0; i < evt.values.length; i++) {
        var index = parseInt(evt.index + i);
        var row = $(ddcs.attacks.TABLE_SELECTOR).children().eq(index);
        details += '<div><div class="inline"><b>' + row.children().eq(0).text() + ' ' + row.children().eq(1).text() + '</b> for ' + row.children().eq(2).text() + 'HP</div> <div class="inline">' + row.children().eq(3).html() + '</div></div>';
    }
    ddcs.log.logDetailedEvent(evt, 'Attack Added', details);
};

ddcs.attacks.onRealtimeRemoved = function(evt) {
    var details = '';
    for (var i = 0; i < evt.values.length; i++) {
        var index = parseInt(evt.index + i);
        var row = $(ddcs.attacks.TABLE_SELECTOR).children().eq(index);
        details += '<div><div class="inline"><b>' + row.children().eq(0).text() + ' ' + row.children().eq(1).text() + '</b> for ' + row.children().eq(2).text() + 'HP</div> <div class="inline">' + row.children().eq(3).html() + '</div></div>';
    }
    ddcs.log.logDetailedEvent(evt, 'Attack Removed', details);
    ddcs.attacks.updateUi();
};

ddcs.attacks.onRealtimeSet = function(evt) {
    ddcs.attacks.updateUi();
    ddcs.log.logEvent(evt, 'Attack Changed');
};

ddcs.attacks.connectUi = function() {
    //console.log('connectUi');
    $(ddcs.attacks.ADD_BUTTON_SELECTOR).click(ddcs.attacks.onAddItem);
    //$(ddcs.attacks.SET_SELECTOR).click(ddcs.attacks.onSetItem);
};

ddcs.attacks.connectRealtime = function() {
    //console.log('connectRealTime');
    ddcs.attacks.listField.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, ddcs.attacks.onRealtimeAdded);
    ddcs.attacks.listField.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, ddcs.attacks.onRealtimeRemoved);
    ddcs.attacks.listField.addEventListener(gapi.drive.realtime.EventType.VALUES_SET, ddcs.attacks.onRealtimeSet);
};
