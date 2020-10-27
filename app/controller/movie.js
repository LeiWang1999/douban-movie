'use strict';

const Controller = require('egg').Controller;

class MovieController extends Controller {
    async index() {
        const { ctx } = this;
        const { doubanId, actorSize, token } = ctx.request.query;
        const tokenValid = await this.service.common.tokenValidate(token);
        if (!tokenValid) ctx.body = {
            msg: "Permission Denied.",
        };
        else {
            let url = await this.service.movie.get_movie_detail_url(doubanId);
            let html = await this.service.common.get_html(url);
            let scoreInfo = await this.service.movie.get_movie_score(html, url);
            let movieDetail = await this.service.movie.get_movie_detail(html);
            movieDetail = await this.service.movie.format_movie_detail(movieDetail, actorSize);
            let res = {
                msg: "获取信息成功！",
                doubanId,
                url,
                scoreInfo,
                movieDetail
            }
            ctx.body = res;
        }
    }
}

module.exports = MovieController;