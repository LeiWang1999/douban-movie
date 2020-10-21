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
        const title = await this.service.movie.parse_title(cheerioModel);
        // Parse Image
        const image = await this.service.movie.parse_image(cheerioModel);
        // Parse Media Info
        const mediaInfo = cheerioModel('#info')[0];
        const { directorsIndex, actorsIndex } = await this.service.movie.parse_media_info_index(mediaInfo);
        const directors = await this.service.movie.parse_directors(mediaInfo, directorsIndex);
        const actors = await this.service.movie.parse_actors(mediaInfo, actorsIndex);
        // Parse Intro
        const intro = await this.service.movie.parse_intro(cheerioModel);
        return {
            title,
            image,
            directors,
            actors,
            intro
        }
    }
    // Format
    async format_movie_detail(movieDetail, actorsSize) {
        let movieDetail_format = movieDetail;
        let { actors, intro } = movieDetail;
        if (!actorsSize) actorsSize = 5;
        actors = actors.split('/');
        actors = actors.slice(0, actorsSize);
        actors = actors.join('/');
        movieDetail_format.actors = actors;
        intro = intro.replace(/\n/g, '');
        intro = intro.replace(/(^\s*)|(\s*$)/g, '');
        movieDetail_format.intro = intro;
        return movieDetail_format;
    }
    // Parse title
    async parse_title(cheerioModel) {
        const title = cheerioModel('#content').find('h1').find('span')[0].children[0].data;
        return title;
    }
    // Parse Image
    async parse_image(cheerioModel) {
        const image = cheerioModel('#mainpic').find('img')[0].attribs.src;
        console.log(image)
        return image;
    }
    // Parse directors、Actors、genre... span index
    async parse_media_info_index(mediaInfo) {
        let directorsIndex = null, scenaristsIndex = null, actorsIndex = null;
        let genreIndex = []
        for (let index = 0; index < mediaInfo.children.length; index++) {
            const element = mediaInfo.children[index];
            if (element.type == 'tag' && element.name == 'span') {
                // search for director index
                try {
                    if (element.children[0].children[0].data == '导演') {
                        directorsIndex = index;
                    } else if (element.children[0].children[0].data == '编剧') {
                        scenaristsIndex = index;
                    }

                } catch (error) { }
                // search for genre index array
                try {
                    if (element.attribs.class == 'actor') {
                        actorsIndex = index;
                    } else if (element.attribs.property == 'v:genre') {
                        genreIndex.push(index);
                    }
                } catch (error) { }
            }
        }
        return {
            directorsIndex,
            scenaristsIndex,
            actorsIndex,
            genreIndex
        }
    }

    async parse_directors(mediaInfo, directorsIndex) {
        let directors = '';
        let span_list = null;
        if (!directorsIndex) return directors;
        span_list = mediaInfo.children[directorsIndex].children[2].children;
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

    async parse_actors(mediaInfo, actorsIndex) {
        let actors = '';
        let span_list = null;
        if (!actorsIndex) return actors;
        span_list = mediaInfo.children[actorsIndex].children[2].children;
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

    // Parse Intro
    async parse_intro(cheerioModel) {
        const intro = cheerioModel('#content').find('span[property="v:summary"]')[0].children[0].data;
        return intro;
    }
}

module.exports = MovieService;