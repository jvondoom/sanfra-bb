if (Meteor.isClient) {
  // This code only runs on the client
  Template.body.helpers({
    matches: [
      { date: "13/2",
        teamHome: "San Francisco",
        teamVisit: "Aguilas",
        inActual: 2,
        upDown: "arriba",
        outs: 2,
        totalScoreHome: 2,
        totalScoreVisit: 2,
        scoreHome: [
          { num: 1,
            score: 0
          },
          { num: 2,
            score: 1
          },
          { num: 3,
            score: 1
          },
          { num: 4,
            score: ""
          },
          { num: 5,
            score: ""
          },
          { num: 6,
            score: ""
          },
          { num: 7,
            score: ""
          },
          { num: 8,
            score: ""
          },
          { num: 9,
            score: ""
          }
        ], 
        scoreVisit: [
          { num: 1,
            score: 2
          },
          { num: 2, 
            score: 0
          },
          { num: 3, 
            score: ""
          },
          { num: 4,
            score: ""
          },
          { num: 5,
            score: ""
          },
          { num: 6,
            score: ""
          },
          { num: 7,
            score: ""
          },
          { num: 8,
            score: ""
          },
          { num: 9,
            score: ""
          }
        ]
      }, 
      { date: "6/2",
        teamHome: "San Francisco",
        teamVisit: "Veteranos",
        inActual: 2,
        upDown: "arriba",
        outs: 2,
        totalScoreHome: 8,
        totalScoreVisit: 13,
        scoreHome: [
          { num: 1,
            score: 0
          },
          { num: 2,
            score: 1
          },
          { num: 3,
            score: 1
          },
          { num: 4,
            score: 1
          },
          { num: 5,
            score: 1
          },
          { num: 6,
            score: 1
          },
          { num: 7,
            score: 1
          },
          { num: 8,
            score: 1
          },
          { num: 9,
            score: 1
          }
        ], 
        scoreVisit: [
          { num: 1,
            score: 2
          },
          { num: 2, 
            score: 0
          },
          { num: 3, 
            score: 5
          },
          { num: 4,
            score: 1
          },
          { num: 5,
            score: 1
          },
          { num: 6,
            score: 1
          },
          { num: 7,
            score: 1
          },
          { num: 8,
            score: 1
          },
          { num: 9,
            score: 1
          }
        ]
      }
    ]
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
}