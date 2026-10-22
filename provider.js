function getStreams(tmdbId, mediaType, season, episode) {
    var metaType = mediaType === 'movie' ? 'movie' : 'series';
    var cinemetaUrl = 'https://v3-cinemeta.strem.io/meta/' + metaType + '/tmdb:' + tmdbId + '.json';

    return fetch(cinemetaUrl)
        .then(function(res) { return res.json(); })
        .then(function(data) {
            var title = (data && data.meta && data.meta.name) ? data.meta.name : "";
            if (!title) throw new Error("Title not found");
            
            return fetch('https://watchwrestling.ae/?s=' + encodeURIComponent(title));
        })
        .then(function(res) { return res.text(); })
        .then(function(html) {
            var postRegex = /<h2 class="title">\s*<a href="([^"]+)"/i;
            var matchPage = postRegex.exec(html);
            if (matchPage && matchPage[1]) return fetch(matchPage[1]);
            throw new Error("Event not found");
        })
        .then(function(res) { return res.text(); })
        .then(function(html) {
            var iframeRegex = /<iframe[^>]+src="([^"]+)"/gi;
            var streams = [];
            var match;
            var count = 1;
            
            while ((match = iframeRegex.exec(html)) !== null) {
                if (match[1].indexOf('youtube') === -1 && match[1].indexOf('facebook') === -1) {
                    streams.push({
                        name: "WatchWrestling",
                        title: "Server " + count,
                        url: match[1],
                        quality: "720p"
                    });
                    count++;
                }
            }
            return streams;
        })
        .catch(function(err) {
            return [];
        });
}

module.exports = {
    getStreams: getStreams
};
