//           /$$                  /$$                                                                                         
//          | $$                 | $$                                                                                         
//   /$$$$$$| $$ /$$$$$$  /$$$$$$| $$   /$$/$$   /$$        /$$$$$$$/$$   /$$ /$$$$$$  /$$$$$$  /$$$$$$ /$$$$$$/$$$$  /$$$$$$ 
//  /$$__  $| $$/$$__  $$|____  $| $$  /$$| $$  | $$/$$$$$$/$$_____| $$  | $$/$$__  $$/$$__  $$/$$__  $| $$_  $$_  $$/$$__  $$
// | $$  \ $| $| $$  \ $$ /$$$$$$| $$$$$$/| $$  | $|______|  $$$$$$| $$  | $| $$  \ $| $$  \__| $$$$$$$| $$ \ $$ \ $| $$$$$$$$
// | $$  | $| $| $$  | $$/$$__  $| $$_  $$| $$  | $$       \____  $| $$  | $| $$  | $| $$     | $$_____| $$ | $$ | $| $$_____/
// |  $$$$$$| $|  $$$$$$|  $$$$$$| $$ \  $|  $$$$$$$       /$$$$$$$|  $$$$$$| $$$$$$$| $$     |  $$$$$$| $$ | $$ | $|  $$$$$$$
//  \____  $|__/\______/ \_______|__/  \__/\____  $$      |_______/ \______/| $$____/|__/      \_______|__/ |__/ |__/\_______/
//  /$$  \ $$                              /$$  | $$                        | $$                                              
// |  $$$$$$/                             |  $$$$$$/                        | $$                                              
//  \______/                               \______/                         |__/                                              

const puppeteer = require('puppeteer')
const proxyChain = require('proxy-chain')
const Stopwatch = require('statman-stopwatch')

const stopwatch = new Stopwatch()
stopwatch.start()

console.log("Starting script...")

const keywords = process.argv.slice(2, 3)
const argSize = process.argv.slice(3)
var proxyEnabled = false
var keywordArr = new Array()
keywordArr = keywords[0].split(" ");

(async () => {
	var browser
	var newProxyUrl

	if (proxyEnabled) {
		const oldProxyUrl = 'http://user:pass@host:port'
		newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl)

		console.log("Anonymizing proxy...")
		console.log("Anonymized Proxy Url: " + newProxyUrl)
		console.log("Starting Chromium headless browser...")

		browser = await puppeteer.launch({
			args: [`--proxy-server=${newProxyUrl}`]
		})
	} else {
		browser = await puppeteer.launch()
	}

	console.log("Headless browser launched!")

	const context = await browser.createIncognitoBrowserContext()
	const page = await context.newPage()

	page.setDefaultNavigationTimeout(0)

	const username = 'user'
	const password = 'pass'

	await page.authenticate({
		'username': 'password'
	})

	console.log("Heading to category page...")
	await page.goto('http://www.supremenewyork.com/shop/all/shirts', {
		waitUntil: 'load'
	})

	console.log("Searching for keywords...")
	const productUrl = await page.evaluate(function (keywords) {
			var i

			actualUrl = ""

			for (i = 0; i < document.querySelectorAll('.product-name a.name-link').length; i++) {
				console.log(document.querySelectorAll('.product-name a.name-link')[i].innerText)
				if (document.querySelectorAll('.product-name a.name-link')[i].parentElement.parentElement.firstChild.lastChild.innerText.includes("sold out")) {
					actualUrl = "sold out"
				} else {
					if (document.querySelectorAll('.product-name a.name-link')[i].innerText.includes(keywords)) {
						return actualUrl = document.querySelectorAll('.product-name a.name-link')[i].href.toString()
					}
				}
			}
			return actualUrl
		},
		keywords)

	console.log("Product found...")
	console.log("Product URL found: " + productUrl)

	if (productUrl != "sold out") {
		console.log("Heading to product page...")
	}

	if (productUrl == "sold out") {
		console.log("Product is sold out")
		process.exit()
	}

	await page.goto(productUrl, {
			waitUntil: 'load'
		}),
		page.screenshot({
			path: 'itemPage.png'
		});

	await page.evaluate((argSize) => {
		function sleep(milliseconds) {
			const date = Date.now()
			let currentDate = null
			do {
				currentDate = Date.now()
			} while (currentDate - date < milliseconds)
		}

		var i
		var sizesAvailabe = []

		for (i = 0; i < document.getElementById('s').length; i++) {
			var size = ""

			size = document.getElementById('s').options[i].text
			sizesAvailabe.push(i)

			if (argSize == 'Random') {
				var randomSize = Math.floor(Math.random() * (sizesAvailabe.length - 0)) + 0
				document.getElementById("s").selectedIndex = randomSize
				document.getElementsByName("commit")[0].click()
			} else if (size == argSize) {
				document.getElementById("s").selectedIndex = i
				document.getElementsByName("commit")[0].click()
			}

			// while (document.getElementById('cart').classList.contains('hidden') == true) {
			// 	sleep(2000)
			// }
		}
	}, argSize)

	console.log("Size added. Heading to checkout...")

	page.screenshot({
			path: 'addedPage.png'
		}),

		await page.waitFor(850),
		await page.goto('https://www.supremenewyork.com/checkout', {
			waitUntil: 'load'
		})

	console.log("Auto-filling information...")
	console.log("Processing payment...")

	await page.evaluate(() => {

		var billing = {
			name: "gloaky Supreme",
			email: "test@gmail.com",
			tel: "1234567890",
			address: "190 Bowery St",
			address2: "",
			zip: "10012",
			city: "New York",
			state: "NY",
			country: "USA"
		}
		var credit_card = {
			number: "123456789101",
			cvv: "123",
			month: "05",
			year: "2023"
		}

		var auto_process = false // set this to true if you want the checkout to automatically click the process payment button

		if (document.location == "https://www.supremenewyork.com/checkout") {

			// billing/billing information
			document.getElementsByName("order[billing_name]")[0].value = billing.name
			document.getElementsByName("order[email]")[0].value = billing.email
			document.getElementsByName("order[tel]")[0].value = billing.tel
			document.getElementsByName("order[billing_address]")[0].value = billing.address
			document.getElementsByName("order[billing_address_2]")[0].value = billing.address2
			document.getElementsByName("order[billing_zip]")[0].value = billing.zip
			document.getElementsByName("order[billing_city]")[0].value = billing.city
			document.getElementsByName("order[billing_state]")[0].value = billing.state
			document.getElementsByName("order[billing_country]")[0].value = billing.country

			// credit card information
			document.getElementsByName("riearmxa")[0].value = credit_card.number
			document.getElementsByName("credit_card[meknk]")[0].value = credit_card.cvv
			document.getElementsByName("credit_card[month]")[0].value = credit_card.month
			document.getElementsByName("credit_card[year]")[0].value = credit_card.year

			// accept terms
			$('div.icheckbox_minimal').iCheck('check')

			// complete
			if (auto_process) {
				document.getElementById("checkout_form").submit()
			}
		}
	})

	await page.screenshot({
		path: 'cartPage.png'
	})

	console.log("Order completed!")
	console.log("Finished in", stopwatch.stop() / 1000, "seconds!")

	if (proxyEnabled) {
		await proxyChain.closeAnonymizedProxy(newProxyUrl, true)
	}
	await browser.close()
})()