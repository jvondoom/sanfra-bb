if (Meteor.isClient) {
  // This code only runs on the client
  Template.body.helpers({
    fielders: [
      { name: "Jardinero Izq.",
        clase: "lf col-md-1 col-xs-1" 
      }, 
      { name: "Jardinero CenI",
        clase: "cf col-md-1 col-md-offset-2 col-xs-1 col-xs-offset-2"
      }, 
      { name: "Jardinero CenD",
        clase: "cf col-md-1 col-md-offset-4 col-xs-1 col-xs-offset-4"
      }, 
      { name: "Jardinero Der.",
        clase: "rf col-md-1 col-md-offset-2 col-xs-1 col-xs-offset-2"
      }
    ], 

    toppers: [
      { name: "Shortstop",
        clase: "ss col-md-1 col-md-offset-4 col-xs-1 col-xs-offset-4"
      },
      { name: "2nda Base",
        clase: "2b col-md-1 col-md-offset-2 col-xs-1 col-xs-offset-2"
      }
    ],

    bottomers: [
      { name: "3era Base",
        clase: "3b col-md-1 col-md-offset-2 col-xs-1 col-xs-offset-2"
      }, 
      { name: "Pitcher",
        clase: "pi col-md-1 col-md-offset-2 col-xs-1 col-xs-offset-2"
      },
      { name: "1era Base",
        clase: "1b col-md-1 col-md-offset-2 col-xs-1 col-xs-offset-2"
      }
    ],
      
    catcher: [ 
      { name: "Catcher",
        clase: "ca col-md-1 col-md-offset-6 col-xs-1 col-xs-offset-6"
      }
    ], 

    teams: [
      {name: "San Francisco"}, 
      {name: "Aguilas"}
    ], 

    numIn: 2, 
    upDown: "arriba", 
    outs: 2
  });
}