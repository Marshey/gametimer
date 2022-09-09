let isNotify;       //通知の可否
let intervIdArr = new Array();

let stamina = {};   //スタミナ
let initialTime;    //タイマー開始時刻
let targetTime;     //完了時刻
let lastElapsed;    //最後に計算が行われた時刻
let flow;           //floorの溢れ

window.addEventListener('DOMContentLoaded', () => {
    updateElement();
    document.getElementById('notifyChk').addEventListener('change', function () {
        if (this.checked) {
            isNotify = true;
            Notification.requestPermission();
        } else {
            isNotify = false;
        }
    });
    document.getElementById('start_bt').onclick = function startTimer() {
        if (intervIdArr.length > 0) {
            clearInterval(intervIdArr.shift());
        }

        getStamina();
        document.getElementById('curSt').max = stamina.maxStamina;
        displayProgress(stamina.currentStamina, stamina.maxStamina);
        if (stamina.currentStamina <= stamina.maxStamina) {
            initialTime = new Date().getTime();
            targetTime = initialTime + ((stamina.maxStamina - stamina.currentStamina) * stamina.intervTime * 1000);
            lastElapsed = initialTime;
            flow = 0;
            updateElement();
            intervIdArr.push(setInterval(timer, 1000));
        }
    }
});

function updateTimer() {
    getStamina();
    let addStamina = parseInt(document.getElementById('addSt1').value);
    targetTime = initialTime + ((stamina.maxStamina - stamina.currentStamina) * stamina.intervTime * 1000);

    if (stamina.currentStamina + addStamina >= 0) {
        stamina.currentStamina += addStamina;
        targetTime -= addStamina * stamina.intervTime * 1000;
    }
    if (stamina.currentStamina + addStamina >= stamina.maxStamina) {
        stamina.currentStamina = stamina.maxStamina;
        targetTime = new Date().getTime();
    }
    displayProgress(stamina.currentStamina, stamina.maxStamina);
}

//1秒毎に実行されるメイン処理
function timer() {
    const now = new Date().getTime();
    const remainTime = targetTime - now;    //残り時間(ms)

    //現在時刻に基づいてスタミナを更新
    if (now - lastElapsed + flow >= stamina.intervTime * 1000) {
        stamina.currentStamina += Math.floor((now - lastElapsed + flow) / 1000 / stamina.intervTime);
        flow = (now - lastElapsed + flow) % (stamina.intervTime * 1000);
        lastElapsed = now;
        displayProgress(stamina.currentStamina, stamina.maxStamina);
    }
    displayTime(remainTime);

    //スタミナが最大になったらカウントを止める
    if (stamina.currentStamina >= stamina.maxStamina) {
        if (isNotify) {
            notify(stamina.currentStamina);
        }
        updateElement();
        clearInterval(intervIdArr.shift());
    }
}

function getStamina() {
    stamina.intervTime = parseFloat(document.getElementById('intTime').value);
    stamina.currentStamina = parseInt(document.getElementById('curSt').value);
    stamina.maxStamina = parseInt(document.getElementById('maxSt').value);
}

function displayProgress(nowProg, maxProg) {
    if (nowProg > maxProg) {
        nowProg = maxProg;
    }
    document.getElementById('prog_front').style.width = (Math.round(nowProg / maxProg * 100)) + '%';
    document.getElementById('curSt').value = nowProg;
    document.getElementById('maxSt').value = maxProg;
    document.getElementById('prog_curSt').innerHTML = nowProg;
    document.getElementById('prog_maxSt').innerHTML = maxProg;
}

function displayTime(msTime) {
    if (msTime < 0) {
        msTime = 0;
    }
    const hour = ('00' + Math.floor(Math.ceil(msTime / 1000) / 60 / 60) % 24).slice(-2);    //時
    const min = ('00' + Math.floor(Math.ceil(msTime / 1000) / 60) % 60).slice(-2);  //分
    const sec = ('00' + Math.ceil(msTime / 1000) % 60).slice(-2);   //秒
    document.getElementById('countdownTime').textContent = hour + ':' + min + ':' + sec
}

function notify(stamina) {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification('スタミナが ' + stamina + ' まで回復しました');
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(function (permission) {
                if (permission === 'granted') {
                    new Notification('スタミナが ' + stamina + ' まで回復しました');
                }
            });
        }
    }
}

function updateElement() {
    const btAreaElement = document.getElementById('button_area');
    if (!(document.getElementById('start_bt'))) {
        if (document.getElementById('lavelAddSt1')) {
            document.getElementById('lavelAddSt1').remove();
            document.getElementById('update_bt').remove();
        }

        const startBtElement = document.createElement('input');
        startBtElement.setAttribute('id', 'start_bt');
        startBtElement.setAttribute('type', 'button');
        startBtElement.setAttribute('value', '開始');
        btAreaElement.appendChild(startBtElement);

    } else {
        document.getElementById('start_bt').remove();
        const lavelElement = document.createElement('lavel');
        lavelElement.setAttribute('id', 'lavelAddSt1');
        const lavelMargin = document.createElement('span');
        lavelMargin.setAttribute('class', 'boxlavel');
        lavelMargin.textContent = 'スタミナ加算';
        lavelElement.appendChild(lavelMargin);
        const updateInElement = document.createElement('input');
        updateInElement.setAttribute('id', 'addSt1',);
        updateInElement.setAttribute('type', 'number');
        updateInElement.setAttribute('value', '0');
        updateInElement.setAttribute('min', '0');
        lavelElement.appendChild(updateInElement);
        btAreaElement.appendChild(lavelElement);
        const updateBtElement = document.createElement('input');
        updateBtElement.setAttribute('id', 'update_bt');
        updateBtElement.setAttribute('type', 'button');
        updateBtElement.setAttribute('value', '更新');
        updateBtElement.setAttribute('onclick', 'updateTimer()');
        btAreaElement.appendChild(updateBtElement);
    }
}
