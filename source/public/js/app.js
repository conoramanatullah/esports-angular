(function(){
  //Initialize Our App module, remember everything is a module!
  var esports = angular.module('esports',['ngRoute','ngMaterial','firebase']);
  //  *******************Configure Routes*********************
  esports.config(function($routeProvider, $locationProvider, $mdThemingProvider){

    $routeProvider                            //Call the injected routeProvider

      .when('/', {                            //Provides a route for the / url
        templateUrl : 'templates/home.html',  //Set Url for the template
        controller  : 'mainController'        //Assign a controller to the template
      })
      .when('/marketplace', {
        templateUrl : 'templates/marketplace.html'
        // Needs Controller
      })
      .when('/events', {
        templateUrl : 'templates/events.html'
        // Needs Controller
      })
      .when('/players', {
        templateUrl : 'templates/players.html',
        controller  : playersController
      })
      .when('/register', {
        templateUrl : 'templates/register.html',
        controller: registerController
      })
      .when('/profile', {
        templateUrl : 'templates/profile.html',
        controller  : profileController
      })
      .when('/official-teams', {
        templateUrl : 'templates/official-teams.html',
        controller  : officialTeamsController
      })
      .when('/my-teams', {
        templateUrl : 'templates/my-teams.html',
        controller  : myTeamController
      })
      .when('/teams', {
        templateUrl : 'templates/teams.html',
        controller  : teamController
      })
      .when('/create-team', {
        templateUrl : 'templates/create-team.html',
        controller  : createTeamController
      })
      .when('/report-bug', {
        templateUrl : 'templates/report.html',
        controller  : reportBugController
      })

    // location provider makes our URLs pretty
    $locationProvider.html5Mode(true);
  })
  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default').accentPalette('blue');
  })
  //  *******************Controllers!*********************
  .controller('mainController', function($scope, $rootScope, $mdSidenav, $log, $timeout, $mdMedia, $window) {
    $scope.BUILD_NUMBER = "0.8.8";
    $scope.$mdMedia = $mdMedia;
    $scope.loaded = false;
    $scope.$on('$viewContentLoaded', function(){
      $timeout(function(){
        $scope.loaded = true;
      },1000);

    });
    $scope.toggleRight = function () {
      $mdSidenav('right').toggle();
    };

    $scope.redirect = function(location){
      $window.location.href = location;
    }

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $scope.isUser = true;
        $scope.showRequest = 1;
        var uid = user.uid;
        $scope.notifications = {};
        firebase.database().ref('users/' + uid + '/notifications').on('value', function(data){
          $scope.notifications = data.val();
        });
        $scope.deny = function(requestData){

        };
        $scope.approve = function(requestData){
          var game = requestData.game.replace(/\s/g, '');
          var players = [];
          firebase.database().ref('users/' + uid + '/teams/' + game + '/players').once('value').then(function(data){
            if(data.val())
              {
                players = data.val();
                players.push(requestData.username);
                console.log(players);
                firebase.database().ref('users/' + uid + '/teams/' + game).update({
                  players : players
                });
                firebase.database().ref('teams/' + game + '/' + uid).update({
                  players : players
                });

              }
            else{
              // players.push(requestData.username);
              players.push(requestData.username);
              console.log(players);
              firebase.database().ref('users/' + uid + '/teams/' + game).update({
                players : players
              });
              firebase.database().ref('teams/' + game + '/' + uid).update({
                players : players
              });

            }
          });

          console.log(requestData.game);
          // Remove Notification
          firebase.database().ref('users/' + uid + '/notifications/requests/' + "{{requestData.game}}" + requestData.uid).remove();
        };
      } else {

      }
    });
    // var uid = firebase.auth().currentUser.uid;


    // Pull user notifications

  })
  .controller('RightCtrl' , function ($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function () {
      $mdSidenav('right').toggle();
    }
  })
  .controller('LeftCtrl' , function($scope, $timeout, $mdSidenav, $log, $mdMedia){
    $scope.close = function () {
      $mdSidenav('left').toggle();
    }
  })
  .controller('TwitchCtrl', function($scope, $timeout,$mdMedia){

  })

  .controller('menuController', function($scope, $location){
    $scope.redirect = function (location) {
      $location.path(location);
    };
  })

  .controller('loginController', function($scope, $mdDialog, FirebaseUrl, $location, $window, $mdSidenav) {

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $scope.isUser = true;
      } else {
        $scope.isUser = false;
      }
    });

    $scope.showModal = function(ev) {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'templates/modal-login.html',
        targetEvent: ev,
        clickOutsideToClose: true
      })
    }
    $scope.logout = function(){
      firebase.auth().signOut().then(function() {
        $location.path('/');

      }, function(error) {
        console.log(error);
      });
    };

    $scope.closeSideNav = function(){
      $mdSidenav('left').toggle();
    };

    $scope.redirect = function(){
      $location.path('/profile');
    };

  })
  .controller('userController', function($scope, Auth, $mdSidenav) {
    $scope.closeSideNav = function(){
      $mdSidenav('left').toggle();
    };
    $scope.current_user = {};
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        if(user.photoURL === null){
          $scope.current_user.avatar = "https://pingendo.github.io/pingendo-bootstrap/assets/user_placeholder.png";
        }else{
          $scope.current_user.avatar = user.photoURL;
        }
        $scope.current_user.displayName = user.displayName;
        } else {
        $scope.current_user.avatar = "https://pingendo.github.io/pingendo-bootstrap/assets/user_placeholder.png";
        $scope.current_user.displayName = null;
        }
      });
  })
  .controller('gameRegisterController', function($scope, $mdDialog){

    $scope.showModal = function(ev){
      if(ev === "league"){
        $mdDialog.show({
          controller: LeagueController,
          templateUrl: 'templates/modal-league.html',
          clickOutsideToClose: true
        });
      }
      else if(ev === "dota"){
        $mdDialog.show({
          controller: DotaController,
          templateUrl: 'templates/modal-dota.html',
          clickOutsideToClose: true
        });
      }
      else if(ev === "csgo"){
        $mdDialog.show({
          controller: CSGOController,
          templateUrl: 'templates/modal-csgo.html',
          clickOutsideToClose: true
        });
      }
      else if(ev === "overwatch"){
        $mdDialog.show({
          controller: OverwatchController,
          templateUrl: 'templates/modal-overwatch.html',
          clickOutsideToClose: true
        });
      }
      else{

      }
    };





  })
  .controller('myTeamCardController', function($scope,$mdDialog,$route){
    var uid = firebase.auth().currentUser.uid;

    // SAVING TEAM
    $scope.saveTeam = function(data){
      alert = $mdDialog.alert({
        title: 'Save Team',
        textContent: 'Saving Team ' + data.name,
        ok: 'SAVE'
      });
      $mdDialog
        .show(alert)
        .finally(function() {
          alert = undefined;
          game = data.game.replace(/\s/g, '');
          firebase.database().ref('users/' + uid + '/teams/' + game).update({
            name : data.name,
            logoUrl : data.logoUrl,
            members : data.members,
            email : data.email
          });
          firebase.database().ref('teams/' + game + '/' + uid).update({
            name : data.name,
            logoUrl : data.logoUrl,
            members : data.members,
            email : data.email

          });
          $route.reload();
        });
    };

    // DELETING TEAM
    $scope.deleteTeam = function(data){
      alert = $mdDialog.alert({
        title: 'Delete Team',
        textContent: 'This team will be deleted.',
        ok: 'OK'
      });
      $mdDialog
        .show(alert)
        .finally(function() {
          // Destroy alert and do stuff
          alert = undefined;
          game = data.game.replace(/\s/g, '');
          firebase.database().ref('users/' + uid + '/teams/' + game).remove();
          firebase.database().ref('teams/' + game + '/' + uid).remove();
          console.log('deleted team');
          // $route.reload();
          $route.reload();
        });
    };




  })
//  *******************FACTORYS!*********************
  .factory('User', function($scope){
    var userData;
    firebase.database().ref('users/' + uid).on('value', function(data) {
      // Reading Data
      userData = data.val();
    });
    return userData;
  })

  .factory('Auth', function($firebaseAuth, FirebaseUrl){
    var current_user = firebase.auth().currentUser;
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        return user;
      } else {

      }
    });
    return current_user;
  })
  .constant('FirebaseUrl', 'https://esports-dev.firebaseio.com/');
})();

function DialogController($scope,$rootScope, $mdDialog ,$location) {
  $scope.showWelcome = true;
  var dialogCtrl = this;
  $scope.isError = false;
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      $scope.isError = false;
    } else {

    }
  });
  $scope.login = function(){

    var email = $scope.email;
    var password = $scope.password;
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error){
      $scope.isError = true;
      $scope.errorCode = error.code;
      var errorMessage = error.message;
      console.log(error.code);
    }).then(function(){
      // Show green thing
      $scope.showWelcome = true;
      $mdDialog.hide();
      $location.path("/");
    });
  };
};//END DIALOG controller

function registerController($scope, $location, $mdDialog) {
  //Provides email validation whatup
  $scope.colorado = ".*\@(colorado\.edu)";
  $scope.createUser = function(){

    //Create a new user account on firebase
    firebase.auth().createUserWithEmailAndPassword($scope.newuser.email, $scope.newuser.password).catch(function(error){
      var errorCode = error.code;
      var errorMessage = error.message;
    }).then(function(){
      // Login user and refresh page
      alert = $mdDialog.alert({
        title: 'Welcome!',
        textContent: 'You are officially registered! Please fill out the user profile and register your game profiles!',
        ok: 'OK'
      });
      $mdDialog.show(alert);
      $location.path('/profile');

    });



  };
};
function AvatarController($scope, $mdDialog, $window) {
  // When user clicks save and the input is not empty, update photoURL

  // Get user ref
  firebase.auth().onAuthStateChanged(function(user) {
    if(user){
      $scope.update = function(){
        user.updateProfile({
          photoURL: $scope.imageUrl
        }).then(function() {
          $mdDialog.hide();
          $window.location.reload();
        }, function(error){
          console.log(error);
        });
      };
      // End Update

    } else {
      // No User, REDIRECT
    }
  });
};
function profileController($scope, $mdDialog, $window){
  // When user clicks on picture, prompt comes up with URL input,
  // Once url is put in, user clicks save to set their profile picture

  // User watcher
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      if(!user.photoURL){
        $scope.userAvatar = "https://pingendo.github.io/pingendo-bootstrap/assets/user_placeholder.png";
      }else{

      }

      var uid = user.uid;

      $scope.options = [
        "Freshman",
        "Sophomore",
        "Junior",
        "Senior"
      ];
      $scope.genders = [
        "Male",
        "Female",
        "Other"
      ];


      if(user.photoURL == null){
        $scope.userAvatar = "https://pingendo.github.io/pingendo-bootstrap/assets/user_placeholder.png";

      }else{
        $scope.userAvatar = user.photoURL;
      }
      $scope.displayName = user.displayName;
      $scope.cu = false;
      $scope.notCu = false;

      var userData;

      firebase.database().ref('users/' + uid).on('value', function(data) {
        userData = data.val();
        $scope.first = userData.firstName;
        $scope.last = userData.lastName;
        $scope.cuTrue = userData.isCu;
        $scope.major = userData.major;
        $scope.year  = userData.year;
        $scope.university = userData.university;
        $scope.about = userData.about;
        $scope.gender = userData.gender;
        $scope.steamProfile = userData.steamProfile;
        $scope.summoner = userData.summoner;
        $scope.battleNet = userData.battleNet;

      },function(error){
        console.log(error);
      });

      $scope.updateAvatar = function(ev){
        $mdDialog.show({
          controller: AvatarController,
          templateUrl: 'templates/modal-avatar.html',
          clickOutsideToClose: true
        })
      };
      // Test
      $scope.save = function(){
        // Check for empty values wwith a giant if statement
        var userData = [
                      $scope.userAvatar,
                      $scope.displayName,
                      $scope.first,
                      $scope.last,
                      $scope.major,
                      $scope.year,
                      $scope.university,

                      $scope.gender,
                      $scope.steamProfile,
                      $scope.summoner,
                      $scope.battleNet,
                      $scope.about,
                    ]

        for(i = 0; i < userData.length; i++){
          if(userData[i] == undefined){
            userData[i] == " ";
          }else{
            // Leave it be if its not blank
          }
        }
        user.updateProfile({
          displayName: userData[1]
        }).then(function(){
          firebase.database().ref('users/' + uid ).update({
            photoURL      :   userData[0],
            username      :   userData[1],
            firstName     :   userData[2],
            lastName      :   userData[3],
            major         :   userData[4],
            year          :   userData[5],
            university    :   userData[6],
            gender        :   userData[7],
            steamProfile  :   userData[8],
            summoner      :   userData[9],
            battleNet     :   userData[10],
            about         :   userData[11]

          }, function(){
            // Success
          });

          $window.location.reload();
        });
      };

    } else {
      // REDIRECT
    }
  });

};




function playersController($scope, $timeout, $mdMedia, $mdDialog){
  $scope.$mdMedia = $mdMedia;
  firebase.database().ref('users/').orderByChild('username').on('value', function(data){
    $scope.players = data.val();
  });

  $timeout(function(){
    $scope.loaded = true;
  }, 1000);


  $scope.showPlayerInfo = function(user,ev){
    $mdDialog.show({
      controller: playerInfoController,
      templateUrl: 'templates/modal-player.html',
      clickOutsideToClose: true,
      targetEvent: ev,
      locals : {
                    user : user,
                }
    })
  };

};

function playerInfoController($scope, user){
  $scope.user = user;
  if(user.photoURL == null){
    $scope.user.photoURL = "https://pingendo.github.io/pingendo-bootstrap/assets/user_placeholder.png";
  }else{
    //Do nothing
  }
};



function LeagueController($scope, $mdDialog, $mdMedia){
  $scope.$mdMedia = $mdMedia;
  $scope.positions = [
    "Top",
    "Mid",
    "Bottom",
    "Jungle",
    "Support"
  ];
  $scope.ranks = [
    "Bronze",
    "Silver",
    "Gold",
    "Platinum",
    "Diamond",
    "Challenger"
  ];
  $scope.rankLevels = [
    "I",
    "II",
    "III",
    "IV",
    "V"
  ];


  var uid = firebase.auth().currentUser.uid;
  firebase.database().ref('users/' + uid + '/games/league').on('value', function(data){
    var userData = data.val();
    $scope.primaryPosition = userData.primary;
    $scope.secondaryPosition = userData.secondary;
    $scope.rank = userData.rank;
    $scope.rankLevel = userData.rankLevel;
    $scope.experience = userData.experience;
  });

  $scope.save = function(){
    // Get user info
    firebase.auth().onAuthStateChanged(function(user) {
      if(user){
        var uid = user.uid;
        // Pull data

        // add info to database
        firebase.database().ref('users/' + uid + '/games/league').set({
          isRegistered: 1,
          primary: $scope.primaryPosition,
          secondary: $scope.secondaryPosition,
          rank: $scope.rank,
          rankLevel: $scope.rankLevel,
          experience: $scope.experience,
          teamCapitain: true

        }, function(){
              // Close Modal
          $mdDialog.hide();
          // Success
        });
      }
      else{}
    });
  };
};

function DotaController($scope, $mdDialog, $mdMedia){
  $scope.$mdMedia = $mdMedia;
  $scope.positions = [
    "Top",
    "Mid",
    "Bottom",
    "Jungle",
    "Support"
  ];
  $scope.ranks = [
    "0-400",
    "400-800",
    "800-1200",
    "1200-1600",
    "1600-2000",
    "2000-2400",
    "2400-2800",
    "2800-3200",
    "3200-3600",
    "3600-4000",
    "4000-4400",
    "4400-4800",
    "4800-5200",
    "5200-5600",
    "5600-6000",
    "6000-6400",
    "6400-6800",
    "6800-7200",
    "7200+"
  ];
  var uid = firebase.auth().currentUser.uid;
  firebase.database().ref('users/' + uid + '/games/dota').on('value', function(data){
    var userData = data.val();
    $scope.primaryPosition = userData.primary;
    $scope.secondaryPosition = userData.secondary;
    $scope.rank = userData.rank;
    $scope.experience = userData.experience;
  });
  $scope.save = function(){
    // Get user info
    firebase.auth().onAuthStateChanged(function(user) {
      if(user){
        var uid = user.uid
        // add info to database
        firebase.database().ref('users/' + uid + '/games/dota').set({
          isRegistered: 1,
          primary: $scope.primaryPosition,
          secondary: $scope.secondaryPosition,
          rank: $scope.rank,
          experience: $scope.experience,
          teamCapitain: true

        }, function(){
              // Close Modal
          $mdDialog.hide();
          // Success
        });
      }
      else{}
    });
  };
};

function CSGOController($scope, $mdDialog, $mdMedia){
  $scope.$mdMedia = $mdMedia;
  $scope.positions = [
    "AWPer",
    "Rifler",
    "Entry",
    "Lurker"
  ];
  $scope.ranks = [
    "Silver I",
    "Silver II",
    "Silver III",
    "Silver IV",
    "Silver Elite",
    "Silver Elite Master",
    "Gold Nova I",
    "Gold Nova II",
    "Gold Nova III",
    "Gold Nova Master",
    "Master Guardian I",
    "Master Guardian II",
    "Master Guardian Elite",
    "Distinguished Master Guardian",
    "Legendary Eagle",
    "Legendary Eagle Master",
    "Supreme Master First Class",
    "The Global Elite"
  ];
  var uid = firebase.auth().currentUser.uid;
  firebase.database().ref('users/' + uid + '/games/csgo').on('value', function(data){
    var userData = data.val();
    $scope.primaryPosition = userData.primary;
    $scope.secondaryPosition = userData.secondary;
    $scope.rank = userData.rank;
    $scope.experience = userData.experience;
  });
  $scope.save = function(){
    // Get user info
    firebase.auth().onAuthStateChanged(function(user) {
      if(user){
        var uid = user.uid
        // add info to database
        firebase.database().ref('users/' + uid + '/games/csgo').set({
          isRegistered: 1,
          primary: $scope.primaryPosition,
          secondary: $scope.secondaryPosition,
          rank: $scope.rank,
          experience: $scope.experience,
          teamCapitain: true

        }, function(){
              // Close Modal
          $mdDialog.hide();
          // Success
        });
      }
      else{}
    });
  };
};

function OverwatchController($scope, $mdDialog, $mdMedia){
  $scope.$mdMedia = $mdMedia;
  $scope.positions = [
    "Attack",
    "Defense",
    "Tank",
    "Support"
  ];
  $scope.ranks = [
    "0-9",
    "10-19",
    "20-29",
    "30-39",
    "40-49",
    "50-59",
    "60-69",
    "70-79",
    "80-89",
    "90-99",
    "100+"
  ];
  var uid = firebase.auth().currentUser.uid;
  firebase.database().ref('users/' + uid + '/games/overwatch').on('value', function(data){
    var userData = data.val();
    $scope.primaryPosition = userData.primary;
    $scope.secondaryPosition = userData.secondary;
    $scope.rank = userData.rank;
    $scope.experience = userData.experience;
  });
  $scope.save = function(){
    // Get user info
    firebase.auth().onAuthStateChanged(function(user) {
      if(user){
        var uid = user.uid
        // add info to database
        firebase.database().ref('users/' + uid + '/games/overwatch').set({
          isRegistered: 1,
          primary: $scope.primaryPosition,
          secondary: $scope.secondaryPosition,
          rank: $scope.rank,
          experience: $scope.experience,
          teamCapitain: true

        }, function(){
              // Close Modal
          $mdDialog.hide();
          // Success
        });
      }
      else{}
    });
  };
};



function teamController($scope){
  // Pull from DB
  // $scope.csgoTeams = [];
  firebase.database().ref('teams' + '/CounterStrikeGlobalOffensive').on('value',function(snapshot){
    $scope.csgoTeams = snapshot.val();
  },function(error){
    console.log(error);
  });
  firebase.database().ref('teams' + '/Dota2').on('value',function(snapshot){
    $scope.dotaTeams = snapshot.val();
  });
  firebase.database().ref('teams' + '/LeagueofLegends').on('value',function(snapshot){
    $scope.leagueTeams = snapshot.val();
  });
  firebase.database().ref('teams' + '/Overwatch').on('value',function(snapshot){
    $scope.overwatchTeams = snapshot.val();
  });
  $scope.buttonText = "Request to Join Team";
  $scope.request = function(team){
    // Send notification to team capitain to approve or deny
    // Get current UID and display name
    var displayName = firebase.auth().currentUser.displayName;
    var uid = firebase.auth().currentUser.uid;
    var game = team.game.replace(/\s/g, '');
    var request = {};

    firebase.database().ref('users/' + team.captain + '/notifications/requests/' + game + '/' + uid).on('value',function(data){
      request = data.val();
      if(0){
        // LMAO this isnt supposed to work yet...
        console.log("request already pending");
        $scope.buttonText = "Request Pending";
      }else{
        firebase.database().ref('users/' + team.captain + '/notifications/requests/' + team.game + '/' + uid).set({
          username  :  displayName,
          uid       :  uid,
          requested :  true,
          pending   :  true,
          game      :  team.game
        });
      }

    });


  };


};

function teamLogoController($scope,$mdDialog){
  // Check for user then update database on both global and user levels
  firebase.auth().onAuthStateChanged(function(user) {
    if(user){
      var uid = user.uid;
      $scope.update = function(){
        firebase.database().ref('users/' + uid + '/teams/temp').set({
          teamLogo  :  $scope.imageUrl
        }, function(){
          $mdDialog.hide();
        });
      };
    } else {
      $mdDialog.hide();
    }
  });
};

function createTeamController($scope, $mdDialog, $location){
  firebase.database().ref('users').on('value',function(data){
    $scope.users = data.val();
  });
  $scope.loaded = true;

  $scope.team = {};
  $scope.gameList = [
    "League of Legends",
    "Dota 2",
    "Counter Strike Global Offensive",
    "Overwatch"
  ];
  $scope.tiers = [
    "Tier 1",
    "Tier 2",
    "Tier 3"
  ];
  $scope.team.logoUrl = "http://placehold.it/150x150";
  // $scope.users = [];
// SEARCH STUFF
  // Pull list of all users and put into an array





  $scope.createTeam = function(){
    firebase.auth().onAuthStateChanged(function(user){
      if(user){
        $scope.team.captain = user.uid;
        var uid = user.uid;
        var game = $scope.team.game;
        game = game.replace(/\s/g, '');
        firebase.database().ref('users/' + uid + '/teams/' + game).set($scope.team);
        firebase.database().ref('teams/' + game + '/' + uid ).set($scope.team);
        console.log('Team Created!');
        // Now we redirect to teams homepage
        $location.path('/my-teams');
      }else{
        // There was an error
      }
    });
  };

  var redirect = function(location){
    $location.path(location);
  };
};

function myTeamController($scope, Auth, $window){
  $scope.teams = [];
  var uid = firebase.auth().currentUser.uid;

  firebase.database().ref('users/' + uid + '/teams').on('value', function(data){
    teamData = data.val();
    if(teamData){
      if(teamData.CounterStrikeGlobalOffensive){
        $scope.teams.push(teamData.CounterStrikeGlobalOffensive);
      }else{

      }
      if(teamData.Overwatch){
        $scope.teams.push(teamData.Overwatch);
      }else{

      }

      if(teamData.Dota2){
        $scope.teams.push(teamData.Dota2);
      }else{

      }

      if(teamData.LeagueofLegends){
        $scope.teams.push(teamData.LeagueofLegends);
      }else{

      }
    }else {
      console.log('nothing to see here');
    }



  },function(error){
    console.log(error);
  });


};


function reportBugController($scope){
  $scope.success = 0;
  $scope.submit = function(bug){
    //check for blanks
    if(bug){
      if(bug.email && bug.data){
        var d = new Date();
        bug.time = d.getTime();
        firebase.database().ref('dev/bug_reports').push(bug);
        console.log('Success');
        $scope.success = 1;
      }
      else{
        // Here we would check which input is empty
        console.log('empty inputs');
      }

    }
    else{
      console.log('empty fields');
    }
  }

};
function officialTeamsController($scope){

};
