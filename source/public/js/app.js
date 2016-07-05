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

  .controller('sideNavigationController', function($scope){

  })

  .controller('loginController', function($scope, $mdDialog, FirebaseUrl, $location) {

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
        $scope.current_user.username = user.email;
        } else {
        // No user is signed in.
        $scope.current_user.avatar = "https://pingendo.github.io/pingendo-bootstrap/assets/user_placeholder.png";
        $scope.current_user.username = null;
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

function profileController($scope){

};
