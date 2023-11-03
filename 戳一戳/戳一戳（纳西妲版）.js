import plugin from '../../lib/plugins/plugin.js'
import { segment } from 'oicq'
import cfg from '../../lib/config/config.js'
import common from '../../lib/common/common.js'
import moment from "moment";
import fetch from 'node-fetch'
import fs from 'fs'
const path = process.cwd()

//在这里设置事件概率,请保证概率加起来小于1，少于1的部分会触发反击
let reply_text = 0.4 //文字回复概率
let reply_img = 0.15 //图片回复概率
let reply_voice = 0.15 //语音回复概率
let mutepick = 0.22 //禁言概率
let example = 0 //拍一拍表情概率
//剩下的0.08概率就是反击
let noiseScale = 0.2  //情感控制
let noiseScaleW = 0.2 //发音时长
let lengthScale = 1 //语速
let sdp_ratio = 0.2 //SDP/DP混合比
// let space = 'https://shikongmengo-vits-uma-genshin-honkai.hf.space/api/generate'
let url = 'https://genshinvoice.top/api'
let uploadRecord = ""
let speaker = "纳西妲" //生成角色
/*
支持角色
丹恒","克拉拉","穹","「信使」","史瓦罗","彦卿","晴霓","杰帕德","素裳","绿芙蓉","罗刹","艾丝妲","黑塔","丹枢","希露瓦","白露","费斯曼","停云","可可利亚","景元","螺丝咕姆","青镞","公输师傅",
"卡芙卡","大毫","驭空","半夏","奥列格","娜塔莎","桑博","瓦尔特","阿兰","伦纳德","佩拉","卡波特","帕姆","帕斯卡","青雀","三月七","刃","姬子","布洛妮娅","希儿","星","符玄","虎克","银狼","镜流",
"「博士」","「大肉丸」","九条裟罗","佐西摩斯","刻晴","博易","卡维","可莉","嘉玛","埃舍尔","塔杰·拉德卡尼","大慈树王","宵宫","康纳","影","枫原万叶","欧菲妮","玛乔丽","珊瑚","田铁嘴","砂糖",
"神里绫华","罗莎莉亚","荒泷一斗","莎拉","迪希雅","钟离","阿圆","阿娜耶","阿拉夫","雷泽","香菱","龙二","「公子」","「白老先生」","优菈","凯瑟琳","哲平","夏洛蒂","安柏","巴达维","式大将","斯坦利",
"毗伽尔","海妮耶","爱德琳","纳西妲","老孟","芙宁娜","阿守","阿祇","丹吉尔","丽莎","五郎","元太","克列门特","克罗索","北斗","埃勒曼","天目十五","奥兹","恶龙","早柚","杜拉夫","松浦","柊千里",
"甘雨","石头","纯水精灵？","羽生田千鹤","莱依拉","菲谢尔","言笑","诺艾尔","赛诺","辛焱","迪娜泽黛","那维莱特","八重神子","凯亚","吴船长","埃德","天叔","女士","恕筠","提纳里","派蒙","流浪者",
"深渊使徒","玛格丽特","珐露珊","琴","瑶瑶","留云借风真君","绮良良","舒伯特","荧","莫娜","行秋","迈勒斯","阿佩普","鹿野奈奈","七七","伊迪娅","博来","坎蒂丝","埃尔欣根","埃泽","塞琉斯","夜兰",
"常九爷","悦","戴因斯雷布","笼钓瓶一心","纳比尔","胡桃","艾尔海森","艾莉丝","菲米尼","蒂玛乌斯","迪奥娜","阿晃","阿洛瓦","陆行岩本真蕈·元素生命","雷电将军","魈","鹿野院平藏","「女士」","「散兵」",
"凝光","妮露","娜维娅","宛烟","慧心","托克","托马","掇星攫辰天君","旁白","浮游水蕈兽·元素生命","烟绯","玛塞勒","百闻","知易","米卡","西拉杰","迪卢克","重云","阿扎尔","霍夫曼","上杉","久利须","嘉良",
"回声海螺","多莉","安西","德沃沙克","拉赫曼","林尼","查尔斯","深渊法师","温迪","爱贝尔","珊瑚宫心海","班尼特","琳妮特","申鹤","神里绫人","艾伯特","萍姥姥","萨赫哈蒂","萨齐因","阿尔卡米","阿贝多",
"anzai","久岐忍","九条镰治","云堇","伊利亚斯","埃洛伊","塞塔蕾","拉齐","昆钧","柯莱","沙扎曼","海芭夏","白术","空","艾文","芭芭拉","莫塞伊思","莺儿","达达利亚","迈蒙","长生","阿巴图伊","陆景和",
"莫弈","夏彦","左然"
*/
let text = ""
let master = "主人"

/*判断是否有枫叶插件，如果有则导入枫叶的高清语音处理方法**/
if (fs.existsSync('plugins/hs-qiqi-plugin/model/uploadRecord.js')) {
    uploadRecord = (await import("../hs-qiqi-plugin/model/uploadRecord.js")).default
}

//定义图片存放路径 默认是Yunzai-Bot/resources/chuochuo
const chuo_path = path + '/resources/chuochuo/';

//图片需要从1开始用数字命名并且保存为jpg或者gif格式，存在Yunzai-Bot/resources/chuochuo目录下
let jpg_number = 35 //输入jpg图片数量
let gif_number = 2 //输入gif图片数量


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


//语音回复文字，不能包含英文，特殊字符和颜文字，生成时间根据文字长度变化，添加文字时请安装我的格式进行添加，不能随意添加出bug我一律不管
let voice = ['看我超级纳西妲旋风！',
    '被戳晕了……轻一点啦！',
    '救命啊，有变态>_<！！！',
    '哼~~~',
    '你戳谁呢！你戳谁呢！！！           o(´^｀)o',
    '是不是要本萝莉揍你一顿才开心啊！！！',
    '唔，这触感有种被兰那罗拿胡萝卜指着的感觉≥﹏≤',
    '不要再戳了！我真的要被你气死了！！！',
    '怎么会有你这么无聊的人啊！！！(￢_￢)',
    '哼，我可是会还手的哦——“所闻遍计！”',
    '把嘴张开（抬起脚）',
    '啊……你戳疼我了Ծ‸Ծ',
    '你干嘛！',
    '我生气了！砸挖撸多!木大！木大木大！',
    '你是不是喜欢我？',
    '朗达哟？',
    '变态萝莉控！',
    '要戳坏掉了>_<',
    '旅行者，你没睡醒吗？一天天就知道戳我',
    '别戳了！在戳就丢你去喂鱼',
    '你戳我干嘛,闲得蛋疼吗?',
    '你刚刚是不是戳我了，你是坏蛋！我要戳回去，哼！！！',
    '手痒痒,老是喜欢戳人。',
    '你戳我,我咬你!',
    '戳来戳去的,真是的... ',
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
    '戳我一下,告诉我你有完没完']

export class chuo extends plugin {
    constructor() {
        super({
            name: '戳一戳',
            dsc: '戳一戳机器人触发效果',
            event: 'notice.group.poke',
            priority: 5000,
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
        logger.info('[戳一戳生效]')
        if (cfg.masterQQ.includes(e.target_id)) {
            if (cfg.masterQQ.includes(e.operator_id)) {
                return;
            }
            e.reply([
                segment.at(e.operator_id),
                `\n你几把谁啊, 竟敢戳我亲爱滴${master}, 胆子好大啊你`,
                segment.image(path + `/resources/chuochuo/生气.gif`),
            ], true)
            await common.sleep(1000);
            e.group.pokeMember(e.operator_id);
            return true
        }
        if (e.target_id == cfg.qq) {
            let count = await redis.get(`Yz:pokecount:`);//${e.group_id}
            let usercount = await redis.get('Yz:pokecount' + e.operator_id + ':')
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
            if (!usercount) {
                await redis.set('Yz:pokecount' + e.operator_id + ':', 1 * 1, { EX: exTime });
            } else {
                await redis.set('Yz:pokecount' + e.operator_id + ':', ++usercount, { EX: exTime, });
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
                let text_number = Math.ceil(Math.random() * word_list['length'])
                await e.reply(word_list[text_number - 1])
            }

            //回复随机图片
            else if (random_type < (reply_text + reply_img)) {

                let photo_number = Math.ceil(Math.random() * (jpg_number + gif_number))

                if (photo_number <= jpg_number) {
                    e.reply(segment.image(chuo_path + photo_number + '.jpg'))
                }
                else {
                    photo_number = photo_number - jpg_number
                    e.reply(segment.image(chuo_path + photo_number + '.gif'))
                }

            }

            //回复随机语音
            else if (random_type < (reply_text + reply_img + reply_voice)) {
                let Text = voice[Math.floor(Math.random() * voice.length)];
                text = `${Text}` //更新合成内容
                logger.info(`合成:${text}`)
                let audioLink = `${url}?speaker=${speaker}&text=${text}&format=mp3&${lengthScale}&noise=${noiseScale}&noisew=${noiseScaleW}&sdp_ratio=${sdp_ratio}`
                fetch(audioLink)
                    .then(responsel => {
                        if (!responsel.ok) {
                            e.reply(`服务器返回状态码异常, ${responsel.status}`)
                            return false;
                        }
                        return responsel.buffer()
                    })
                    .then(async buffer => {
                        await new Promise((resolve, reject) => {
                            fs.writeFile('plugins/example/audo.mp3', buffer, (err) => {
                                if (err) reject(err);
                                else resolve();
                            })
                        })
                        if (fs.existsSync('plugins/hs-qiqi-plugin/model/uploadRecord.js')) {
                            e.reply(await uploadRecord(`plugins/example/audo.mp3`, 0, false))
                            return;
                        } else {
                            e.reply(segment.record('plugins/example/audo.mp3'))
                            return;
                        }
                    })
                    .catch(error => {
                        e.reply(`文件保存错误`)
                        return false;
                    })
            }
            //禁言
            else if (random_type < (reply_text + reply_img + reply_voice + mutepick)) {
                //n种禁言方式，随机选一种
                let mutetype = Math.ceil(Math.random() * 4)
                if (mutetype == 1) {
                    e.reply('我生气了！砸挖撸多!木大！木大木大！')
                    await common.sleep(1000)
                    if (usercount >= 36) {
                        await e.group.muteMember(e.operator_id, 21600)
                    }
                    else {
                        await e.group.muteMember(e.operator_id, 60 * (usercount + 1))
                    }
                }
                else if (mutetype == 2) {
                    e.reply('不！！')
                    await common.sleep(1000);
                    e.reply('准！！')
                    await common.sleep(1000);
                    e.reply('戳！！')
                    await common.sleep(1000);
                    if (usercount >= 36) {
                        await e.group.muteMember(e.operator_id, 21600)
                    }
                    else {
                        await e.group.muteMember(e.operator_id, 60 * (usercount + 1))
                    }
                    await common.sleep(1000);
                    e.reply('所闻遍计！！')
                }
                else if (mutetype == 3) {
                    e.reply('看我超级纳西妲旋风！')
                    await common.sleep(1000)
                    await e.group.pokeMember(e.operator_id)
                    if (usercount >= 36) {
                        await e.group.muteMember(e.operator_id, 21600)
                    }
                    else {
                        await e.group.muteMember(e.operator_id, 60 * (usercount + 1))
                    }
                    await common.sleep(1000);
                }
                else if (mutetype == 4) {
                    e.reply('哼，我可是会还手的哦——“所闻遍计！')
                    await common.sleep(1000)
                    await e.group.pokeMember(e.operator_id)
                    if (usercount >= 36) {
                        await e.group.muteMember(e.operator_id, 21600)
                    }
                    else {
                        await e.group.muteMember(e.operator_id, 60 * (usercount + 1))
                    }
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
/*更新日志：
V1.0 Bate 0.1 10.23 修复了图片发送与语言合成。
V1.0 Bate 0.2 10.29 增加了戳主人相关内容。
V1.0 Bate 0.3 11.01 修复了语言API失效问题
*/