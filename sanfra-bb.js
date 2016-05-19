/* Instance of the collections in MongoDB
  - 'matches' is the collection where the matches info is saved
  - 'matchValues' is the temporal value collection for the actual match
*/
Matches = new Mongo.Collection("matches");
ActualMatch = new Mongo.Collection("matchValues");


// Methods that interact with the collections in the MongoDB
Meteor.methods({

  // Adds the unique document of 'matchValues' in case isn't created
  'addActualMatch': function (){
    ActualMatch.insert({
      idMV: 0,
      inActual: 1,
      upDown: "Arriba",
      outs: 0, 
      ended: false,
      scoreActual: 0,
      isVideo: false,
      videoLink: ""
    });
  },

  // Updates the values of 'matchValues' with the current info of each inning
  'modActualMatch': function (idAM, inA, upD, ots, sA, ends){
    ActualMatch.update(
      { _id: idAM }, 
      {$set: {
        inActual: inA,
        upDown: upD,
        outs: ots, 
        ended: ends, 
        scoreActual: sA
      }
    });
  },

  /* Updates the 'outs' value from 'matchValues'
    - Used by the submit & new-half of matchSettings Template
  */
  'modOuts': function (idAM, ots){
    ActualMatch.update(
      { _id: idAM }, 
      {$set: {
        outs: ots
      }
    });
  }, 

  /* Updates the video values from 'matchValues'
    - Used by the video-settings submit of matchSettings Template
  */
  'modVideo': function (idAM, ivd, lnk){
    ActualMatch.update(
      { _id: idAM }, 
      {$set: {
        isVideo: ivd,
        videoLink: lnk
      }
    });
  },

  /* Updates the runs from the actual inning and updates the Score
    - Used by the submit & new-half of matchSettings Template
  */
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

    ActualMatch.update(
      { _id: idAM }, 
      {$set: { 
        scoreActual: rn
      }
    });
  }, 

  /*Updates the values in matchValues and puts a 0 in the new inning
    - Used by new-half of matchSettings Template
    - ***PENDING*** Extra Inning information (10+)
  */
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
            "outs" : 0, 
            "scoreActual": 0 } }
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

  //Creates a new match with the information from newMatch Template
  'addMatch': function (tmH, tmV, pls) {
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
          { num: 1, score: 0},
          { num: 2, score: null},
          { num: 3, score: null},
          { num: 4, score: null},
          { num: 5, score: null},
          { num: 6, score: null},
          { num: 7, score: null},
          { num: 8, score: null},
          { num: 9, score: null}
      ],
      players: pls
    });
  },

  //Updates the values from matchSettings and matches to end the game
  'modEndMatch': function (){
    ActualMatch.update({
      _id:ActualMatch.findOne({"idMV" : 0})['_id']}, 
      {$set: { 
        "ended" : true,
        "isVideo": false
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

  //Calls to the instances in MongoDB
  Template.body.helpers({
    matches: function () {
      return Matches.find({}, {sort: {date: -1}});
    },

    actualMatch: function () {
      return ActualMatch.find({});
    }
  });

  /*
    - mForm1 = matchSettings Template
    - mForm2 = newMatch Template
    - mForm3 = ***PENDING*** Substitutes
  */
  Template.body.events({
    'click .navig-item': function (e) {
      $('li.active').attr('class', 'navig-item');
      e.currentTarget.className = "navig-item active";
    }, 

    'click #mForm1': function () {
      $('.mForm1').show();
      $('.mForm2').hide();
      $('.mForm3').hide();
    },

    'click #mForm2': function () {
      $('.mForm2').show();
      $('.mForm1').hide();
      $('.mForm3').hide();
    }, 

    'click #mForm3': function () {
      $('.mForm3').show();
      $('.mForm1').hide();
      $('.mForm2').hide();
    }
  });

  Template.body.onRendered(function () {
    $('.mForm1').hide();
    $('.mForm2').hide();
    $('.mForm3').hide();
  });

  Template.match.onRendered(function () {
    $('.match-info').hide();
  });

  // Hides and shows older matches info
  Template.match.events({
    'click .match-header': function (e) {
      $('.match-info').slideUp('normal');
      if ($(e.currentTarget).next().is(':hidden') === true) {
        $(e.currentTarget).next().slideDown('normal');
      }
      return false;
    }
  });

  // Sorts the match lineup by P/B
  Template.match.helpers({
    foo: function (players) {
      players.sort(function (a, b) {
      if (a.PB > b.PB) {
        return 1;
      }
      if (a.PB < b.PB) {
        return -1;
      }
      // a must be equal to b
      return 0;
    });
    }
  });

  // Here is where all the info of the form is saved to the collection
  Template.matchSettings.events({
    'submit .score-settings': function (e) {
      e.preventDefault();

      var txtRuns = $(e.currentTarget).find("input[name=runs]")[0];
      var txtOuts = $(e.currentTarget).find("input[name=outs]")[0];

      if (txtRuns.value == "") {
        return false;
      }

      if (txtOuts.value == "") {
        return false;
      }

      if (txtOuts.value !="" && txtRuns.value !="") {
        Meteor.call('modRuns', this._id, this.upDown, txtRuns.value, this.inActual);
        Meteor.call('modOuts', this._id, txtOuts.value);
      }
    }, 

    'click .new-half': function (e) {
      e.preventDefault();

      var txtRuns = $(e.delegateTarget).find("input[name=runs]")[0];
      var txtOuts = $(e.delegateTarget).find("input[name=outs]")[0];

      if (txtRuns.value == "") {
        return false;
      }

      if (txtOuts.value == "") {
        return false;
      }

      if (txtOuts.value !="" && txtRuns.value !="") {
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
      }
    },

    'click .end-game': function (e) {
      e.preventDefault();

      Meteor.call('modEndMatch');
    },

    'submit .video-settings': function (e) {
      e.preventDefault();
      var bolIsVideo = $(e.delegateTarget).find("input[type=checkbox]")[0].checked;
      var txtLink = $(e.delegateTarget).find("input[name=link]")[0];

      Meteor.call('modVideo', this._id, bolIsVideo, txtLink.value);
    }
  });

  // Call to the selectpicker plugin
  Template.newMatch.onRendered(function () {
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
      $('.selectpicker').selectpicker('mobile');
    }
    else {
      $('select').selectpicker();  
    }    

  });

  // Here is where all the info of the form is saved to the collection
  Template.newMatch.events({
    'submit .new-match': function (e) {
      e.preventDefault();

      var optHomeVisit = $(e.currentTarget).find("input[name=homeVisit]:checked")[0];
      var otherTeam = $(e.currentTarget).find("input[name=otherTeam]")[0];
      var txtPB = $(e.currentTarget).find("input[name=PB]");
      var txtPN = $(e.currentTarget).find("input[name=PN]");
      var txtPos = $(e.currentTarget).find("input[name=Pos]");
      var txtNum = $(e.currentTarget).find("input[name=Num]");
      var errorOtherTeam = $(e.currentTarget).find('#other-team')[0];
      var errorHelp1 =  $(e.currentTarget).find('#helpBlock1')[0];
      var errorHomeVisit = $(e.currentTarget).find('#home-visit')[0];
      var errorHelp2 =  $(e.currentTarget).find('#helpBlock2')[0];
      var errorHelp3 =  $(e.currentTarget).find('#helpBlock3')[0];
      var txtTeamHome = "";
      var txtTeamVisit = "";

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

      if (txtPB.length == 0) {
        errorHelp3.className = "alert alert-danger";
      }
      else {
        errorHelp3.className = "alert alert-danger hidden";
      }

      if (otherTeam.value != "" && typeof optHomeVisit !== "undefined" && txtPB.length != 0) {
        if (optHomeVisit.value == "home") {
          txtTeamHome = otherTeam.value;
          txtTeamVisit = "San Francisco";
        }
        else if (optHomeVisit.value == "visit" ) {
          txtTeamVisit = otherTeam.value;
          txtTeamHome = "San Francisco";
        }
        var strPL = '[';

        for (var i = 0; i < txtPB.length; i++) {
          strPL = strPL + '{';

          if (txtPB[i].value != "") {
            strPL = strPL + '"PB": '+txtPB[i].value+', ';
          }else {
            strPL = strPL + '"PB": "", ';
          }

          strPL = strPL + '"name": "'+txtPN[i].value+'", ';          

          if (txtPos[i].value != "") {
            strPL = strPL + '"pos": "'+txtPos[i].value+'"}';
          }else {
            strPL = strPL + '"pos": ""}';
          }

          if ((i + 1) < txtPB.length) {
            strPL = strPL + ',';
          }
        }

        strPL = strPL + ']';


        Meteor.call('addMatch', txtTeamHome, txtTeamVisit, JSON.parse(strPL));

        var flagAM = ActualMatch.findOne({idMV:0})

        if (flagAM === undefined) {
          Meteor.call('addActualMatch');
        }
        else {
          Meteor.call('modActualMatch', flagAM['_id'], 1, "Arriba", 0, 0, false);
        }
        
      }
    }, 

    'click .new-match .add-box': function (e) {
      e.preventDefault();

      var txtPB = $(e.delegateTarget).find("input[name=pb]")[0];
      var txtPlayerInfo = $(e.delegateTarget).find("#player-info")[0].selectedOptions[0];
      var txtPosInfo = $(e.delegateTarget).find("#pos-info")[0].selectedOptions[0];
      var errorHelp2 =  $(e.delegateTarget).find('#helpPl')[0];
      var errorHelp3 =  $(e.delegateTarget).find('#helpPos')[0];

      if (txtPlayerInfo.value == "Escoja el jugador") {
        errorHelp2.className = "alert alert-danger";
      } else {
        errorHelp2.className = "alert alert-danger hidden";
      }

      if (txtPosInfo.value == "Escoja la posición") {
        errorHelp3.className = "alert alert-danger";
      } else {
        errorHelp3.className = "alert alert-danger hidden";
      }

      if (txtPlayerInfo.value != "Escoja el jugador" && txtPosInfo.value != "Escoja la posición") {
        var box_html = $('<div class="row player-row"><div class="input-group col-md-2"><div class="input-group-addon">P/B</div><input name="PB" type="number" class="form-control" value="'+ txtPB.value +'" readonly></div> <div class="input-group col-md-5"><div class="input-group-addon">Nombre</div><input name="PN" type="text" class="form-control" value="'+ txtPlayerInfo.text +'" readonly></div> <div class="input-group col-md-2"><div class="input-group-addon">Pos.</div><input name="Pos" type="text" class="form-control" value="'+ txtPosInfo.value+'" readonly></div> <button type="button" class="btn btn-default remove-box"><span class="glyphicon glyphicon-remove"></span></button></div>');
        box_html.hide();
        $('.new-match .row:last').after(box_html);
        box_html.fadeIn('slow');

        txtPB.value = $(e.delegateTarget).find('.player-row').length;
        if (txtPB.value > 12) {
          txtPB.value = "";
        }
      }
      
      return false;
    }, 

    'click .remove-box': function (e) {
      e.preventDefault();

      
      $(e.currentTarget).parent().fadeOut("slow", function() {
        $(e.currentTarget).parent().remove();
      });

      return false;
    }
  });
  
  /* Players info Array
    - ***Pending*** Move this information to a collection in MongoDB
  */
  Template.newMatch.helpers({
    players: [
      {
        num: 1, 
        name: "Ramon Silva Pichardo"
      },
      {
        num: 6, 
        name: "Fernando Fco. Valverde Manzanares"
      },
      {
        num: 8, 
        name: "Felix Alfonso Noguera Telles"
      },
      {
        num: 10, 
        name: "Juan Carlos Ulloa Monge"
      },
      {
        num: 11, 
        name: "Marco Chacon Solis"
      },
      {
        num: 13, 
        name: "Christian Enrique Salas Bermudez"
      },
      {
        num: 14, 
        name: "William Cornelio Murillo Saborio"
      },
      {
        num: 16, 
        name: "Ricardo Adolfo Ramirez Schmidt"
      },
      {
        num: 19, 
        name: "Arturo Barboza Morales"
      },
      {
        num: 20, 
        name: "Roberto Javier Soto Massey"
      },
      {
        num: 21, 
        name: "Carlos Leo Montero Fernandez"
      },
      {
        num: 23, 
        name: "Victor Eduardo Calvo Aymerich"
      },
      {
        num: 24, 
        name: "Edwin Alfredo Salas Bermudez"
      },
      {
        num: 26, 
        name: "Rafael Zapata Monge"
      },
      {
        num: 27, 
        name: "Roberto Moreno Mata"
      },
      {
        num: 29, 
        name: "Roger Enrique Salazar Vega"
      },
      {
        num: 31, 
        name: "Alvaro Enrique Saborio Mora"
      },
      {
        num: 32,
        name: "Ignacio Toruño del Castillo"
      },
      {
        num: 34, 
        name: "Jimmy Rodriguez Ramirez"
      },
      {
        num: 44, 
        name: "Jean Carlo Saborio Mora"
      },
      {
        num: 47, 
        name: "Edmundo Garcia Sanchez"
      },
      {
        num: 54, 
        name: "Jorge Enrique Garro Zuñiga"
      },
      {
        num: 60, 
        name: "Marco Vinicio Chaves Leiva"
      },
      {
        num: 73, 
        name: "Carlos Gonzalez Velazquez"
      },
      {
        num: 74, 
        name: "Marco Antonio Valenciano Ruiz"
      },
      {
        num: 77, 
        name: "Eric Alberto Romero Armas"
      }
    ]
  });

  /* Converts a inning to percentage
    - Used in matchStats Template
  */
  Template.registerHelper('per', function (inActual) {
    var p = $(this)[0].inActual * 100 / 9;

    if (p > 100 ) {
      return 100;
    }
    else{
      return p;
    }
  });

  /* Formats the date
    - Used in match Template
  */
  Template.registerHelper('formatDate', function(date) {
    return date.toLocaleDateString();
  });

  /* Creates a id for the Modal based on the date 
    - Used in match Template
  */
  Template.registerHelper('idDate', function(date) {
    var strDate = date.toLocaleDateString();
    return (strDate.replace(/\//g, ''));
  });  
  
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  /* Changes the number position to its name
    - Used in match Template
  */
  Template.registerHelper('posToName', function(pos) {
    var strPos = "";

    switch (pos) {
      case "1": 
        strPos = "Lanzador";
        break;
      case "2": 
        strPos = "Receptor";
        break;
      case "3": 
        strPos = "Primera Base";
        break;
      case "4": 
        strPos = "Segunda Base";
        break;
      case "5": 
        strPos = "Tercera Base";
        break;
      case "6": 
        strPos = "Parador en corto";
        break;
      case "7": 
        strPos = "Jardinero Izquierdo";
        break;
      case "8": 
        strPos = "Jardinero Central Izquierdo";
        break;
      case "9": 
        strPos = "Jardinero Central Derecho";
        break;
      case "10": 
        strPos = "Jardinero Derecho";
        break;
      case "BE": 
        strPos = "Bateador Extra";
        break;
      case "BD": 
        strPos = "Bateador Designado";
        break;
      default: 
        strPos = "";
        break;
    }

    return strPos;
  });

  /* Displays the part of the inning that is been played. 
    - Used in matchStats Template
  */
  Template.registerHelper('topBottom', function(upDown) {
    if (upDown == "Arriba")
      return "Abriendo";
    else
      return "Cerrando";
  });

  Template.board.onRendered(function () {
    $('.map1').hide();
    $('.map2').hide();
  })

  Template.board.events({
    'click .show-hide1': function (e) {
      e.preventDefault();
      $('.map1').show();

      var myCenter = new google.maps.LatLng(9.934146, -84.107030);

      var mapProp = {
        center: myCenter,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      var map = new google.maps.Map(document.getElementById("map-sabana"),
      mapProp);
      var marker = new google.maps.Marker({
        position: myCenter,
      });
      marker.setMap(map);

      $('.show-hide1').hide();
    },
    'click .show-hide2': function (e) {
      e.preventDefault();
      $('.map2').show();

      var myCenter = new google.maps.LatLng(9.922781,-84.077378);

      var mapProp = {
        center: myCenter,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      var map = new google.maps.Map(document.getElementById("map-estadio"),
      mapProp);
      var marker = new google.maps.Marker({
        position: myCenter,
      });
      marker.setMap(map);

      $('.show-hide2').hide();
    },
  });
}