"use strict";

ddcs.spells = ddcs.spells || {};

ddcs.allDemos.push(ddcs.spells);

ddcs.spells.LEVEL_FIELD_NAME = 'spellLevel';
ddcs.spells.CAST_ABILITIES_FIELD_NAME = 'castAbilities';
ddcs.spells.SLOTS_FIELD_NAME = 'slots';
ddcs.spells.STATS_FIELD_NAME = 'stats';

ddcs.spells.levels = [];
ddcs.spells.castAbilities = null;
ddcs.spells.spellSlots = null;


function Spell(name, prepared, description) {
    this.name = name;
    this.prepared = prepared;
    this.description = description;
    this.index = null;
}
;

function CastAbility(ability, maxPreparedSpells) {
    this.ability = ability;
    this.maxPreparedSpells = maxPreparedSpells;
}
;

ddcs.spells.SLOTS_START_KEYS = ({
    "Level1": "0", "Level1Max": "0",
    "Level2": "0", "Level2Max": "0",
    "Level3": "0", "Level3Max": "0",
    "Level4": "0", "Level4Max": "0",
    "Level5": "0", "Level5Max": "0",
    "Level6": "0", "Level6Max": "0",
    "Level7": "0", "Level7Max": "0",
    "Level8": "0", "Level8Max": "0",
    "Level9": "0", "Level9Max": "0"
});

ddcs.spells.SLOTS_SELECTOR = ({
    "Level1": "#level1Slots", "Level1Max": "#level1MaxSlots",
    "Level2": "#level2Slots", "Level2Max": "#level2MaxSlots",
    "Level3": "#level3Slots", "Level3Max": "#level3MaxSlots",
    "Level4": "#level4Slots", "Level4Max": "#level4MaxSlots",
    "Level5": "#level5Slots", "Level5Max": "#level5MaxSlots",
    "Level6": "#level6Slots", "Level6Max": "#level6MaxSlots",
    "Level7": "#level7Slots", "Level7Max": "#level7MaxSlots",
    "Level8": "#level8Slots", "Level8Max": "#level8MaxSlots",
    "Level9": "#level9Slots", "Level9Max": "#level9MaxSlots"
});

ddcs.spells.SPELL_START_VALUE = {
    prepared: 'false',
    name: 'New Spell',
    description: ''
};

ddcs.spells.LIST_SELECTOR = ['#cantrips', '#level1Spells', '#level2Spells',
    '#level3Spells', '#level4Spells', '#level5Spells', '#level6Spells',
    '#level7Spells', '#level8Spells', '#level9Spells'];

ddcs.spells.ADD_SPELL_BUTTON_SELECTOR = ['#cantripButton', '#level1Button', '#level2Button',
    '#level3Button', '#level4Button', '#level5Button', '#level6Button',
    '#level7Button', '#level8Button', '#level9Button'];

ddcs.spells.ABILITIES_SELECTOR = '#castAbilities';

ddcs.spells.loadField = function() {
    for (var i = 0; i <= 9; i++) {
        ddcs.spells.levels[i] = ddcs.getField(ddcs.spells.LEVEL_FIELD_NAME + i);
    }
    ddcs.spells.castAbilities = ddcs.getField(ddcs.spells.CAST_ABILITIES_FIELD_NAME);
    ddcs.spells.spellSlots = ddcs.getField(ddcs.spells.SLOTS_FIELD_NAME);

    ddcs.spells.map = ddcs.getField(ddcs.map.FIELD_NAME);

    ddcs.spells.statsField = ddcs.getField(ddcs.spells.STATS_FIELD_NAME);
};

ddcs.spells.initializeModel = function(model) {
    //spell lists
    for (var i = 0; i <= 9; i++) {
        var level = model.createList();
        model.getRoot().set(ddcs.spells.LEVEL_FIELD_NAME + i, level);
    }
    //cast abilities list
    var castField = model.createList();
    castField.push(new CastAbility('IntelligenceMod', 0));
    model.getRoot().set(ddcs.spells.CAST_ABILITIES_FIELD_NAME, castField);

    var slotsField = model.createMap(ddcs.spells.SLOTS_START_KEYS);
    for (var key in ddcs.spells.SLOTS_START_KEYS) {
        slotsField.set(key, ddcs.spells.SLOTS_START_KEYS[key]);
    }
    model.getRoot().set(ddcs.spells.SLOTS_FIELD_NAME, slotsField);
};

ddcs.spells.updateUi = function() {
    var map = ddcs.getField(ddcs.map.FIELD_NAME);
    var showField = map ? map.get('ShowSpellCasting') : null;
    //console.log('showing spellcasting? ' + showField);
    if (showField === false) {
        $('#spellCasting').css('display', 'none');
        return;
    } else {
        $('#spellCasting').css('display', 'initial');
    }
    ddcs.spells.updateCastAbilitiesUi();
    ddcs.spells.updateSlotsUi();
    for (var i = 0; i <= 9; i++) {
        ddcs.spells.updateLevelUi(i);
    }
};

ddcs.spells.updateCastAbilitiesUi = function() {
    var abilitiesDiv = $(ddcs.spells.ABILITIES_SELECTOR);
    abilitiesDiv.empty();
    var array = ddcs.spells.castAbilities.asArray();
    for (var i = 0, len = array.length; i < len; i++) {
        (function(i) {
            var abilityDiv = $('<div></div>');
            var id = 'castAbility' + i;
            abilityDiv.attr("id", id);
            var index = i;
            var abilityInput = $(
                    '<select class="ability" style="height: 50px; border: none; font-weight: bold;">' +
                    '<option value="StrengthMod">Strength</option>' +
                    '<option value="DexterityMod">Dexterity</option>' +
                    '<option value="ConstitutionMod">Constitution</option>' +
                    '<option value="IntelligenceMod">Intelligence</option>' +
                    '<option value="WisdomMod">Wisdom</option>' +
                    '<option value="CharismaMod">Charisma</option>' +
                    '</select>');
            abilityInput.change(function() {
                ddcs.spells.onCastAbilityChange(id, index);
            });
            abilityInput.val(array[index].ability);
            var selectAbilityDiv = $('<div class="inline squareStat"></div>');
            selectAbilityDiv.append('Spellcasting Ability<div>');
            selectAbilityDiv.append(abilityInput);
            selectAbilityDiv.append('</div>');
            abilityDiv.append(selectAbilityDiv);

            var saveDc = $('<div class="bigNumber calculate"></div>');
            saveDc.attr('title', '8 + ' + array[index].ability + ' + Proficiency Bonus');
            saveDc.attr('data-calculation', '8 + ' + array[index].ability + ' + ProficiencyBonus');
            var saveDiv = $('<div class="inline squareStat"></div>');
            saveDiv.append('Spell Save DC<div>');
            saveDiv.append(saveDc);
            saveDiv.append('</div>');
            abilityDiv.append(saveDiv);

            var attackBonus = $('<div class="bigNumber calculate"></div>');
            attackBonus.attr('title', array[index].ability + ' + Proficiency Bonus');
            attackBonus.attr('data-calculation', array[index].ability + ' + ProficiencyBonus');
            var attackDiv = $('<div class="inline squareStat"></div>');
            attackDiv.append('Spell Attack Bonus<div>');
            attackDiv.append(attackBonus);
            attackDiv.append('</div>');
            abilityDiv.append(attackDiv);
            if (i === 0) {
                var maxPrepared = $('<input type="number" class="bigNumber maxPrepared" max="99" min="0">');
                (function(id, index) {
                    maxPrepared.blur(function() {
                        ddcs.spells.onCastAbilityChange(id, index);
                    });
                })(id, index);
                maxPrepared.val(array[index].maxPreparedSpells);
                var maxPreparedDiv = $('<div class="inline squareStat"></div>');
                maxPreparedDiv.append('Max Prepared Spells<div>');
                maxPreparedDiv.append(maxPrepared);
                maxPreparedDiv.append('</div>');
                abilityDiv.append(maxPreparedDiv);
            } else {
                var button = $(
                        '<button class="deleteButton" type="button" style="visibility: hidden; float: right"></button>'
                        );
                button.click(function() {
                    ddcs.spells.onAbilityButton(index);
                });
                abilityDiv.append(button);
                abilityDiv.hover(
                        function() {
                            ddcs.spells.onMouseEnter(id);
                        },
                        function() {
                            ddcs.spells.onMouseLeave(id);
                        }
                );
            }

            abilitiesDiv.append(abilityDiv);
        })(i);
    }
    if (ddcs.map.field) {
        ddcs.map.updateExternalCalculations();
    }
};

ddcs.spells.updateLevelUi = function(level) {
    var spellList = $(ddcs.spells.LIST_SELECTOR[level]);
    spellList.empty();
    var array = ddcs.spells.levels[level].asArray();

    for (var i = 0; i < array.length; i++) {
      for (var i = 0; i < array.length; i++) {
        var item = array[i];
        var cloneItem = {};
        for (var prop in item) {
          if(item.hasOwnProperty(prop)) {
            cloneItem[prop] = item[prop];
          }
        }
        cloneItem.index = i;
        array[i] = cloneItem;
      }
    }

    array.sort(function(a, b) {
        if (a.name.toUpperCase() > b.name.toUpperCase())
            return 1;
        if (a.name.toUpperCase() < b.name.toUpperCase())
            return -1;
        return 0;
    });

    for (var i = 0, len = array.length; i < len; i++) {
        (function(i) {
            var index = array[i].index;
            var id = 'level' + level + 'spell' + index;
            var checkBox = $('<input class="prepared" type="checkbox" style="margin-right: 5px">');
            checkBox.attr('title', 'Spell Prepared');
            checkBox.prop('checked', array[i].prepared);
            checkBox.change(function() {
                ddcs.spells.onSpellEdit(id, level, index);
            });
            var spellName = $('<input type="text" class="spellName" ></input>');
            spellName.val(array[i].name);
            spellName.blur(function() {
                ddcs.spells.onSpellEdit(id, level, index);
            });
            var spellDescription = $('<div class="spellDescription" style="padding: 5px;" contenteditable="true"></div>');
            spellDescription.html(ddcs.strings.parseCalculations(array[i].description));
            spellDescription.blur(function() {
                ddcs.spells.onSpellEdit(id, level, index);
            });
            (function(desc) {
                spellDescription.focus(function() {
                    spellDescription.html(desc);
                });
            })(array[i].description);
            var button = $(
                    '<button class="deleteButton" type="button" style="visibility: hidden; float: right"></button>'
                    );
            button.click(function() {
                ddcs.spells.onButtonClick(level, index);
            });
            var spellDiv = $('<div style="margin-bottom: 10px;"></div>');
            spellDiv.attr("id", id);
            spellDiv.hover(
                    function() {
                        ddcs.spells.onMouseEnter(id);
                    },
                    function() {
                        ddcs.spells.onMouseLeave(id);
                    }
            );
            spellDiv.append(checkBox);
            spellDiv.append(spellName);
            spellDiv.append(button);
            spellDiv.append(spellDescription);
            spellList.append(spellDiv);
        })(i);
    }
    if (ddcs.map.field) {
        ddcs.map.updateExternalCalculations();
    }
};

ddcs.spells.updateSlotsUi = function() {
    var keys = ddcs.spells.spellSlots.keys();
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var val = ddcs.spells.spellSlots.get(key);
        $(ddcs.spells.SLOTS_SELECTOR[key]).val(val);
        //edit the maximum values of the other fields
        if (key.length > 6) {
            var otherKey = key.replace('Max', '');
            $(ddcs.spells.SLOTS_SELECTOR[otherKey]).attr('max', val);
        }
    }
};

//events
ddcs.spells.onAddCastAbility = function(evt) {
    ddcs.spells.castAbilities.push(new CastAbility('IntelligenceMod', 0));
};

ddcs.spells.onCastAbilityChange = function(castAbilityId, index) {
    var castAbility = $('#' + castAbilityId);
    var ability = castAbility.find('.ability').val();
    var maxPrepared = castAbility.find('.maxPrepared').val();
    ddcs.spells.castAbilities.set(index, new CastAbility(ability, maxPrepared));
};

ddcs.spells.onAbilityButton = function(index) {
    ddcs.spells.castAbilities.remove(index);
};

ddcs.spells.onButtonClick = function(level, index) {
    ddcs.spells.levels[level].remove(index);
};

ddcs.spells.onMouseEnter = function(spellId) {
    $('#' + spellId).find('.deleteButton').css('visibility', 'visible');
};

ddcs.spells.onMouseLeave = function(spellId) {
    $('#' + spellId).find('.deleteButton').css('visibility', 'hidden');
};

ddcs.spells.onSpellEdit = function(spellId, level, index) {
    var spell = $('#' + spellId);
    var name = spell.find('.spellName').val();
    var prepared = spell.find('.prepared').prop('checked');
    var description = spell.find('.spellDescription').html();
    ddcs.spells.levels[level].set(index, new Spell(name, prepared, description));
};

ddcs.spells.onSpellAdd = function(level) {
    ddcs.spells.levels[level].push(new Spell('~New Spell', false, ''));
};

ddcs.spells.onSlotEdit = function(key) {
    var val = $(ddcs.spells.SLOTS_SELECTOR[key]).val();
    ddcs.spells.spellSlots.set(key, val);
};

ddcs.spells.onRealtimeSpellAdded = function(evt, level) {
    ddcs.spells.updateLevelUi(level);
    ddcs.log.logEvent(evt, 'Level ' + level + ' Spell Added');
};

ddcs.spells.onRealtimeSpellRemoved = function(evt, level) {
    ddcs.spells.updateLevelUi(level);
    ddcs.log.logEvent(evt, 'Level ' + level + ' Spell Removed');
};

ddcs.spells.onRealtimeSpellSet = function(evt, level) {
    ddcs.spells.updateLevelUi(level);
    ddcs.log.logEvent(evt, 'Level ' + level + ' Spell Modified');
};

ddcs.spells.onRealtimeSlot = function(evt) {
    ddcs.spells.updateSlotsUi();
    ddcs.log.logEvent(evt, 'Spell Slot Modified');
};

ddcs.spells.onRealtimeCastAbilityAdded = function(evt) {
    ddcs.spells.updateCastAbilitiesUi();
    ddcs.log.logEvent(evt, 'Casting Ability Added');
};

ddcs.spells.onRealtimeCastAbilityRemoved = function(evt) {
    ddcs.spells.updateCastAbilitiesUi();
    ddcs.log.logEvent(evt, 'Casting Ability Removed');
};

ddcs.spells.onRealtimeCastAbilitySet = function(evt) {
    ddcs.spells.updateCastAbilitiesUi();
    ddcs.log.logEvent(evt, 'Casting Ability Set');
};

ddcs.spells.onRealtimeAbilityChange = function(evt) {
    ddcs.spells.updateCastAbilitiesUi();
};

ddcs.spells.onRealtimeMap = function(evt) {
    if (evt.property === 'ShowSpellCasting') {
        ddcs.spells.updateUi();
    }
};

ddcs.spells.connectUi = function() {
    for (var i = 0; i <= 9; i++) {
        (function(level) {
            $(ddcs.spells.ADD_SPELL_BUTTON_SELECTOR[level]).click(function() {
                ddcs.spells.onSpellAdd(level);
            });
        })(i);
    }
    var keys = ddcs.spells.spellSlots.keys();
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        (function(key) {
            $(ddcs.spells.SLOTS_SELECTOR[key]).change(function() {
                ddcs.spells.onSlotEdit(key);
            });
        })(key);
    }
    $('#castAbilitiesButton').click(ddcs.spells.onAddCastAbility);
};

ddcs.spells.connectRealtime = function() {

    //spell lists
    for (var i = 0; i <= 9; i++) {
        (function(level) { //closure start
            ddcs.spells.levels[level].addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED,
                    function(evt) {
                        ddcs.spells.onRealtimeSpellAdded(evt, level);
                    });
            ddcs.spells.levels[level].addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED,
                    function(evt) {
                        ddcs.spells.onRealtimeSpellRemoved(evt, level);
                    });
            ddcs.spells.levels[level].addEventListener(gapi.drive.realtime.EventType.VALUES_SET,
                    function(evt) {
                        ddcs.spells.onRealtimeSpellSet(evt, level);
                    });
        })(i);//closure end
    }

    //spell slots
    ddcs.spells.spellSlots.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, ddcs.spells.onRealtimeSlot);

    //cast Abilities
    ddcs.spells.castAbilities.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, ddcs.spells.onRealtimeCastAbilityAdded);
    ddcs.spells.castAbilities.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, ddcs.spells.onRealtimeCastAbilityRemoved);
    ddcs.spells.castAbilities.addEventListener(gapi.drive.realtime.EventType.VALUES_SET, ddcs.spells.onRealtimeCastAbilitySet);
};
