'use strict'

const Service = require('egg').Service;
const cheerio = require('cheerio');


const movie_detail_url = "https://movie.douban.com/subject/"
class MovieService extends Service {

    async get_movie_detail_url(doubanId) {
        return movie_detail_url + doubanId + '/';
    };

    async get_movie_detail(html, imageUpload) {
        const cheerioModel = cheerio.load(html);
        // Parse Banner Info
        const title = await this.service.movie.parse_title(cheerioModel);
        // Parse Image
        let image = await this.service.movie.parse_image(cheerioModel);
        if (imageUpload == 'minio') {
            image = await this.service.common.upload_img(image);
        }
        // Parse Year
        const year = await this.service.movie.parse_year(cheerioModel);
        // Parse Media Info
        const mediaInfo = cheerioModel('#info')[0];
        // Parse Intro
        const { directorsIndex, actorsIndex, aliasIndex } = await this.service.movie.parse_media_info_index(mediaInfo);
        const directors = await this.service.movie.parse_directors(mediaInfo, directorsIndex);
        const actors = await this.service.movie.parse_actors(mediaInfo, actorsIndex);
        // Parse aliases
        const aliases = await this.service.movie.parse_aliases(mediaInfo, aliasIndex);
        // Parse Intro
        const intro = await this.service.movie.parse_intro(cheerioModel);

        // Parse Score
        return {
            title,
            year,
            image,
            directors,
            actors,
            aliases,
            intro
        }
    }
    async get_movie_score(html, url) {
        const cheerioModel = cheerio.load(html);
        let score = null, commentCount = null, scoreInfo = '', commentsUrl = '';
        try {
            const scorespan = cheerioModel('#interest_sectl').find('strong')[0].children[0];
            if (scorespan) {
                score = scorespan.data;
                commentCount = cheerioModel('span[property="v:votes"]')[0].children[0].data;
            }
            commentsUrl = url + 'comments' + '/';

        } catch (error) {
        }
        scoreInfo = {
            score,
            commentCount,
            commentsUrl
        }
        return scoreInfo;
    }
    // Format
    async format_movie_detail(movieDetail, actorsSize) {
        let movieDetail_format = movieDetail;
        let { actors, intro, year } = movieDetail;
        if (!actorsSize) actorsSize = 5;
        year = year.replace(/[()]/g, '');
        movieDetail_format.year = parseInt(year);
        actors = actors.split('/');
        actors = actors.slice(0, actorsSize);
        actors = actors.join('/');
        movieDetail_format.actors = actors;
        intro = intro.replace(/\n/g, '');
        intro = intro.replace(/(^\s*)|(\s*$)/g, '');
        intro = intro.replace(/(^\s+)|(\s+$)|\s+/g, '');
        movieDetail_format.intro = intro;
        return movieDetail_format;
    }
    // Parse title
    async parse_title(cheerioModel) {
        let title = '';
        try {
            title = cheerioModel('#content').find('h1').find('span')[0].children[0].data;
        } catch (error) {

        }
        return title;
    }
    // Parse year
    async parse_year(cheerioModel) {
        let year = '';
        try {
            year = cheerioModel('#content').find('h1').find('span')[1].children[0].data;
        } catch (error) {

        }
        return year;
    }
    // Parse Image
    async parse_image(cheerioModel) {
        let image = '';
        try {
            image = cheerioModel('#mainpic').find('img')[0].attribs.src;
        } catch (error) {

        }
        return image;
    }
    // Parse directors、Actors、genre... span index
    async parse_media_info_index(mediaInfo) {
        let directorsIndex = null, scenaristsIndex = null, actorsIndex = null, aliasIndex = null;
        let genreIndex = []
        try {
            for (let index = 0; index < mediaInfo.children.length; index++) {
                const element = mediaInfo.children[index];
                if (element.type == 'tag' && element.name == 'span') {
                    // Try TypeA
                    try {
                        if (element.children[0].children[0].data == '导演') {
                            directorsIndex = index;
                        } else if (element.children[0].children[0].data == '编剧') {
                            scenaristsIndex = index;
                        }

                    } catch (error) { }
                    // Try TypeB
                    try {
                        if (element.children[0].type == 'text' && element.children[0].data == '又名:') aliasIndex = index;
                    } catch (error) { }

                    // Try TypeC
                    try {
                        if (element.attribs.class == 'actor') {
                            actorsIndex = index;
                        } else if (element.attribs.property == 'v:genre') {
                            genreIndex.push(index);
                        }
                    } catch (error) { }
                }
            }
        } catch (error) {

        }

        return {
            directorsIndex,
            scenaristsIndex,
            actorsIndex,
            genreIndex,
            aliasIndex
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
    // Parse aliases
    async parse_aliases(mediaInfo, aliasIndex) {
        let aliases = '';
        let alias_span = null;
        if (!aliasIndex) return aliases;
        alias_span = mediaInfo.children[aliasIndex];
        if (!alias_span) return aliases;
        if (alias_span.next.type == 'text') aliases = alias_span.next.data;
        return aliases;
    }
    // Parse Intro
    async parse_intro(cheerioModel) {
        let intro = '';
        try {
            const intro_span = cheerioModel('#content').find('span[property="v:summary"]')[0];
            intro_span.children.forEach(element => {
                if (element.type == 'text') intro += element.data;
                else if (element.type == 'tag' && element.name == 'br') intro += '\n';
            })
        } catch (error) {

        }
        return intro;
    }

}

module.exports = MovieService;