'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, there is a service product by Njtech Mars Studio, you can find document here: just a joke !';
  }
}

module.exports = HomeController;
