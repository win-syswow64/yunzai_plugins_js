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
let noiseScale = 0.2  //情感控制
let noiseScaleW = 0.2 //发音时长
let lengthScale = 1 //语速
let sdp_ratio = 0.2 //SDP/DP混合比
let language = 'ZH'
let url = 'https://genshinvoice.top/api'
let uploadRecord = ""
let speaker = "纳西妲_ZH" //生成角色
let text = ""
let master = "主人"
let mutetime = 1 //禁言时间设置，单位分钟，如果设置0则为自动递增，如需关闭禁言请修改触发概率为0

/*判断是否有枫叶插件，如果有则导入枫叶的高清语音处理方法**/
if (fs.existsSync('plugins/hs-qiqi-plugin/model/uploadRecord.js')) {
    uploadRecord = (await import("../hs-qiqi-plugin/model/uploadRecord.js")).default
}

//定义图片存放路径 默认是Yunzai-Bot/resources/chuochuo
const chuo_path = path + '/resources/chuochuo/';

//图片需要从1开始用数字命名并且保存为jpg或者gif格式，存在Yunzai-Bot/resources/chuochuo目录下
let jpg_number = 42 //输入jpg图片数量
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
        logger.info('[戳一戳生效]')
        if (cfg.masterQQ.includes(e.target_id)) {
            if (cfg.masterQQ.includes(e.operator_id) || cfg.qq == e.operator_id) {
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
            let usercount = mutetime
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
                let audioLink = `${url}?speaker=${speaker}&text=${text}&format=mp3&language=${language}&length=${lengthScale}&sdp=${sdp_ratio}&noise=${noiseScale}&noisew=${noiseScaleW}`
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
V1.0 Bate 0.1 10.23 修复了图片发送与语音合成。
V1.1 Bate 0.1 10.29 增加了戳主人相关内容。
V1.1 Bate 0.2 11.01 修复了语音API失效问题
V1.1 Bate 0.3 11.06 适配新版语音API
V1.1 Bate 0.4 11.17 修复了机器人戳主人会触发戳主人功能的BUG
*/

/*
支持角色
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
"五郎_ZH","「博士」_ZH","行秋_JP","コナー_JP","籠釣瓶一心_JP","宛煙_JP","アビスの使徒_JP","ティマイオス_JP","タージ·ラドカニ_JP","望雅_JP","イディア_JP","フレミネ_JP","セノ_JP","シャリフ_JP",
"アデリン_JP","イナヤ_JP","巫女_JP","サーチェン_JP","クンジュ_JP","「淵上」と自称するもの_JP","ニィロウ_JP","シェイクズバイル_JP","式大将_JP","レオン_JP","放浪者_JP","レッシグ_JP","アーラヴ_JP",
"フェルディナンド_JP","凝光_JP","小倉澪_JP","マーガレット_JP","守_JP","長生_JP","アルバート_JP","慧心_JP","ヨォーヨ_JP","柊千里_JP","丹羽_JP","アルカミ_JP","甘雨_JP","モセイス_JP",
"掇星攫辰天君_JP","龍二_JP","スクロース_JP","珊瑚宮心海_JP","ヴィハル_JP","マル_JP","スタンレー_JP","御肉丸_JP","上杉_JP","アーロイ_JP","サラ_JP","純水精霊?_JP","嘉良_JP","申鶴_JP",
"リサ_JP","クリメント_JP","オズ_JP","アルハイゼン_JP","ナヴィア_JP","孟_JP","淑女_JP","傍白_JP","空_JP","古山_JP","七七_JP","サイリュス_JP","ナビル_JP","雷電将軍_JP","九条裟羅_JP",
"セタレ_JP","天おじ_JP","ロサリア_JP","ドゥラフ_JP","晃_JP","ディオナ_JP","宵宮_JP","テウセル_JP","銀杏_JP","楓原万葉_JP","夜蘭_JP","八重神子_JP","レザー_JP","エルザー_JP","エデ_JP",
"神里綾人_JP","詩筠_JP","神里綾華_JP","マルシラック_JP","雲菫_JP","ダインスレイヴ_JP","マハールッカデヴァータ_JP","ジン_JP","ノエル_JP","ゴロー_JP","ゾシモス_JP","アイルマン_JP","胡桃_JP",
"メイモム_JP","アペプ_JP","ベネット_JP","キャンディス_JP","ナーダワ_JP","アイベル_JP","綺良々_JP","ロレンツォ_JP","煙緋_JP","ジョイン_JP","ドニアザード_JP","エルファネ_JP","九条鎌治_JP",
"バダウィ_JP","クロッサル_JP","鍾離_JP","言笑_JP","「カーブース」_JP","トーマ_JP","エウルア_JP","安西_JP","ウェンティ_JP","プカプカ水キノコン·元素生命_JP","ファルザン_JP","哲平_JP",
"天目十五_JP","ナヒーダ_JP","一平_JP","アリス_JP","アロイス_JP","リネット_JP","悪龍_JP","アンバー_JP","刻晴_JP","田饒舌_JP","クレー_JP","ラフマン_JP","ラエッド_JP","スカーレット_JP",
"シコウ_JP","荒瀧一斗_JP","ジェマ_JP","ピンばあや_JP","香菱_JP","つみ_JP","鹿野院平蔵_JP","シラージ_JP","博来_JP","鶯_JP","アザール_JP","パイモン_JP","派蒙_EN","纳西妲_EN","凯亚_EN",
"阿贝多_EN","温迪_EN","枫原万叶_EN","钟离_EN","荒泷一斗_EN","八重神子_EN","艾尔海森_EN","迪希雅_EN","提纳里_EN","卡维_EN","宵宫_EN","莱依拉_EN","赛诺_EN","诺艾尔_EN","托马_EN","凝光_EN",
"莫娜_EN","北斗_EN","柯莱_EN","神里绫华_EN","可莉_EN","芭芭拉_EN","雷电将军_EN","珊瑚宫心海_EN","鹿野院平藏_EN","迪奥娜_EN","琴_EN","五郎_EN","班尼特_EN","安柏_EN","夜兰_EN","妮露_EN",
"辛焱_EN","珐露珊_EN","林尼_EN","丽莎_EN","魈_EN","香菱_EN","烟绯_EN","迪卢克_EN","砂糖_EN","早柚_EN","云堇_EN","刻晴_EN","重云_EN","优菈_EN","胡桃_EN","久岐忍_EN","神里绫人_EN","公子_EN",
"娜维娅_EN","甘雨_EN","戴因斯雷布_EN","菲谢尔_EN","行秋_EN","白术_EN","九条裟罗_EN","雷泽_EN","申鹤_EN","荧_EN","空_EN","流浪者_EN","迪娜泽黛_EN","凯瑟琳_EN","多莉_EN","坎蒂丝_EN","萍姥姥_EN",
"罗莎莉亚_EN","埃德_EN","夏洛蒂_EN","伊迪娅_EN","爱贝尔_EN","留云借风真君_EN","散兵_EN","那维莱特_EN","琳妮特_EN","七七_EN","式大将_EN","瑶瑶_EN","奥兹_EN","米卡_EN","达达利亚_EN","哲平_EN",
"绮良良_EN","浮游水蕈兽·元素生命_EN","大肉丸_EN","托克_EN","蒂玛乌斯_EN","昆钧_EN","欧菲妮_EN","塞琉斯_EN","拉赫曼_EN","阿守_EN","芙宁娜_EN","杜拉夫_EN","伊利亚斯_EN","阿晃_EN","旁白_EN",
"菲米尼_EN","爱德琳_EN","埃洛伊_EN","迈勒斯_EN","德沃沙克_EN","玛乔丽_EN","塞塔蕾_EN","九条镰治_EN","柊千里_EN","海芭夏_EN","阿娜耶_EN","笼钓瓶一心_EN","回声海螺_EN","元太_EN","阿扎尔_EN",
"查尔斯_EN","埃勒曼_EN","阿洛瓦_EN","莎拉_EN","纳比尔_EN","康纳_EN","博来_EN","阿祇_EN","玛塞勒_EN","博士_EN","玛格丽特_EN","宛烟_EN","羽生田千鹤_EN","海妮耶_EN","佐西摩斯_EN","霍夫曼_EN",
"舒伯特_EN","鹿野奈奈_EN","天叔_EN","龙二_EN","艾莉丝_EN","莺儿_EN","嘉良_EN","言笑_EN","费迪南德_EN","珊瑚_EN","嘉玛_EN","久利须_EN","艾文_EN","女士_EN","丹吉尔_EN","白老先生_EN","老孟_EN",
"天目十五_EN","巴达维_EN","舍利夫_EN","拉齐_EN","吴船长_EN","艾伯特_EN","埃泽_EN","松浦_EN","阿拉夫_EN","莫塞伊思_EN","阿圆_EN","石头_EN","百闻_EN","迈蒙_EN","掇星攫辰天君_EN","博易_EN",
"斯坦利_EN","毗伽尔_EN","诗筠_EN","慧心_EN","恶龙_EN","小仓澪_EN","知易_EN","恕筠_EN","克列门特_EN","大慈树王_EN","维多利亚_EN","黑田_EN","宁禄_EN","马姆杜_EN","西拉杰_EN","上杉_EN",
"阿尔卡米_EN","常九爷_EN","纯水精灵_EN","田铁嘴_EN","沙扎曼_EN","加萨尼_EN","克罗索_EN","莱斯格_EN","星稀_EN","阿巴图伊_EN","悦_EN","德田_EN","阿佩普_EN","埃尔欣根_EN","萨赫哈蒂_EN",
"洛伦佐_EN","深渊使徒_EN","塔杰·拉德卡尼_EN","泽田_EN","安西_EN","理水叠山真君_EN","萨齐因_EN","古田_EN"
*/
/*
支持语言
ZH:中文   JP:日语    EN：英语
*/