const isChrome = !window.browser;
const browser = isChrome ? window.chrome : window.browser;

function removeCookie(cookie) {
    let allowSubDomains = cookie.domain.startsWith('.');
    let rawDomain = allowSubDomains ? cookie.domain.substr(1) : cookie.domain;
    const details = {
        name: cookie.name,
        url: (cookie.secure ? 'https://' : 'http://') + rawDomain + cookie.path,
        storeId: cookie.storeId
    };
    browser.cookies.remove(details);
	if(cookie.path.indexOf('../') >= 0) {
		const parts = cookie.path.split('/');
		const newParts = [];
		for(const part of parts) {
			if(part === '..')
				newParts.pop();
			else
				newParts.push(part);
		}
		const newPath = newParts.join('/');
		details.url = (cookie.secure ? 'https://' : 'http://') + rawDomain + newPath;
		console.log('trying to remove with fixed path: ' + details.url);
    	browser.cookies.remove(details);
	}
}

browser.browserAction.onClicked.addListener(()=> {
	function callback(cookies) {
		if(cookies.length) {
			for (const cookie of cookies)
				removeCookie(cookie);
			browser.notifications.create("removecookie", {
				"iconUrl": browser.extension.getURL("icon16.png"),
				"type": "basic",
				"title": "Called browser.cookie.remove() on " + cookies.length + " cookies.",
				"message": "Check if cookies from salzundbrot.com have all been removed."
			});
		} else {
			browser.notifications.create("removecookie", {
				"iconUrl": browser.extension.getURL("icon16.png"),
				"type": "basic",
				"title": "No cookies to remove",
				"message": "Visit salzundbrot.com to get the problematic cookie."
			});
		}
	}
	if(isChrome)
		browser.cookies.getAll({domain: "salzundbrot.com"}, callback);
	else
		browser.cookies.getAll({domain: "salzundbrot.com"}).then(callback);
});