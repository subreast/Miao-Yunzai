import EventListener from '../listener/listener.js'
import cfg from '../config/config.js'
import common from '../common/common.js'

/**
 * 监听上线事件
 */
export default class onlineEvent extends EventListener {
  constructor() {
    super({
      event: 'system.online',
      once: true
    })
  }

  /** 默认方法 */
  async execute(e) {
    logger.mark('----^_^----')
    logger.mark(logger.green(`Yunzai-Bot 上线成功 版本v${cfg.package.version}`))
    // logger.mark('-----------')
    /** 加载插件 */
    await this.plugins.load()

    /** 上线通知 */
    this.loginMsg()
  }

  async loginMsg() {
    if (!cfg.bot.online_msg) return
    if (!cfg.masterQQ || !cfg.masterQQ[0]) return
    let key = `Yz:loginMsg:${Bot.uin}`
    if (await redis.get(key)) return
    let msg = `Yunzai-Bot v${cfg.package.version}已上线`
    redis.set(key, '1', { EX: cfg.bot.online_msg_exp })
    setTimeout(() => common.relpyPrivate(cfg.masterQQ[0], msg), 1000)
  }
}
