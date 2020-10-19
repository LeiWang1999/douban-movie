'use strict';

const Controller = require('egg').Controller;

class MovieController extends Controller {
    async index() {
        const { ctx } = this;
        const { doubanId } = ctx.request.query;
        let movie_detail_url = await this.service.common.get_movie_detail_url(doubanId);
        ctx.body = context;
    }
}

module.exports = MovieController;