import YAML from 'yaml'
import fs from 'node:fs'
import chokidar from 'chokidar'

/** 配置文件 */
class Cfg {

  constructor() {
    this.config = {}
    /** 监听文件 */
    this.watcher = { config: {}, defSet: {} }
    /* 初始化配置 */
    this.initCfg()
  }

  /** 初始化配置，生成用户配置文件 */
  initCfg() {
    /** 用户配置文件路径 */
    let path = './config/config/'
    /** 默认配置文件路径 */
    let pathDef = './config/default_config/'
    const files = fs.readdirSync(pathDef).filter(file => file.endsWith('.yaml'))
    for (let file of files) {
      if (!fs.existsSync(`${path}${file}`)) {
        fs.copyFileSync(`${pathDef}${file}`, `${path}${file}`)
      }
    }
  }

  /** 获取qq配置 */
  get bot() {
    let bot = this.getConfig('bot')
    let defbot = this.getdefSet('bot')
    bot = { ...defbot, ...bot }
    bot.platform = this.getConfig('qq').platform
    bot.data_dir = process.cwd() + '/data'
    if (!bot.ffmpeg_path) delete bot.ffmpeg_path
    if (!bot.ffprobe_path) delete bot.ffprobe_path
    return bot
  }

  /** 机器人qq号 */
  get qq() {
    return Number(this.getConfig('qq').qq)
  }

  /** 机器人qq号密码 */
  get pwd() {
    return this.getConfig('qq').pwd
  }

  /** 获取主人qq */
  get masterQQ() {
    let masterQQ = this.getConfig('other').masterQQ || []
    if (Array.isArray(masterQQ)) {
      masterQQ.forEach(qq => { qq = String(qq) })
    } else {
      masterQQ = [String(masterQQ)]
    }
    return masterQQ
  }


  get other() {
    return this.getConfig('other')
  }

  /** 读取package文件 */
  get package() {
    if (this._package) return this._package
    this._package = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
    return this._package
  }

  /** 群配置 */
  getGroup(groupId = '') {
    let config = this.getConfig('group')
    let defCfg = this.getdefSet('group')
    if (config[groupId]) {
      return { ...defCfg.default, ...config.default, ...config[groupId] }
    }
    return { ...defCfg.default, ...config.default }
  }

  /** other配置 */
  getOther() {
    let def = this.getdefSet('other')
    let config = this.getConfig('other')
    return { ...def, ...config }
  }

  /**
   * 读取默认配置文件
   * @param {*} name 文件名
   * @returns 
   */
  getdefSet(name) {
    return this.getYaml('default_config', name)
  }

  /**
   * 读取用户配置文件
   * @param {*} name 文件名
   * @returns 
   */
  getConfig(name) {
    return this.getYaml('config', name)
  }

  /**
   * 读取Yaml文件
   * @param {*} type config/default_config
   * @param {*} name 文件名
   * @returns 
   */
  getYaml(type, name) {
    let file = `./config/${type}/${name}.yaml`
    let key = `${type}.${name}`
    if (this.config[key]) return this.config[key]
    this.config[key] = YAML.parse(fs.readFileSync(file, 'utf8'))
    this.watch(file, name, type)
    return this.config[key]
  }

  /**
   * 监听文件和目录的变化。它可以在文件或目录被创建、修改、删除等事件发生时触发回调函数
   * @param {*} file 文件路径
   * @param {*} name 文件名
   * @param {*} type config/default_config
   * @returns 
   */
  watch(file, name, type = 'default_config') {
    let key = `${type}.${name}`
    if (this.watcher[key]) return
    const watcher = chokidar.watch(file)
    watcher.on('change', path => {
      delete this.config[key]
      if (typeof Bot == 'undefined') return
      logger.mark(`[修改配置文件][${type}][${name}]`)
      if (this[`change_${name}`]) {
        this[`change_${name}`]()
      }
    })
    this.watcher[key] = watcher
  }

  /** qq发生改变 */
  change_qq() {
    if (process.argv.includes('login') || !this.qq) return
    logger.info('修改qq或密码，请手动重启')
  }

  /** 日志等级发生改变 */
  async change_bot() {
    /** 修改日志等级 */
    let log = await import('./log.js')
    log.default()
  }

}

export default new Cfg()
