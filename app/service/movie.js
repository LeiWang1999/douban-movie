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
        const mediaInfo = cheerioModel('#info')[0];
        const directors = await this.service.movie.parse_directors(mediaInfo);
        const actors = await this.service.movie.parse_actors(mediaInfo);
        // console.log(directors)
        return directors
        // console.log(cheerioModel('#info')[0].children[1].children[2].children[0].children[0].data);
    }

    async parse_directors(mediaInfo) {
        let directors = '';
        const span_list = mediaInfo.children[1].children[2].children;
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
        const span_list = mediaInfo.children[7].children[2].children;
        console.log(span_list)
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