'use strict';

/* Cooking App */

var cookingApp = angular.module('cookingApp', [
  'ngRoute',

  'cookingControllers'
  // ,
  // 'cookingFilters',
]);

cookingApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/ingredientsView', {
        templateUrl: 'partials/ingredients-view.html',
        controller: 'IngredientsController'
      }).
      when('/main', {
        templateUrl: 'partials/main-view.html',
        controller: 'MainCtrl'
      }).
      when('/testView', {
        templateUrl: 'partials/test-view.html',
        controller: 'TestCtrl'
      }).
      otherwise({
        redirectTo: '/ingredientsView'
      });
  }]);