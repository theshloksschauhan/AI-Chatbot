const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// NOTE: you must manually enter your API_KEY below using information retrieved from your IBM Cloud account (https://au-syd.dai.cloud.ibm.com/docs/content/wsj/analyze-data/ml-authentication.html?context=wx)
const API_KEY = "<your API key>";

const req = new XMLHttpRequest();
const oReq = new XMLHttpRequest();

function getToken(errorCallback, loadCallback) {
	req.addEventListener("load", loadCallback);
	req.addEventListener("error", errorCallback);
	req.open("POST", "https://iam.cloud.ibm.com/identity/token");
	req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	req.setRequestHeader("Accept", "application/json");
	req.send("grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=" + API_KEY);
}

function apiPost(scoring_url, token, payload, loadCallback, errorCallback) {
	oReq.addEventListener("load", loadCallback);
	oReq.addEventListener("error", errorCallback);
	oReq.open("POST", scoring_url);
	oReq.setRequestHeader("Accept", "application/json");
	oReq.setRequestHeader("Authorization", "Bearer " + token);
	oReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	oReq.send(payload);
}

getToken((err) => console.log("An error occurred submitting the request."), () => {
	let tokenResponse;
	try {
		tokenResponse = JSON.parse(req.responseText);
	} catch(ex) {
		console.log("An error occurred parsing the token response.");
		return;
	}
	// NOTE:  manually define and pass the array(s) of values to be scored in the next line
	const payload = `{"messages":[{"content":"","role":""}]}`;

	const scoring_url = "https://au-syd.ml.cloud.ibm.com/ml/v4/deployments/34340002-bd4c-4004-b623-399f3660d610/ai_service_stream?version=2021-05-01";
	apiPost(scoring_url, tokenResponse.access_token, payload, function (resp) {
		let parsedPostResponse;
		try {
			parsedPostResponse = JSON.parse(oReq.responseText);
		} catch (ex) {
			console.log("An error occurred parsing the scoring response.");
			return;
		}
		console.log("Scoring response");
		console.log(JSON.stringify(parsedPostResponse, null, "  "));
	}, function (error) {
		console.log(error);
	});
});
