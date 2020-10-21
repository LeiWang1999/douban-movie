'use strict';

const Controller = require('egg').Controller;

class MovieController extends Controller {
    async index() {
        const { ctx } = this;
        const { doubanId } = ctx.request.query;
        let url = await this.service.movie.get_movie_detail_url(doubanId);
        let html = await this.service.common.get_html(url);
        let movieDetail = await this.service.movie.get_movie_detail(html);
        movieDetail = await this.service.movie.format_movie_detail(movieDetail);
        let res = {
            doubanId,
            url,
            movieDetail,
        }
        ctx.body = res;
    }
}

module.exports = MovieController;