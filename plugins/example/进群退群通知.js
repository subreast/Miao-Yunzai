import plugin from '../../lib/plugins/plugin.js'
export class newcomer extends plugin {
  constructor () {
    super({
      name: '入群欢迎',
      dsc: '新人入群欢迎',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'notice.group.increase',
      priority: 5000
    })
  }

  /** 接受到消息都会执行一次 */
  async accept () {
    /** 定义入群欢迎内容 */
    let msg = '欢迎新人！\n可发送【#帮助】【#喵喵帮助】【*帮助】【#图鉴帮助】【#群管帮助】【#土块帮助】查看各功能使用说明\n发现各种bug或者问题可以加主人(1556841)好友反馈'
    /** 冷却cd 30s */
    let cd = 30

    if (this.e.user_id == Bot.uin) return

    /** cd */
    let key = `Yz:newcomers:${this.e.group_id}`
    if (await redis.get(key)) return
    redis.set(key, '1', { EX: cd })

    /** 回复 */
    await this.reply([
      segment.at(this.e.user_id),
      // segment.image(),
      msg
    ])
  }
}

export class outNotice extends plugin {
  constructor () {
    super({
      name: '退群通知',
      dsc: 'xx退群了',
      event: 'notice.group.decrease'
    })

    /** 退群提示词 */
    this.tips = '退群了'
  }

  async accept () {
    if (this.e.user_id == Bot.uin) return

    let name, msg
    if (this.e.member) {
      name = this.e.member.card || this.e.member.nickname
    }

    if (name) {
      msg = `${name}(${this.e.user_id}) ${this.tips}`
    } else {
      msg = `${this.e.user_id} ${this.tips}`
    }
    logger.mark(`[退出通知]${this.e.logText} ${msg}`)
    await this.reply(msg)
  }
}