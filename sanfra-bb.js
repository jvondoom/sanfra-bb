if (Meteor.isClient) {
  // This code only runs on the client
  Template.body.helpers({
    fielders: [
      { name: "Jardinero Izq.",
        clase: "lef col-md-1 col-md-offset-2" 
      }, 
      { name: "Jardinero CenI",
        clase: "clf col-md-1 col-md-offset-1"
      }, 
      { name: "Jardinero CenD",
        clase: "crf col-md-1 col-md-offset-2"
      }, 
      { name: "Jardinero Der.",
        clase: "rif col-md-1 col-md-offset-1"
      }
    ], 

    toppers: [
      { name: "Shortstop",
        clase: "shs col-md-1 col-md-offset-5"
      },
      { name: "2nda Base",
        clase: "ba2 col-md-1"
      }
    ],

    bottomers: [
      { name: "3era Base",
        clase: "ba3 col-md-1 col-md-offset-4"
      }, 
      { name: "Pitcher",
        clase: "pit col-md-1"
      },
      { name: "1era Base",
        clase: "ba1 col-md-1"
      }
    ],
      
    catcher: [ 
      { name: "Catcher",
        clase: "cat col-md-1 col-md-offset-5"
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