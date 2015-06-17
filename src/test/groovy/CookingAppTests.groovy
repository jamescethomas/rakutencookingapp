// CookingAppTests.groovy
package hello

import junit.framework.Assert
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner
import org.junit.runner.RunWith
import org.junit.Test
import groovy.json.*
import java.util.ArrayList

import com.google.gson.*

// @RunWith(SpringJUnit4ClassRunner.class)
// @ContextConfiguration("classpath:spring-config.xml")
public class CookingAppTests {
	@Autowired
	private Recipe recipe;
	private TestClass testClass;


	@Test
	public void testOne() {
		Assert.assertEquals("test", "test");
	}
	
	@Test
	public void testTWo() {
		testClass = new TestClass("myName");
		def name = testClass.getName();
		Assert.assertEquals(name, "myName");
	}

	@Test
	public void testTwo() {
		ArrayList testStringArray = ["item1", "item2"]
		recipe = new Recipe(
			1234,
			"testTitle",
			"testUrl",
			"testImage",
			123,
			123,
			"testNickname", 
			"testDecription",
			testStringArray,
			"testIndication",
			"testCost", 
			"testDate",
			"1"
			);
		println (new JsonBuilder(recipe).toPrettyString())
		Assert.assertEquals(recipe.toString(), "testTitle")
	}
}