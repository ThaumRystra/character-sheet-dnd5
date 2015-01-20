"use strict";

ddcs.experience = ddcs.experience || {};

ddcs.allDemos.push(ddcs.experience);

ddcs.experience.LIST_FIELD_NAME = 'experience_list';

ddcs.experience.field = null;

ddcs.experience.START_VALUE = [];

ddcs.experience.ADD_BUTTON_SELECTOR = '#addExperienceButton';
ddcs.experience.ADD_EVENT_SELECTOR = '#eventInput';
ddcs.experience.ADD_XP_SELECTOR = '#xpInput';

function ExperienceGain (event, value) {
  this.event = event;
  this.value = value;
  this.index = null;
}

ddcs.experience.TABLE_SELECTOR = '#experience';

ddcs.experience.totalExperience = 0;

ddcs.experience.loadField = function() {
  //console.log('loadField');
  ddcs.experience.field = ddcs.getField(ddcs.experience.LIST_FIELD_NAME);
};

ddcs.experience.initializeModel = function(model) {
  //console.log('initModel');
  var field = model.createList();
  field.pushAll(ddcs.experience.START_VALUE);
  model.getRoot().set(ddcs.experience.LIST_FIELD_NAME, field);
};

ddcs.experience.updateUi = function() {
  //console.log('updateUi');
  var totalXP = 0;
  var array = ddcs.experience.field.asArray();

  //clone the items in the array because Google made them sealed :(
  for (var i = 0; i < array.length; i++) {
    var item = array[i];
    var cloneItem = {};
    for (var prop in item) {
      if(item.hasOwnProperty(prop)) {
        cloneItem[prop] = item[prop];
      }
    }
    array.index = i;
    array[i] = cloneItem;
  }

  for (var i = 0, len = array.length; i < len; i++){
    array[i].index = i;
  }

  array.reverse();
  $(ddcs.experience.TABLE_SELECTOR).empty();

  //keep track of total XP
  ddcs.experience.totalExperience = 0;

  for(var i = 0, len = array.length; i < len; i++){
    var row = $('<tr class="experienceGain"></tr>')
    var xp = array[i].value;
    if (xp == null){
      xp = '?';
    }
    totalXP += parseInt(xp);
    row.html('<td>' + array[i].event + '</td><td>' + xp + '</td>');
    ddcs.experience.totalExperience += array[i].value; //add XP to total
    var button = $('<button class="deleteButton" type="button" style="visibility: hidden;"></button>');
    (function(index){
      button.click(function(){
        ddcs.experience.onButtonClick(index);
      });
    })(array[i].index);
    var buttonCell = $('<td></td>');
    buttonCell.html(button);
    row.append(buttonCell);
    row.hover(ddcs.experience.onMouseEnter, ddcs.experience.onMouseLeave);
    $(ddcs.experience.TABLE_SELECTOR).append(row);
  }
  $('#xpHeading').html('Experience&nbsp;&nbsp;&nbsp;&nbsp;' + totalXP + 'XP');
  //console.log('XP total: ' + ddcs.experience.totalExperience);
  //console.log('updateUi ended');
};

ddcs.experience.onMouseEnter = function (evt) {
  $(evt.target).parent().find('.deleteButton').css('visibility','visible');
};

ddcs.experience.onMouseLeave = function (evt) {
  $(evt.target).parent().find('.deleteButton').css('visibility','hidden');
};

ddcs.experience.onButtonClick = function (index) {
  ddcs.experience.field.remove(index);
};

ddcs.experience.onClearList = function() {
  ddcs.experience.field.clear();
};

ddcs.experience.onSetItem = function() {
  var newValue = $(ddcs.experience.SET_CONTENT_SELECTOR).val();
  var indexToSet = $(ddcs.experience.TABLE_SELECTOR + ' .active').index();
  if (newValue != '' && indexToSet != -1) {
    ddcs.experience.field.set(indexToSet, newValue);
  }
};

ddcs.experience.onRemoveItem = function() {
  var indexToRemove = $(ddcs.experience.TABLE_SELECTOR + ' .active').index();
  ddcs.experience.field.remove(indexToRemove);
};

ddcs.experience.onAddItem = function() {
  var xp = parseInt($(ddcs.experience.ADD_XP_SELECTOR).text());
  if (isNaN(xp)){
    //TODO add some UI here to indicate an invalid field
    return;
  }
  var newValue = new ExperienceGain($(ddcs.experience.ADD_EVENT_SELECTOR).html(), xp);
  if (newValue != null) {
    ddcs.experience.field.push(newValue);
  }
  $(ddcs.experience.ADD_EVENT_SELECTOR).empty();
  $(ddcs.experience.ADD_XP_SELECTOR).empty();
};

ddcs.experience.onMoveItem = function (evt) {
  var oldIndex = $(ddcs.experience.TABLE_SELECTOR + ' .active').index(),
      newIndex = parseInt($(ddcs.experience.MOVE_CONTENT_SELECTOR).val());

  if(newIndex <= $(ddcs.experience.TABLE_SELECTOR).children().length && newIndex >= 0){
    ddcs.experience.field.move(oldIndex, newIndex);
    ddcs.experience.updateUi();
  } else {
    alert('Index is out of bounds');
  }
};

ddcs.experience.onRealtimeAdded = function(evt) {
  ddcs.experience.updateUi();
  var details = '';
  for (var i = 0; i < evt.values.length; i++){
    var index = parseInt(evt.index + i);
    var row = $(ddcs.experience.TABLE_SELECTOR).children().eq(index);
    details += '<div><div class="inline"><b>' + row.children().eq(1).text() + ' XP:</b></div> <div class="inline">' + row.children().eq(0).html() + '</div></div>';
  }
  ddcs.log.logDetailedEvent(evt, 'Experience Added', details);
};

ddcs.experience.onRealtimeRemoved = function(evt) {
  var details = '';
  for (var i = 0; i < evt.values.length; i++){
    var index = parseInt(evt.index + i);
    var row = $(ddcs.experience.TABLE_SELECTOR).children().eq(index);
    details += '<div><div class="inline"><b>' + row.children().eq(1).text() + ' XP:</b></div> <div class="inline">' + row.children().eq(0).html() + '</div></div>';
  }
  ddcs.log.logDetailedEvent(evt, 'Experience Removed', details);
  ddcs.experience.updateUi();
};

ddcs.experience.onRealtimeSet = function(evt) {
  ddcs.experience.updateUi();
  ddcs.log.logEvent(evt, 'Experience Changed');
};

ddcs.experience.connectUi = function() {
  //console.log('connectUi');
  $(ddcs.experience.ADD_BUTTON_SELECTOR).click(ddcs.experience.onAddItem);
  //$(ddcs.experience.SET_SELECTOR).click(ddcs.experience.onSetItem);
};

ddcs.experience.connectRealtime = function() {
  //console.log('connectRealTime');
  ddcs.experience.field.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, ddcs.experience.onRealtimeAdded);
  ddcs.experience.field.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, ddcs.experience.onRealtimeRemoved);
  ddcs.experience.field.addEventListener(gapi.drive.realtime.EventType.VALUES_SET, ddcs.experience.onRealtimeSet);
};
