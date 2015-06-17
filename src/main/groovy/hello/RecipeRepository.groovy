// RecipeRepository.groovy
package hello

import com.mongodb.*

class MongoService {
	private static MongoClient mongoClient
	private static host = "localhost"
	private static port = 27017
	private static databaseName = "recipe-db"

	public static MongoClient client() {
		if(mongoClient == null) {
			return new MongoClient(host, port)
		} else {
			return mongoClient
		}
	}

	public DBCollection collection(collectionName) {
		DB db = client().getDB(databaseName)
		return db.getCollection(collectionName)
	}
}