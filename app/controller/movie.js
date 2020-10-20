'use strict';

const Controller = require('egg').Controller;

class MovieController extends Controller {
    async index() {
        const { ctx } = this;
        const { doubanId } = ctx.request.query;
        let url = await this.service.movie.get_movie_detail_url(doubanId);
        let html = await this.service.common.get_html(url);
        let res = await this.service.movie.get_movie_detail(html);
        ctx.body = res;
    }
}

module.exports = MovieController;