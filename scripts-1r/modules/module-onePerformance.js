/*
	OnePerformance
	Yangli @onerockwell
*/

import {getCLS, getFCP, getFID, getLCP, getTTFB} from 'web-vitals';

let self;

class Performance {
	constructor (settings) {
		self = this;

		console.log(`ORW Performance Init`);
		
		/*
			settings = {
				webVitalsEnable: boolean,
				webVitalsUrl: string,
				webVitalsReportType: string 'logging' or 'report',
			}
		*/
        this.settings = settings ? settings : ORW.performance;
    }

	composePayload (metric) {

		let pageType = false;

		if (ORW.template.name == 'index') {
			pageType = 'HP';
		} else if (ORW.template.name.includes('collection')) {
			pageType = 'PLP';
		} else if (ORW.template.name.includes('product')) {
			pageType = 'PDP';
		}

		if (!pageType) {
			return false;
		}

		return {
			jobType: "save",
			saveCode: {
				client_id: `${self.settings.webVitalsClientId}`,
				scrape_url: `${pageType}`,
				page_name: Shopify.theme.name,
			},
			saveData: {
				[metric.name]: metric.value,
			}
		}
	}

	toReport (metric) {
		const data = self.composePayload(metric);
		if (!data) {
			console.log(`No data report for this type of page`);
			return false;
		}
		const body = JSON.stringify(self.composePayload(metric));
		// Use `navigator.sendBeacon()` if available, falling back to `fetch()`.
		(navigator.sendBeacon && navigator.sendBeacon(`${self.settings.webVitalsUrl}`, body)) ||
		fetch(`${self.settings.webVitalsUrl}`, {body, method: 'POST', keepalive: true});
	}

	toLog (metric) {
		// console.log(metric);
		const body = self.composePayload(metric);
		console.log(body);
	}

	measure () {
		if (this.settings.webVitalsReportType == 'report' ) {
			this.measureAsReport();
		} else if (this.settings.webVitalsReportType == 'logging') {
			this.measureAsLog();
		}
	}

	measureAsLog () {
		getCLS(this.toLog);
		getFCP(this.toLog);
		getFID(this.toLog);
		getLCP(this.toLog);
		getTTFB(this.toLog);
	}

	measureAsReport () {
		getCLS(this.toReport);
		getFCP(this.toReport);
		getFID(this.toReport);
		getLCP(this.toReport);
		getTTFB(this.toReport);
	}
}

// Define the module here 
const OnePerformance = {
	init: (settings) => {
		const performance = new Performance(settings);
		performance.measure();
	}
}

// Output the module
export default OnePerformance;