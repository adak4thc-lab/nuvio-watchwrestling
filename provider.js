function getStreams(req) {
    // 1. Search the site for the requested match or event title
    var searchUrl = 'https://watchwrestling.ae/?s=' + encodeURIComponent(req.title);
    
    return fetch(searchUrl)
        .then(function(response) {
            return response.text();
        })
        .then(function(html) {
            // 2. Find the first search result link
            var postRegex = /<h2 class="title">\s*<a href="([^"]+)"/i;
            var matchPage = postRegex.exec(html);
            
            if (matchPage && matchPage[1]) {
                return fetch(matchPage[1]);
            }
            throw new Error("Event not found on the site.");
        })
        .then(function(response) {
            return response.text();
        })
        .then(function(html) {
            // 3. Extract the video iframe links from the match page
            // Wrestling sites usually embed players like Dailymotion, Doodstream, etc.
            var iframeRegex = /<iframe[^>]+src="([^"]+)"/gi;
            var streams = [];
            var match;
            var streamCount = 1;
            
            while ((match = iframeRegex.exec(html)) !== null) {
                // Filter out irrelevant iframes (like ads or social widgets)
                if (match[1].indexOf('youtube.com') === -1 && match[1].indexOf('facebook.com') === -1) {
                    streams.push({
                        title: "Stream " + streamCount,
                        url: match[1]
                    });
                    streamCount++;
                }
            }
            
            return { streams: streams };
        })
        .catch(function(err) {
            // If anything fails in the chain, return an empty array so Nuvio knows to check other plugins
            return { streams: [] };
        });
}

// Register the function with Nuvio
module.exports = {
    getStreams: getStreams
};
