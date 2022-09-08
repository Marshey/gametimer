let isNotify;       //通知の可否
let intervIdArr = new Array();

let stamina = {};   //スタミナ
let targetTime;     //完了時刻
let lastElapsed;    //最後に計算が行われた時刻
let flow;           //floorの溢れ

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('notifyChk').addEventListener('change', function () {
        if (this.checked) {
            isNotify = true;
            Notification.requestPermission();
        } else {
            isNotify = false;
        }
    });
});

function startTimer() {
    if (intervIdArr.length > 0) {
        clearInterval(intervIdArr.shift());
    }
    stamina.intervTime = parseFloat(document.getElementById('intTime').value);
    stamina.currentStamina = parseInt(document.getElementById('curSt').value);
    stamina.maxStamina = parseInt(document.getElementById('maxSt').value);
    document.getElementById('curSt').max = stamina.maxStamina;

    displayProgress(stamina.currentStamina, stamina.maxStamina);

    if (stamina.currentStamina <= stamina.maxStamina) {
        const initialTime = new Date().getTime();
        targetTime = initialTime + ((stamina.maxStamina - stamina.currentStamina) * stamina.intervTime * 1000);
        lastElapsed = initialTime;
        flow = 0;
        intervIdArr.push(setInterval(timer, 1000));
    }
}

function updateTimer() {
    let addStamina = parseInt(document.getElementById('addSt1').value);

    if (stamina.currentStamina + addStamina >= 0 && stamina.currentStamina + addStamina <= stamina.maxStamina) {
        stamina.currentStamina += addStamina;
        targetTime -= addStamina * stamina.intervTime * 1000;
        displayProgress(stamina.currentStamina, stamina.maxStamina);
    }
}

function timer() {
    const now = new Date().getTime();
    const remainTime = targetTime - now;    //残り時間(ms)

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
        if (intervIdArr.length > 0) {
            clearInterval(intervIdArr.shift());
        }
    }
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
    // console.log(msTime)
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
