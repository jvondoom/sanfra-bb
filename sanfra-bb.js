Matches = new Mongo.Collection("matches");
ActualMatch = new Mongo.Collection("matchValues");

Meteor.methods({
  'addActualMatch': function (){
    ActualMatch.insert({
      idMV: 0,
      inActual: 1,
      upDown: "Arriba",
      outs: 0, 
      ended: false
    });
  }, 

  'modActualMatch': function (idAM, inA, upD, ots){
    ActualMatch.update(
      { _id: idAM }, 
      {$set: {
        inActual: inA,
        upDown: upD,
        outs: ots
      }
    });
  },

  'modActualMatch': function (idAM, inA, upD, ots, ends){
    ActualMatch.update(
      { _id: idAM }, 
      {$set: {
        inActual: inA,
        upDown: upD,
        outs: ots, 
        ended: ends
      }
    });
  },

  'modOuts': function (idAM, ots){
    ActualMatch.update(
      { _id: idAM }, 
      {$set: {
        outs: ots
      }
    });
  }, 

  'modRuns': function (idAM, upD, rn, inA){
    var docID = Matches.findOne({"ended" : false});

    if (upD == "Arriba") {
      strSH = 'scoreVisit.' + (inA - 1) + '.score';
    }
    else {
      strSH = 'scoreHome.' + (inA - 1) + '.score';
    }
    
    Matches.update({ 
        _id:docID._id 
      }, 
      { $set: JSON.parse('{"'+strSH+'" : '+rn+'}') }
    );

    var i = 1;
    var sumRuns = 0;
    strTS = "";
    if (upD == "Arriba") {
      strTS = "totalScoreVisit";
      while (i < inA){
        sumRuns = sumRuns + docID.scoreVisit[i-1].score;
        i = i + 1;
      }
    }
    else {
      strTS = "totalScoreHome";
      while (i < inA){
        sumRuns = sumRuns + docID.scoreHome[i-1].score;
        i = i + 1;
      }
    }
    sumRuns = parseInt(sumRuns) + parseInt(rn);
    Matches.update({ 
        _id:docID._id 
      }, 
      { $set: JSON.parse('{"'+strTS+'" : '+sumRuns+'}') }
    );
  }, 

  'modNextIn': function (idAM, upD, inA){
    var docID = Matches.findOne({"ended" : false});
    var strSH = "";

    if (upD == "Arriba"){
        strSH = 'scoreHome.' + (inA - 1) + '.score';

        Matches.update({ 
            _id:docID._id 
          }, 
          { $set: JSON.parse('{"'+strSH+'" : '+0+'}') }
        );

        ActualMatch.update(
          { _id: idAM }, 
          { $set: {
            "upDown" : "Abajo",
            "outs" : 0 } }
        );
      }
      else{
        strSH = 'scoreVisit.' + (inA) + '.score';

        Matches.update({ 
            _id:docID._id 
          }, 
          { $set: JSON.parse('{"'+strSH+'" : '+0+'}') }
        );

        var nextIn = inA + 1;

        ActualMatch.update(
          { _id: idAM }, 
          { $set: { 
            "upDown" : "Arriba",
            "inActual" : nextIn, 
            "outs" : 0 } }
        );
      }
  }, 

  'addMatch': function (tmH, tmV) {
    Matches.insert({
      date: new Date(), 
      teamHome: tmH,
      teamVisit: tmV,
      totalScoreHome: 0,
      totalScoreVisit: 0,
      ended: false,
      scoreHome: [
          { num: 1, score: null},
          { num: 2, score: null},
          { num: 3, score: null},
          { num: 4, score: null},
          { num: 5, score: null},
          { num: 6, score: null},
          { num: 7, score: null},
          { num: 8, score: null},
          { num: 9, score: null}
      ], 
      scoreVisit: [
          { num: 1, score: null},
          { num: 2, score: null},
          { num: 3, score: null},
          { num: 4, score: null},
          { num: 5, score: null},
          { num: 6, score: null},
          { num: 7, score: null},
          { num: 8, score: null},
          { num: 9, score: null}
      ]
    });
  },

  'modEndMatch': function (){
    ActualMatch.update({
      _id:ActualMatch.findOne({"idMV" : 0})['_id']}, 
      {$set: { 
        "ended" : true
      }
    });

    Matches.update({
      _id:Matches.findOne({"ended" : false})['_id']}, 
      {$set: { 
        "ended" : true
      }
    });
  }
});

if (Meteor.isServer) {
  // This code only runs on the server
  Accounts.validateNewUser(function (user) {
    console.log(user.username === "admin");
    return user.username === "admin";
  });
}


if (Meteor.isClient) {
  // This code only runs on the client

  Template.body.helpers({
    matches: function () {
      return Matches.find({}, {sort: {date: -1}});
    },

    actualMatch: function () {
      return ActualMatch.find({});
    }
  });

  Template.body.events({
    'click .navig-item': function (e) {
      $('li.active').attr('class', 'navig-item');
      e.currentTarget.className = "navig-item active";
    }, 

    'click #mForm1': function () {
      $('.mForm1').show();
      $('.mForm2').hide();
    },

    'click #mForm2': function () {
      $('.mForm2').show();
      $('.mForm1').hide();
    }
  });

  Template.body.onRendered(function () {
    $('.mForm1').hide();
    $('.mForm2').hide();
  });

  Template.match.onRendered(function () {
    $('.match-info').hide();
  });

  Template.match.events({
    'click .match-header': function (e) {
      $('.match-info').slideUp('normal');
      if ($(e.currentTarget).next().is(':hidden') === true) {
        $(e.currentTarget).next().slideDown('normal');
      }
      return false;
    }
  });

  Template.matchSettings.events({
    'submit .score-settings': function (e) {
      e.preventDefault();

      var txtRuns = $(e.currentTarget).find("input[name=runs]")[0];
      var txtOuts = $(e.currentTarget).find("input[name=outs]")[0];

      Meteor.call('modRuns', this._id, this.upDown, txtRuns.value, this.inActual);
      Meteor.call('modOuts', this._id, txtOuts.value);
    }, 

    'click .new-half': function (e) {
      e.preventDefault();

      var txtRuns = $(e.delegateTarget).find("input[name=runs]")[0];
      var txtOuts = $(e.delegateTarget).find("input[name=outs]")[0];

      Meteor.call('modRuns', this._id, this.upDown, txtRuns.value, this.inActual);
      Meteor.call('modOuts', this._id, txtOuts.value);

      txtRuns.value = 0;
      txtOuts.value = 0;

      var strNextUpD = "";

      if (this.upDown == "Arriba") {
        strNextUpD = "Abajo";
      }
      else {
        strNextUpD = "Arriba";
      }

      Meteor.call('modNextIn', this._id, this.upDown, this.inActual);
    },

    'click .end-game': function (e) {
      e.preventDefault();

      Meteor.call('modEndMatch');
    }
  });

  Template.newMatch.events({
    'submit .new-match': function (e) {
      e.preventDefault();

      var optHomeVisit = $(e.currentTarget).find("input[name=homeVisit]:checked")[0];
      var otherTeam = $(e.currentTarget).find("input[name=otherTeam]")[0];
      var errorOtherTeam = $(e.currentTarget).find('#other-team')[0];
      var errorHelp1 =  $(e.currentTarget).find('#helpBlock1')[0];
      var errorHomeVisit = $(e.currentTarget).find('#home-visit')[0];
      var errorHelp2 =  $(e.currentTarget).find('#helpBlock2')[0];
      var txtTeamHome = "";
      var txtTeamVisit = "";

      if (otherTeam.value == "" || typeof optHomeVisit === "undefined") {
        if (otherTeam.value == "") {
          errorOtherTeam.className = "form-group has-error";
          errorHelp1.className = "alert alert-danger";
        }
        else {
          errorOtherTeam.className = "form-group";
          errorHelp1.className = "alert alert-danger hidden";
        }

        if (typeof optHomeVisit === "undefined") {
          errorHomeVisit.className = "form-group has-error";
          errorHelp2.className = "alert alert-danger";
        }
        else {
          errorHomeVisit.className = "form-group";
          errorHelp2.className = "alert alert-danger hidden";
        }
      }
      else {
        errorOtherTeam.className = "form-group";
        errorHelp1.className = "alert alert-danger hidden";
        errorHomeVisit.className = "form-group";
        errorHelp2.className = "alert alert-danger hidden";

        if (optHomeVisit.value == "home") {
          txtTeamHome = otherTeam.value;
          txtTeamVisit = "San Francisco";
        }
        else if (optHomeVisit.value == "visit" ) {
          txtTeamVisit = otherTeam.value;
          txtTeamHome = "San Francisco";
        }

        Meteor.call('addMatch', txtTeamHome, txtTeamVisit);

        var flagAM = ActualMatch.findOne({idMV:0})

        if (flagAM === undefined) {
          Meteor.call('addActualMatch');
        }
        else {
          Meteor.call('modActualMatch', flagAM['_id'], 1, "Arriba", 0, false);
        }
        
      }
    }
  });

  Template.registerHelper('per', function (inActual) {
    var p = $(this)[0].inActual * 100 / 9;

    if (p > 100 ) {
      return 100;
    }
    else{
      return p;
    }
  });

  Template.registerHelper('formatDate', function(date) {
    return date.toLocaleDateString();
  });
  
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}