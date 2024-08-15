import plugin from '../../lib/plugins/plugin.js'
import { segment } from 'icqq'
import cfg from '../../lib/config/config.js'
import common from '../../lib/common/common.js'
import moment from "moment";
import fetch from 'node-fetch'

// 支持信息详见文件最下方
//在这里设置事件概率,请保证概率加起来小于1，少于1的部分会触发反击
let reply_text = 0.4 //文字回复概率
let reply_img = 0.15 //图片回复概率
let reply_voice = 0.15 //语音回复概率
let mutepick = 0.22 //禁言概率
let example = 0 //拍一拍表情概率
//剩下的0.08概率就是反击
let master = "主人"
let mutetime = 0 //禁言时间设置，单位分钟，如果设置0则为自动递增，如需关闭禁言请修改触发概率为0

//回复文字列表
let word_list = [
    '被戳晕了……轻一点啦！',
    '救命啊，有变态>_<！！！',
    '哼~~~',
    '你戳谁呢！你戳谁呢！！！           o(´^｀)o',
    '唔，这触感有种被兰那罗拿胡萝卜指着的感觉≥﹏≤',
    '不要再戳了！我真的要被你气死了！！！',
    '怎么会有你这么无聊的人啊！！！(￢_￢)',
    '把嘴张开（抬起脚）',
    '啊……你戳疼我了Ծ‸Ծ',
    '你干嘛！',
    '你是不是喜欢我？',
    '朗达哟？',
    '变态萝莉控！',
    '要戳坏掉了>_<',
    '旅行者，你没睡醒吗？一天天就知道戳我',
    '别戳了！在戳就丢你去喂鱼',
    '你戳我干嘛,闲得蛋疼吗?',
    '手痒痒,老是喜欢戳人。',
    '你戳我,我咬你!',
    '戳来戳去,真是的... ',
    '戳我也没用,改变不了你单身的事实。',
    '戏精,你戳我有完没完?',
    '戳我干嘛,要不要脸啊你!',
    '戳人家干嘛,难道我长得很好戳?',
    '戳完了,满足你的戳癖了吧!',
    '戳我啊,等会儿我报复,就不止戳一戳那么简单!',
    '你戳我,是想逗我开心吗?那我很开心噢!',
    '没事找事,真是的',
    '拜托,旅行者你能不能消停会?',
    '行了行了,戳完了没?闹腾完了没?',
    '你再戳,纳西妲要生气了哦',
    '惹不起,躲得起,您别老戳人家了行不?',
    '戳我一下,告诉我你有完没完',];

let ciku_ = [
    "纳西妲今天已经被戳了_num_次啦，休息一下好不好",
    "纳西妲今天已经被戳了_num_次啦，有完没完！",
    "纳西妲今天已经被戳了_num_次啦，要戳坏掉了！",
    "纳西妲今天已经被戳了_num_次啦，别戳了!!!",
    "纳西妲今天已经被戳了_num_次啦，不准戳了！！！",
    "纳西妲今天已经被戳了_num_次啦，再戳就坏了！",
];

export class chuo extends plugin {
    constructor() {
        super({
            name: '戳一戳',
            dsc: '戳一戳机器人触发效果',
            event: 'notice.group.poke',
            priority: 100,
            rule: [
                {
                    /** 命令正则匹配 */
                    fnc: 'chuoyichuo'
                }
            ]
        }
        )
    }


    async chuoyichuo(e) {
        if (cfg.masterQQ.includes(e.target_id)) {
            logger.info('[戳主人生效]')
            if (cfg.masterQQ.includes(e.operator_id) || e.self_id == e.operator_id) {
                return;
            }
            fetch("https://api.xingdream.top/API/poke.php?status=angry").then(Response => Response.json()).then(data => {
                if (data) {
                    if (data.status == 200) {
                        try {
                            e.reply([
                                segment.at(e.operator_id),
                                `\n你几把谁啊, 竟敢戳我亲爱滴${master}, 胆子好大啊你`,
                                segment.image(data.link),
                            ], true)
                            common.sleep(1000);
                            e.group.pokeMember(e.operator_id);
                            return true
                        }
                        catch (err) {
                            e.reply('图片获取失败，请检查网络链接或联系开发者。');
                        }
                    }
                    else {
                        e.reply(`获取图链失败，错误码：${data.status}`);
                    }
                }
                else {
                    e.reply('图片api异常。');
                }
            })
        }
        if (e.target_id == e.self_id) {
            logger.info('[戳一戳生效]')
            let count = await redis.get(`Yz:pokecount:`);
            let group = Bot.pickGroup(e.group_id);
            let usercount = mutetime - 1
            if (mutetime == 0) {
                usercount = await redis.get('Yz:pokecount' + e.operator_id + ':')
            }

            // 当前时间
            let time = moment(Date.now())
                .add(1, "days")
                .format("YYYY-MM-DD 00:00:00");
            // 到明日零点的剩余秒数
            let exTime = Math.round(
                (new Date(time).getTime() - new Date().getTime()) / 1000
            );
            if (!count) {
                await redis.set(`Yz:pokecount:`, 1 * 1, { EX: exTime });//${e.group_id}
            } else {
                await redis.set(`Yz:pokecount:`, ++count, {
                    EX: exTime,
                });
            }
            if (mutetime == 0) {
                if (!usercount) {
                    await redis.set('Yz:pokecount' + e.operator_id + ':', 1 * 1, { EX: exTime });
                } else {
                    await redis.set('Yz:pokecount' + e.operator_id + ':', ++usercount, { EX: exTime, });
                }
            }
            if (Math.ceil(Math.random() * 100) <= 20 && count >= 10) {
                let conf = cfg.getGroup(e.group_id);
                e.reply([
                    `${ciku_[Math.round(Math.random() * (ciku_.length - 1))]}`
                        .replace("_name_", conf.botAlias[0])
                        .replace("_num_", count),
                ]);
                return true;
            }
            //生成0-100的随机数
            let random_type = Math.random()

            //回复随机文字
            if (random_type < reply_text) {
                logger.info('[回复随机文字生效]')
                let text_number = Math.ceil(Math.random() * word_list['length'])
                e.reply(word_list[text_number - 1])
            }

            //回复随机图片
            else if (random_type < (reply_text + reply_img)) {
                logger.info('[回复随机图片生效]')
			  fetch("https://api.xingdream.top/API/poke.php").then(Response => Response.json()).then(data => {
                        if (data) {
                            if (data.status == 200) {
                                try {
                                    e.reply([segment.image(data.link)])
                                }
                                catch (err) {
                                    e.reply('图片获取失败，请检查网络链接或联系开发者。');
                                }
                            }
                            else {
                                e.reply(`获取图链失败，错误码：${data.status}`);
                            }
                        }
                        else {
                            e.reply('图片api异常。');
                        }
                    })
            }

            //回复随机语音
            else if (random_type < (reply_text + reply_img + reply_voice)) {
                logger.info('[回复随机语音生效]')
                e.reply(segment.record('https://api.xingdream.top/API/pokevoice.php'));
            }
            //禁言
            else if (random_type < (reply_text + reply_img + reply_voice + mutepick)) {
            	if(cfg.masterQQ.includes(e.operator_id) || !group.is_admin){
            		fetch("https://api.xingdream.top/API/poke.php").then(Response => Response.json()).then(data => {
                        if (data) {
                            if (data.status == 200) {
                                try {
                                    e.reply([segment.image(data.link)])
                                }
                                catch (err) {
                                    e.reply('图片获取失败，请检查网络链接或联系开发者。');
                                }
                            }
                            else {
                                e.reply(`获取图链失败，错误码：${data.status}`);
                            }
                        }
                        else {
                            e.reply('图片api异常。');
                        }
                    })
            	}
                logger.info('[禁言生效]')
                logger.info(e.operator_id + `将要被禁言${usercount + 1}分钟`)
                if (usercount >= 36) {
                    e.reply('我生气了！小黑屋冷静冷静')
                    await common.sleep(1000)
                    await e.group.muteMember(e.operator_id, 21600)
                    return
                }
                //n种禁言方式，随机选一种
                let mutetype = Math.ceil(Math.random() * 4)
                if (mutetype == 1) {
                    e.reply('我生气了！砸挖撸多!木大！木大木大！')
                    await common.sleep(1000)
                    await e.group.muteMember(e.operator_id, 60 * (usercount + 1))
                }
                if (mutetype == 2) {
                    e.reply('不！！')
                    await common.sleep(1000);
                    e.reply('准！！')
                    await common.sleep(1000);
                    e.reply('戳！！')
                    await common.sleep(1000);
                    await e.group.muteMember(e.operator_id, 60 * (usercount + 1))
                    await common.sleep(1000);
                    e.reply('所闻遍计！！')
                    return
                }
                if (mutetype == 3) {
                    e.reply('看我超级纳西妲旋风！')
                    await common.sleep(1000)
                    await e.group.pokeMember(e.operator_id)
                    await e.group.muteMember(e.operator_id, 60 * (usercount + 1))
                    await common.sleep(1000);
                    return
                }
                if (mutetype == 4) {
                    e.reply('哼，我可是会还手的哦——“所闻遍计！')
                    await common.sleep(1000)
                    await e.group.pokeMember(e.operator_id)
                    await e.group.muteMember(e.operator_id, 60 * (usercount + 1))
                    return
                }
            }

            //拍一拍表情包
            else if (random_type < (reply_text + reply_img + reply_voice + mutepick + example)) {
                await e.reply(await segment.image(`http://ovooa.com/API/face_pat/?QQ=${e.operator_id}`))
            }

            //反击
            else {
                let mutetype = Math.round(Math.random() * 3)
                if (mutetype == 1) {
                    e.reply('吃我一拳喵！')
                    await common.sleep(1000)
                    await e.group.pokeMember(e.operator_id)
                }
                else if (mutetype == 2) {
                    e.reply('你刚刚是不是戳我了，你是坏蛋！我要戳回去，哼！！！')
                    await common.sleep(1000)
                    await e.group.pokeMember(e.operator_id)
                }
                else if (mutetype == 3) {
                    e.reply('是不是要本萝莉揍你一顿才开心啊！！！')
                    await common.sleep(1000)
                    await e.group.pokeMember(e.operator_id)
                }
            }

        }

    }

}
