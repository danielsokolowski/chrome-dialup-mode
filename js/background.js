//2019-Feb-11-2022: we don't use stripes patterns to simplify, that is we don't need to CSS them in and only
//					need have the gray image load instead of media. 

// load our blocked ad ips list file
let oBlockedDomains = {}
let oXHMLTR = new XMLHttpRequest();
oXHMLTR.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
	 	let sHostsFile = this.responseText;
		let aRegExMatches = sHostsFile.match(/0\.0\.0\.0\s[^\s\t\n]*/g);
		for (let i = 0; i < aRegExMatches.length; i++) {
			oBlockedDomains[aRegExMatches[i].match(/0\.0\.0\.0\s(.*)/)[1]] = true;
		}
	}
};
oXHMLTR.open("GET", "/hosts-2019-feb-11.txt", true);
oXHMLTR.send();

// Called when the user clicks on the browser extension action.
chrome.browserAction.onClicked.addListener(function(tab) {

	// activate or deactivate extension
	let bExtensionEnabled = 'true' === localStorage['bExtensionEnabled'];
	bExtensionEnabled = !bExtensionEnabled
	localStorage['bExtensionEnabled'] = bExtensionEnabled; 

	// toggle the icon 
	if (bExtensionEnabled === true) {
		chrome.browserAction.setIcon({path:'/images/windows-95-style-modem-icon-38x38.png'});	
	}
	else {
		chrome.browserAction.setIcon({path:'/images/windows-95-style-modem-icon-off-38x38.png'});	
	}
	

	//console.log("setListeners: getReplacementImageID=" + getReplacementImageID());
	// add or remove listeners

	// Sets the listeners only if the extension is enabled for the current context
	if (bExtensionEnabled === true) {
		chrome.webRequest.onBeforeRequest.addListener(
			// listener
			fOnBeforeRequestScript, // block ad domains, i.e. ad blocker, no need for `1px` image blocking as that's taken care by our image replacer
			// filters
			{
				urls: ["http://*/*", "https://*/*"]
				,types: ["script"]
			}
			// extraInfoSpec
			,["blocking"]
		);

		chrome.webRequest.onBeforeRequest.addListener(
			// listener
			fOnBeforeRequestImage, // this also block any image based tracking
			// filters
			{
				urls: ["http://*/*", "https://*/*"]
				,types: ["image"]
			}
			// extraInfoSpec
			,["blocking"]
		);
		
		chrome.webRequest.onBeforeRequest.addListener(
			// listener
			fOnBeforeRequestMedia, // this also block any image based tracking
			// filters
			{
				urls: ["http://*/*", "https://*/*"]
				,types: ["media"]
			}
			// extraInfoSpec
			,["blocking"]
		);
		
		chrome.webRequest.onBeforeRequest.addListener(
			// listener
			fOnBeforeRequestObject,
			// filters
			{
				urls: ["http://*/*", "https://*/*"]
				,types: ["object"] 
			}// extraInfoSpec
			,["blocking"]
		);

		chrome.webRequest.onBeforeRequest.addListener(
			// listener
			fOnBeforeRequestFont,
			// filters
			{
				urls: ["http://*/*", "https://*/*"]
				,types: ["font"] 
			}
			// extraInfoSpec
			,["blocking"]
		);
	}
	else {
		// Remove listeners
		chrome.webRequest.onBeforeRequest.removeListener( fOnBeforeRequestScript );
		chrome.webRequest.onBeforeRequest.removeListener( fOnBeforeRequestImage );
		chrome.webRequest.onBeforeRequest.removeListener( fOnBeforeRequestMedia );
		chrome.webRequest.onBeforeRequest.removeListener( fOnBeforeRequestObject );
		chrome.webRequest.onBeforeRequest.removeListener( fOnBeforeRequestFont );
	}

	chrome.tabs.reload(tab.id);


});



// Listeners
// DS, need to be functions so they can be removed
fOnBeforeRequestScript = function(oRequest) {
	let sRequestURLHostname = new URL(oRequest.url).hostname;
	if (oBlockedDomains[sRequestURLHostname] === true) {
		console.info('fOnBeforeRequestScript(...): blocked an ad domain, : `sRequestURLHostname=`' + sRequestURLHostname + '`');
		return {cancel:true};
	}
};


fOnBeforeRequestImage = function(info)
{
	//console.log(info);
	// Redirect the image request to blank.
	// DS,2019-Feb-0000: no need for stupid overarchitecting 

	//return {redirectUrl: chrome.extension.getURL("images/stripes_4.png")};
	return {redirectUrl: chrome.extension.getURL("images/graysquare_1.png")};
};
fOnBeforeRequestObject = function(info) {
	// Canceling the request shows an ugly Chrome message
	//return {cancel:true};
	
	// Redirect the asset request to ////
	//return {redirectUrl: chrome.extension.getURL("images/stripes_4.png")};
	return {redirectUrl: chrome.extension.getURL("images/graysquare_1.png")};
	//return {redirectUrl: getReplacementImage()};
};
fOnBeforeRequestFont = function(info) {
	return {cancel:true};
};
fOnBeforeRequestMedia = function(info) {
	return {cancel:true};
};
