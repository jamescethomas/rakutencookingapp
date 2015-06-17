// RecipeApiParser.groovy
package hello

import groovyx.net.http.HTTPBuilder
import groovyx.net.http.ContentType
import groovyx.net.http.Method
import groovyx.net.http.RESTClient

import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

class RecipeApiParser {
	static def post(String baseUrl, String apiPath, query, method = Method.POST) {
		try {
			def returnResponse = null;
			def http = new HTTPBuilder(baseUrl)

			http.request(method, ContentType.JSON) {
				uri.path = apiPath
				uri.query = query
				headers.'User-Agent' = 'Mozilla/5.0 Ubuntu/14.04 Firefox/3.0.4'

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
	@RequestMapping("/recipeApiParserLaunch")
	String recipeApiParserLaunch() {
		return "success"
	}

	@RequestMapping("/recipeByIngredient")
	String recipeByIngredient() {
		// TODO 
		// post request
	}

	@RequestMapping("/testHttp")
	void testHttp() {
		println "TEST HTTP"
	}

	@RequestMapping("/testRecipe")
	String testRecipe() {
		println "TEST RECIPE"
		/*
		def url = "http://localhost:8080"
		def path = "/testHttp"

		def http = new HTTPBuilder(url)
		http.post(path: path) { resp, reader ->
			println "$resp"
			System.out << reader
		}
		*/

		def url  = "https://app.rakuten.co.jp/services/api"
		def path = "/Recipe/CategoryRanking/20121121"
		def query = [applicationId:"1097588232648126322", format:"json", formatVersion:2]

		def http = new HTTPBuilder(url);

		/*
		http.request(Method.POST, ContentType.JSON) {
			uri.path = path
			uri.query = query

			response.success = { resp ->
				println "SUCCESS!"
				println "$resp.status"
				println "{$resp}"
			}

			response.failure = { resp ->
				println "ERROR"
				println "{$resp.status}"
				println "{$resp}"
			}
		}
		*/

		http.get(path: path, contentType: ContentType.TEXT, query: query) { resp, reader ->
			println "${resp}"
		}
	}
}