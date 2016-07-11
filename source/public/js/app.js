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
      .when('/register', {
        templateUrl : 'templates/register.html',
        controller: registerController
      })
      .when('/profile', {
        templateUrl : 'templates/profile.html',
        controller  : profileController
      })
      .when('/teams', {
        templateUrl : 'templates/teams.html',

      })
      .when('/create-team', {
        templateUrl : 'templates/create-team.html'
      })

    // location provider makes our URLs pretty
    $locationProvider.html5Mode(true);
  })

  //  *******************Controllers!*********************
  .controller('mainController', function($scope, $rootScope, $mdSidenav, $log, $timeout) {
    $scope.toggleRight = function () {
      $mdSidenav('right').toggle();
    };

  })
  .controller('RightCtrl' , function ($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function () {
      $mdSidenav('right').toggle();
    }
  })
  .controller('LeftCtrl' , function($scope, $timeout, $mdSidenav, $log, $mdMedia){
    $scope.screenIsLarge = $mdMedia('lg');
    $scope.screenIsMedium = $mdMedia('md');
    $scope.screenIsSmall = $mdMedia('sm');

    $scope.close = function () {
      $mdSidenav('left').toggle();
    }
  })
  .controller('TwitchCtrl', function($scope, $timeout){
    var options = {
        width: 480,
        height: 360,
        channel: "dansgaming",
        //video: "{VIDEO_ID}"
    };
    $timeout(function(){
      var player = new Twitch.Player("twitch-stream", options);
      player.setVolume(0.5);
    },1000);
  })

  .controller('menuController', function($scope, $location){
    $scope.redirect = function (location) {
      $location.path(location);
    };
  })

  .controller('loginController', function($scope, $mdDialog, FirebaseUrl, $location, $window) {

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
        console.log("Signed out.");

      }, function(error) {
        console.log(error);
      });
    }
  })
  .controller('userController', function($scope, Auth) {
    // var currUser = {};
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
        // No user is signed in.
        $scope.current_user.avatar = "https://pingendo.github.io/pingendo-bootstrap/assets/user_placeholder.png";
        $scope.current_user.displayName = null;
        }
      });
  })
//  *******************FACTORYS!*********************
  .factory('User', function($scope){

    // Pull User data from firebase?
    var user = {
      avatar: "img/user.jpg"
    }
    return user;
  })

  .factory('Auth', function($firebaseAuth, FirebaseUrl){
    var current_user = firebase.auth().currentUser;
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log("Current User: " + current_user.email + "\nUID: " + current_user.uid);
        return user;
      } else {

      }
    });
    return current_user;
  })
  .constant('FirebaseUrl', 'https://esports-dev.firebaseio.com/');
})();

function DialogController($scope,$rootScope, $mdDialog ,$location) {
  var dialogCtrl = this;
  $scope.isError = false;
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log("Current User: " + user.email + "\nUID: " + user.uid);
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
      $mdDialog.hide();
      $location.path("/");
    });
  };
};//END DIALOG controller

function registerController($scope, $location) {
  //Provides email validation whatup
  $scope.colorado = "^[a-z]*\.[a-z]*\@(colorado\.edu)";
  $scope.createUser = function(){
    console.log($scope.newuser);
    //Create a new user account on firebase
    firebase.auth().createUserWithEmailAndPassword($scope.newuser.email, $scope.newuser.password).catch(function(error){
      var errorCode = error.code;
      var errorMessage = error.message;
    }).then(function(){
      // Login user and refresh page
      $location.path('/profile');

    });

    console.log("Success in creating user.")

    //Get that created user's uid
    // Add data to database
    // firebase.database().ref('users/' + uid ).set({
    //   firstName    : $scope.newuser.firstName,
    //   lastName     : $scope.newuser.lastName,
    //   email        : $scope.newuser.email,
    //   year         : $scope.newuser.eduLevel,
    //   major        : $scope.newuser.eduMajor,
    //   password     : $scope.newuser.password,
    //   league       : $scope.newuser.lolBox,
    //   dota         : $scope.newuser.dotaBox,
    //   rocket       : $scope.newuser.rocketBox,
    //   comp         : $scope.newuser.userTypeComp,
    //   scrim        : $scope.newuser.userTypeScrim
    // })
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
          console.log('update success');
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
      var uid = user.uid;
      var userInfo = firebase.database().ref('users/' + uid);

      // User is signed in.
      $scope.userAvatar = user.photoURL;
      $scope.displayName = user.displayName;


      console.log(uid);
      $scope.updateAvatar = function(ev){
        $mdDialog.show({
          controller: AvatarController,
          templateUrl: 'templates/modal-avatar.html',
          clickOutsideToClose: true
        })
      };

      $scope.save = function(){
        user.updateProfile({
          // Update firebase profile elements
          displayName: $scope.displayName
        }).then(function(){
          // TODO Update database stuff
          console.log("updating database...")
          firebase.database().ref('users/' + uid ).set({
            username      :   $scope.displayName,
            firstName     :   $scope.user.first,
            lastName      :   $scope.user.last
          }, function(){
            console.log("Update successful!");
          });

          $window.location.reload();
        });
      };

    } else {
      // REDIRECT
    }
  });

};
