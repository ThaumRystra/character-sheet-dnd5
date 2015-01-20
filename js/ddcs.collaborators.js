"use strict";

ddcs.collaborators = ddcs.collaborators || {};

ddcs.allDemos.push(ddcs.collaborators);

ddcs.collaborators.COLLABORATORS_SELECTOR = '#collaborators';

ddcs.collaborators.loadField = function() {
}

ddcs.collaborators.initializeModel = function(model) {
}

ddcs.collaborators.updateUi = function() {
  var collaboratorsList = ddcs.realtimeDoc.getCollaborators();
  $(ddcs.collaborators.COLLABORATORS_SELECTOR).empty();
  for (var i = 0; i < collaboratorsList.length; i = i + 1) {
    var collaborator = collaboratorsList[i];
    var imgSrc = collaborator.photoUrl == null ? 'images/anon.jpeg' : collaborator.photoUrl;
    var img = $('<img>').attr('src', imgSrc).attr('alt', collaborator.displayName).attr('title', collaborator.displayName + (collaborator.isMe ? " (Me)" : ""));
    img.css('background-color', collaborator.color);
    $(ddcs.collaborators.COLLABORATORS_SELECTOR).append(img);
  }
};

ddcs.collaborators.connectUi = function() {
};

ddcs.collaborators.connectRealtime = function(doc) {
  //Adding Listeners for Collaborator events.
  doc.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_JOINED, ddcs.collaborators.onCollaboratorJoined);
  doc.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT, ddcs.collaborators.onCollaboratorLeft);
  ddcs.collaborators.updateUi();
};

ddcs.collaborators.onCollaboratorJoined = function(event) {
  ddcs.log.logEvent(event, 'User opened the document');
  ddcs.collaborators.updateUi();
};

ddcs.collaborators.onCollaboratorLeft = function(event) {
  ddcs.log.logEvent(event, 'User closed the document');
  ddcs.collaborators.updateUi();
  ddcs.list.garbageCollectReferenceIndices();
};
