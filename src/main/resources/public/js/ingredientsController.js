// ingredientsController.js
'use strict'

var cookingControllers = angular.module('cookingControllers', []);

cookingControllers.controller('IngredientsController', ['$scope', '$http', 'Global',
	function($scope, $http, Global) {
		$scope.inputIngredient = '';
		$scope.ingredients = [];

		$scope.currentPage = [];
		$scope.currentPageNumber = 0;
		$scope.numPerPage = 3;

		$scope.recipes = [];
		$scope.filteredRecipes = [];
		$scope.pages = [];
		$scope.numPages;

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

			var beforeSearch = false;
			if ($scope.recipes.length == 0) {
				beforeSearch = true;
			}
			$scope.submitIngredients(beforeSearch);
		}

		$scope.submitIngredients = function(before) {
			$scope.recipes = [];
			$scope.currentPageNumber = 0;
			$scope.currentPage = [];
			var _data = { "ingredients": $scope.ingredients };

			if ($scope.ingredients.length == 0){
				$("#noRecipesFound").hide();
				$("#welcomeMessage").show();
				$scope.pageRecipes();
				return;
			}

			$http({
				url: '/getRecipeByIngredient',
				method: 'POST',
				data: {ingredients : $scope.ingredients},
				headers: {'Content-Type': 'application/json'}
			}).success(function(response) {
				$scope.recipes = response;
				$scope.pageRecipes();
				if ($scope.recipes.length == 0){
					if (!before){
						$("#noRecipesFound").show();
					}
				} else {
					$("#noRecipesFound").hide();
					$("#welcomeMessage").hide();
				}

			}).error(function(response) {
				// console.log(response);
				// console.log("test2");
			});
		}

		$scope.pageRecipes = function() {
			var pageNumber = 0;
			var currPage = [];
			$scope.pages = [];
			$scope.currentPage = [];
			$scope.currentPageNumber = 0;
			for (var i = 0; i < $scope.recipes.length; i += $scope.numPerPage) {
				for(var j = i; j < i + $scope.numPerPage; j++) {
					if ($scope.recipes[j] !== undefined) {
						currPage.push($scope.recipes[j]);
					}
				}
				$scope.pages[pageNumber] = currPage;
				currPage = [];
				pageNumber++;
			}

			$scope.currentPage = $scope.pages[$scope.currentPageNumber];
			$scope.numPages = $scope.pages.length;


			if ($scope.numPages > 1) {
				$(".pagination").removeClass("fade");
			} else {
				$(".pagination").addClass("fade");
			}

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

				if (currRecipe !== undefined) {

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
							currRecipe.currentItem = response.Items[0];
							if (currRecipe.items.length == 1) {
								currRecipe.showArrows = false;
							} else {
								currRecipe.showArrows = true;
							}
						} else {
							currRecipe.hasItems = false;
						}

						// console.log(response);
						//
					}).error(function(response) {
						//
						// console.log(response);
					});
				}
			}
		}

		$scope.nextPage = function() {

			if ($scope.currentPageNumber < $scope.pages.length - 1) {
				$scope.currentPageNumber++;
			} else {
				$scope.currentPageNumber = 0;
			}


			$(".recipesContainer").animate({opacity: 0}, 500, function() {
				$scope.currentPage = [];
				$scope.$apply();
				$(".recipesContainer").css({opacity: 1});

				$scope.currentPage = $scope.pages[$scope.currentPageNumber];
				loadIchibaRecommendations();

			});
		}

		$scope.prevPage = function() {
			if ($scope.currentPageNumber > 0) {
				$scope.currentPageNumber--;
			} else {
				$scope.currentPageNumber = $scope.pages.length - 1;
			}

			$(".recipesContainer").animate({opacity: 0}, 500, function() {
				$scope.currentPage = [];
				$scope.$apply();
				$(".recipesContainer").css({opacity: 1});

				$(".recipesContainer").addClass("open");
				$scope.currentPage = $scope.pages[$scope.currentPageNumber];
				loadIchibaRecommendations();

			});
		}

		$scope.closeWarning = function() {
			$("#noRecipesFound").hide();
		}

		$scope.prevItem = function(recipe, index) {
			var currIndex = recipe.items.indexOf(recipe.currentItem);
			$("#osusume" + index).animate({ opacity: 0 }, 500, function() {
				if (currIndex == 0) {
					recipe.currentItem = recipe.items[recipe.items.length - 1];
				} else {
					recipe.currentItem = recipe.items[currIndex - 1];
				}
				$scope.$apply();
			});
			$("#osusume" + index).animate({ opacity: 1}, 500);
		}

		$scope.nextItem = function(recipe, index) {
			var currIndex = recipe.items.indexOf(recipe.currentItem);
			$("#osusume" + index).animate({ opacity: 0 }, 500, function() {
				if (currIndex == recipe.items.length - 1) {
					recipe.currentItem = recipe.items[0];
				} else {
					recipe.currentItem = recipe.items[currIndex + 1];
				}
				$scope.$apply();
			});
			$("#osusume" + index).animate({ opacity: 1}, 500);
		}

		$scope.safeApply = function(fn) {
			var phase = this.$root.$$phase;
			if(phase == '$apply' || phase == '$digest') {
				if(fn && (typeof(fn) === 'function')) {
					fn();
				}
			} else {
			this.$apply(fn);
		  	}
		}

		$scope.sortByTime = function() {
			$scope.recipes.sort(function(a, b) {
				var aTime = a.recipeIndication.substring(1, a.recipeIndication.length);
				var bTime = b.recipeIndication.substring(1, b.recipeIndication.length);

				var aNum = parseInt(aTime);
				var bNum = parseInt(bTime);

				if (aNum < bNum) {
					return 1;
				} else {
					return 0;
				}
			});	
			$scope.pageRecipes();
		}
	}]);