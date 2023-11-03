import plugin from '../../lib/plugins/plugin.js'
import fetch from 'node-fetch'

let apiLink = 'https://api.boxmoe.com/random.php?return=json'
let bingphotoapi = 'https://api.paugram.com/bing/'

export class dayPhoto extends plugin {
    constructor() {
        super({
            name: '每日一图',
            dsc: '每日一图',
            event: 'message',
            priority: 30,
            rule: [
                {
                    reg: '^#?(每日)?一图$',
                    fnc: 'bing'
                },
                {
                    reg: '^#?来份二次元$',
                    fnc: 'photo'
                },
            ]
        })
    }
    async photo(e) {
        let response = await fetch(apiLink);
        const data = await response.json();
        if (!data) {
            e.reply(`获取图片地址失败`)
            return
        }
        e.reply(segment.image(data.imgurl))
    }
    async bing(e) {
        e.reply(segment.image(bingphotoapi))
    }
}