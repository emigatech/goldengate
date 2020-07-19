const express   = require('express');
const scrape    = require('scraperjs');
const validUrl  = require('valid-url').is_web_uri;
const router    = express.Router();
const path      = require('path');
const { DB }    = require(path.join(__dirname, `/../../helpers/firebase`));
const {v4:uuid4}= require('uuid');

router.post('/', (req, res) => {

    let key;
    
    if (!validUrl(req.body.url) || typeof req.body.url !== 'string') 
    {
        res.status(400).json({
            status: 400,
            time: Date.now(),
            message: `invalid url`,
            data: null
        }) 
    }
    if (req.body.key === null || req.body.key === "" || typeof req.body.key !== "string") 
    {
        key = uuid4();
    }
    else {
        key = req.body.key;
    }

    /**
     * Scraper Init
     */
    const cache = (() => { if (validUrl(req.body.cache) && typeof req.body.cache === "string") { return req.body.cache } else { return undefined } });

    scrape
        .StaticScraper
        .create(cache() || req.body.url)
        .scrape(function ($) {
            return {
                /**
                 *  SEO
                 */
                seo: {
                    /**
                     *  Title
                     */
                    title: {
                        meta: $("title").map(function () {
                            if($(this).text() !== undefined && $("#title").text() !== "")
                            {
                                return ($(this).text()).replace(/ +(?= )/g,'')
                            }
                            return $(this).text()
                        }).get(),
                        og: $('meta[property="og:title"]').map(function () {
                            if($(this).text() !== undefined && $("#title").text() !== "")
                            {
                                return ($(this).text()).replace(/ +(?= )/g,'')
                            }
                            return $(this).attr('content')
                        }).get(),
                        twitter: $('meta[name="twitter:title"]').map(function () {
                            if($(this).text() !== undefined && $("#title").text() !== "")
                            {
                                return ($(this).text()).replace(/ +(?= )/g,'')
                            }
                            return $(this).attr('content')
                        }).get(),
                    },
                    /**
                     *  Description
                     */
                    description: {
                        meta: $('meta[name="description"]').map(function () {
                            if($(this).text() !== undefined && $("#title").text() !== "")
                            {
                                return ($(this).text()).replace(/ +(?= )/g,'')
                            }
                            return $(this).attr('content')
                        }).get(),
                        og: $('meta[property="og:description"]').map(function () {
                            if($(this).text() !== undefined && $("#title").text() !== "")
                            {
                                return ($(this).text()).replace(/ +(?= )/g,'')
                            }
                            return $(this).attr('content')
                        }).get(),
                        twitter: $('meta[name="twitter:description"]').map(function () {
                            if($(this).text() !== undefined && $("#title").text() !== "")
                            {
                                return ($(this).text()).replace(/ +(?= )/g,'')
                            }
                            return $(this).attr('content')
                        }).get(),
                    },
                    /**
                     *  Canonical
                     */
                    canonical: {
                        meta: $('link[rel="canonical"]').map(function () {
                            if($(this).text() !== undefined && $("#title").text() !== "")
                            {
                                return ($(this).text()).replace(/ +(?= )/g,'')
                            }
                            return $(this).attr('href')
                        }).get(),
                        og: $('meta[property="og:url"]').map(function () {
                            if($(this).text() !== undefined && $("#title").text() !== "")
                            {
                                return ($(this).text()).replace(/ +(?= )/g,'')
                            }
                            return $(this).attr('content')
                        }).get()
                    },
                    /**
                     *  Image
                     */
                    image: {
                        og: $('meta[property="og:image"]').map(function () {
                            if($(this).text() !== undefined && $("#title").text() !== "")
                            {
                                return ($(this).text()).replace(/ +(?= )/g,'')
                            }
                            return $(this).attr('content')
                        }).get(),
                        twitter: $('meta[name="twitter:image"]').map(function () {
                            if($(this).text() !== undefined && $("#title").text() !== "")
                            {
                                return ($(this).text()).replace(/ +(?= )/g,'')
                            }
                            return $(this).attr('content')
                        }).get(),
                    }
                },
                /**
                 * Url
                 */
                /**
                *  a tag
                *  @value {text,link}
                */
                url: $("a").map(function () {
                    let url  = $(this).attr('href');
                    let text = (($(this).text()).trim()).replace(/ +(?= )/g,'');
                    if(!validUrl(url))
                    {
                        url = new URL($(this).attr('href'), req.body.url)
                    }
                    return {
                        text: text,
                        link: url.href || url
                    }
                }).get(),
                /**
                 * Media
                 */
                media: {
                    /**
                     *  img tag
                     *  @value {alt,link}
                     */
                    img: $("img").map(function () {
                        let url  = $(this).attr('src');
                        let alt  = $(this).attr('alt');
                        if(!validUrl(url))
                        {
                            url = new URL($(this).attr('href') || "", req.body.url)
                        }
                        return {
                            alt: alt || "",
                            link: url.href || url
                        }
                    }).get(),

                    /**
                     *  video tag
                     *  @value {string}
                     */
                    video: $("video").map(function () {
                        let url  = $(this).attr('src');
                        if(!validUrl(url))
                        {
                            url = new URL($(this).attr('href'), req.body.url)
                        }
                        return url.href || url
                    }).get(),

                    /**
                     *  audio tag
                     *  @value {string}
                     */
                    audio: $("audio").map(function () {
                        let url  = $(this).attr('src');
                        if(!validUrl(url))
                        {
                            url = new URL($(this).attr('href'), req.body.url)
                        }
                        return url.href || url
                    }).get()
                },
                /**
                 *  Text
                 */
                text: {
                    /**
                     *  h1 tag
                     *  @value {string}
                     */
                    h1: $("h1").map(function () {
                        if ($(this).text() !== null && $(this).text() !== "") {
                            return (($(this).text()).trim()).replace(/ +(?= )/g,'') || null
                        }
                    }).get(),

                    /**
                     *  h2 tag
                     *  @value {string}
                     */
                    h2: $("h2").map(function () {
                        if ($(this).text() !== null && $(this).text() !== "") {
                            return (($(this).text()).trim()).replace(/ +(?= )/g,'') || null
                        }
                    }).get(),

                    /**
                     *  h3 tag
                     *  @value {string}
                     */
                    h3: $("h3").map(function () {
                        if ($(this).text() !== null && $(this).text() !== "") {
                            return (($(this).text()).trim()).replace(/ +(?= )/g,'') || null
                        }
                    }).get(),

                    /**
                     *  h4 tag
                     *  @value {string}
                     */
                    h4: $("h4").map(function () {
                        if ($(this).text() !== null && $(this).text() !== "") {
                            return (($(this).text()).trim()).replace(/ +(?= )/g,'') || null
                        }
                    }).get(),

                    /**
                     *  h5 tag
                     *  @value {string}
                     */
                    h5: $("h5").map(function () {
                        if ($(this).text() !== null && $(this).text() !== "") {
                            return (($(this).text()).trim()).replace(/ +(?= )/g,'') || null
                        }
                    }).get(),

                    /**
                     *  h6 tag
                     *  @value {string}
                     */
                    h6: $("h6").map(function () {
                        if ($(this).text() !== null && $(this).text() !== "") {
                            return (($(this).text()).trim()).replace(/ +(?= )/g,'') || null
                        }
                    }).get(),

                    /**
                     *  p tag
                     *  @value {string}
                     */
                    p: $("p").map(function () {
                        if ($(this).text() !== null && $(this).text() !== "") {
                            return (($(this).text()).trim()).replace(/ +(?= )/g,'') || null
                        }
                    }).get(),

                    /**
                     *  b tag
                     *  @value {string}
                     */
                    b: $("b").map(function () {
                        if ($(this).text() !== null && $(this).text() !== "") {
                            return (($(this).text()).trim()).replace(/ +(?= )/g,'') || null
                        }
                    }).get(),

                    /**
                     *  i tag
                     *  @value {string}
                     */
                    i: $("i").map(function () {
                        if ($(this).text() !== null && $(this).text() !== "") {
                            return (($(this).text()).trim()).replace(/ +(?= )/g,'') || null
                        }
                    }).get(),

                    /**
                     *  u tag
                     *  @value {string}
                     */
                    u: $("u").map(function () {
                        if ($(this).text() !== null && $(this).text() !== "") {
                            return (($(this).text()).trim()).replace(/ +(?= )/g,'') || null
                        }
                    }).get(),

                    /**
                     *  strike tag
                     *  @value {string}
                     */
                    strike: $("strike").map(function () {
                        if ($(this).text() !== null && $(this).text() !== "") {
                            return (($(this).text()).trim()).replace(/ +(?= )/g,'') || null
                        }
                    }).get(),

                    /**
                     *  sup tag
                     *  @value {string}
                     */
                    sup: $("sup").map(function () {
                        if ($(this).text() !== null && $(this).text() !== "") {
                            return (($(this).text()).trim()).replace(/ +(?= )/g,'') || null
                        }
                    }).get(),

                    /**
                     *  sub tag
                     *  @value {string}
                     */
                    sub: $("sub").map(function () {
                        if ($(this).text() !== null && $(this).text() !== "") {
                            return (($(this).text()).trim()).replace(/ +(?= )/g,'') || null
                        }
                    }).get(),

                    /**
                     *  small tag
                     *  @value {string}
                     */
                    small: $("small").map(function () {
                        if ($(this).text() !== null && $(this).text() !== "") {
                            return (($(this).text()).trim()).replace(/ +(?= )/g,'') || null
                        }
                    }).get(),

                    /**
                     *  tt tag
                     *  @value {string}
                     */
                    tt: $("tt").map(function () {
                        if ($(this).text() !== null && $(this).text() !== "") {
                            return (($(this).text()).trim()).replace(/ +(?= )/g,'') || null
                        }
                    }).get(),

                    /**
                     *  pre tag
                     *  @value {string}
                     */
                    pre: $("pre").map(function () {
                        if ($(this).text() !== null && $(this).text() !== "") {
                            return (($(this).text()).trim()).replace(/ +(?= )/g,'') || null
                        }
                    }).get(),

                    /**
                     *  blockquote tag
                     *  @value {string}
                     */
                    blockquote: $("blockquote").map(function () {
                        if ($(this).text() !== null && $(this).text() !== "") {
                            return (($(this).text()).trim()).replace(/ +(?= )/g,'') || null
                        }
                    }).get(),

                    /**
                     *  strong tag
                     *  @value {string}
                     */
                    strong: $("strong").map(function () {
                        if ($(this).text() !== null && $(this).text() !== "") {
                            return (($(this).text()).trim()).replace(/ +(?= )/g,'') || null
                        }
                    }).get(),

                    /**
                     *  em tag
                     *  @value {string}
                     */
                    em: $("em").map(function () {
                        if ($(this).text() !== null && $(this).text() !== "") {
                            return (($(this).text()).trim()).replace(/ +(?= )/g,'') || null
                        }
                    }).get(),

                    /**
                     *  font tag
                     *  @value {string}
                     */
                    font: $("font").map(function () {
                        if ($(this).text() !== null && $(this).text() !== "") {
                            return (($(this).text()).trim()).replace(/ +(?= )/g,'') || null
                        }
                    }).get(),
                },
                /**
                 * Table
                 */
                table: {
                    /**
                     *  th tag
                     *  @value {string}
                     */
                    th: $("th").map(function () {
                        if ($(this).text() !== null && $(this).text() !== "") {
                            return (($(this).text()).trim()).replace(/ +(?= )/g,'') || null
                        }
                    }).get(),

                    /**
                     *  td tag
                     *  @value {string}
                     */
                    td: $("td").map(function () {
                        if ($(this).text() !== null && $(this).text() !== "") {
                            return (($(this).text()).trim()).replace(/ +(?= )/g,'') || null
                        }
                    }).get()
                },
                /**
                 *  li tag
                 *  @value {string}
                 */
                list: $("li").map(function () {
                    if ($(this).text() !== null && $(this).text() !== "") {
                        return (($(this).text()).trim()).replace(/ +(?= )/g,'') || null
                    }
                }).get()
            };
        })
        .then(function (data) {
            DB.ref.child(`data/${key}`).set({
                status: 201,
                time: Date.now(),
                message: "success",
                url: req.body.url,
                key: key,
                data: {
                    ...data
                }
            })
                .then(() => {
                    res.status(201).json({
                        status: 201,
                        time: Date.now(),
                        message: "success",
                        url: req.body.url,
                        key: key,
                        data: {
                            ...data
                        }
                    })
                })
                .catch(function (err) {
                    res.status(500).json({
                        status: 500,
                        time: Date.now(),
                        message: `${err}`,
                        url: req.body.url,
                        key: key,
                        data: null
                    })
                })
        })
        .catch(function (err) {
            res.status(500).json({
                status: 500,
                time: Date.now(),
                message: `${err}`,
                url: req.body.url,
                key: key,
                data: null
            })
        })
});

module.exports = router;