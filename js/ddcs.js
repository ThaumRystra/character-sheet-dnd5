"use strict";

var ddcs = ddcs || {};

/** Your Application ID from the Google APIs Console. */
ddcs.APP_ID = '17452280709';

/** Your application's Client ID from the Google APIs Console. */
ddcs.CLIENT_ID = '17452280709-3sqfpshkc46u6egp12ampsn1sj0un5c8.apps.googleusercontent.com';

ddcs.realtimeDoc = null;

ddcs.allDemos = [];

ddcs.mapDemos = function(callback) {
    return ddcs.allDemos.map(callback);
};

ddcs.isInitialized = function() {
    return (ddcs.string.field !== null);
};

ddcs.getField = function(name) {
    return ddcs.realtimeDoc.getModel().getRoot().get(name);
};

ddcs.LOG_SELECTOR = '#demoLog';
ddcs.SHARE_SELECTOR = '#demoShareButton';
ddcs.OPEN_SELECTOR = '#openExistingDoc';
ddcs.CREATE_SELECTOR = '#createNewDoc';
ddcs.AUTH_BUTTON_ID = 'demoAuthorizeButton';
ddcs.AUTH_HOLDER_SELECTOR = '#demoUnauthorizedOverlay';
ddcs.CREATE_DOC_HOLDER_SELECTOR = '#demoChooseDocument';
ddcs.SHARE_DOC_HOLDER_SELECTOR = '#mainContent';
ddcs.INITILIZED_MESSAGE_SELECTOR = '#realtimeInitialized';
ddcs.COLLAB_HOLDER_SELECTOR = '#collabSections';
ddcs.AUTHORIZED_MESSAGE_HOLDER_SELECTOR = '#authorizedMessage';

// Interval at which we check if the auth token needs to be refreshed in ms
ddcs.AUTH_TOKEN_REFRESH_INTERVAL = 1800000; // 30 minutes

ddcs.initializeModel = function(model) {
    var l = ddcs.allDemos.length;
    for (var i = 0; i < l; i++) {
        var demo = ddcs.allDemos[i];
        demo.initializeModel(model);
    }
};

//Only called by others
ddcs.updateUi = function() {
    for (var i = 0; i < ddcs.allDemos.length; i++) {
        var demo = ddcs.allDemos[i];
        demo.updateUi();
    }
};

// Called when the realtime file has been loaded.
ddcs.onFileLoaded = function(doc) {
    console.log('File loaded');
    console.log(doc);
    ddcs.realtimeDoc = doc;
    // Binding UI and listeners for demo data elements.
    for (var i = 0; i < ddcs.allDemos.length; i++) {
        var demo = ddcs.allDemos[i];
        demo.loadField();
        demo.updateUi();
        demo.connectUi();
        demo.connectRealtime(doc);
    }

    ddcs.settings.connectUi();

    // Activating undo and redo buttons.
    var model = doc.getModel();
    $('#undoButton').click(function() {
        model.undo();
    });
    $('#redoButton').click(function() {
        model.redo();
    });

    // Add event handler for UndoRedoStateChanged events.
    var onUndoRedoStateChanged = function(e) {
        $('#undoButton').prop('disabled', !e.canUndo);
        $('#redoButton').prop('disabled', !e.canRedo);
    };
    model.addEventListener(gapi.drive.realtime.EventType.UNDO_REDO_STATE_CHANGED, onUndoRedoStateChanged);

    // We load the name of the file to populate the file name field.
    gapi.client.load('drive', 'v2', function() {
        var request = gapi.client.drive.files.get({
            'fileId': rtclient.params['fileIds'].split(',')[0]
        });
        $('#documentName').attr('disabled', '');
        request.execute(function(resp) {
            $('#documentName').val(resp.title);
            document.title = resp.title;
            $('#documentName').removeAttr('disabled');
            $('#documentName').change(function() {
                $('#documentName').attr('disabled', '');
                var body = {'title': $('#documentName').val()};
                var renameRequest = gapi.client.drive.files.patch({
                    'fileId': rtclient.params['fileIds'].split(',')[0],
                    'resource': body
                });
                renameRequest.execute(function(resp) {
                    $('#documentName').val(resp.title);
                    $('#documentName').removeAttr('disabled');
                });
            });
        });
    });

    // Showing message that a doc has been loaded
    $('#documentNameContainer').show();
    // Enable Step 3 and 4
    $(ddcs.SHARE_DOC_HOLDER_SELECTOR).removeClass('disabled');
    $('#settingsButton').removeClass('disabled');
    $(ddcs.INITILIZED_MESSAGE_SELECTOR).show();
    $(ddcs.COLLAB_HOLDER_SELECTOR).removeClass('disabled');
    //Re-enabling buttons to create or load docs
    $('#createNewDoc').removeClass('disabled');
    $('#openExistingDoc').removeClass('disabled');
    $('#demoShareButton').removeClass('disabled');
    ddcs.layout.initialize();
};

// Register all types on Realtime doc creation.
ddcs.registerTypes = function() {
    var l = ddcs.allDemos.length;
    for (var i = 0; i < l; i++) {
        var demo = ddcs.allDemos[i];
        var registerTypes = demo.registerTypes;
        if (registerTypes) {
            registerTypes();
        }
    }
    console.log(ddcs);
};

// Opens the Google Picker.
ddcs.popupOpen = function() {
    var token = gapi.auth.getToken().access_token;
    var view = new google.picker.View(google.picker.ViewId.DOCS);
    view.setMimeTypes("application/vnd.google-apps.drive-sdk." + ddcs.realTimeOptions.appId);
    var picker = new google.picker.PickerBuilder()
            .enableFeature(google.picker.Feature.NAV_HIDDEN)
            .setAppId(ddcs.realTimeOptions.appId)
            .setOAuthToken(token)
            .addView(view)
            .addView(new google.picker.DocsUploadView())
            .setCallback(ddcs.openCallback)
            .build();
    picker.setVisible(true);
};

// Called when a file has been selected using the Google Picker.
ddcs.openCallback = function(data) {
    if (data.action == google.picker.Action.PICKED) {
        var fileId = data.docs[0].id;
        ddcs.realtimeLoader.redirectTo([fileId], ddcs.realtimeLoader.authorizer.userId);
    }
};

// Popups the Sharing dialog.
ddcs.popupShare = function() {
    var shareClient = new gapi.drive.share.ShareClient(ddcs.realTimeOptions.appId);
    shareClient.setItemIds(rtclient.params['fileIds'].split(','));
    shareClient.showSettingsDialog();
};

// Connects UI elements to functions.
ddcs.connectUi = function() {
    $(ddcs.SHARE_SELECTOR).click(ddcs.popupShare);
    $(ddcs.OPEN_SELECTOR).click(ddcs.popupOpen);
};

// Initializes the Realtime Playground.
ddcs.start = function() {
    ddcs.realtimeLoader = new rtclient.RealtimeLoader(ddcs.realTimeOptions);
    ddcs.connectUi();
    ddcs.realtimeLoader.start();
};

ddcs.afterAuth = function() {
    $(ddcs.CREATE_DOC_HOLDER_SELECTOR).removeClass('disabled');
    $(ddcs.AUTHORIZED_MESSAGE_HOLDER_SELECTOR).show();
    $('#createNewDoc').removeClass('disabled');
    $('#openExistingDoc').removeClass('disabled');

    $(ddcs.CREATE_SELECTOR).click(function() {
        $(ddcs.CREATE_SELECTOR).addClass('disabled');
        $(ddcs.OPEN_SELECTOR).addClass('disabled');
        ddcs.realtimeLoader.createNewFileAndRedirect();
    });
};

ddcs.refreshAuth = function() {
    setTimeout(function() {
        ddcs.realtimeLoader.authorizer.authorize();
        ddcs.refreshAuth();
    }, ddcs.AUTH_TOKEN_REFRESH_INTERVAL);
};

// Start oauth token refresher timer
ddcs.refreshAuth();

// Options container for the realtime client utils.
ddcs.realTimeOptions = {
    appId: ddcs.APP_ID,
    clientId: ddcs.CLIENT_ID,
    authButtonElementId: ddcs.AUTH_BUTTON_ID,
    autoCreate: false,
    initializeModel: ddcs.initializeModel,
    onFileLoaded: ddcs.onFileLoaded,
    registerTypes: ddcs.registerTypes,
    afterAuth: ddcs.afterAuth,
    newFileMimeType: null, // Using default.
    defaultTitle: "New Character"
};

// Returns the collaborator for the given session ID.
ddcs.getCollaborator = function(sessionId) {
    var collaborators = ddcs.realtimeDoc.getCollaborators();
    for (var i = 0; i < collaborators.length; i = i + 1) {
        if (collaborators[i].sessionId == sessionId) {
            return collaborators[i];
        }
    }
    return null;
};

// Returns the Collaborator object for the current user.
ddcs.getMe = function() {
    var collaborators = ddcs.realtimeDoc.getCollaborators();
    for (var i = 0; i < collaborators.length; i = i + 1) {
        if (collaborators[i].isMe) {
            return collaborators[i];
        }
    }
    return null;
};
