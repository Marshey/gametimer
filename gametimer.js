let isNotify;       //通知の可否
let intervIdArr = new Array();

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
    timer();
}

function timer() {

    const intervTime = parseFloat(document.getElementById('intTime').value);
    let currentStamina = parseInt(document.getElementById('curSt').value);
    const maxStamina = parseInt(document.getElementById('maxSt').value);
    document.getElementById('curSt').max = maxStamina;

    displayProgress(currentStamina, maxStamina);

    if (currentStamina <= maxStamina) {
        const initialTime = new Date().getTime();
        const targetTime = initialTime + ((maxStamina - currentStamina) * intervTime * 1000);
        let lastElapsed = initialTime;  //最後に計算が行われた時刻
        let flow = 0;   //floorの溢れ
        intervIdArr.push(setInterval(function () {
            const now = new Date().getTime();
            const remainTime = targetTime - now;    //残り時間(ms)

            if (now - lastElapsed + flow >= intervTime * 1000) {
                currentStamina += Math.floor((now - lastElapsed + flow) / 1000 / intervTime);
                flow = (now - lastElapsed + flow) % (intervTime * 1000);
                lastElapsed = now;
                displayProgress(currentStamina, maxStamina);
            }
            displayTime(remainTime);

            //スタミナが最大になったらカウントを止める
            if (currentStamina >= maxStamina) {
                if (isNotify) {
                    notify(currentStamina);
                }
                if (intervIdArr.length > 0) {
                    clearInterval(intervIdArr.shift());
                }
            }
        }, 1000));
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
