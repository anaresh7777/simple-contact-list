/*
/!**
 * Created by Naresh Goud on 4/2/2017.
 *!/

var app = angular.module('myApp', ['ngRoute']).
    config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/page1', {templateUrl: 'partials/home.html'});
    $routeProvider.when('/signup', {templateUrl: 'partials/signup.html'});
    $routeProvider.otherwise({redirectTo: '/index'});
}]);*/

var app = angular.module('myApp', ['ngRoute', 'ngCookies']);

app.config(function($routeProvider) {
    $routeProvider
        .when('/home', {
            templateUrl: 'partials/home.html'
        })
        .when('/login', {
            templateUrl: 'partials/login.html',
            controller: 'LoginController'
        })
        .when('/profile', {
            templateUrl: 'partials/profile.html',
            controller: 'ProfileController',
            resolve: {
                logincheck: checklogin
            }
        })
        .when('/signup', {
            templateUrl: 'partials/signup.html',
            controller: 'SignupController'
        })
        .when('/contacts', {
            templateUrl: 'partials/list.html',
            controller: 'ListController'
        })
        .when('/contacts/create', {
            templateUrl: 'partials/add.html',
            controller: 'AddController'
        })
        .when('/contacts/:id/edit', {
            templateUrl: 'partials/edit.html',
            controller: 'EditController'
        })
        .when('/contacts/:id/show', {
            templateUrl: 'partials/show.html',
            controller: 'ShowController'
        })
        .otherwise({
            redirectTo: '/home'
        })
});

app.controller('LoginController', function($rootScope, $scope, $http, $cookies, $location) {
    $scope.login = function(user) {
        console.log(user);
        $http.post('/login', user).success(function(res) {
            console.log(res);
            $rootScope.currentUser = res;
            $location.url('/contacts');         // Change the CONTACTS to PROFILE to see the CurrentUser name
        });
    };
});

app.controller('LogoutController', function ($rootScope, $scope, $http, $location) {
            $scope.logout = function() {
            $http.post('/logout').success(function() {
                $rootScope.currentUser = null;
                $location.url('/home');
            });
        };
});


app.controller('SignupController', function($scope, $http, $rootScope, $location) {

    $scope.register = function(user) {
        //console.log(user);
        if (user.password == user.password2)
        {
            $http.post('/signup', user).success(function(user) {
                $rootScope.currentUser = user;
                //console.log(user);
                //$location.url('/contacts');
                console.log("Successfully registered");
            });
        }
    };
});

var checklogin = function ($q, $timeout, $http, $location, $rootScope) {
    var deferred = $q.defer();
    $http.get('/loggedin').success(function (user) {
        $rootScope.errorMessage = null;
        //User is Authenticated
        if (user !== '0') {
            $rootScope.currentUser = user;
            deferred.resolve();
        }
        //User is not Authenticated
        else {
            $rootScope.errorMessage = 'You need to log in';
            deferred.reject();
            $location.url('/home');
        }
    });
    return deferred.promise;
};

app.controller('ProfileController', function ($scope, $http) {
    $http.get("/rest/user").success(function(users) {
       $scope.users = users;
    });
});

app.controller('ListController', function($scope, $route, $routeParams, $http) {
    $scope.getContact = function () {
        $http.get('/employees/').then(function (res) {
            $scope.contacts = res.data;
            /*$scope.contact = "";*/
        });
    };

    $scope.deleteContact = function(id){
        var id = id;
        $http.delete('/employees/'+ id).then(function(response){
            $route.reload();
        });
    };

    $scope.updateContact = function () {
        var id = $routeParams.id;
        $http.put('/employees/'+ id, $scope.contact).then(function (response) {
            // $scope.contact = response.data;
            window.location.href = '#/contacts';
        });
    };
});
app.controller('ShowController', function($scope, $route, $routeParams, $http) {
    $scope.showContact = function () {
        var id = $routeParams.id;
        $http.get('/employees/'+ id).then(function (response) {
            $scope.contact = response.data;
        });
    };
});
app.controller('AddController', function($scope, $route, $routeParams, $location, $http) {
    $scope.addContact = function () {
        //var id = $routeParams.id;
        $http.post('/employees/', $scope.contact).then(function (response) {
            //$scope.employee = response.data;
            window.location.href = '#/contacts';
            //$location.url('/list');
        });
    };
});
/*
app.controller('EditController', function($scope, $route, $routeParams, $http) {
    $scope.updateContact = function () {
        var id = $routeParams.id;
        $http.put('/employees/' + id, $scope.contact).then(function (response) {
           // $scope.contact = response.data;
            window.location.href = '#/contacts';
        });
    };
});
*/

