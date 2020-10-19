'use strict';

const Service = require('egg').Service;


const movie_detail_url = "https://movie.douban.com/subject/"

class CommonService extends Service {

    async get_movie_detail_url(doubanId) {
        return movie_detail_url + doubanId;
    };

    async get_context(url) {
        const { ctx } = this.ctx;

    }
}

module.exports = CommonService;