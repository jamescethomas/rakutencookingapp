// ingredientsController.js
'use strict'

var cookingControllers = angular.module('cookingControllers', []);

cookingControllers.controller('IngredientsController', ['$scope', 
	function($scope) {
		$scope.inputIngredient = '';
		$scope.ingredients = [];

		$("#ingredientInput").keydown(function(event) {
			var key = (event.keyCode ? event.keyCode : event.which);
			if (key == 13) {
				$scope.addIngredient();
				$scope.inputIngredient = '';
				$scope.$apply();
			}
		});
		
		$scope.addIngredient = function() {
			if ($scope.inputIngredient != '' && $scope.ingredients.indexOf($scope.inputIngredient) == -1) {
				$scope.ingredients.push($scope.inputIngredient);
			}

			if ($scope.ingredients.length > 0) {
				$("#submitButton").attr("disabled", false);
				$("#submitButton").removeClass("btn-disabled");
				$("#submitButton").addClass("btn-enabled");
			}
		}

		$scope.removeIngredient = function(ingredient) {
			var index = $scope.ingredients.indexOf(ingredient);
			if (index > -1) {
				$("[id='"+ ingredient +"']").addClass("fadeout");
				setTimeout(function() {
					$scope.ingredients.splice(index, 1);
					$scope.$apply();

					if ($scope.ingredients.length == 0) {
						$("#submitButton").attr("disabled", true);
						$("#submitButton").removeClass("btn-enabled");
						$("#submitButton").addClass("btn-disabled");
					}
				}, 500);
			}
		}
	}]);