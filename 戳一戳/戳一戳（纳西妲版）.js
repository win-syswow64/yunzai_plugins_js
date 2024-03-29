import plugin from '../../lib/plugins/plugin.js'
import { segment } from 'oicq'
import cfg from '../../lib/config/config.js'
import common from '../../lib/common/common.js'
import moment from "moment";
import fetch from 'node-fetch'
import fs from 'fs'
const path = process.cwd()

// 支持信息详见文件最下方
//在这里设置事件概率,请保证概率加起来小于1，少于1的部分会触发反击
let reply_text = 0.4 //文字回复概率
let reply_img = 0.15 //图片回复概率
let reply_voice = 0.15 //语音回复概率
let mutepick = 0.22 //禁言概率
let example = 0 //拍一拍表情概率
//剩下的0.08概率就是反击
let ttsapichoose = 'api1' //api设置
let noiseScale = 0.2  //情感控制
let noiseScaleW = 0.2 //发音时长
let lengthScale = 1 //语速
let sdp_ratio = 0.2 //SDP/DP混合比
let language = 'ZH'
let api1url = 'https://api.lolimi.cn/API/yyhc/y.php'
let api2url = 'https://bv2.firefly.matce.cn/run/predict'
let uploadRecord = ""
let speakerapi1 = "纳西妲" //生成角色api1
let speakerapi2 = "纳西妲_ZH" //生成角色api2
let text = ""
let master = "主人"
let mutetime = 1 //禁言时间设置，单位分钟，如果设置0则为自动递增，如需关闭禁言请修改触发概率为0

//定义图片存放路径 默认是Yunzai-Bot/resources/chuochuo
const chuo_path = path + '/resources/chuochuo/';

//图片需要从1开始用数字命名并且保存为jpg或者gif格式，存在Yunzai-Bot/resources/chuochuo目录下
let jpg_number = 80 //输入jpg图片数量
let gif_number = 3 //输入gif图片数量

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
        if (cfg.masterQQ.includes(e.target_id)) {
            logger.info('[戳主人生效]')
            if (cfg.masterQQ.includes(e.operator_id) || e.self_id == e.operator_id) {
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
        if (e.target_id == e.self_id) {
            logger.info('[戳一戳生效]')
            let count = await redis.get(`Yz:pokecount:`);//${e.group_id}
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
                logger.info('[回复随机语音生效]')
                let Text = voice[Math.floor(Math.random() * voice.length)];
                text = `${Text}` //更新合成内容
                logger.info(`合成:${text}`)
                let audiourl = ''
                if (ttsapichoose == 'api1') {
                    let audioLink = `${api1url}?msg=${text}&speaker=${speakerapi1}&Length=${lengthScale}&noisew=${noiseScaleW}&sdp=${sdp_ratio}&noise=${noiseScale}&yy='中'`
                    let responsel = await fetch(audioLink)
                    responsel = await responsel.json()
                    audiourl = responsel.music
                } else if (ttsapichoose == 'api2') {
                    let data = JSON.stringify({
                        "data": [`${text}`, `${speakerapi2}`, sdp_ratio, noiseScale, noiseScaleW, lengthScale, `${language}`, true, 1, 0.2, null, "Happy", "", "", 0.7],
                        "event_data": null,
                        "fn_index": 0,
                        "session_hash": "v141oxnc02o"
                    })
                    let responsel = await fetch(api2url
                        , {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
                            'Accept-Language': 'en-US,en;q=0.5',
                            'method': 'POST',
                            'headers': {
                                'Content-Type': 'application/json',
                                'Content-Length': data.length
                            },
                            'body': data
                        }
                    )
                    responsel = await responsel.json()
                    audiourl = `https://bv2.firefly.matce.cn/file=${responsel.data[1].name}`
                } else {
                    e.reply("API选择错误，已重置为api1")
                    ttsapichoose = 'api1'
                    return;
                }
                fetch(audiourl)
                    .then(responsel => {
                        if (!responsel.ok) {
                            e.reply(`服务器返回状态码异常, ${responsel.status}`)
                            return false;
                        }
                        return responsel.buffer()
                    })
                    .then(async buffer => {
                        await new Promise((resolve, reject) => {
                            fs.writeFile('plugins/example/audo.wav', buffer, (err) => {
                                if (err) reject(err);
                                else resolve();
                            })
                        })
                        e.reply(segment.record('plugins/example/audo.wav'))
                        return;
                    })
                    .catch(error => {
                        e.reply(`文件保存错误`)
                        return false;
                    })
            }
            //禁言
            else if (random_type < (reply_text + reply_img + reply_voice + mutepick)) {
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
/*更新日志：
V1.0 Bate 0.1 10.23 修复了图片发送与语音合成。
V1.1 Bate 0.1 10.29 增加了戳主人相关内容。
V1.1 Bate 0.2 11.01 修复了语音API失效问题
V1.1 Bate 0.3 11.06 适配新版语音API
V1.1 Bate 0.4 11.17 修复了机器人戳主人会触发戳主人功能的BUG
V1.2 Bate 0.1 12.14 1.适配了新的语音API。2.语音API支持双语音API
V1.2 Bate 0.1 12.19 1.修复语音API。2.新增更多DeBUG信息。
*/
/*
api1支持角色
空, 荧, 派蒙, 纳西妲, 阿贝多, 温迪, 枫原万叶, 钟离, 荒泷一斗, 八重神子, 艾尔海森, 提纳里, 迪希雅, 卡维, 宵宫, 莱依拉, 赛诺, 诺艾尔, 托马, 凝光, 莫娜, 北斗, 神里绫华, 雷电将军, 
芭芭拉, 鹿野院平藏, 五郎, 迪奥娜, 凯亚, 安柏, 班尼特, 琴, 柯莱, 夜兰, 妮露, 辛焱, 珐露珊, 魈, 香菱, 达达利亚, 砂糖, 早柚, 云堇, 刻晴, 丽莎, 迪卢克, 烟绯, 重云, 珊瑚宫心海, 胡桃,
可莉, 流浪者, 久岐忍, 神里绫人, 甘雨, 戴因斯雷布, 优菈, 菲谢尔, 行秋, 白术, 九条裟罗, 雷泽, 申鹤, 迪娜泽黛, 凯瑟琳, 多莉, 坎蒂丝, 萍姥姥, 罗莎莉亚, 留云借风真君, 绮良良, 瑶瑶, 七七, 
奥兹, 米卡, 夏洛蒂, 埃洛伊, 博士, 女士, 大慈树王, 三月七, 娜塔莎, 希露瓦, 虎克, 克拉拉, 丹恒, 希儿, 布洛妮娅, 瓦尔特, 杰帕德, 佩拉, 姬子, 艾丝妲, 白露, 星, 穹, 桑博, 伦纳德, 停云, 罗刹, 
卡芙卡, 彦卿, 史瓦罗, 螺丝咕姆, 阿兰, 银狼, 素裳, 丹枢, 黑塔, 景元, 帕姆, 可可利亚, 半夏, 符玄, 公输师傅, 奥列格, 青雀, 大毫, 青镞, 费斯曼, 绿芙蓉, 镜流, 信使, 丽塔, 失落迷迭, 缭乱星棘,
 伊甸, 伏特加女孩, 狂热蓝调, 莉莉娅, 萝莎莉娅, 八重樱, 八重霞, 卡莲, 第六夜想曲, 卡萝尔, 姬子, 极地战刃, 布洛妮娅, 次生银翼, 理之律者, 真理之律者, 迷城骇兔, 希儿, 魇夜星渊, 黑希儿, 
 帕朵菲莉丝, 天元骑英, 幽兰黛尔, 德丽莎, 月下初拥, 朔夜观星, 暮光骑士, 明日香, 李素裳, 格蕾修, 梅比乌斯, 渡鸦, 人之律者, 爱莉希雅, 爱衣, 天穹游侠, 琪亚娜, 空之律者, 终焉之律者, 薪炎之律者,
  云墨丹心, 符华, 识之律者, 维尔薇, 始源之律者, 芽衣, 雷之律者, 苏莎娜, 阿波尼亚, 陆景和, 莫弈, 夏彦, 左然
*/
/*
api2支持角色
"埃德_ZH","塔杰·拉德卡尼_ZH","行秋_ZH","深渊使徒_ZH","凯瑟琳_ZH","常九爷_ZH","神里绫人_ZH","丽莎_ZH","纯水精灵?_ZH","宛烟_ZH","重云_ZH","悦_ZH","莱依拉_ZH","鹿野奈奈_ZH",
"式大将_ZH","白术_ZH","埃舍尔_ZH","莫娜_ZH","优菈_ZH","琴_ZH","凯亚_ZH","西拉杰_ZH","凝光_ZH","石头_ZH","达达利亚_ZH","伊利亚斯_ZH","艾尔海森_ZH","慧心_ZH","「大肉丸」_ZH",
"柊千里_ZH","玛乔丽_ZH","神里绫华_ZH","菲米尼_ZH","甘雨_ZH","掇星攫辰天君_ZH","坎蒂丝_ZH","上杉_ZH","阿尔卡米_ZH","戴因斯雷布_ZH","艾文_ZH","回声海螺_ZH","九条裟罗_ZH",
"迪卢克_ZH","提纳里_ZH","嘉良_ZH","塞塔蕾_ZH","琳妮特_ZH","阿洛瓦_ZH","蒂玛乌斯_ZH","枫原万叶_ZH","丹吉尔_ZH","空_ZH","林尼_ZH","阿守_ZH","七七_ZH","嘉玛_ZH","恶龙_ZH",
"阿巴图伊_ZH","阿佩普_ZH","八重神子_ZH","迪希雅_ZH","迈勒斯_ZH","夜兰_ZH","萨赫哈蒂_ZH","欧菲妮_ZH","笼钓瓶一心_ZH","芭芭拉_ZH","瑶瑶_ZH","天叔_ZH","派蒙_ZH","米卡_ZH",
"玛塞勒_ZH","胡桃_ZH","百闻_ZH","艾莉丝_ZH","安柏_ZH","阿晃_ZH","萨齐因_ZH","田铁嘴_ZH","烟绯_ZH","海妮耶_ZH","纳比尔_ZH","女士_ZH","诺艾尔_ZH","云堇_ZH","舒伯特_ZH",
"埃勒曼_ZH","九条镰治_ZH","留云借风真君_ZH","言笑_ZH","安西_ZH","珊瑚宫心海_ZH","托克_ZH","哲平_ZH","恕筠_ZH","拉赫曼_ZH","久利须_ZH","天目十五_ZH","妮露_ZH","莺儿_ZH",
"佐西摩斯_ZH","鹿野院平藏_ZH","温迪_ZH","菲谢尔_ZH","anzai_ZH","可莉_ZH","刻晴_ZH","克列门特_ZH","阿扎尔_ZH","班尼特_ZH","伊迪娅_ZH","巴达维_ZH","深渊法师_ZH","赛诺_ZH",
"大慈树王_ZH","拉齐_ZH","海芭夏_ZH","香菱_ZH","康纳_ZH","阿祇_ZH","卡维_ZH","博来_ZH","斯坦利_ZH","霍夫曼_ZH","北斗_ZH","阿拉夫_ZH","陆行岩本真蕈·元素生命_ZH","爱贝尔_ZH",
"雷泽_ZH","毗伽尔_ZH","莎拉_ZH","莫塞伊思_ZH","多莉_ZH","珊瑚_ZH","老孟_ZH","宵宫_ZH","钟离_ZH","芙宁娜_ZH","爱德琳_ZH","「女士」_ZH","博易_ZH","长生_ZH","查尔斯_ZH","阿娜耶_ZH",
"流浪者_ZH","辛焱_ZH","德沃沙克_ZH","雷电将军_ZH","羽生田千鹤_ZH","那维莱特_ZH","沙扎曼_ZH","纳西妲_ZH","艾伯特_ZH","龙二_ZH","旁白_ZH","克罗索_ZH","元太_ZH","阿贝多_ZH","萍姥姥_ZH",
"久岐忍_ZH","埃洛伊_ZH","托马_ZH","迪奥娜_ZH","荧_ZH","夏洛蒂_ZH","莱欧斯利_ZH","昆钧_ZH","塞琉斯_ZH","埃泽_ZH","迪娜泽黛_ZH","知易_ZH","玛格丽特_ZH","申鹤_ZH","罗莎莉亚_ZH","娜维娅_ZH",
"珐露珊_ZH","浮游水蕈兽·元素生命_ZH","奥兹_ZH","砂糖_ZH","绮良良_ZH","杜拉夫_ZH","魈_ZH","松浦_ZH","迈蒙_ZH","荒泷一斗_ZH","吴船长_ZH","埃尔欣根_ZH","柯莱_ZH","阿圆_ZH","「白老先生」_ZH",
"五郎_ZH","「博士」_ZH"
支持语言
ZH:中文   JP:日语    EN：英语
*/
