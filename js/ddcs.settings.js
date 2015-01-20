"use strict";

ddcs.settings = ddcs.settings || {};

ddcs.settings.connectUi = function() {
    $('#settingsButton').click(function() {
        $('#settings').slideToggle();
    });

    $('.scrollLink').each(function() {
        $(this).click(function() {
            $('html, body').animate({
                scrollTop: $($(this).attr('data-destination')).offset().top
            }, 500);
        });
    });

    $('#showRightBox').click(ddcs.settings.toggleRightBox);
};

ddcs.settings.toggleRightBox = function() {
    var rb = $('#rightBox'),
            leftPos = '-2px',
            rightPos = '-158px';
    if (rb.css('right') === rightPos) {
        $('#rightBox').animate({
            right: leftPos
        }, 300);
    } else if (rb.css('right') === leftPos) {
        $('#rightBox').animate({
            right: rightPos
        }, 300);
    }
};


ddcs.settings.updateShowHitDice = function() {
    var map = ddcs.getField(ddcs.map.FIELD_NAME);
    var show = map ? map.get('ShowUnsusedHitDice') : null;

    //d6
    if (($('#D6HitDiceMax').val() === '0' || $('#D6HitDiceMax').val() === '')
            && !show) {
        $('#d6HitDice').hide();
    } else {
        $('#d6HitDice').show();
    }

    //d8
    if (($('#D8HitDiceMax').val() === '0' || $('#D8HitDiceMax').val() === '')
            && !show) {
        $('#d8HitDice').hide();
    } else {
        $('#d8HitDice').show();
    }

    //d10
    if (($('#D10HitDiceMax').val() === '0' || $('#D10HitDiceMax').val() === '')
            && !show) {
        $('#d10HitDice').hide();
    } else {
        $('#d10HitDice').show();
    }

    //d12
    if (($('#D12HitDiceMax').val() === '0' || $('#D12HitDiceMax').val() === '')
            && !show) {
        $('#d12HitDice').hide();
    } else {
        $('#d12HitDice').show();
    }
};

ddcs.settings.updateShowSpellCasting = function(showCasting) {
    if (showCasting) {
        $('#spellCastingLink').show();
    } else {
        $('#spellCastingLink').hide();
    }
    ddcs.spells.updateUi();
};

ddcs.settings.updateShowUnusedSpells = function(value) {
    var show = value;

    //hide cantrips if there are none
    if (!show &&
            $('#cantrips').children().length === 0) {
        $('#cantripsBox').hide();
        console.log('hiding cantrips');
    } else {
        $('#cantripsBox').show();
    }

    //hide spell boxes if they have no slots and no spells
    for (var i = 1; i <= 9; i++) {
        var maxSlots = $('#level' + i + 'MaxSlots');
        if (!show &&
                $('#level' + i + 'Spells').children().length === 0 &&
                (maxSlots.val() === '0' || maxSlots.val() === '')) {
            $('#level' + i + 'SpellsBox').hide();
        } else {
            $('#level' + i + 'SpellsBox').show();
        }
    }
};

ddcs.settings.showThirdMaxWeight = function(value) {
    if (value) {
        $('#maxWeight').hide();
        $('#thirdMaxWeight').show();
        $('#weightWarning').show();
    } else {
        $('#maxWeight').show();
        $('#thirdMaxWeight').hide();
        $('#weightWarning').hide();
    }
};

ddcs.settings.showProfMultipliers = function(value){
    if(value){
        $('.profMultiplier').show();
    } else{
        $('.profMultiplier').hide();
    }
};

ddcs.settings.showNumericalProfs = function(value){
    if(value){
        $('.profInput').each(function(){
            $(this).get(0).type = "number";
        });
    } else{
        $('.profInput').each(function(){
            $(this).get(0).type = "checkbox";
        });
    }
    for(var i = 5; i < 30; i++){
        ddcs.map.data[i].updateUi();
    }
};
