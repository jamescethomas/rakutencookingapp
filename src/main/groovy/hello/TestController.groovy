// TestController.groovy
package hello
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class TestController {
	@RequestMapping("/testGroovy")
	String testGroovy() {
		return "Groovy works!"
	}
}