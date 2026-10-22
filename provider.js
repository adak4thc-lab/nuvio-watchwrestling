// Pre-defined series mapped to their site category URLs based on the site menu
var SHOWS = [
    {
        id: "ww:raw",
        name: "WWE Raw",
        poster: "https://watchwrestling.ae/wp-content/uploads/wwe-raw.jpg",
        catUrl: "https://watchwrestling.ae/category/wwe/raw/"
    },
    {
        id: "ww:smackdown",
        name: "WWE SmackDown",
        poster: "https://watchwrestling.ae/wp-content/uploads/wwe-smackdown.jpg",
        catUrl: "https://watchwrestling.ae/category/wwe/smackdown/"
    },
    {
        id: "ww:mainevent",
        name: "WWE Main Event",
        poster: "https://watchwrestling.ae/wp-content/uploads/wwe-main-event.jpg",
        catUrl: "https://watchwrestling.ae/category/wwe/main-event/"
    },
    {
        id: "ww:nxt",
        name: "WWE NXT",
        poster: "https://watchwrestling.ae/wp-content/uploads/wwe-nxt.jpg",
        catUrl: "https://watchwrestling.ae/category/wwe/nxt/"
    },
    {
        id: "ww:ppv",
        name: "WWE PPV",
        poster: "https://watchwrestling.ae/wp-content/uploads/wwe-ppv.jpg",
        catUrl: "https://watchwrestling.ae/category/wwe/ppv/"
    },
    {
        id: "ww:totaldivas",
        name: "WWE Total Divas",
        poster: "https://watchwrestling.ae/wp-content/uploads/wwe-total-divas.jpg",
        catUrl: "https://watchwrestling.ae/category/wwe/total-divas/"
    },
    {
        id: "ww:aew",
        name: "AEW (All Elite Wrestling)",
        poster: "https://watchwrestling.ae/wp-content/uploads/aew-wrestling.jpg",
        catUrl: "https://watchwrestling.ae/category/aew/"
    },
    {
        id: "ww:impact",
        name: "IMPACT Wrestling",
        poster: "https://watchwrestling.ae/wp-content/uploads/impact-wrestling.jpg",
        catUrl: "https://watchwrestling.ae/category/impact-wrestling/"
    },
    {
        id: "ww:ufc",
        name: "UFC",
        poster: "https://watchwrestling.ae/wp-content/uploads/ufc.jpg",
        catUrl: "https://watchwrestling.ae/category/ufc/"
    },
    {
        id: "ww:njpw",
        name: "NJPW",
        poster: "https://watchwrestling.ae/wp-content/uploads/njpw.jpg",
        catUrl: "https://watchwrestling.ae/category/njpw/"
    },
    {
        id: "ww:roh",
        name: "ROH",
        poster: "https://watchwrestling.ae/wp-content/uploads/roh.jpg",
        catUrl: "https://watchwrestling.ae/category/roh/"
    },
    {
        id: "ww:other",
        name: "Other Wrestling",
        poster: "https://watchwrestling.ae/wp-content/uploads/other-wrestling.jpg",
        catUrl: "https://watchwrestling.ae/category/other-wrestling/"
    }
];

// 1. Catalog Handler: Displays the show boxes on your home screen
function getCatalog(args) {
    if (args.type === "series" && args.id === "watchwrestling_shows") {
        var metas = SHOWS.map(function(show) {
            return {
                id: show.id,
                type: "series",
                name: show.name,
                poster: show.poster,
                posterShape: "landscape"
            };
        });
        return Promise.resolve({ metas: metas });
    }
    return Promise.resolve({ metas: [] });
}

// 2. Meta Handler: When a user clicks a box, scrape the archive for its episodes
function getMeta(args) {
    var show = SHOWS.find(function(s) { return s.id === args.id; });
    if (!show) return Promise.resolve({ meta: null });

    return fetch(show.catUrl)
        .then(function(res) { return res.text(); })
        .then(function(html) {
            var episodes = [];
            // Extracts all post links and titles from the archive page
            var itemRegex = /<h2 class="title">\s*<a href="([^"]+)">([^<]+)<\/a>/gi;
            var match;
            var epIndex = 1;

            while ((match = itemRegex.exec(html)) !== null) {
                episodes.push({
                    id: show.id + ":" + encodeURIComponent(match[1]),
                    title: match[2].trim(),
                    season: 1,
                    episode: epIndex,
                    released: new Date().toISOString()
                });
                epIndex++;
            }

            return {
                meta: {
                    id: show.id,
                    type: "series",
                    name: show.name,
                    poster: show.poster,
                    videos: episodes
                }
            };
        })
        .catch(function() {
            return { meta: null };
        });
}

// 3. Stream Handler: Plays the selected episode
function getStreams(args) {
    var parts = args.id.split(":");
    if (parts.length < 3) return Promise.resolve({ streams: [] });

    var targetUrl = decodeURIComponent(parts.slice(2).join(":"));

    return fetch(targetUrl)
        .then(function(res) { return res.text(); })
        .then(function(html) {
            var iframeRegex = /<iframe[^>]+src="([^"]+)"/gi;
            var streams = [];
            var match;
            var count = 1;

            while ((match = iframeRegex.exec(html)) !== null) {
                if (match[1].indexOf("youtube.com") === -1 && match[1].indexOf("facebook.com") === -1) {
                    streams.push({
                        title: "Server " + count,
                        url: match[1]
                    });
                    count++;
                }
            }

            return { streams: streams };
        })
        .catch(function() {
            return { streams: [] };
        });
}

module.exports = {
    getCatalog: getCatalog,
    getMeta: getMeta,
    getStreams: getStreams
};
