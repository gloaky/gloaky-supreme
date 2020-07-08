const puppeteer = require('puppeteer');
const proxyChain = require('proxy-chain');
const Stopwatch = require('statman-stopwatch');

const stopwatch = new Stopwatch();
stopwatch.start();
console.log("Started!");

const url = process.argv.slice(2);

(async () => {
	const oldProxyUrl = 'http://user:pass@url:port';
	const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);

	console.log(newProxyUrl);

	const browser = await puppeteer.launch({
		args: [`--proxy-server=${newProxyUrl}`]
	});
	const context = await browser.createIncognitoBrowserContext();
	const page = await context.newPage();

	const username = 'zp34';
	const password = '5qRgSb';

	await page.authenticate({
		'username': 'password'
	})

	await page.goto(url[0], {
		waitUntil: 'load'
	});

	await page.evaluate(() => {
		document.getElementById("s").selectedIndex = "1";
		document.getElementsByName("commit")[0].click();
	});

	await page.waitFor(850),
		await page.goto('https://www.supremenewyork.com/checkout', {
			waitUntil: 'load'
		});

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
		};
		var credit_card = {
			number: "123456789101",
			cvv: "123",
			month: "05",
			year: "2023"
		};

		var auto_process = false; // set this to true if you want the checkout to automatically click the process payment button

		if (document.location == "https://www.supremenewyork.com/checkout") {

			// billing/billing information
			document.getElementsByName("order[billing_name]")[0].value = billing.name;
			document.getElementsByName("order[email]")[0].value = billing.email;
			document.getElementsByName("order[tel]")[0].value = billing.tel;
			document.getElementsByName("order[billing_address]")[0].value = billing.address;
			document.getElementsByName("order[billing_address_2]")[0].value = billing.address2;
			document.getElementsByName("order[billing_zip]")[0].value = billing.zip;
			document.getElementsByName("order[billing_city]")[0].value = billing.city;
			document.getElementsByName("order[billing_state]")[0].value = billing.state;
			document.getElementsByName("order[billing_country]")[0].value = billing.country;

			// credit card information
			document.getElementsByName("riearmxa")[0].value = credit_card.number;
			document.getElementsByName("credit_card[meknk]")[0].value = credit_card.cvv;
			document.getElementsByName("credit_card[month]")[0].value = credit_card.month;
			document.getElementsByName("credit_card[year]")[0].value = credit_card.year;

			// accept terms
			$('div.icheckbox_minimal').iCheck('check');

			// complete
			if (auto_process) {
				document.getElementById("checkout_form").submit();
			}
		}
	});

	await page.screenshot({
		path: 'cartPage.png'
	});

	console.log("Finished in", stopwatch.stop() / 1000, "seconds!");

	await proxyChain.closeAnonymizedProxy(newProxyUrl, true);
	await browser.close();
})();