"use strict";

ddcs.abilities = ddcs.abilities || {};

ddcs.allDemos.push(ddcs.abilities);

ddcs.abilities.FIELD_NAME = 'abilities';

ddcs.abilities.field = null;

ddcs.abilities.Data = function() {};
ddcs.abilities.Data.prototype.initialize = function(str, dex, con, intel, wis, cha) {
	this.str = str;
	this.dex = dex;
	this.con = con;
	this.intel = intel;
	this.wis = wis;
	this.cha = cha;
};

ddcs.abilities.START_VALUE = {
  str: '8',
  dex: '8',
  con: '8',
  intel: '8',
  wis: '8',
  cha: '8'
};


ddcs.abilities.OUTPUT_SELECTOR = '#abilityContainer';


ddcs.abilities.INPUT_STR_SELECTOR = '#str';
ddcs.abilities.INPUT_DEX_SELECTOR = '#dex';
ddcs.abilities.INPUT_CON_SELECTOR = '#con';
ddcs.abilities.INPUT_INTEL_SELECTOR = '#intel';
ddcs.abilities.INPUT_WIS_SELECTOR = '#wis';
ddcs.abilities.INPUT_CHA_SELECTOR = '#cha';

ddcs.abilities.loadField = function() {
  ddcs.abilities.field = ddcs.getField(ddcs.abilities.FIELD_NAME);
}

ddcs.abilities.initializeModel = function(model) {
  var start = ddcs.abilities.START_VALUE;
  var field = model.create(ddcs.abilities.Data, start.str, start.dex, start.con, start.intel, start.wis, start.cha);
  model.getRoot().set(ddcs.abilities.FIELD_NAME, field);
}

ddcs.abilities.registerTypes = function() {
  var Data = ddcs.abilities.Data;
  var custom = gapi.drive.realtime.custom;
  custom.registerType(Data, 'AbilityData');
  Data.prototype.str = custom.collaborativeField('str');
  Data.prototype.dex = custom.collaborativeField('dex');
  Data.prototype.con = custom.collaborativeField('con');
  Data.prototype.intel = custom.collaborativeField('intel');
  Data.prototype.wis = custom.collaborativeField('wis');
  Data.prototype.cha = custom.collaborativeField('cha');
  custom.setInitializer(Data, Data.prototype.initialize);
}

ddcs.abilities.updateUi = function() {
  if(ddcs.abilities.field){
    $(ddcs.abilities.INPUT_STR_SELECTOR).val(ddcs.abilities.field.str);

    $(ddcs.abilities.INPUT_DEX_SELECTOR).val(ddcs.abilities.field.dex);
	$(ddcs.abilities.INPUT_CON_SELECTOR).val(ddcs.abilities.field.con);
	$(ddcs.abilities.INPUT_INTEL_SELECTOR).val(ddcs.abilities.field.intel);
	$(ddcs.abilities.INPUT_WIS_SELECTOR).val(ddcs.abilities.field.wis);
	$(ddcs.abilities.INPUT_CHA_SELECTOR).val(ddcs.abilities.field.cha);
  }
};

ddcs.abilities.onStrInput = function(evt) {
  var newValue = $(ddcs.abilities.INPUT_STR_SELECTOR).val();
  ddcs.abilities.field.str = newValue;
};

ddcs.abilities.onDexInput = function(evt) {
  var newValue = $(ddcs.abilities.INPUT_DEX_SELECTOR).val();
  ddcs.abilities.field.dex = newValue;
};

ddcs.abilities.onConInput = function(evt) {
  var newValue = $(ddcs.abilities.INPUT_CON_SELECTOR).val();
  ddcs.abilities.field.con = newValue;
};

ddcs.abilities.onIntelInput = function(evt) {
  var newValue = $(ddcs.abilities.INPUT_INTEL_SELECTOR).val();
  ddcs.abilities.field.intel = newValue;
};

ddcs.abilities.onWisInput = function(evt) {
  var newValue = $(ddcs.abilities.INPUT_WIS_SELECTOR).val();
  ddcs.abilities.field.wis = newValue;
};

ddcs.abilities.onChaInput = function(evt) {
  var newValue = $(ddcs.abilities.INPUT_CHA_SELECTOR).val();
  ddcs.abilities.field.cha = newValue;
};

ddcs.abilities.onRealtimeChange = function(evt) {
  ddcs.abilities.updateUi();
  ddcs.log.logEvent(evt, 'Ability Score Changed');
};

ddcs.abilities.connectUi = function() {
  $(ddcs.abilities.INPUT_STR_SELECTOR).change(ddcs.abilities.onStrInput);
  $(ddcs.abilities.INPUT_DEX_SELECTOR).change(ddcs.abilities.onDexInput);
  $(ddcs.abilities.INPUT_CON_SELECTOR).change(ddcs.abilities.onConInput);
  $(ddcs.abilities.INPUT_INTEL_SELECTOR).change(ddcs.abilities.onIntelInput);
  $(ddcs.abilities.INPUT_WIS_SELECTOR).change(ddcs.abilities.onWisInput);
  $(ddcs.abilities.INPUT_CHA_SELECTOR).change(ddcs.abilities.onChaInput);
};

ddcs.abilities.connectRealtime = function() {
  if(ddcs.abilities.field){
    ddcs.abilities.field.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, ddcs.abilities.onRealtimeChange);
  }
};
