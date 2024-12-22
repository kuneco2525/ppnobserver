'use strict';

// 作物クラス
class Crop {
	constructor(name, timing) {
		this.name = name;
		this.timing = timing;
		this.harvest = timing.length - 2;
		this.restore = timing.length - 1;
	}
}

const y = [
	new Crop('未開放', []),
	new Crop('かぶ', [0, 2, 3]),
	new Crop('にんじん', [0, 4, 6]),
	new Crop('たまねぎ', [0, 4, 6, 9]),
	new Crop('キャベツ', [0, 4, 8, 12]),
	new Crop('トマト', [0, 4, 8, 12, 18]),
	new Crop('とうもろこし', [0, 4, 8, 12, 16, 24]),
	new Crop('りんご', [0, 4, 8, 12, 16, 20, 30]),
	new Crop('みかん', [0, 4, 8, 12, 16, 20, 24, 36]),
	new Crop('サルビア', [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 60]),
	new Crop('クレマチス', [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 72])
], q = location.search;
let config = {
	m: 0,// 配色
	i: 60,// 同じ作物を植える間隔
	c: [1, 1, 1, 1, 1, 1],// 植える作物
	s: [],// 植える時刻
	v: -1// 表示切替
}, id;// setInterval

// 文字埋め 本サイトではdigitsは未使用(2固定)
function strpad(subject, pchar = '0', digits = 2) {
	let r = String(subject);
	for(let i = r.length; i < digits; ++i) { r = `${pchar}${r}`; }
	return r.substr(-2);
}
// 日付文字列
function dateString(n = new Date(), s = '-', year = true) {
	return `${year?n.getYear()+1900+s:''}${strpad(n.getMonth()+1,year?'0':' ')}${s}${strpad(n.getDate())}`;
}
// 時刻文字列
function timeString(n = new Date(), pchar = '0') {
	return `${strpad(n.getHours(),pchar)}:${strpad(n.getMinutes())}:${strpad(n.getSeconds())}`;
}
// 日時文字列
function datetimeString(n = new Date(), ms = true, s = '-', year = true) {
	return `${dateString(n,s,year)} ${timeString(n)}${ms?'.000+0900':''}`;
}
// ISO8601形式の日時文字列
function datetimeISO8601(n = new Date()) {
	return `${n.getYear()+1900}-${strpad(n.getMonth()+1)}-${strpad(n.getDate())}T${strpad(n.getHours())}:${strpad(n.getMinutes())}:${strpad(n.getSeconds())}.000+0900`;
}
// 主処理
function main() {
	const n = new Date();
	tc.textContent = datetimeString(n, false, '/');
	tc.datetime = datetimeString();
	if(n.getMilliseconds() > 10) {
		clearInterval(id);
		reset();
		return;
	}
	const ts = [];
	for(let i = 0; i < 6; ++i) {
		if(config.v >= 0 && i != config.v) { continue; }
		const yc = y[config.c[i]];
		for(let j = 0; j < yc.timing.length; ++j) {
			if(config.v == -2 && j > 0) { continue; }
			n.setTime(new Date(config.s[i]).getTime() + yc.timing[j] * 3600000);
			const nt = n.getTime();
			let k = 0;
			for(k = 0; k < ts.length; ++k) { if(nt <= ts[k][3]) { break; } }
			let act = '水やり';
			switch(j) {
				case 0:
					act = '植え付け';
					break;
				case yc.harvest:
					act = '収穫';
					break;
				case yc.restore:
					act = '休耕明け';
					break;
				default: act += j + 1;
			}
			ts.splice(k, 0, [String.fromCharCode(i + 97), yc.name, act, nt, (new Date(config.s[i]) - new Date(tc.textContent)) / 1000 + yc.timing[j] * 3600]);
		}
	}
	const td = [
		document.getElementsByClassName('f'),
		document.getElementsByClassName('k'),
		document.getElementsByClassName('a'),
		document.getElementsByClassName('t'),
		document.getElementsByClassName('v')
	];
	for(let i = 0; i < ts.length; ++i) {
		td[0][i].textContent = ts[i][0];
		td[1][i].textContent = ts[i][1];
		td[2][i].textContent = ts[i][2];
		n.setTime(ts[i][3]);
		td[3][i].textContent = datetimeString(n, false, '/');
		const at = Math.abs(ts[i][4]), hrs = Math.floor(at / 3600), min = Math.floor(at / 60 % 60), sec = at % 60;
		td[4][i].innerHTML = (ts[i][4] < 0 ? '<span class="red">過ぎたよ</span>' : (at > 3599 ? strpad(hrs, ' ') + '時間' : '      ') + (at > 59 ? strpad(min, at > 3599 ? '0' : ' ') + '分' : '    ') + strpad(sec, at > 59 ? '0' : ' ') + '秒');
	}
}
// 配色
function setMood() {
	switch(config.m) {
		case 0:
			document.body.style.color = 'black';
			document.body.style.backgroundColor = 'transparent';
			break;
		case 1:
			document.body.style.color = 'white';
			document.body.style.backgroundColor = 'black';
	}
}
// 設定保存
function saveConfig() {
	localStorage.setItem('ppn', JSON.stringify(config));
	if(q.length > 0) { location.search = ''; }
}
// 時分秒入力欄の設定ついでに戻り値を表示用に利用
function intervalValue(t) {
	const hrs = Math.floor(t / 3600), min = Math.floor(t / 60 % 60), sec = t % 60;
	it[0].value = strpad(hrs);
	it[1].value = strpad(min);
	it[2].value = strpad(sec);
	return `${hrs}:${strpad(min)}:${strpad(sec)}`;
}
// 等間隔植えの間隔保存
function saveInterval() {
	config.i = 3600 * it[0].value + 60 * it[1].value + 1 * it[2].value;
	saveConfig();
}
// a～fの作物選択肢切り替え処理
function setCrops() {
	let n = 0;
	for(let i = 0; i < config.c.length; ++i) { if(config.v < 0 || i == config.v) { n += y[config.c[i]].timing.length; } }
	tt.innerHTML = '';
	for(let i = 0; i < n; ++i) {
		const tr = document.createElement('tr');
		tr.innerHTML = '<td class="f"></td><td class="k"></td><td class="a"></td><td class="t"></td><td class="v"></td>';
		tt.appendChild(tr);
	}
}
// 共有リンクのクエリ文字列生成
// 0-36: 6x6(unixtimeを36進数でurlエンコード回避)
// 36-6: クレマチスはa
function encodeconf() {
	let qs = '', qc = '';
	for(let i = 0; i < 6; ++i) {
		qs += Math.floor(new Date(config.s[i]).getTime() / 1000).toString(36);
		qc += config.c[i].toString(36);
	}
	return qs + qc;
}
// 共有リンクのクエリ再現
function decodeconf(query) {
	const n = new Date();
	for(let i = 0; i < 6; ++i) {
		n.setTime(parseInt(query.substr(6 * i, 6), 36) * 1000);
		config.s[i] = datetimeISO8601(n);
		config.c[i] = parseInt(query.substr(36 + i, 1), 36);
	}
}
// setInterval起動
function reset() {
	setTimeout(() => {
		id = setInterval(main, 1000);
		main();
	}, 1000 - new Date().getMilliseconds());
}
function init() {
// 初期バージョンのゴミ掃除
	localStorage.removeItem('ppn-c');
	localStorage.removeItem('ppn-s');
	localStorage.removeItem('ppn-t');
	localStorage.removeItem('ppn-i');
	localStorage.removeItem('ppn-m');

// 設定復元
	config = JSON.parse(localStorage.getItem('ppn') ?? JSON.stringify(config));

// 共有リンクの設定再現
	if(q.length > 0 && q.substr(0, 3) == '?q=') { decodeconf(decodeURI(q.substr(3))); }

// 配色
	config.m = config.m ?? 0;
	md.value = config.m;
	setMood();

// 間隔
	config.i = config.i ?? 60;
	intervalValue(config.i);

// 作物
	const n = new Date();
	for(let i = 0; i < 6; ++i) {
		cs[i].value = config.c[i];
		config.s[i] = config.s[i] ?? datetimeISO8601();
		n.setTime(Date.parse(config.s[i]));
		ss[0][i].value = dateString(n);
		ss[1][i].value = strpad(n.getHours());
		ss[2][i].value = strpad(n.getMinutes());
		ss[3][i].value = strpad(n.getSeconds());
	}
	config.v = config.v ?? -1;
	vi.value = config.v;
	setCrops();

// 現在時刻表示
	tc.textContent = datetimeString(new Date(), false, '/');
	tc.datetime = datetimeString();

// setInterval起動
	reset();
}

const md = document.getElementById('mood'),// 配色選択肢
	tc = document.getElementById('timecurrent'),// 現在時刻
	it = [
		document.getElementById('ih'),// 時間
		document.getElementById('im'),// 分
		document.getElementById('is')// 秒
	],// 同じ作物を植える間隔
	ac = document.getElementById('ac'),// 等間隔植え選択肢
	ai = document.getElementById('autointerval'),// 等間隔植えボタン
	cs = document.getElementsByClassName('c'),// 作物選択
	ss = [
		document.getElementsByClassName('sd'),// 年月日
		document.getElementsByClassName('sh'),// 時
		document.getElementsByClassName('sm'),// 分
		document.getElementsByClassName('ss')// 秒
	],// 種植え時刻
	tt = document.getElementById('timetable'),// 時刻表の外枠
	rc = document.getElementById('rc'),// 植え替え選択肢
	rp = document.getElementById('repeat'),// 植え替えボタン
	vi = document.getElementById('view');// 表示フィルター

init();

// Event
md.addEventListener('input', () => {
	config.m = Number(md.value);
	saveConfig();
	setMood();
});
document.getElementById('sharelink').addEventListener('click', () => {
	location.href = './?q=' + encodeconf();
});
document.getElementById('resetstorage').addEventListener('click', () => {
	localStorage.removeItem('ppn');
});
for(const i of it) {
	i.addEventListener('input', saveInterval);
	i.addEventListener('blur', () => i.value = strpad(i.value));
}
ai.addEventListener('click', () => {
	const av = Number(ac.value), yc = av > 0 ? y[av] : y[config.c[0]];
	if(!confirm(`${yc.name}を${intervalValue(config.i)}間隔で植えますか？`)) { return; }
	const n = new Date();
	for(let i = av > 0 ? 0 : 1; i < 6; ++i) {
		if(config.c[i] < 1) { continue; }
		config.c[i] = av > 0 ? av : config.c[0];
		cs[i].value = config.c[i];
		n.setTime(new Date(config.s[0]).getTime() + i * 1000 * config.i);
		config.s[i] = datetimeISO8601(n);
		ss[0][i].value = dateString(n);
		ss[1][i].value = strpad(n.getHours());
		ss[2][i].value = strpad(n.getMinutes());
		ss[3][i].value = strpad(n.getSeconds());
	}
	saveConfig();
	setCrops();
});
for(let i = 0; i < 6; ++i) {
	cs[i].addEventListener('input', () => {
		config.c[i] = Number(cs[i].value);
		saveConfig();
		setCrops();
	});
	for(let j = 0; j < 4; ++j) {
		ss[j][i].addEventListener('input', () => {
			const n = new Date(`${ss[0][i].value}T00:00:00.000+0900`);
			n.setTime(n.getTime() + 1000 * (3600 * ss[1][i].value + 60 * ss[2][i].value + 1 * ss[3][i].value));
			config.s[i] = datetimeISO8601(n);
			saveConfig();
		});
		if(j > 0) { ss[j][i].addEventListener('blur', () => ss[j][i].value = strpad(ss[j][i].value)); }
	}
}
rp.addEventListener('click', () => {
	const rv = Number(rc.value), yc = rv > 0 ? y[rv] : {name : '元と同じ作物'};
	if(!confirm(`収穫後の畑の休耕明けに${yc.name}を植えますか？`)) { return; }
	const n = new Date();
	for(let i = 0; i < 6; ++i) {
		if(config.c[i] < 1) { continue; }
		const yc = y[config.c[i]];
		n.setTime(new Date(config.s[i]).getTime() + 3600000 * yc.timing[yc.harvest]);
		if(new Date() - n < 0) { continue; }
		if(rv > 0) {
			config.c[i] = rv;
			cs[i].value = config.c[i];
		}
		n.setTime(new Date(config.s[i]).getTime() + 3600000 * yc.timing[yc.restore]);
		config.s[i] = datetimeISO8601(n);
		ss[0][i].value = dateString(n);
		ss[1][i].value = strpad(n.getHours());
		ss[2][i].value = strpad(n.getMinutes());
		ss[3][i].value = strpad(n.getSeconds());
	}
	saveConfig();
	setCrops();
});
vi.addEventListener('input', () => {
	config.v = Number(vi.value);
	saveConfig();
	setCrops();
});
