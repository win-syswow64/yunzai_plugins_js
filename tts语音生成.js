import plugin from '../../lib/plugins/plugin.js';
import {
	segment
} from "oicq";
import common from '../../lib/common/common.js';
import fetch from 'node-fetch';
import fs from "fs";

let noiseScale = 0.2  //情感控制
let noiseScaleW = 0.2 //发音时长
let lengthScale = 1 //语速
let sdp_ratio = 0.2 //SDP/DP混合比
let language = "ZH"//语言设置
let ttsapi = "https://bv2.firefly.matce.cn/run/predict"
let languageMap = {
	"ZH": "ZH",
	"JP": "JP",
	"EN": "EN"
};
let speakermap = ["埃德_ZH", "塔杰·拉德卡尼_ZH", "行秋_ZH", "深渊使徒_ZH", "凯瑟琳_ZH", "常九爷_ZH", "神里绫人_ZH", "丽莎_ZH", "纯水精灵?_ZH", "宛烟_ZH", "重云_ZH", "悦_ZH", "莱依拉_ZH", "鹿野奈奈_ZH",
	"式大将_ZH", "白术_ZH", "埃舍尔_ZH", "莫娜_ZH", "优菈_ZH", "琴_ZH", "凯亚_ZH", "西拉杰_ZH", "凝光_ZH", "石头_ZH", "达达利亚_ZH", "伊利亚斯_ZH", "艾尔海森_ZH", "慧心_ZH", "「大肉丸」_ZH",
	"柊千里_ZH", "玛乔丽_ZH", "神里绫华_ZH", "菲米尼_ZH", "甘雨_ZH", "掇星攫辰天君_ZH", "坎蒂丝_ZH", "上杉_ZH", "阿尔卡米_ZH", "戴因斯雷布_ZH", "艾文_ZH", "回声海螺_ZH", "九条裟罗_ZH",
	"迪卢克_ZH", "提纳里_ZH", "嘉良_ZH", "塞塔蕾_ZH", "琳妮特_ZH", "阿洛瓦_ZH", "蒂玛乌斯_ZH", "枫原万叶_ZH", "丹吉尔_ZH", "空_ZH", "林尼_ZH", "阿守_ZH", "七七_ZH", "嘉玛_ZH", "恶龙_ZH",
	"阿巴图伊_ZH", "阿佩普_ZH", "八重神子_ZH", "迪希雅_ZH", "迈勒斯_ZH", "夜兰_ZH", "萨赫哈蒂_ZH", "欧菲妮_ZH", "笼钓瓶一心_ZH", "芭芭拉_ZH", "瑶瑶_ZH", "天叔_ZH", "派蒙_ZH", "米卡_ZH",
	"玛塞勒_ZH", "胡桃_ZH", "百闻_ZH", "艾莉丝_ZH", "安柏_ZH", "阿晃_ZH", "萨齐因_ZH", "田铁嘴_ZH", "烟绯_ZH", "海妮耶_ZH", "纳比尔_ZH", "女士_ZH", "诺艾尔_ZH", "云堇_ZH", "舒伯特_ZH",
	"埃勒曼_ZH", "九条镰治_ZH", "留云借风真君_ZH", "言笑_ZH", "安西_ZH", "珊瑚宫心海_ZH", "托克_ZH", "哲平_ZH", "恕筠_ZH", "拉赫曼_ZH", "久利须_ZH", "天目十五_ZH", "妮露_ZH", "莺儿_ZH",
	"佐西摩斯_ZH", "鹿野院平藏_ZH", "温迪_ZH", "菲谢尔_ZH", "anzai_ZH", "可莉_ZH", "刻晴_ZH", "克列门特_ZH", "阿扎尔_ZH", "班尼特_ZH", "伊迪娅_ZH", "巴达维_ZH", "深渊法师_ZH", "赛诺_ZH",
	"大慈树王_ZH", "拉齐_ZH", "海芭夏_ZH", "香菱_ZH", "康纳_ZH", "阿祇_ZH", "卡维_ZH", "博来_ZH", "斯坦利_ZH", "霍夫曼_ZH", "北斗_ZH", "阿拉夫_ZH", "陆行岩本真蕈·元素生命_ZH", "爱贝尔_ZH",
	"雷泽_ZH", "毗伽尔_ZH", "莎拉_ZH", "莫塞伊思_ZH", "多莉_ZH", "珊瑚_ZH", "老孟_ZH", "宵宫_ZH", "钟离_ZH", "芙宁娜_ZH", "爱德琳_ZH", "「女士」_ZH", "博易_ZH", "长生_ZH", "查尔斯_ZH", "阿娜耶_ZH",
	"流浪者_ZH", "辛焱_ZH", "德沃沙克_ZH", "雷电将军_ZH", "羽生田千鹤_ZH", "那维莱特_ZH", "沙扎曼_ZH", "纳西妲_ZH", "艾伯特_ZH", "龙二_ZH", "旁白_ZH", "克罗索_ZH", "元太_ZH", "阿贝多_ZH", "萍姥姥_ZH",
	"久岐忍_ZH", "埃洛伊_ZH", "托马_ZH", "迪奥娜_ZH", "荧_ZH", "夏洛蒂_ZH", "莱欧斯利_ZH", "昆钧_ZH", "塞琉斯_ZH", "埃泽_ZH", "迪娜泽黛_ZH", "知易_ZH", "玛格丽特_ZH", "申鹤_ZH", "罗莎莉亚_ZH", "娜维娅_ZH",
	"珐露珊_ZH", "浮游水蕈兽·元素生命_ZH", "奥兹_ZH", "砂糖_ZH", "绮良良_ZH", "杜拉夫_ZH", "魈_ZH", "松浦_ZH", "迈蒙_ZH", "荒泷一斗_ZH", "吴船长_ZH", "埃尔欣根_ZH", "柯莱_ZH", "阿圆_ZH", "「白老先生」_ZH",
	"五郎_ZH", "「博士」_ZH"]

export class voicecreate extends plugin {
	constructor() {
		super({
			name: 'tts语音生成',
			dsc: 'tts语音生成',
			event: 'message',
			priority: 999,
			rule: [{
				reg: `^#?语音生成帮助$`,
				fnc: `voicecrehelp`
			}, {
				reg: `^#?语音语速设置\\d+$`,
				fnc: `speedset`
			}, {
				reg: `^#?语音感情设置\\d+$`,
				fnc: `emotionset`
			}, {
				reg: `^#?语音发音时长设置\\d+$`,
				fnc: `noiseScaleWset`
			}, {
				reg: `^#?语音混合比设置\\d+$`,
				fnc: `sdp_ratioset`
			}, {
				reg: `^#?语言设置?(.*)$`,
				fnc: `languageset`
			}, {
				reg: `^#?(.*)语音?(.*)$`,
				fnc: 'voicesend'
			},]
		})
	}

	async voicesend(e) {
		let speaker = e.msg.replace(/语音?(.*)$/g, '')
			.replace(/#/g, '')
		if (!speakermap.includes(speaker + "_" + language)) {
			e.reply(`暂未支持该角色，发送"(#)语音生成帮助"查看列表`)
			return true
		}
		speaker = `${speaker}_${language}`
		let text = e.msg.replace(/^#?(.*)语音?/g, '')
		logger.info(text)
		logger.info(speaker)
		let data = JSON.stringify({
			"data": [`${text}`, `${speaker}`, sdp_ratio, noiseScale, noiseScaleW, lengthScale, `${language}`, true, 1, 0.2, null, "Happy", "", "", 0.7],
			"event_data": null,
			"fn_index": 0,
			"session_hash": "v141oxnc02o"
		})
		let responsel = await fetch(ttsapi
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
		let audiourl = `https://v2.genshinvoice.top/file=${responsel.data[1].name}`
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
					fs.writeFile('plugins/example/tts.wav', buffer, (err) => {
						if (err) reject(err);
						else resolve();
					})
				})
				e.reply(segment.record('plugins/example/tts.wav'))
				return;
			})
			.catch(error => {
				e.reply(`文件保存错误`)
				return false;
			})
	}

	async noiseScaleWset(e) {
		let noiseScaleWnum = e.msg.replace(/^#?语音发音时长设置/g, '')
		if (noiseScaleWnum < 0 || noiseScaleWnum > 15) {
			e.reply(`参数不符合要求！(0<=x<15)`)
			return true
		}
		noiseScaleW = noiseScaleWnum / 10;
		e.reply(`已成功设置`)
		return true;
	}

	async sdp_ratioset(e) {
		let sdp_rationum = e.msg.replace(/^#?语音混合比设置/g, '')
		if (sdp_rationum < 0 || sdp_rationum > 10) {
			e.reply(`参数不符合要求！(0<=x<10)`)
			return true
		}
		sdp_ratio = sdp_rationum / 10;
		e.reply(`已成功设置`)
		return true;
	}

	async speedset(e) {
		let lengthnum = e.msg.replace(/^#?语音语速设置/g, '')
		if (lengthnum < 5 || lengthnum > 20) {
			e.reply(`参数不符合要求！(5<x<20)`)
			return true
		}
		lengthScale = lengthnum / 10
		e.reply(`已成功设置`)
		return true
	}

	async emotionset(e) {
		let noiseScalenum = e.msg.replace(/^#?语音感情设置/g, '')
		if (noiseScalenum < 0 || noiseScalenum > 15) {
			e.reply(`参数不符合要求！(0<=x<15)`)
			return true;
		}
		noiseScale = noiseScalenum / 10;
		e.reply(`已成功设置`)
		return true;
	}

	async languageset(e) {
		let languagedata = e.msg.replace(/^#?语言设置/g, '')
		language = languageMap[languagedata.substr(0, 2)] || null;
		if (!language) {
			language = "ZH"
			e.reply(`暂未支持该语言，已重置为ZH，发送"(#)语音生成帮助"查看列表`)
		}
		else { e.reply(`已成功设置`) }
		return true;
	}

	async voicecrehelp(e) {
		let msg = `#"角色名"语音xxx\n` +
			`#语音语速设置number\n` +
			`#语音感情设置number\n` +
			`#语音发音时长设置number\n` +
			`#语言设置ZH/JP/EN\n` +
			`#语音混合比设置number\n`
		let tip = `xxx代表任意内容\n` +
			`number代表自然数\n` +
			`/代表“或者”\n` +
			`[]可以直接无视\n` +
			`\n使用示例：\n` +
			`#派蒙语音你好\n` +
			`#语音语速设置1\n` +
			`\n注：不支持别名，请输入准确的名字\n` +
			`语音语速/感情推荐为最大值`
		let speakertip1 = "发言者列表：\n"
		let speakertip2 = ""
		let speakertip3 = ""
		for (let i = 0; i < speakermap.length; i++) {
			if (i <= (speakermap.length / 3)) {
				speakertip1 += speakermap[i]
				if (i % 2 == 0) {
					speakertip1 += "　　"
				}
				else {
					speakertip1 += "\n"
				}
			}
			if (i <= ((speakermap.length * 2) / 3) && i > (speakermap.length / 3)) {
				speakertip2 += speakermap[i]
				if (i % 2 == 0) {
					speakertip2 += "　　"
				}
				else {
					speakertip2 += "\n"
				}
			}
			if (i > ((speakermap.length * 2) / 3)) {
				speakertip3 += speakermap[i]
				if (i % 2 == 0) {
					speakertip3 += "　　"
				}
				else {
					speakertip3 += "\n"
				}
			}

		}
		let msgx = await common.makeForwardMsg(e, [msg, tip, speakertip1, speakertip2, speakertip3], `语音生成帮助`);
		e.reply(msgx);
		return true;
	}
}
