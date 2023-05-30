import plugin from '../../../lib/plugins/plugin.js'
import gsCfg from '../model/gsCfg.js'
import MysSign from '../MiaoSign/mysSign.js'
import Note from "../MiaoSign/GenShinDailyNote.js";
import puppeteer from "../../../lib/puppeteer/puppeteer.js";

gsCfg.cpCfg('mys', 'set')

export class GenshinSignDailyNote extends plugin {
    constructor() {
        super({
            name: '原神体力与签到',
            dsc: '原神体力与签到',
            event: 'message',
            priority: -1,
            rule: [
                {
                    reg: '^(#签到|#*米游社(自动)*签到)(force)*$',
                    fnc: 'sign'
                },
                {
                    reg: '^#(全部签到|签到任务)(force)*$',
                    permission: 'master',
                    fnc: 'signTask'
                },
                {
                    reg: '^#*(开启|关闭|取消)(米游社|自动|原神)*签到$',
                    fnc: 'signClose'
                }
            ]
        })

        this.set = gsCfg.getConfig('mys', 'set')

        /** 定时任务 */
        this.task = {
            name: '米游社原神签到任务',
            cron: '10 0 0,4,8,12,16,20 * * *',//修改说明↓↓↓↓↓↓↓
            // 每4小时执行一次，【0,4,8,12,16,20】代表0点、4点、8点、12点、16点、20点，删除哪个点就不执行哪个点
            //前面的10 0 代表每天0点10分执行，后面的 * * *代表每天都执行，建议不要修改
            fnc: () => {
                this.SelectSign(true)
            }
        }
    }


    /** #签到 */
    async sign() {
        await MysSign.sign(this.e)
    }

    /** 自动签到入口 */
    async SelectSign(isAuto = false) {
        if (Bot.uin !== 2374221304) {
            return true
        }
        await this.signTask(isAuto)
    }

    /** 签到任务 */
    async signTask(isAuto = false) {
        let mysSign = new MysSign(this.e)
        await mysSign.signTask(!!this?.e?.msg, isAuto)
    }

    async signClose() {
        let mysSign = new MysSign(this.e)
        await mysSign.signClose()
    }
}
