	// groovy Recipe object for mongodb
package hello
import org.springframework.data.annotation.Id
import groovy.json.*
import java.util.ArrayList

import com.google.gson.*

public class Recipe {
	@Id
	private String id

	public int recipeId
	public String recipeTitle
	public String recipeUrl
	public String foodImageUrl
	// private String mediumImageUrl
	// private String smallImageUrl
	public int pickup
	public int shop
	public String nickname
	public String recipeDescription
	public ArrayList recipeMaterial
	public String recipeIndication
	public String recipeCost
	public String recipePublishday
	public String rank

	public Recipe(
		int recipeId,
		String recipeTitle,
		String recipeUrl,
		String foodImageUrl,
		int pickup,
		int shop,
		String nickname,
		String recipeDescription,
		ArrayList recipeMaterial,
		String recipeIndication,
		String recipeCost,
		String recipePublishday,
		String rank
	) {
		this.recipeId = recipeId
		this.recipeTitle = recipeTitle
		this.recipeUrl = recipeUrl
		this.foodImageUrl = foodImageUrl
		this.pickup = pickup
		this.shop = shop
		this.nickname = nickname
		this.recipeDescription = recipeDescription
		this.recipeMaterial = recipeMaterial
		this.recipeIndication = recipeIndication
		this.recipeCost = recipeCost
		this.recipePublishday = recipePublishday
		this.rank = rank
	}

	public String toString() {
		return this.recipeTitle;
	}

	def toJSON() {
		Gson gson = new Gson()
		String json = gson.toJson(this);
		return json
	}
}
