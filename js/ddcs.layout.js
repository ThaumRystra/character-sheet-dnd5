"use strict";

ddcs.layout = ddcs.layout || {};

ddcs.layout.initialize = function() {

};

ddcs.layout.setDocumentColor = function(value){
    var body = $('body');
    body.css('background', 'linear-gradient(white, ' + value + ')');
    body.css('background-repeat', 'no-repeat');
    body.css('background-attachment', 'fixed');
};
