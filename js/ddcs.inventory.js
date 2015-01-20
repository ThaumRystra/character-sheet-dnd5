"use strict";

ddcs.inventory = ddcs.inventory || {};

ddcs.allDemos.push(ddcs.inventory);

ddcs.inventory.ITEM_LIST_FIELD_NAME = 'item_list';
ddcs.inventory.GROUP_LIST_FIELD_NAME = 'group_list';
ddcs.inventory.COINS_FIELD_NAME = 'coins';

ddcs.inventory.itemField = null;
ddcs.inventory.groupField = null;
ddcs.inventory.coinsField = null;

ddcs.inventory.START_GROUPS = [new Group('Coin Pouch'), new Group('Equipment')];
ddcs.inventory.START_ITEMS = [
  new Item('Platinum Pieces', '', 0, '1pp', 0.02, 0, 10),
  new Item('Gold Pieces', '', 0, '1gp', 0.02, 0, 9),
  new Item('Electrum Pieces', '', 0, '1ep', 0.02, 0, 8),
  new Item('Silver Pieces', '', 0, '1sp', 0.02, 0, 7),
  new Item('Copper Pieces', '', 0, '1cp', 0.02, 0, 6)
];

ddcs.inventory.ADD_ITEM_BUTTON_SELECTOR = '#addItemButton';
ddcs.inventory.ITEM_LIST_SELECTOR = '#itemList';
//TODO add all selectors

function Item(name, description, quantity, value, weight, group, order) {
  this.name = name;
  this.description = description;
  this.quantity = quantity;
  this.value = value;
  this.weight = weight;
  this.group = group;
  this.order = order;
  this.index = null;
}
;

function Group(name) {
  this.name = name;
  this.carried = true;
  this.index = null;
}
;

ddcs.inventory.CoinData = function() {
};
ddcs.inventory.CoinData.prototype.initialize = function(pp, gp, ep, sp, cp) {
  this.pp = pp;
  this.gp = gp;
  this.ep = ep;
  this.sp = sp;
  this.cp = cp;
};

ddcs.inventory.COINS_START_VALUE = {
  pp: '0',
  gp: '0',
  ep: '0',
  sp: '0',
  cp: '0'
};

ddcs.inventory.TABLE_SELECTOR = '#inventory';

ddcs.inventory.loadField = function() {
  //console.log('loadField');
  ddcs.inventory.itemField = ddcs.getField(ddcs.inventory.ITEM_LIST_FIELD_NAME);
  ddcs.inventory.groupField = ddcs.getField(ddcs.inventory.GROUP_LIST_FIELD_NAME);
  ddcs.inventory.coinsField = ddcs.getField(ddcs.inventory.COINS_FIELD_NAME);
};

ddcs.inventory.initializeModel = function(model) {
  //console.log('initModel');
  var itemFld = model.createList();
  itemFld.pushAll(ddcs.inventory.START_ITEMS);
  model.getRoot().set(ddcs.inventory.ITEM_LIST_FIELD_NAME, itemFld);
  var groupFld = model.createList();
  groupFld.pushAll(ddcs.inventory.START_GROUPS);
  model.getRoot().set(ddcs.inventory.GROUP_LIST_FIELD_NAME, groupFld);

  var start = ddcs.inventory.COINS_START_VALUE;
  var coinsFld = model.create(ddcs.inventory.CoinData, start.pp, start.gp, start.ep, start.sp, start.cp);
  model.getRoot().set(ddcs.inventory.COINS_FIELD_NAME, coinsFld);
};

ddcs.inventory.registerTypes = function() {
  var Data = ddcs.inventory.CoinData;
  var custom = gapi.drive.realtime.custom;
  custom.registerType(Data, 'CoinData');
  Data.prototype.pp = custom.collaborativeField('pp');
  Data.prototype.gp = custom.collaborativeField('gp');
  Data.prototype.ep = custom.collaborativeField('ep');
  Data.prototype.sp = custom.collaborativeField('sp');
  Data.prototype.cp = custom.collaborativeField('cp');
  custom.setInitializer(Data, Data.prototype.initialize);
};

ddcs.inventory.updateUi = function() {
  //console.log('updateInventoryUi');
  var groupArray = ddcs.inventory.groupField.asArray();
  var itemArray = ddcs.inventory.itemField.asArray();

  //store indices
  for (var i = 0; i < groupArray.length; i++) {
    var group = groupArray[i];
    var cloneGroup = {};
    for (var prop in group) {
      if(group.hasOwnProperty(prop)) {
        cloneGroup[prop] = group[prop];
      }
    }
    cloneGroup.index = i;
    groupArray[i] = cloneGroup;
  }
  for (var i = 0; i < itemArray.length; i++) {
    var item = itemArray[i];
    var cloneItem = {};
    for (var prop in item) {
      if(item.hasOwnProperty(prop)) {
        cloneItem[prop] = item[prop];
      }
    }
    cloneItem.index = i;
    itemArray[i] = cloneItem;
  }

  //sort item array
  itemArray.sort(function(a, b) {
    if (a.order < b.order) {
      return 1;
    }
    if (a.order > b.order) {
      return -1;
    }
    if (a.name.toUpperCase() > b.name.toUpperCase())
      return 1;
    if (a.name.toUpperCase() < b.name.toUpperCase())
      return -1;
    return 0;
  });

  var mainDiv = $(ddcs.inventory.ITEM_LIST_SELECTOR);
  mainDiv.empty();
  var oldGroupSelection = $('#itemGroup').val();
  $('#itemGroup').empty();
  var oldGroupSelection2 = $('#itemGroup2').val();
  $('#itemGroup2').empty();

  var allWeight = 0;

  for (var group = 0; group < groupArray.length; group++) {
    (function(group) {
      var groupHead = $('<table class="itemGroupHeader"></table>');
      var groupName = $('<td style="font-weight: bold;"></td>');
      groupName.html(groupArray[group].name);
      groupHead.append(groupName);

      var groupOption = $('<option></option>');
      groupOption.html(groupArray[group].name);
      groupOption.attr('value', groupArray[group].index);
      $('#itemGroup').append(groupOption);
      var groupOption2 = $('<option></option>');
      groupOption2.html(groupArray[group].name);
      groupOption2.attr('value', groupArray[group].index);
      $('#itemGroup2').append(groupOption2);

      var groupDiv = $('<table class="itemGroup"></table>');
      groupDiv.append('<thead><tr><th style="width:50px"></th><th style="min-width:100px;"></th><th style="width:25px"></th></tr></thead>');
      var totalWeight = 0;
      var totalCoins = [0, 0, 0, 0, 0];
      var groupIndex = groupArray[group].index;
      for (var item = 0; item < itemArray.length; item++) {
        (function(item) {
          if (itemArray[item].group === groupArray[group].index) {
            var itemIndex = itemArray[item].index;
            var itemId = 'group' + group + 'item' + item;
            ddcs.inventory.addCoinString(totalCoins, itemArray[item].value, itemArray[item].quantity);

            var itemHead = $('<tr></tr>');
            (function(id) {
              itemHead.attr("id", id);
              itemHead.hover(function() {
                ddcs.inventory.onMouseEnter(id);
              }, function() {
                ddcs.inventory.onMouseLeave(id);
              });
            })(itemId);

            var itemQuantity = $('<input style="float: left ;width: 50px; text-align: right;" type="number" min="0" max="9999">');
            itemQuantity.val(itemArray[item].quantity);
            var quantityId = itemId + 'Quantity';
            itemQuantity.attr('id', quantityId);
            (function(index, id) {
              itemQuantity.blur(function() {
                ddcs.inventory.onSetItem(index, id);
              });
            })(itemIndex, quantityId);
            totalWeight += itemArray[item].quantity * itemArray[item].weight;
            var quantityCell = $('<td></td>');
            quantityCell.append(itemQuantity);
            itemHead.append(quantityCell);
            var itemName = $('<td></td>');
            itemName.text(itemArray[item].name);
            itemHead.append(itemName);
            var itemButton = $('<button class="deleteButton" type="button" title="Remove and edit item" style="visibility: hidden;"></button>');
            (function(index) {
              itemButton.click(function() {
                ddcs.inventory.onEditItem(index);
              });
            })(itemIndex);
            var buttonCell = $('<td></td>');
            buttonCell.append(itemButton);
            itemHead.append(buttonCell);
            groupDiv.append(itemHead);

            var itemDiv = $('<div style="max-width:400px;"></div>');
            var itemWeight = $('<span></span>');
            itemWeight.text(itemArray[item].weight + ' lbs');
            itemDiv.append(itemWeight);
            var itemValue = $('<span style="float:right; margin-left:10px;"></span>');
            itemValue.text(itemArray[item].value);
            itemDiv.append(itemValue);
            var itemDescription = $('<div></div>');
            itemDescription.html(itemArray[item].description);
            itemDiv.append(itemDescription);
            itemHead.attr('title', itemDiv.html());
          }//end if item is in the group
        })(item);
      }//for each item end

      var groupCarriedDiv = $('<td style="text-align:right; font-weight: bold;"></td>');
      var groupCarried = $('<input type="checkbox">');
      groupCarried.attr('title', 'Add to weight carried');
      groupCarried.prop('checked', groupArray[group].carried);
      var id = groupIndex + 'checkBox';
      groupCarried.attr('id', id);
      (function(index, id) {
        groupCarried.change(function() {
          ddcs.inventory.onGroupCarriedSet(index, id);
        });
      })(groupIndex, id);
      groupCarriedDiv.append(groupCarried);
      totalWeight = Math.round(totalWeight * 100) / 100;
      if (groupArray[group].carried) {
        allWeight += totalWeight;
      }
      groupCarriedDiv.prepend(totalWeight + ' lbs  ');
      groupCarriedDiv.prepend(ddcs.inventory.getCoinString(totalCoins));
      groupHead.append(groupCarriedDiv);
      mainDiv.append(groupHead);
      var groupOuterDiv = $('<div></div>');
      groupOuterDiv.append(groupDiv);
      mainDiv.append(groupOuterDiv);
    })(group);
  } //for each group end
  $('#itemGroup').val(oldGroupSelection);
  $('#itemGroup2').val(oldGroupSelection2);
  $('#weightCarried').text(Math.round(allWeight * 100) / 100);
  var maxWeight = parseFloat($('#maxWeight').text());
  if(allWeight > maxWeight){
    $('#weightWarning').html('<br><b>Can\'t Lift Load</b>');
    $('#weightWarning').attr('title', 'Cannot lift and move current inventory');
  }else if(allWeight > maxWeight*2/3){
    $('#weightWarning').html('<br><b>Heavily Encumbered </b>');
    $('#weightWarning').attr('title', 'Speed reduced by 20ft<br>\
Disadvantage on ability checks, attack rolls, and saving throws \
that use Strength, Dexterity, or Constitution.');
  } else if(allWeight > maxWeight/3){
    $('#weightWarning').html('<br><b>Encumbered </b>');
    $('#weightWarning').attr('title', 'Speed reduced by 10ft');
  } else{
    $('#weightWarning').empty();
    $('#weightWarning').attr('title','');
  }
};

ddcs.inventory.addCoinString = function(originalArray, coinString, quantityString) {
  var quantity = parseInt(quantityString);

  //return early if invalid or zero quantity
  if (isNaN(quantity) || quantity === 0) {
    return;
  }

  var ppString = coinString.match(/\b\d+pp\b/i);
  if (ppString !== null) {
    var pp = parseInt(ppString[0].match(/\d+/)[0]);
    if (!isNaN(pp)) {
      originalArray[0] += pp * quantity;
    }
  }

  var gpString = coinString.match(/\b\d+gp\b/i);
  if (gpString !== null) {
    var gp = parseInt(gpString[0].match(/\d+/)[0]);
    if (!isNaN(gp)) {
      originalArray[1] += gp * quantity;
    }
  }

  var epString = coinString.match(/\b\d+ep\b/i);
  if (epString !== null) {
    var ep = parseInt(epString[0].match(/\d+/)[0]);
    if (!isNaN(ep)) {
      originalArray[2] += ep * quantity;
    }
  }

  var spString = coinString.match(/\b\d+sp\b/i);
  if (spString !== null) {
    var sp = parseInt(spString[0].match(/\d+/)[0]);
    if (!isNaN(sp)) {
      originalArray[3] += sp * quantity;
    }
  }

  var cpString = coinString.match(/\b\d+cp\b/i);
  if (cpString !== null) {
    var cp = parseInt(cpString[0].match(/\d+/)[0]);
    if (!isNaN(cp)) {
      originalArray[4] += cp * quantity;
    }
  }
};

ddcs.inventory.getCoinString = function(coinArray) {
  var string = '';

  //move coins over where needed
  var spFromCp = Math.floor(coinArray[4]/10);
  coinArray[4] -= spFromCp*10;
  coinArray[3] += spFromCp;

  var gpFromSp = Math.floor(coinArray[3]/10);
  coinArray[3] -= gpFromSp*10;
  coinArray[1] += gpFromSp;

  if (coinArray[0] > 0) {
    string += coinArray[0] + 'pp ';
  }
  if (coinArray[1] > 0) {
    string += coinArray[1] + 'gp ';
  }
  if (coinArray[2] > 0) {
    string += coinArray[2] + 'ep ';
  }
  if (coinArray[3] > 0) {
    string += coinArray[3] + 'sp ';
  }
  if (coinArray[4] > 0) {
    string += coinArray[4] + 'cp ';
  }
  return string;
};

//UI Events

ddcs.inventory.onSetItem = function(index, id) {
  var item = ddcs.inventory.itemField.get(index);
  var quantityInput = $('#' + id);
  //store indices
  var cloneItem = {};
  for (var prop in item) {
    if(item.hasOwnProperty(prop)) {
      cloneItem[prop] = item[prop];
    }
  }
  cloneItem.quantity = quantityInput.val();
  ddcs.inventory.itemField.set(index, cloneItem);
};

ddcs.inventory.onGroupCarriedSet = function(index, id) {
  var group = ddcs.inventory.groupField.get(index);
  var cloneGroup = {};
  for (var prop in group) {
    if(group.hasOwnProperty(prop)) {
      cloneGroup[prop] = group[prop];
    }
  }
  cloneGroup.carried = $('#' + id).prop('checked');
  ddcs.inventory.groupField.set(index, cloneGroup);
};

ddcs.inventory.onEditItem = function(index) {
  var item = ddcs.inventory.itemField.get(index);
  var nameInput = $('#itemName');
  var quantityInput = $('#itemQuantity');
  var weightInput = $('#itemWeight');
  var valueInput = $('#itemValue');
  var descriptionInput = $('#itemDescription');
  var groupInput = $('#itemGroup');
  var orderInput = $('#itemOrder');

  nameInput.val(item.name);
  quantityInput.val(item.quantity);
  weightInput.val(item.weight);
  valueInput.val(item.value);
  descriptionInput.html(item.description);
  groupInput.val(item.group);
  orderInput.val(item.order);

  ddcs.inventory.itemField.remove(index);
  $('#addItem').slideDown();
  $('#addGroup').slideUp();
};

ddcs.inventory.onClearItem = function() {
  var nameInput = $('#itemName');
  var quantityInput = $('#itemQuantity');
  var weightInput = $('#itemWeight');
  var valueInput = $('#itemValue');
  var descriptionInput = $('#itemDescription');
  var orderInput = $('#itemOrder');

  nameInput.val('');
  quantityInput.val(1);
  weightInput.val(0);
  valueInput.val('');
  orderInput.val(0);
  descriptionInput.empty();
};

ddcs.inventory.onAddItem = function() {
  var nameInput = $('#itemName');
  var quantityInput = $('#itemQuantity');
  var weightInput = $('#itemWeight');
  var valueInput = $('#itemValue');
  var descriptionInput = $('#itemDescription');
  var groupInput = $('#itemGroup');
  var orderInput = $('#itemOrder');

  var originalColor = descriptionInput.css('background');
  var name = nameInput.val();
  var quantity = parseInt(quantityInput.val());
  var weight = parseFloat(weightInput.val());
  var value = valueInput.val();
  var description = descriptionInput.html();
  var group = parseInt(groupInput.val());
  var order = parseFloat(orderInput.val());

  //return early if the numbers aren't correctly inputted
  var returnEarly = false;
  if (isNaN(quantity)) {
    quantityInput.css('background', 'red');
    returnEarly = true;
  } else {
    quantityInput.css('background', originalColor);
  }
  if (isNaN(weight)) {
    weightInput.css('background', 'red');
    returnEarly = true;
  } else {
    weightInput.css('background', originalColor);
  }
  if (isNaN(order)) {
    orderInput.css('background', 'red');
    returnEarly = true;
  } else {
    orderInput.css('background', originalColor);
  }
  if (name === '') {
    nameInput.css('background', 'red');
    returnEarly = true;
  } else {
    nameInput.css('background', originalColor);
  }
  if (returnEarly) {
    return;
  }

  var item = new Item(name, description, quantity, value, weight, group, order);
  ddcs.inventory.itemField.push(item);
  nameInput.val('');
  quantityInput.val(1);
  weightInput.val(0);
  valueInput.val('');
  orderInput.val(0);
  descriptionInput.empty();
};

ddcs.inventory.onMouseEnter = function(id) {
  $('#' + id).find('.deleteButton').css('visibility', 'visible');
};

ddcs.inventory.onMouseLeave = function(id) {
  $('#' + id).find('.deleteButton').css('visibility', 'hidden');
};

ddcs.inventory.onMoveItem = function(evt) {

};

ddcs.inventory.onSetGroup = function() {

};

ddcs.inventory.onRemoveGroup = function() {
  var groupIndex = parseInt($('#itemGroup2').val());
  $('#itemGroup2').prop('selectedIndex', -1);
  ddcs.inventory.groupField.remove(groupIndex);
  //reshuffle items group index regerences
  var itemArray = ddcs.inventory.itemField.asArray();
  var indexToRemove = [];
  for(var i = 0; i < itemArray.length; i++){
    var item = itemArray[i];
    if (item.group === groupIndex){
      indexToRemove.push(i);
    } else if (item.group > groupIndex){
      item.group--;
      ddcs.inventory.itemField.set(i, item);
    }
  }
  for(var i = 0; i < indexToRemove.length; i++){
    ddcs.inventory.itemField.remove(indexToRemove[i]);
  }
};

ddcs.inventory.onAddGroup = function() {
  var groupName = $('#groupName');
  ddcs.inventory.groupField.push(new Group(groupName.val()));
};

ddcs.inventory.onMoveGroup = function(evt) {

};

ddcs.inventory.onPpInput = function(evt) {
  var val = 0;
  ddcs.inventory.coinsField.pp = val;
};

ddcs.inventory.onGpInput = function(evt) {
  var val = 0;
  ddcs.inventory.coinsField.gp = val;
};

ddcs.inventory.onEpInput = function(evt) {
  var val = 0;
  ddcs.inventory.coinsField.ep = val;
};

ddcs.inventory.onSpInput = function(evt) {
  var val = 0;
  ddcs.inventory.coinsField.sp = val;
};

ddcs.inventory.onCpInput = function(evt) {
  var val = 0;
  ddcs.inventory.coinsField.cp = val;
};

//RealTime Events

ddcs.inventory.onRealtimeItemAdded = function(evt) {
  ddcs.inventory.updateUi();
  ddcs.log.logEvent(evt, 'Item Added');
};

ddcs.inventory.onRealtimeItemRemoved = function(evt) {
  ddcs.inventory.updateUi();
  ddcs.log.logEvent(evt, 'Item Removed');
};

ddcs.inventory.onRealtimeItemSet = function(evt) {
  ddcs.inventory.updateUi();
  ddcs.log.logEvent(evt, 'Item Changed');
};

ddcs.inventory.onRealtimeGroupAdded = function(evt) {
  ddcs.inventory.updateUi();
  ddcs.log.logEvent(evt, 'Group Added');
};

ddcs.inventory.onRealtimeGroupRemoved = function(evt) {
  ddcs.inventory.updateUi();
  ddcs.log.logEvent(evt, 'Group Removed');
};

ddcs.inventory.onRealtimeGroupSet = function(evt) {
  ddcs.inventory.updateUi();
  ddcs.log.logEvent(evt, 'Group Changed');
};

ddcs.inventory.onRealtimeCoinsChange = function(evt) {
  ddcs.inventory.updateUi();
  ddcs.log.logevent(evt, 'Coin Changed');
};

ddcs.inventory.onShowGroupButton = function() {
  var div = $('#addGroup');
  var otherDiv = $('#addItem');
  if (div.css('display') === 'block') {
    div.slideUp();
  } else {
    div.slideDown();
    otherDiv.slideUp();
  }
};

ddcs.inventory.onShowItemButton = function() {
  var div = $('#addItem');
  var otherDiv = $('#addGroup');
  if (div.css('display') === 'block') {
    div.slideUp();
  } else {
    div.slideDown();
    otherDiv.slideUp();
  }
};

ddcs.inventory.connectUi = function() {
  //console.log('connectUi');
  //$(ddcs.inventory.SET_SELECTOR).click(ddcs.inventory.onSetItem);
  $('#showGroupButton').click(ddcs.inventory.onShowGroupButton);
  $('#showItemButton').click(ddcs.inventory.onShowItemButton);
  $('#addGroupButton').click(ddcs.inventory.onAddGroup);
  $('#deleteGroupButton').click(ddcs.inventory.onRemoveGroup);
  $('#addItemButton').click(ddcs.inventory.onAddItem);
  $('#clearItemButton').click(ddcs.inventory.onClearItem);

  $('#itemGroup2').prop('selectedIndex', -1);
};

ddcs.inventory.connectRealtime = function() {
  //console.log('connectRealTime');
  ddcs.inventory.itemField.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, ddcs.inventory.onRealtimeItemAdded);
  ddcs.inventory.itemField.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, ddcs.inventory.onRealtimeItemRemoved);
  ddcs.inventory.itemField.addEventListener(gapi.drive.realtime.EventType.VALUES_SET, ddcs.inventory.onRealtimeItemSet);

  ddcs.inventory.groupField.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, ddcs.inventory.onRealtimeGroupAdded);
  ddcs.inventory.groupField.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, ddcs.inventory.onRealtimeGroupRemoved);
  ddcs.inventory.groupField.addEventListener(gapi.drive.realtime.EventType.VALUES_SET, ddcs.inventory.onRealtimeGroupSet);

  ddcs.inventory.coinsField.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, ddcs.inventory.onRealtimeCoinsChange);
};
