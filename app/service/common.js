'use strict';

const Service = require('egg').Service;
const Minio = require('minio')
const fs = require('fs')
const path = require('path')
const dotenv = require("dotenv")
dotenv.config()

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT, // 替换 minio 的访问地址
    port: parseInt(process.env.MINIO_PORT),
    useSSL: true,
    accessKey: process.env.MINIO_ACCESSKEY, // 替换 accessKey
    secretKey: process.env.MINIO_SECRETKEY// 替换 secretKey
});

class CommonService extends Service {

    async tokenValidate(token) {
        return token === process.env.TOKEN ? true : false;
    }

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

    async mkdirSync(dirname) {
        if (fs.existsSync(dirname)) {
            return true;
        } else {
            if (this.service.common.mkdirSync(path.dirname(dirname))) {
                fs.mkdirSync(dirname);
                return true;
            }
        }
        return false
    }
    // upload image to minio
    async upload_img(imgUrl) {
        const filename = imgUrl.split('/').slice(-1)[0];
        const extname = path.extname(filename).toLowerCase();
        if (['.png', '.jpg', '.jpeg', '.gif'].indexOf(extname) !== -1) {
            const localFilePath = await this.service.common.download_url(imgUrl, filename);
            // 获取月份
            const today = new Date();
            const month = today.getMonth() + 1;
            const year = today.getFullYear();
            // 上传指 minio 中
            await minioClient.fPutObject("resource", `img/${year}/${month}/${filename}`, localFilePath, {
                'Content-Type': `image/${extname.split('.')[1]}`,
            }, async (err) => {
                if (err) this.logger.error(err);
                // delete regardless of anything happened.
                fs.unlink(localFilePath, (err) => { if (err) this.logger.error(err); })
            })
            const image = `https://minio.online.njtech.edu.cn/resource/img/${year}/${month}/${filename}`;
            return image;
        } else {
            this.logger.error('only img files are allowed!');
            return false;
        }
    }

    async download_url(url, filename) {
        const { ctx } = this;
        const tempDir = './temp/';
        const filePath = path.join(tempDir, filename);
        const mdStatus = this.service.common.mkdirSync(tempDir);
        if (!mdStatus) {
            this.logger.error('Tempdir Made Error.');
            return false;
        };
        const res = await ctx.curl(url);
        if (res.status === 200) {
            fs.writeFileSync(filePath, res.data, (err) => { if (err) this.logger.error(err); });
            return filePath;
        }
    }
}

module.exports = CommonService;