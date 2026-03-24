let currentDuelRot = 0;
let isDuelSpinning = false;

function updateDuelWheel() {
    const bet1 = Math.max(0, parseInt(document.getElementById('duelBet1').value) || 0);
    const bet2 = Math.max(0, parseInt(document.getElementById('duelBet2').value) || 0);
    
    const total = bet1 + bet2;
    const wheel = document.getElementById('duelWheelContainer');
    wheel.innerHTML = ''; // ล้างข้อความเก่า

    let p1Percent, p2Percent;
    
    // ถ้ายังไม่ลงเดิมพัน ให้แบ่งครึ่ง
    if (total === 0) {
        p1Percent = 50;
        p2Percent = 50;
    } else {
        p1Percent = (bet1 / total) * 100;
        p2Percent = (bet2 / total) * 100;
    }

    // ตั้งค่าพื้นหลังแบ่งสัดส่วน (แดง-น้ำเงิน)
    wheel.style.transition = 'none';
    wheel.style.background = `conic-gradient(from 0deg, #ef4444 0% ${p1Percent}%, #3b82f6 ${p1Percent}% 100%)`;
    
    // ใส่ป้ายชื่อ
    if (p1Percent > 0) {
        const label1 = document.createElement('div');
        label1.className = 'absolute top-1/2 left-1/2 font-bold text-white drop-shadow-md origin-left pointer-events-none text-xl sm:text-2xl whitespace-nowrap';
        const mid1 = (p1Percent / 2) * 3.6; // แปลง % เป็นองศา
        label1.style.transform = `translateY(-50%) rotate(${mid1 - 90}deg) translateX(70px)`;
        label1.textContent = `ฝ่ายแดง (${Math.round(p1Percent)}%)`;
        wheel.appendChild(label1);
    }

    if (p2Percent > 0) {
        const label2 = document.createElement('div');
        label2.className = 'absolute top-1/2 left-1/2 font-bold text-white drop-shadow-md origin-left pointer-events-none text-xl sm:text-2xl whitespace-nowrap';
        const mid2 = (p1Percent * 3.6) + ((p2Percent / 2) * 3.6); 
        label2.style.transform = `translateY(-50%) rotate(${mid2 - 90}deg) translateX(70px)`;
        label2.textContent = `ฝ่ายน้ำเงิน (${Math.round(p2Percent)}%)`;
        wheel.appendChild(label2);
    }

    currentDuelRot = 0;
    wheel.style.transform = `rotate(0deg)`;
    void wheel.offsetWidth; // Force Reflow
    wheel.style.transition = '';
}

function spinDuelWheel() {
    if (isDuelSpinning) return;
    
    const bet1 = Math.max(0, parseInt(document.getElementById('duelBet1').value) || 0);
    const bet2 = Math.max(0, parseInt(document.getElementById('duelBet2').value) || 0);
    
    if (bet1 === 0 && bet2 === 0) {
        alert("กรุณาลงเงินเดิมพันอย่างน้อย 1 ฝ่ายครับ!");
        return;
    }

    isDuelSpinning = true;
    const resultBox = document.getElementById('duelResult');
    resultBox.innerHTML = '⚔️ <i>กำลังต่อสู้...</i> ⚔️';
    resultBox.classList.add("animate-pulse");

    const total = bet1 + bet2;
    const randomVal = Math.random() * total;
    
    let winner, winnerAngleStart, winnerAngleEnd;
    if (randomVal <= bet1) {
        winner = "ฝ่ายแดง";
        winnerAngleStart = 0;
        winnerAngleEnd = (bet1 / total) * 360;
    } else {
        winner = "ฝ่ายน้ำเงิน";
        winnerAngleStart = (bet1 / total) * 360;
        winnerAngleEnd = 360;
    }

    // สุ่มจุดหยุดในพื้นที่ของผู้ชนะ (หลีกเลี่ยงขอบๆ เส้นแบ่ง 10% เพื่อกันการสับสน)
    const sliceAngle = winnerAngleEnd - winnerAngleStart;
    const randomJitter = (Math.random() * sliceAngle * 0.8) + (sliceAngle * 0.1);
    const stopAngle = winnerAngleStart + randomJitter;

    const spins = (Math.floor(Math.random() * 3) + 5) * 360; // หมุน 5-7 รอบ
    const currentMod = currentDuelRot % 360;
    const targetRotation = currentDuelRot + spins + ((360 - stopAngle) - currentMod + 360) % 360;

    const wheel = document.getElementById('duelWheelContainer');
    wheel.style.transform = `rotate(${targetRotation}deg)`;
    currentDuelRot = targetRotation;

    setTimeout(() => {
        resultBox.classList.remove("animate-pulse");
        const colorClass = winner === "ฝ่ายแดง" ? "text-red-600" : "text-blue-600";
        resultBox.innerHTML = `🏆 ผู้ชนะ: <b class="${colorClass}">${winner}</b> (รับไป ${total} G) 🏆`;
        isDuelSpinning = false;
    }, 3500);
}

// โหลดวงล้อให้พร้อมใช้งานตั้งแต่แรก
window.addEventListener('DOMContentLoaded', () => {
    updateDuelWheel();
});
