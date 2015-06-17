// ingredientsController.js
'use strict'

var cookingControllers = angular.module('cookingControllers', []);

cookingControllers.controller('IngredientsController', ['$scope', '$http', 'Global',
	function($scope, $http, Global) {
		$scope.inputIngredient = '';
		$scope.ingredients = [];

		$scope.currentPage = [];
		$scope.currentPageNumber = 1;
		$scope.numPerPage = 3;

		$scope.recipes = [];
		$scope.filteredRecipes = [];
		$scope.pages = [];
		$scope.numPages = 1;

		$("#ingredientInput").keydown(function(event) {
			var key = (event.keyCode ? event.keyCode : event.which);
			if (key == 13) {
				$scope.addIngredient();
				$scope.inputIngredient = '';
			}
		});
		
		$scope.addIngredient = function() {
			if ($scope.inputIngredient != '' && $scope.ingredients.indexOf($scope.inputIngredient) == -1) {
				$scope.ingredients.push($scope.inputIngredient);
			}

			if ($scope.ingredients.length > 0) {
				$("#ingredientInputContainer").removeClass("closed");

				$("#submitButton").attr("disabled", false);
				$("#submitButton").removeClass("btn-disabled");
				$("#submitButton").addClass("btn-enabled");
				$(".recipesContainer").addClass("open");
				$("#welcomeMessage").addClass("fadeout");
			}

			$scope.submitIngredients();
		}

		$scope.removeIngredient = function(ingredient) {
			var index = $scope.ingredients.indexOf(ingredient);
			if (index > -1) {
				$("[id='"+ ingredient +"']").addClass("fadeout");

				$scope.ingredients.splice(index, 1);

				if ($scope.ingredients.length == 0) {
					$("#ingredientInputContainer").addClass("closed");

					$("#submitButton").attr("disabled", true);
					$("#submitButton").removeClass("btn-enabled");
					$("#submitButton").addClass("btn-disabled");
					$(".recipesContainer").removeClass("open");
					$("#welcomeMessage").show();
					$("#welcomeMessage").removeClass("fadeout");
				}
			}

			console.log($scope.ingredients);

			var beforeSearch = false;
			if ($scope.recipes.length == 0) {
				beforeSearch = true;
			}
			$scope.submitIngredients(beforeSearch);
		}

		$scope.submitIngredients = function(before) {
			$scope.recipes = [];
			var _data = { "ingredients": $scope.ingredients };

			if ($scope.ingredients.length == 0){
				$("#noRecipesFound").hide();
				$("#welcomeMessage").show();
				$scope.pageRecipes();
				return;
			}

			console.log(_data);

			$http({
				url: '/getRecipeByIngredient',
				method: 'POST',
				data: {ingredients : $scope.ingredients},
				headers: {'Content-Type': 'application/json'}
			}).success(function(response) {
				$scope.recipes = response;
				$scope.pageRecipes();
				console.log("test1");
				if ($scope.recipes.length == 0){
					if (!before){
						$("#noRecipesFound").show();
					}
				} else {
					$("#noRecipesFound").hide();
					$("#welcomeMessage").hide();
				}

			}).error(function(response) {
				console.log(response);
				console.log("test2");
			});
		}

		$scope.pageRecipes = function() {
			var pageNumber = 0;
			var currPage = [];
			$scope.pages = [];
			$scope.currentPage = [];
			for (var i = 0; i < $scope.recipes.length; i += $scope.numPerPage) {
				for(var j = i; j < i + $scope.numPerPage; j++) {
					currPage.push($scope.recipes[j]);
				}
				$scope.pages[pageNumber] = currPage;
				currPage = [];
				pageNumber++;
			}

			$scope.currentPage = $scope.pages[$scope.currentPageNumber];
			$scope.numPages = $scope.pages.length;

			if ($scope.currentPage && $scope.currentPage.length > 0) {
				loadIchibaRecommendations();
			}
		}

		function loadIchibaRecommendations() {
			var currRecipe;
			// for(var i = 0; i < $scope.currentPage.length; i++) {
			for(var i = 0; i < $scope.currentPage.length; i++) {
				currRecipe = $scope.currentPage[i];

				var _keyword = '';

				for (var j = 0;j < currRecipe.recipeMaterial.length; j++){
					var recipeMaterial = currRecipe.recipeMaterial[j];
					var usedIngredient = false;

					for(var k = 0; k < $scope.ingredients.length; k++) {
						var ingredient = $scope.ingredients[k];
						if (recipeMaterial.indexOf(ingredient) > 0) {
							true;
							break;
						}
					}
					if (!usedIngredient) {
						_keyword = recipeMaterial;
						break;
					}
				}

				if (_keyword == '') {
					_keyword = currRecipe.recipeMaterials[0];
				}

				var _params = {
					format: 'json',
					keyword: _keyword,
					hits: 5,
					applicationId: Global.ApplicationID
				}

				$http({
					url: 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20140222',
					method: 'GET',
					params: _params
				}).success(function(response) {
					currRecipe.items = response.Items;
					if (currRecipe.items.length > 0) {
						currRecipe.hasItems = true;
					} else {
						currRecipe.hasItems = false;
					}

					console.log(response);
					//
				}).error(function(response) {
					//
					console.log(response);
				});
			}
		}

		$scope.nextPage = function() {
			if ($scope.currentPageNumber < $scope.pages.length - 1) {
				$scope.currentPageNumber++;
			}

			$scope.currentPage = $scope.pages[$scope.currentPageNumber];
			loadIchibaRecommendations();
		}

		$scope.prevPage = function() {
			if ($scope.currentPageNumber > 1) {
				$scope.currentPageNumber--;
			}

			$scope.currentPage = $scope.pages[$scope.currentPageNumber];
			loadIchibaRecommendations();
		}

		$scope.closeWarning = function() {
			$("#noRecipesFound").hide();
		}
	}]);