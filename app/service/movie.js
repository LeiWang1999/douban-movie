'use strict'

const Service = require('egg').Service;
const cheerio = require('cheerio');


const movie_detail_url = "https://movie.douban.com/subject/"
class MovieService extends Service {

    async get_movie_detail_url(doubanId) {
        return movie_detail_url + doubanId + '/';
    };

    async get_movie_detail(html) {
        const cheerioModel = cheerio.load(html);
        // Parse Banner Info
        // Parse Media Info
        const mediaInfo = cheerioModel('#info')[0];
        await this.service.movie.parse_media_info_index(cheerioModel);
        // const directors = await this.service.movie.parse_directors(mediaInfo);
        // const actors = await this.service.movie.parse_actors(mediaInfo);
        return {
            // directors,
            // actors,
        }
    }

    // Parse directors、Actors、genre... span index
    async parse_media_info_index(cheerioModel) {
        let directorsIndex = null, scenaristsIndex = null, actorsIndex = null;
        let genreIndex = []
        const mediaInfo = cheerioModel('#info')[0];
        for (let index = 0; index < mediaInfo.children.length; index++) {
            const element = mediaInfo.children[index];
            if (element.type == 'tag' && element.name == 'span') {
                // search for director index
                try {
                    if (element.children[0].children[0].data == '导演') {
                        directorsIndex = index;
                    } else if (element.children[0].children[0].data == '编剧') {
                        scenaristsIndex = index;
                    } else if (element.attribs.class == 'actor') {
                        actorsIndex = index;
                    }

                } catch (error) { }
                // search for genre index array
                try {
                    if (element.attribs.property) {
                        genreIndex.push(index);
                        console.log(index)
                    }
                } catch (error) { }

                // console.log(element.attribs.property)
            }
        }

        return {
            directorsIndex,
            actorsIndex,
        }
    }

    async parse_directors(mediaInfo) {
        let directors = '';
        let span_list = null;
        try {
            span_list = mediaInfo.children[1].children[2].children;
        } catch (error) {
            this.logger.error(error);
        }
        if (!span_list) return directors;
        span_list.forEach(span => {
            if (span.type == 'tag') {
                directors += span.children[0].data;
            }
            else if (span.type == 'text') {
                directors += span.data;
            }
        });
        return directors;
    }

    async parse_actors(mediaInfo) {
        let actors = '';
        let span_list = null;
        try {
            span_list = mediaInfo.children[7].children[2].children;
        } catch (error) {
            this.logger.error(error);
        }
        if (!span_list) return actors;
        span_list.forEach(span => {
            if (span.type == 'tag') {
                actors += span.children[0].data;
            }
            else if (span.type == 'text') {
                actors += span.data;
            }
        });
        return actors;
    }

    async parse_genre(mediaInfo) {

    }
}

module.exports = MovieService;