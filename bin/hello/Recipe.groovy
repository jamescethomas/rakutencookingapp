	// groovy Recipe object for mongodb
package hello
import org.springframework.data.annotation.Id
import groovy.json.*

public class Recipe {
	@Id
	private String id

	private int recipeId
	private String recipeTitle
	private String recipeUrl
	private String foodImageUrl
	// private String mediumImageUrl
	// private String smallImageUrl
	private String pickup
	private String shop
	private String nickname
	private String recipeDescription
	private String[] recipeMaterial
	private String recipeIndication
	private String recipeCost
	private String recipePublishday
	private String rank

	public Recipe(
		int recipeId,
		String recipeTitle,
		String recipeUrl,
		String foodImageUrl,
		String pickup,
		String shop,
		String nickname,
		String recipeDescription,
		String[] recipeMaterial,
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
		return (new JsonBuilder(this).toPrettyString())
	}
}
