"use strict";

var ddcs = ddcs || {};

ddcs.ui = ddcs.ui || {};

ddcs.ui.initButtons = function() {
  $('.rp-button').each(function() {
    var thisButton = $(this);
    if (thisButton.hasClass('rp-togglebutton')) {
      thisButton.bind('click', function() {
        thisButton.toggleClass('selected');
      });
    }
  });
};

ddcs.ui.initScrollBoxes = function() {
  var maxS = 15;
  $('.scrollBarInner').bind('scroll', function() {
    $(this).find('.shadow').css('opacity', $(this).scrollTop() / maxS);
  });
};

ddcs.ui.resizeElements = function() {
  $('#rightContainer').width($(document).width() -
      $('#leftContainer').width());
  if ($(window).scrollTop() >=
      ($('#rp-googlebar').outerHeight() + $('#logTitle').outerHeight() - 30)) {
    $('#logContainer').height($('body').height() -
        $('.rp-appbar').outerHeight() + 22);
    $('#rightContainer').css('position','fixed');
    $('#rightContainer').css('top','67px');
    $('#rightContainer').css('right','0');

  } else {
    $('#logContainer').height($('body').height() -
        $('.rp-appbar').outerHeight() -
        $('#rp-googlebar').outerHeight() -
        $('#logTitle').outerHeight() -
        16 +
        $(window).scrollTop());
    $('#rightContainer').css('position','relative');
    $('#rightContainer').css('top','');
    $('#rightContainer').css('right','0');
  }
};

ddcs.ui.matchSelectFromKey = function() {
  $('#demoMapValues').prop("selectedIndex", $('#demoMapKeys').prop("selectedIndex"));
  $('#demoMapKey').val($('#demoMapKeys').val());
  $('#demoMapValue').val($('#demoMapValues').val());
};

ddcs.ui.hideShowLocalEvents = function() {
  if ($('#filterLocal').get(0).checked) {
    $('.localEvent').hide();
  } else {
    $('.localEvent').show();
  }
};

ddcs.ui.matchSelectFromValue = function() {
  $('#demoMapKeys').prop("selectedIndex", $('#demoMapValues').prop("selectedIndex"));
  $('#demoMapKey').val($('#demoMapKeys').val());
  $('#demoMapValue').val($('#demoMapValues').val());
};

ddcs.ui.matchListValue = function() {
  var value = $('#demoListInput').val();
  $('#demoListSetContent').val(value);
  $('#demoListMove').text('Move ' + value + ' to index');
};

//Resizing elastic elements on window resize.
$(window).resize(ddcs.ui.resizeElements);
$(window).scroll(ddcs.ui.resizeElements);

//Initializing everything on document ready.
$(document).ready(function() {
  ddcs.ui.initButtons();
  ddcs.ui.initScrollBoxes();
  ddcs.ui.resizeElements();

  $('#demoMapValues').change(ddcs.ui.matchSelectFromValue);
  $('#demoMapKeys').change(ddcs.ui.matchSelectFromKey);
  $('#demoListInput').change(ddcs.ui.matchListValue);
  $('#filterLocal').change(ddcs.ui.hideShowLocalEvents);
});

// Loading Tooltips
google.setOnLoadCallback(ddcs.start);
google.load('picker', '1');
$(function() {
  $( document ).tooltip({
    position: {
      my: "center top+4",
      at: "center bottom",
      using: function(position, feedback) {
        $(this).css( position );
        $('<div>').addClass('arrow')
          .addClass(feedback.vertical)
          .addClass(feedback.horizontal)
          .appendTo(this);
      }
    }
  });
});
