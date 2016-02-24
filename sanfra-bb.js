Matches = new Mongo.Collection("matches");
ActualMatch = new Mongo.Collection("matchValues");


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
    }
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
    'change .score-settings': function (e) {
      e.preventDefault();

      var txtRuns = $(e.currentTarget).find("input[name=runs]")[0];
      var txtOuts = $(e.currentTarget).find("input[name=outs]")[0];
      
      var docID = Matches.findOne({"ended" : false});
      var strSH = "";

      if (this.upDown == "Arriba") {
        strSH = 'scoreVisit.' + (this.inActual - 1) + '.score';
      }
      else {
        strSH = 'scoreHome.' + (this.inActual - 1) + '.score';
      }

      Matches.update({ 
            _id:docID._id 
          }, 
          { $set: JSON.parse('{"'+strSH+'" : '+txtRuns.value+'}') }
      );

      ActualMatch.update(
        { _id: this._id }, 
        { $set: { "outs" : parseInt( txtOuts.value ) } }
      );
    }, 

    'click .new-half': function (e) {
      e.preventDefault();

      if (this.upDown == "Arriba"){
        ActualMatch.update(
          { _id: this._id }, 
          { $set: { "upDown" : "Abajo" } }
        );
      }
      else{
        var nextIn = this.inActual + 1;

        ActualMatch.update(
          { _id: this._id }, 
          { $set: { "upDown" : "Arriba",
                   "inActual" : nextIn } }
        );
      }
    },

    'click .end-game': function (e) {
      e.preventDefault();

      Matches.update({_id:Matches.findOne({"ended" : false})['_id']}, 
                     {$set: { "ended" : true}});
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
          errorHelp1.className = "help-block";
        }
        else {
          errorOtherTeam.className = "form-group";
          errorHelp1.className = "help-block hidden";
        }

        if (typeof optHomeVisit === "undefined") {
          errorHomeVisit.className = "form-group has-error";
          errorHelp2.className = "help-block";
        }
        else {
          errorHomeVisit.className = "form-group";
          errorHelp2.className = "help-block hidden";
        }
      }
      else {
        errorOtherTeam.className = "form-group";
        errorHelp1.className = "help-block hidden";
        errorHomeVisit.className = "form-group";
        errorHelp2.className = "help-block hidden";

        if (optHomeVisit.value == "home") {
          txtTeamHome = otherTeam.value;
          txtTeamVisit = "San Francisco";
        }
        else if (optHomeVisit.value == "visit" ) {
          txtTeamVisit = otherTeam.value;
          txtTeamHome = "San Francisco";
        }

        Matches.insert({
          date: new Date(), 
          teamHome: txtTeamHome,
          teamVisit: txtTeamVisit,
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

        var flagAM = ActualMatch.findOne({idMV:0})

        if (flagAM === undefined) {
          ActualMatch.insert({
              inActual: 1,
              upDown: "Arriba",
              outs: 0});
        }
        else {
          ActualMatch.update({
            _id:flagAM['_id'] }, 
           {$set: {
              inActual: 1,
              upDown: "Arriba",
              outs: 0
            }
          });
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

}