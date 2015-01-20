"use strict";

/*global ddcs:false*/

ddcs.map = ddcs.map || {};

ddcs.allDemos.push(ddcs.map);

ddcs.map.FIELD_NAME = 'shortDataMap';
ddcs.map.field = null;

function DataField(key, startValue, uiEvents) {
    this.key = key;
    this.startValue = startValue;
    this.uiEvents = uiEvents || [];
}

DataField.prototype.updateUi = function() {
    var input = $('#' + this.key);
    var value = this.getValue();

    if (input.is('input:checkbox')) {
        if(value){
            input.prop('checked', true);
        } else {
            input.prop('checked', false);
        }
    } else {
        if (typeof value === 'string' || typeof value === 'number'){
            input.val(value);
        } else {
            if(value){
                input.val(1);
            } else{
                input.val(0);
            }
        }
    }

    //Change all the classes that reference this value
    $('.get-' + this.key).each(function() {
        $(this).text(value);
    });

    //call all the events that are linked to this ui update
    for (var uiEvent in this.uiEvents) {
        this.uiEvents[uiEvent](value);
    }
};

DataField.prototype.getInput = function() {
    var input = $('#' + this.key);
    if (input.is('input:checkbox')) {
        return input.prop('checked');
    } else {
        return input.val();
    }
};

DataField.prototype.getValue = function() {
    if (ddcs.map.field) {
        var value = ddcs.map.field.get(this.key);
        if (value === null) {
            value = this.startValue;
        }
        return value;
    }
    else {
        return this.startValue;
    }
};

function Mod(id, ability) {
    this.id = id;
    this.ability = ability;
}

Mod.prototype.updateUi = function() {
    var value = this.getValue();
    var id = this.id;
    var getters = $('.get-' + id);
    var ability = this.ability;
    getters.each(function() {
        $(this).attr('title', ability + ' Modifier');
        $(this).text(value);
        $(this).attr('draggable', 'true');
        var htmlString = '[<span class ="get-' + id +
                '" style="font-weight:bold" title ="' +
                ability + ' Modifier">' +
                value + '</span>]';
        $(this).on('dragstart', function(event) {
            event.originalEvent.dataTransfer.setData('text/html', htmlString);
        });
    });
};

Mod.prototype.getValue = function() {
    var score = ddcs.map.field.get(this.ability);
    var value = ddcs.map.getMod(score);
    if (value >= 0) {
        value = '+' + value;
    }
    return value;
};

function ProfMod(id, ability, proficiency, name) {
    this.id = id;
    this.ability = ability;
    this.proficiency = proficiency;
    this.name = name ? name : id;
}

ProfMod.prototype.updateUi = function() {
    var value = this.getValue();
    var id = this.id;
    var getters = $('.get-' + id);
    var prof = ddcs.map.field.get(this.proficiency);
    var ability = this.ability;
    var name = this.name;
    getters.each(function() {
        if ($(this).attr('data-userGetter')) {
            $(this).attr('title', name);
        }
        else if (prof === true) {
            $(this).attr('title', ability + ' Modifier + Proficiency Bonus');
        } else if (prof === false || prof === 0){
            $(this).attr('title', ability + ' Modifier');
        } else {
            $(this).attr('title', ability +
                    ' Modifier + Proficiency Bonus &times; ' + prof);
        }
        $(this).text(value);
        $(this).attr('draggable', 'true');
        var htmlString = '[<span class ="get-' + id +
                '" data-userGetter="true" style="font-weight:bold" title ="' +
                name + '">' +
                value + '</span>]';
        $(this).on('dragstart', function(event) {
            event.originalEvent.dataTransfer.setData('text/html', htmlString);
        });
    }
    );
};

ProfMod.prototype.getValue = function() {
    var score = ddcs.map.field.get(this.ability);
    var prof = ddcs.map.field.get(this.proficiency);
    var value = ddcs.map.getMod(score);
    if (prof === true) {
        value += parseInt(ddcs.map.field.get('ProficiencyBonus'));
    } else if (prof === false || prof === 0 || prof === '0'){
        //do nothing, value is right
    } else{
        value += parseInt(ddcs.map.field.get('ProficiencyBonus')) * parseFloat(prof);
    }
    value = Math.floor(value);
    if (value >= 0) {
        value = '+' + value;
    }

    return value;
};

ddcs.map.setMax = function(fieldId, value) {
    $('#' + fieldId).attr('max', value);
};

ddcs.map.data = [
    //Abilities
    new DataField('Strength', 8, [ddcs.inventory.updateUi]),
    new DataField('Dexterity', 8),
    new DataField('Constitution', 8),
    new DataField('Intelligence', 8),
    new DataField('Wisdom', 8),
    new DataField('Charisma', 8),
    //Save proficiencies
    new DataField('StrengthSaveProf', false),
    new DataField('DexteritySaveProf', false),
    new DataField('ConstitutionSaveProf', false),
    new DataField('IntelligenceSaveProf', false),
    new DataField('WisdomSaveProf', false),
    new DataField('CharismaSaveProf', false),
    //Skill proficiencies
    new DataField('AcrobaticsProf', false),
    new DataField('AnimalHandlingProf', false),
    new DataField('ArcanaProf', false),
    new DataField('AthleticsProf', false),
    new DataField('DeceptionProf', false),
    new DataField('HistoryProf', false),
    new DataField('InsightProf', false),
    new DataField('IntimidationProf', false),
    new DataField('InvestigationProf', false),
    new DataField('MedicineProf', false),
    new DataField('NatureProf', false),
    new DataField('PerceptionProf', false),
    new DataField('PerformanceProf', false),
    new DataField('PersuasionProf', false),
    new DataField('ReligionProf', false),
    new DataField('SleightOfHandProf', false),
    new DataField('StealthProf', false),
    new DataField('SurvivalProf', false),
    //Death saves
    new DataField('DeathSaveFail0', false),
    new DataField('DeathSaveFail1', false),
    new DataField('DeathSaveFail2', false),
    new DataField('DeathSavePass0', false),
    new DataField('DeathSavePass1', false),
    new DataField('DeathSavePass2', false),
    //Other Fields
    new DataField('ProficiencyBonus', 2),
    new DataField('HitPoints', 0),
    new DataField('ArmorClass', 10),
    new DataField('Speed', 30),
    new DataField('Inspiration', 0),
    new DataField('D6HitDice', 0),
    new DataField('D6HitDiceMax', 0, [
        ddcs.settings.updateShowHitDice,
        function(value) {
            ddcs.map.setMax('D6HitDice', value);
        }
    ]),
    new DataField('D8HitDice', 0),
    new DataField('D8HitDiceMax', 0, [
        ddcs.settings.updateShowHitDice,
        function(value) {
            ddcs.map.setMax('D8HitDice', value);
        }
    ]),
    new DataField('D10HitDice', 0),
    new DataField('D10HitDiceMax', 0, [
        ddcs.settings.updateShowHitDice,
        function(value) {
            ddcs.map.setMax('D10HitDice', value);
        }
    ]),
    new DataField('D12HitDice', 0),
    new DataField('D12HitDiceMax', 0, [
        ddcs.settings.updateShowHitDice,
        function(value) {
            ddcs.map.setMax('D12HitDice', value);
        }
    ]),
    //settings Fields
    new DataField('ShowSpellCasting', true,
            [ddcs.settings.updateShowSpellCasting]
            ),
    new DataField(
            'ShowUnusedCastingLevels', true,
            [ddcs.settings.updateShowUnusedSpells]
            ),
    new DataField(
            'ShowUnsusedHitDice', true,
            [ddcs.settings.updateShowHitDice]
            ),
    new DataField(
            'SelectBackgroundColor', '#8C8CAA',
            [ddcs.layout.setDocumentColor]
            ),
    new DataField(
            'ShowThirdMaxWeight', false,
            [ddcs.settings.showThirdMaxWeight]
            ),
    new DataField(
            'UseNumericalProficiencies', false,
            [ddcs.settings.showNumericalProfs]
            )

];

ddcs.map.calculatedValues = [
    //Ability Mods
    new Mod('StrengthMod', 'Strength'),
    new Mod('DexterityMod', 'Dexterity'),
    new Mod('ConstitutionMod', 'Constitution'),
    new Mod('IntelligenceMod', 'Intelligence'),
    new Mod('WisdomMod', 'Wisdom'),
    new Mod('CharismaMod', 'Charisma'),
    //Saves
    new ProfMod(
            'StrengthSave', 'Strength',
            'StrengthSaveProf', 'Strength Save'
            ),
    new ProfMod(
            'DexteritySave', 'Dexterity',
            'DexteritySaveProf', 'Dexterity Save'
            ),
    new ProfMod(
            'ConstitutionSave', 'Constitution',
            'ConstitutionSaveProf', 'Constitution Save'
            ),
    new ProfMod(
            'IntelligenceSave', 'Intelligence',
            'IntelligenceSaveProf', 'Intelligence Save'
            ),
    new ProfMod(
            'WisdomSave', 'Wisdom',
            'WisdomSaveProf', 'Wisdom Save'
            ),
    new ProfMod(
            'CharismaSave', 'Charisma',
            'CharismaSaveProf', 'Charisma Save'
            ),
    //Skills
    new ProfMod(
            'AcrobaticsMod', 'Dexterity',
            'AcrobaticsProf', 'Acrobatics Modifier'
            ),
    new ProfMod(
            'AnimalHandlingMod', 'Wisdom',
            'AnimalHandlingProf', 'Animal Handling Modifier'
            ),
    new ProfMod(
            'ArcanaMod', 'Intelligence',
            'ArcanaProf', 'Arcana Modifier'
            ),
    new ProfMod(
            'AthleticsMod', 'Strength',
            'AthleticsProf', 'Athletics Modifier'
            ),
    new ProfMod(
            'DeceptionMod', 'Charisma',
            'DeceptionProf', 'Deception Modifier'
            ),
    new ProfMod(
            'HistoryMod', 'Intelligence',
            'HistoryProf', 'History Modifier'
            ),
    new ProfMod(
            'InsightMod', 'Wisdom',
            'InsightProf', 'Insight Modifier'
            ),
    new ProfMod(
            'IntimidationMod', 'Charisma',
            'IntimidationProf', 'Intimidation Modifier'
            ),
    new ProfMod(
            'InvestigationMod', 'Intelligence',
            'InvestigationProf', 'Investigation Modifier'
            ),
    new ProfMod(
            'MedicineMod', 'Wisdom',
            'MedicineProf', 'Medicine Modifier'
            ),
    new ProfMod(
            'NatureMod', 'Intelligence',
            'NatureProf', 'Nature Modifier'
            ),
    new ProfMod(
            'PerceptionMod', 'Wisdom',
            'PerceptionProf', 'Perception Modifier'
            ),
    new ProfMod(
            'PerformanceMod', 'Charisma',
            'PerformanceProf', 'Performance Modifier'
            ),
    new ProfMod(
            'PersuasionMod', 'Charisma',
            'PersuasionProf', 'Persuasion Modifier'
            ),
    new ProfMod(
            'ReligionMod', 'Intelligence',
            'ReligionProf', 'Religion Modifier'
            ),
    new ProfMod(
            'SleightOfHandMod', 'Dexterity',
            'SleightOfHandProf', 'Sleight of Hand Modifier'
            ),
    new ProfMod(
            'StealthMod', 'Dexterity',
            'StealthProf', 'Stealth Modifier'
            ),
    new ProfMod(
            'SurvivalMod', 'Wisdom',
            'SurvivalProf', 'Survival Modifier'
            )
];

ddcs.map.getMod = function(abilityScore) {
    var score = parseInt(abilityScore);
    if (isNaN(score))
        return abilityScore;
    return Math.floor((score - 10) / 2);
};

ddcs.map.loadField = function() {
    ddcs.map.field = ddcs.getField(ddcs.map.FIELD_NAME);
};

ddcs.map.initializeModel = function(model) {
    var field = model.createMap();
    for (var i in ddcs.map.data) {
        var dataField = ddcs.map.data[i];
        field.set(dataField.key, dataField.startValue);
    }
    model.getRoot().set(ddcs.map.FIELD_NAME, field);
};

ddcs.map.updateUi = function() {
    //console.log('updating map ui');
    ddcs.map.updateExternalCalculations();
    for (var i in ddcs.map.data) {
        var dataField = ddcs.map.data[i];
        dataField.updateUi();
    }
    for (var i in ddcs.map.calculatedValues) {
        var valueField = ddcs.map.calculatedValues[i];
        valueField.updateUi();
    }
};

ddcs.map.updateExternalCalculations = function() {
    $('.calculate').each(function() {//for each member of the 'calculate' class
        var inputString = $(this).attr('data-calculation');
        $(this).attr('title', inputString);
        var newText = ddcs.map.evaluateString(inputString);
        $(this).text(newText);
    });
};

ddcs.map.evaluateString = function(string) {
    for (var i in ddcs.map.data) {
        var field = ddcs.map.data[i];
        var regex = new RegExp('\\b' + field.key + '\\b', 'ig');
        string = string.replace(regex, field.getValue());
        //console.log('replacing ' + field.key + ' with ' + field.getValue() +
        //        '  -> ' + string);
    }
    for (i in ddcs.map.calculatedValues) {
        field = ddcs.map.calculatedValues[i];
        regex = new RegExp('\\b' + field.id + '\\b', 'ig');
        string = string.replace(regex, field.getValue());
        //console.log('replacing ' + field.id + ' with ' + field.getValue() +
        //        '  -> ' + string);
    }
    //before using eval, make sure there are only numbers and operators
    if (string.match(/[^0-9\+\-\*\/\.\s\(\)]/g)) {
        return string;
    }
    return eval(string);
};

ddcs.map.onDataInput = function(dataField) {
    ddcs.map.field.set(dataField.key, dataField.getInput());
};

ddcs.map.onRealtime = function(evt) {
    //for all the stored fields
    for (var i in ddcs.map.data) {
        var dataField = ddcs.map.data[i];
        //only update the ui of the field that changed
        if (dataField.key === evt.property) {
            dataField.updateUi();
            break; //keys are unique, only one need be found
        }
    }
    //for all the calculated values
    for (var i in ddcs.map.calculatedValues) {
        var valueField = ddcs.map.calculatedValues[i];
        //only update the ui of the calculated value if an input changed
        if (
                valueField.ability === evt.property ||
                valueField.proficiency === evt.property ||
                (valueField.constructor === ProfMod &&
                        'ProficiencyBonus' === evt.property)
                ) {
            valueField.updateUi();
        }
    }
    ddcs.map.updateExternalCalculations();
};

ddcs.map.connectUi = function() {
    //console.log('connecting map UI');
    for (var i in ddcs.map.data) {
        var dataField = ddcs.map.data[i];
        (function(dataField) {
            $('#' + dataField.key).change(function() {
                ddcs.map.onDataInput(dataField);
            });
        })(dataField);
    }
    //console.log('done connecting map UI');
};

ddcs.map.connectRealtime = function() {
    ddcs.map.field.addEventListener(
            gapi.drive.realtime.EventType.VALUE_CHANGED,
            ddcs.map.onRealtime
            );
};
