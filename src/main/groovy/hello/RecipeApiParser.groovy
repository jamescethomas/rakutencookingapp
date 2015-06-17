// RecipeApiParser.groovy
package hello

import groovyx.net.http.HTTPBuilder
import groovyx.net.http.ContentType
import groovyx.net.http.Method
import groovyx.net.http.RESTClient

import org.springframework.web.bind.annotation.*

import groovy.json.*
import org.json.*
import net.sf.json.JSONObject

import com.mongodb.*
import com.mongodb.util.JSON

import com.google.gson.*

import java.util.concurrent.TimeUnit

class RecipeApiParser {
	static def post(String baseUrl, String apiPath, query, method = Method.POST) {
		try {
			def returnResponse = null;
			def http = new HTTPBuilder(baseUrl)

			http.request(method, ContentType.JSON) {
				uri.path = apiPath
				uri.query = query
				// headers.'User-Agent' = 'Mozilla/5.0 Ubuntu/14.04 Firefox/3.0.4'

				response.success = { resp, reader ->
					println "success! ${resp.status}"

					returnResponse = resp;
				}
			}

			return returnResponse;
		} catch (groovyx.net.http.HttpResponseException e) {
			e.printStackTrace()
		} catch (java.net.ConnectException e) {
			e.printStackTrace
		}
	}

	static def get(String baseUrl, String apiPath, query) {
		return post(baseUrl, apiPath, query, Method.GET)
	}
}

@RestController
class RecipeApiParserLaunch {
	MongoService mongoService = new MongoService()
	def recipeCollection = mongoService.collection('recipe')
	def ingredientsCursor = mongoService.collection('ingredient')

	@RequestMapping(value = "/getRecipeByIngredient", method = RequestMethod.POST, consumes = "application/json")
	public List<Recipe> getRecipeByIngredient(@RequestBody String ingredientsReq) {
		println "Getting Recipes by Ingredients"

		def jsonSlurper = new JsonSlurper()
		def ingredientsJson = jsonSlurper.parseText(ingredientsReq)

		List<String> ingredients = new ArrayList<String>()
		List<Recipe> recipes = new ArrayList<Recipe>()

		assert ingredientsJson instanceof Map

		println ingredientsJson
		ingredientsJson.ingredients.each() {
			ingredients.add(it)
		}

		println ingredients
		println ingredients.size()

		// def matchObject = new BasicDBObject("recipeMaterial", ingredients[0])
		def matchObject = new BasicDBObject("recipeMaterial", new BasicDBObject('$regex', ingredients[0])) // working
		println matchObject

		DBCursor cursor =  recipeCollection.find(matchObject)
		// DBCursor cursor =  collection.find(new BasicDBObject("recipeMaterial", ingredients))
		try {
			while(cursor.hasNext()) {
				def curr = cursor.next()
				boolean hasAllIngredients = true;
				// check remaining ingredents
				for(int i = 1; i < ingredients.size(); i++) {

					boolean hasIngredeint = false;
					for(int j = 0; j < curr.recipeMaterial.size(); j++) {
						def ingredent = curr.recipeMaterial[j]
						if (ingredent.contains(ingredients[i])) {
							hasIngredeint = true
							break
						}
					}

					if (hasIngredeint) {
						hasIngredeint = false
					} else {
						hasAllIngredients = false
						break
					}
				}

				if (hasAllIngredients) {
					def image = curr.smallImageUrl
					if (!image) {
						image = curr.mediumImageUrl
					}
					if (!image) {
						image = curr.foodImageUrl
					}
					Recipe recipe = new Recipe(
						curr.recipeId,
						curr.recipeTitle,
						curr.recipeUrl,
						// curr.foodImageUrl,
						image,
						curr.pickup,
						curr.shop,
						curr.nickname,
						curr.recipeDescription,
						curr.recipeMaterial,
						curr.recipeIndication,
						curr.recipeCost,
						curr.recipePublishday,
						curr.rank
						)

					recipes.add(recipe)
				}
			}
		} finally {
			cursor.close()
		}

		return recipes
	}

	@RequestMapping("/getAllRecipes")
	public List<Recipe> getAllRecipes() {
		println "Getting Recipes"

		List<Recipe> recipes = new ArrayList<Recipe>()

		DBCursor cursor =  recipeCollection.find();
		try {
			while(cursor.hasNext()) {
				def curr = cursor.next()

				Recipe recipe = new Recipe(
					curr.recipeId,
					curr.recipeTitle,
					curr.recipeUrl,
					curr.foodImageUrl,
					curr.pickup,
					curr.shop,
					curr.nickname,
					curr.recipeDescription,
					curr.recipeMaterial,
					curr.recipeIndication,
					curr.recipeCost,
					curr.recipePublishday,
					curr.rank
					)
				recipes.add(recipe)
			}
		} finally {
			cursor.close()
		}

		return recipes
	}

	@RequestMapping("/insertIngredientsIntoDatabase")
	String insertIngredientsIntoDatabase() {
		println "Inserting ingredients into database"

		List<Recipe> recipes = new ArrayList<Recipe>()

		ingredients.remove(new BasicDBObject())
		ingredients.save(new BasicDBObject("ingredients", new ArrayList<String>()))

		DBCursor cursor =  recipeCollection.find()

		try {
			while (cursor.hasNext()) {
				def recipeMaterial = cursor.next().recipeMaterial;
				recipeMaterial.each() {
					DBCursor ingredientsCursor = ingredientsCollection.find();
					try {
						while (ingredientsCursor.hasNext()) {
							def ingredientsObject = ingredientsCursor.next()
							if (!ingredientsObject.ingredients.contains(it)) {
								ingredients.update(new BasicDBObject(), new BasicDBObject('$push', new BasicDBObject("ingredients", it)))
								println "inserted ingredient"
							}
						}
					} finally {
						ingredientsCursor.close()
					}
				}
			}
		} finally {
			cursor.close()
		}
		return "success"
	}

	@RequestMapping("/insertRecipesIntoDatabase") 
	String insertRecipesIntoDatabase() {
		populateDatabaseFromCategoryApi("10");
		return 'DONE'

		println "Getting categoies"

		def format = "json"
		def applicationId = "1097588232648126322"

		def categoryUrl = "https://app.rakuten.co.jp/services/api/Recipe/CategoryList/20121121?format=" + format + 
			"&applicationId=" + applicationId

		def categoryJson = categoryUrl.toURL().getText(requestProperties: [Accept: 'application/json'])

		def jsonSlurper = new JsonSlurper()

		def categoryResponse = jsonSlurper.parseText(categoryJson);

		assert categoryResponse instanceof Map
		
		categoryResponse.result.large.each() {
			println it.categoryId + " " + it.categoryName
			populateDatabaseFromCategoryApi(it.categoryId)
			TimeUnit.SECONDS.sleep(1)
			println "- - - - - - - - - - - - - - - - - - - - - - - "
		}
		
		categoryResponse.result.medium.each() {
			println it.categoryId + " " + it.categoryName

			populateDatabaseFromCategoryApi(it.parentCategoryId + "-" + it.categoryId)
			TimeUnit.SECONDS.sleep(1)
			println "- - - - - - - - - - - - - - - - - - - - - - - "
		}

		categoryResponse.result.small.each() {
			println it.categoryId + " " + it.categoryName

			def categoryId = it.categoryUrl.replace("http://recipe.rakuten.co.jp/category/", "")
			categoryId = categoryId.replace("/", "") 

			println it.categoryUrl

			populateDatabaseFromCategoryApi(categoryId)
			TimeUnit.SECONDS.sleep(1)
			println "- - - - - - - - - - - - - - - - - - - - - - - "
		}
	}

	boolean populateDatabaseFromCategoryApi(categoryId) {

		// quick and dirty HTTP
		def format = "json"
		def applicationId = "1097588232648126322"

		def url = "https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20121121?format=" + format +
			"&categoryId=" + categoryId + 
			"&applicationId=" + applicationId

		def jsonText = url.toURL().getText(requestProperties: [Accept: 'application/json'])

		def jsonSlurper = new JsonSlurper()
		def response = jsonSlurper.parseText(jsonText)

		Recipe recipe
		assert response instanceof Map
		response.result.each() {
			recipe = new Recipe(
				it.recipeId,
				it.recipeTitle,
				it.recipeUrl,
				it.foodImageUrl,
				it.pickup,
				it.shop,
				it.nickname,
				it.recipeDescription,
				it.recipeMaterial,
				it.recipeIndication,
				it.recipeCost,
				it.recipePublishday,
				it.rank,
				)

			int resultsLength = recipeCollection.find(new BasicDBObject("recipeTitle", it.recipeTitle)).count()
			if (resultsLength == 0) {
				def recipeObject = jsonSlurper.parseText(recipe.toJSON());
				recipeCollection.save(new BasicDBObject(recipeObject))
				println "New document created"
			} else {
				println "duplicate found"
				println resultsLength
				println recipeCollection.find(new BasicDBObject("recipeTitle", it.recipeTitle))
			}
		}
	}
}
