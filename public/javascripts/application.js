var DISP_SIZE = 17, DEFAULT_TIME = 200, BLINK_START_TIME = 10, BLINK_RESET_TIME = 20
var _ajax, _shot = '', _sclr = ''
var _test = document.getElementById('test')
var _pout = document.getElementById('pout')
var _disp = new Array(DISP_SIZE), _data = new Array(DISP_SIZE)
var _idxs = new Array(DISP_SIZE), _time = new Array(DISP_SIZE)
var _size = new Array(DISP_SIZE), _sync = new Array(DISP_SIZE)
var _left = new Array(DISP_SIZE), _back = new Array(DISP_SIZE)
var _scrw = new Array(DISP_SIZE), _scrx = new Array(DISP_SIZE)
var _stkh = new Array(DISP_SIZE), _rset = new Array(DISP_SIZE)
var _spls = new Array()
var days    = ['日', '月', '火', '水', '木', '金', '土']

function makeDisp(idx, left, top, size) {
  document.write('<div class="base back" style="left: ' + (left - 3) + 'px; top: ' + (top - 3) + 'px; width: ' + (size + 6) + 'px;"></div>')
  document.write('<div class="base disp" id="disp' + idx + 'a" style="left: ' + left + 'px; top: ' + top + 'px; width: ' + size + 'px;"></div>')
  document.write('<div class="base disp" id="disp' + idx + 'b" style="left: ' + left + 'px; top: ' + top + 'px; width: ' + size + 'px;"></div>')
  _disp[idx] = [document.getElementById('disp' + idx + 'a'), document.getElementById('disp' + idx + 'b')]
  _left[idx] = left
  _size[idx] = size
}

function getWidth(data) {
  _test.innerHTML = getHTML(data)
  return _test.offsetWidth
}

function setDisp(idx, pos, pls) {
  var data = _data[idx][pos][_idxs[idx][pos]] || ''
  var i, w, wb
  if (/^( *[0-9]+:)?`RS([0-9]+)/.exec(data)) {
    // 指定の表示をすぐにリセット
    i = RegExp.$2 - 0
    _rset[i] = 1
    nextDisp(idx, pos, pls)
  } else if (/^( *[0-9]+:)?`NX([0-9]+)/.exec(data)) {
    // 指定の表示を次に進める
    i = RegExp.$2 - 0
    nextDisp(i, 0, 0)
    nextDisp(i, 1, 0)
    nextDisp(idx, pos, pls)
  } else if (/^( *[0-9]+:)?`SW/.exec(data)) {
    // 通過スイッチ
    _sync[idx][idx] = 1
    nextDisp(idx, pos, pls)
  } else if (/^( *[0-9]+:)?`WN([0-9]+)/.exec(data)) {
    // 指定の表示が `S を通過したらリセット
    i = RegExp.$2 - 0
    if (!_rset[i]) _sync[i][idx] = 1
    nextDisp(idx, pos, pls)
  } else if (/^( *[0-9]+:)?`WD([0-9]+)/.exec(data)) {
    // 指定の表示が `S を通過したらリセット (手動リセット直後は反応しない)
    i = RegExp.$2 - 0
    if (!_rset[i] && _rset[idx] <= 0) _sync[i][idx] = 1
    nextDisp(idx, pos, pls)
  } else {
    _time[idx][pos] = /^ *([0-9]+):/.exec(data) ? RegExp.$1 - 0 : 0
    if (_time[idx][pos]) _time[idx][pos] += pls
    if (pos) {
      w = getWidth(data)
      _scrx[idx] = w > _scrw[idx] ? w + _scrw[idx] + 20 : 0
    } else {
      w = getWidth(data), wb = _size[idx] - w
      if (_scrw[idx] != wb) {
        _disp[idx][0].style.width = w + 'px'
        _disp[idx][1].style.left = (_left[idx] + w) + 'px'
        _scrw[idx] = wb
        _scrx[idx] = 0
        _disp[idx][1].style.width = wb + 'px'
        _disp[idx][1].innerHTML = ''
        _disp[idx][1].scrollLeft = 0
      }
    }
    var html = getHTML(data)
    if (pos && _scrx[idx]) {
      html = '<span style="padding-left:' + _scrw[idx] + 'px;">&nbsp;</span>' + html
      html = html + '<span style="padding-right:' + (_scrw[idx] + 100) + 'px;">&nbsp;</span>'
    }
    if (_stkh[idx][pos] != html) _disp[idx][pos].innerHTML = _stkh[idx][pos] = html
    _disp[idx][pos].scrollLeft = 0
  }
}

function setSplash() {
  _spls = document.getElementsByName('splash')
}

function nextDisp(idx, pos, pls) {
  if (!_data[idx][pos].length) return
  if (++_idxs[idx][pos] >= _data[idx][pos].length) _idxs[idx][pos] = 0
  setDisp(idx, pos, pls)
  setSplash()
}

function getHTML(data) {
  var html = data, temp = ''
  html = html.replace(/^ *[0-9]+:/, '')
  var sf = /^@@/.test(html)
  html = html.replace(/^@@/, '')
  for (var leng = html.length, i = 0; i < leng;) {
    if (/^([@`][A-Za-z0-9])/.exec(html)) {
      html = html.substring(2)
      temp += RegExp.$1
      i += 1
    } else if (/^([A-Za-z0-9ｱ-ﾝｧ-ｫｬｭｮｯﾞﾟ:;\-+*/=,._!"#$%&'()[\]<>{}])/.exec(html)) {
      html = html.substring(1)
      temp += '<span class="base han">' + RegExp.$1 + '</span>'
      i++
    } else if (/^~/.exec(html)) {
      html = html.substring(1)
      temp += '<span class="base dash">~</span>'
      i++
    } else if (/^ /.exec(html)) {
      html = html.substring(1)
      temp += '<span class="base sp">&nbsp;</span>'
      i++
    } else if (/^([^A-Za-z0-9ｱ-ﾝｧ-ｫｬｭｮｯﾞﾟ:;\-+*/=,._!"#$%&'()[\]<>{}~@` ]+)/.exec(html)) {
      var j = RegExp.$1.length
      html = html.substring(j)
      temp += RegExp.$1
      i += j
    } else {
      html = html.substring(j)
      i += j
    }
  }
  html = temp
  html = html.replace(/@([a-z])/g, '</span><span class="base $1">')
  html = html.replace(/@([A-Z])/g, '</span><span class="base r$1">')
  html = html.replace(/`([a-z])/g, '</span><span class="base $1"><input type="hidden" name="splash" value="0">')
  html = '<span class="base g">' + html + '</span>'
  if (sf) html = '<span class="small">' + html + '</span>'
  return html
}

function changeDisp() {
  var f = 0
  var idx
  for (idx = 0; idx < DISP_SIZE; idx++) for (var pos = 0; pos < 2; pos++) {
    if (!_time[idx][pos] || --_time[idx][pos]) continue
    nextDisp(idx, pos, 0)
    f = 1
  }
  if (f) {
    for (idx = 0; idx < DISP_SIZE; idx++) resetSync(idx)
    for (idx = 0; idx < DISP_SIZE; idx++) resetDisp(idx)
    for (idx = 0; idx < DISP_SIZE; idx++) resetTime(idx)
  }
  for (var leng = _spls.length, i = 0; i < leng; i++) {
    var obj = _spls[i]
    var j = obj.value - (-1)
    if (j == BLINK_START_TIME) {
      obj.parentNode.style.visibility = 'hidden'
    } else if (j == BLINK_RESET_TIME) {
      obj.parentNode.style.visibility = ''
      j = 0
    }
    obj.value = j
  }
}

function scrollDisp() {
  var f = 0
  var idx
  for (idx = 0; idx < DISP_SIZE; idx++) {
    if (_rset[idx] || !_scrx[idx]) continue
    var x = ++_disp[idx][1].scrollLeft
    if (x < _scrx[idx]) continue
    _disp[idx][1].scrollLeft = 0
    if (_time[idx][1]) continue
    if (!_time[idx][0]) nextDisp(idx, 0, 1)
    nextDisp(idx, 1, 1)
    f = 1
  }
  if (f) {
    for (idx = 0; idx < DISP_SIZE; idx++) resetSync(idx)
    for (idx = 0; idx < DISP_SIZE; idx++) resetDisp(idx)
    for (idx = 0; idx < DISP_SIZE; idx++) resetTime(idx)
  }
}

function resetSync(idx) {
  if (!_sync[idx][idx]) return
  for (var i in _sync[idx]) if (i != idx) _rset[i] = 1
  _sync[idx] = {}
}

function resetDisp(idx) {
  if (!_rset[idx]) return
  _idxs[idx][0] = 0
  _idxs[idx][1] = 0
  _sync[idx] = {}
  setDisp(idx, 0, 0)
  setDisp(idx, 1, 0)
  setSplash()
}

function resetTime(idx) {
  _rset[idx] = 0
  if (!_time[idx][0]) {
    if (!_time[idx][1] && !_scrx[idx]) _time[idx][1] = DEFAULT_TIME
    if (_time[idx][1]) _time[idx][0] = _time[idx][1]
  }
  if (_time[idx][0]) {
    if (!_time[idx][1] && !_scrx[idx]) _time[idx][1] = _time[idx][0]
  }
}

function sendRequest(method, url, callback) {
  if (!_ajax) return
  _ajax.onload = callback
  _ajax.open(method, url, false)
  _ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
  _ajax.send()
}

function checkData() {
  sendRequest('get', 'time.txt', checkDataCallback)
}

function checkDataCallback() {
  var text = _ajax.responseText.split(' ')
  var shot = text[0] || '', sclr = text[1] || ''
  if (_shot == shot) return
  _shot = shot
  _sclr = ',' + sclr + ','
  reloadData()
}

function reloadData() {
  sendRequest('get', 'data.txt', reloadDataCallback)
}

function reloadDataCallback() {
  var text = _ajax.responseText
  resetData(text)
}

function resetData(text) {
  var lines = text.split('\r\n')
  var data = new Array(DISP_SIZE)
  var idx
  for (idx = 0; idx < DISP_SIZE; idx++) data[idx] = [[], []]
  for (var leng = lines.length, i = 0; i < leng; i++) {
    var line = lines[i]
    if (!/^ *([0-9]+)([A-Ca-c]?):(.+)$/.exec(line)) continue
    idx = RegExp.$1 - 0, pos = RegExp.$2.length ? 'abcABC'.indexOf(RegExp.$2) : -1
    if (pos < 0 || pos == 2 || pos == 5) {
      data[idx][1].push(RegExp.$3)
      pos = 0
    } else if (pos >= 3 && pos <= 4) {
      data[idx][4 - pos].push('')
      pos = pos - 3
    }
    data[idx][pos].push(RegExp.$3)
  }
  var f = 0
  for (idx = 0; idx < DISP_SIZE; idx++) {
    for (var pos = 0; pos < 2; pos++) {
      var back = data[idx][pos].join('/')
      if (_sclr.indexOf(',' + idx + ',') < 0 && _back[idx][pos] == back) continue
      _back[idx][pos] = back
      _data[idx][pos] = data[idx][pos]
      _rset[idx] = -1
      f = 1
    }
  }
  if (f) {
    for (idx = 0; idx < DISP_SIZE; idx++) resetSync(idx)
    for (idx = 0; idx < DISP_SIZE; idx++) resetDisp(idx)
    for (idx = 0; idx < DISP_SIZE; idx++) resetTime(idx)
  }
}

document.onkeydown = function(e) {
  if (!e) e = window.event
  switch (e.keyCode) {
  case 0x0d:
    reloadData()
    break
  }
}

for (var i = 0; i < DISP_SIZE; i++) {
  _disp[i] = [[], []]
  _data[i] = [[], []]
  _idxs[i] = [0, 0]
  _time[i] = [0, 0]
  _sync[i] = {}
  _rset[i] = 0
  _back[i] = ['', '']
  _stkh[i] = ['', '']
}

setInterval(changeDisp, 50)
setInterval(scrollDisp, 20)
setInterval(checkData, 2000)

var CHAR_SIZE = 24

window.onload = function() {
  _pout.innerHTML = ''
  var today = new Date()
  var year = today.getFullYear()
  var month = today.getMonth() + 1
  var date = today.getDate()
  var day = today.getDay()

  var data = [
    // 表示のサンプル
    '0a:70:@G　快　速　@w 10:30 　新　宿　 @g10 両編成',
    '0a:70:@GＲＡＰＩＤ@w 10:30 SHINJUKU @g10 Cars',
    '1a:50:`r前々駅を出ました',
    '1b:0:@gまもなく電車が参ります。　@y黄色い線@gの内側に下がってお待ちください。',
    '2B:0:@o大雨の影響で、山形〜新庄駅間の上下線で終日運転を見合わせます。　　　　　　　　　　　　　　　　 @gこの電車は、 @o北戸田 @g駅を出ました。　　　　　　　',

    '3A:20:@o'+year+'年'+month+'月'+date+'日 @g('+days[day]+') @r(* \'3\')y┛',
    '3A:20:@o'+year+'年'+month+'月'+date+'日 @g('+days[day]+') @r(* \'3\')y─┛',
    '3A:20:@o'+year+'年'+month+'月'+date+'日 @g('+days[day]+') @r(* \'3\')y──┛',
    '3A:20:@o'+year+'年'+month+'月'+date+'日 @g('+days[day]+') @r(* \'3\')y───┛',
    '3A:20:@o'+year+'年'+month+'月'+date+'日 @g('+days[day]+') @r(* \'3\')y────┛',
    '3A:20:@o'+year+'年'+month+'月'+date+'日 @g('+days[day]+') @r(* \'3\')y─────┛',
    '3A:20:@o'+year+'年'+month+'月'+date+'日 @g('+days[day]+') @r(* \'3\')y──────┛',
    '3A:20:@o'+year+'年'+month+'月'+date+'日 @g('+days[day]+') @r(* \'3\')y───────┛',
    '3A:20:@o'+year+'年'+month+'月'+date+'日 @g('+days[day]+') @r(* \'3\')y────────┛',
    '3A:20:@o'+year+'年'+month+'月'+date+'日 @g('+days[day]+') @r(* \'3\')y─────────┛',
    '3A:20:@o'+year+'年'+month+'月'+date+'日 @g('+days[day]+') @r(* \'3\')y───────┛(-_-',
    '3A:20:@o'+year+'年'+month+'月'+date+'日 @g('+days[day]+') @r(; \'Д\')y──────┛(-_-',
    '3A:20:@o'+year+'年'+month+'月'+date+'日 @g('+days[day]+') @r(; \'Д\')y─────┛(-_-',
    '3A:20:@o'+year+'年'+month+'月'+date+'日 @g('+days[day]+') @r(; \'Д\')y────┛(-_-',
    '3A:20:@o'+year+'年'+month+'月'+date+'日 @g('+days[day]+') @r(; \'Д\')y───┛(-_-',
    '3A:20:@o'+year+'年'+month+'月'+date+'日 @g('+days[day]+') @r(; \'Д\')y──┛(-_-',
    '3A:20:@o'+year+'年'+month+'月'+date+'日 @g('+days[day]+') @r(; \'Д\')y─┛(-_-',
    '3A:20:@o'+year+'年'+month+'月'+date+'日 @g('+days[day]+') @r(; \'Д\')y┛(-_-',
    '3A:20:@o'+year+'年'+month+'月'+date+'日 @g('+days[day]+') @r(* \'Д\') (-_-',
    '3A:50:@o'+year+'年'+month+'月'+date+'日 @g('+days[day]+') @r(* u_u)❤︎(u_u *',

    '4a:50:@Bりんかい線@w 10:28　@o新　木　場　@g10 両編成',
    '4A:50:@BLOCAL@w　　 10:28　@oSHIN-KIBA @g10 Cars',
    '5B:0:@w年末地域安全活動実施中　@r駅構内での粗暴行為はやめましょう　@w特殊詐欺根絶「@r手放すな　確かめましたか　その電話@w」　@g東京湾岸警察署',

    '6a:50:　　@o各駅停車@g 11:28 @w 川　越  @g10 両編成',
    '6A:50:　　@oLOCAL@g  11:28 @wKAWAGOE @g10 Cars',

    '7A:9999:@y始発@o各駅停車@g 11:43 @w武蔵浦和@g10 両編成 @r5分遅れ',
    '7A:70:@y始発@o各駅停車@g 11:43 @wMUSASHI-URAWA @g10Cars',

    '8B:0:停車駅は、 @o戸田公園•戸田•北戸田•武蔵浦和@gです。',
    '8a:0:`NX7',
    '9a:0:@g　　回送',
    '10a:0:`SW',
    '10A:20:１ トーマス',
    '10A:20:２ エドワード',
    '10A:20:３ ヘンリー',
    '10A:20:４ ゴードン',
    '10A:20:５ ジェームス',
    '10A:20:６ パーシー',
    '10A:20:７ トビー',
    '10A:20:８ ダック',
    '10A:20:９ ドナルド',
    '10A:20:０',
    '11B:50:@wThis is the Saikyō-Line bound for Ōmiya',
    '11a:0:`WN10',
    '11B:0:@w警視庁警察官募集中 問合せ先：蕨警察署　048-444-0110 　　　　　　　　　年末・年始安全総点検実施中「@r一人ひとりが基本に徹し、安全で快適な輸送サービスを提供します。@w」JR東日本',
  ]
  resetData(data.join('\r\n'))
}

makeDisp(0,  24,  65, CHAR_SIZE * 18)
makeDisp(1,  24,  95, CHAR_SIZE * 18)
makeDisp(2,  24, 125, CHAR_SIZE * 18)

makeDisp(3, 460,  65, CHAR_SIZE * 18)
makeDisp(4, 460,  95, CHAR_SIZE * 18)
makeDisp(5, 460, 125, CHAR_SIZE * 18)

makeDisp(6,  24, 365, CHAR_SIZE * 18)
makeDisp(7,  24, 395, CHAR_SIZE * 18)
makeDisp(8,  24, 425, CHAR_SIZE * 18)

makeDisp(9,  460, 365, CHAR_SIZE * 18)
makeDisp(10, 460, 395, CHAR_SIZE * 18)
makeDisp(11, 460, 425, CHAR_SIZE * 18)
