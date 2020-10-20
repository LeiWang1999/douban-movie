'use strict';

const Service = require('egg').Service;


class CommonService extends Service {

    async get_html(url) {
        const { ctx } = this;
        let headers = {
            'Host': 'movie.douban.com',
            'Cache-Control': 'no-cache',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:58.0) Gecko/20100101 Firefox/58.0',
            'Referer': 'https://www.douban.com',
            'Cookie': 'bid=L-u7svjqTFE; ll="118159"'
        }
        let options = {
            headers,
        }
        let res = await ctx.curl(url, options);
        const resultHtml = res.data.toString();
        return resultHtml;
    }
}

module.exports = CommonService;