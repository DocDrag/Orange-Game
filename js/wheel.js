const allWheelData = {
    CHANCE: [
        // สองช่องใหญ่ เน้นสีให้เด่นชัด
        { text: "สุ่มวงล้อ Good", weight: 9, color: "#4ade80" },
        { text: "สุ่มวงล้อ Bad", weight: 9, color: "#f87171" },

        // 20 ช่องเล็ก สลับ 5 สีพาสเทลเพื่อไม่ให้สีชนกันและดูสวยงาม
        { text: "ถอยหลัง 1 ช่อง", weight: 1, color: "#fde047" },
        { text: "เดินหน้า 1 ช่อง", weight: 1, color: "#7dd3fc" },
        { text: "มอบไอเทมตนเองให้คนอื่น", weight: 1, color: "#f9a8d4" },
        { text: "ขโมยไอเทมจากคนอื่น", weight: 1, color: "#d8b4fe" },
        { text: "กลับไปจุดเริ่มต้น", weight: 1, color: "#6ee7b7" },
        { text: "ไม่มีอะไรเกิดขึ้น", weight: 1, color: "#fde047" },
        { text: "เสียไอเทม", weight: 1, color: "#7dd3fc" },
        { text: "ได้รับไอเทม", weight: 1, color: "#f9a8d4" },
        { text: "ได้เงินจากคนอื่นแบบสุ่ม 1G", weight: 1, color: "#d8b4fe" },
        { text: "วาปไปช่องอื่นแบบสุ่ม", weight: 1, color: "#6ee7b7" },
        { text: "เสียเงินครึ่งนึง", weight: 1, color: "#fde047" },
        { text: "เสียเงิน 1 G", weight: 1, color: "#7dd3fc" },
        { text: "ได้ส้ม 1 ผล", weight: 1, color: "#f9a8d4" },
        { text: "ได้เงิน 3 G", weight: 1, color: "#d8b4fe" },
        { text: "ได้เงิน 2 G", weight: 1, color: "#6ee7b7" },
        { text: "ได้เงิน 1 G", weight: 1, color: "#fde047" },
        { text: "รับ 1G จากผู้เล่นทุกคน", weight: 1, color: "#7dd3fc" },
        { text: "สุ่มส้มขึ้นมาบนกระดาน", weight: 1, color: "#f9a8d4" },
        { text: "วาปไป Gamble", weight: 1, color: "#d8b4fe" },
        { text: "วาปไป Duel", weight: 1, color: "#6ee7b7" }
    ],
    // วงล้อแห่งความเสี่ยง (ใช้สีโทนร้อน รุนแรง)
    GAMBLE: [
        { text: "ได้เงิน x2", weight: 1, color: "#fde047" },
        { text: "เสียทั้งหมด", weight: 2, color: "#ef4444" },
        { text: "ได้เพิ่ม 1 G", weight: 1, color: "#f97316" }
    ],
    // วงล้อของดี (ใช้โทนสีสว่าง สบายตา)
    GOOD: [
        { text: "รับ 1G จากทุกคน", weight: 1, color: "#86efac" },
        { text: "ขโมยเงินใครก็ได้ 1 G", weight: 1, color: "#fde047" },
        { text: "ได้เงิน 3 G", weight: 1, color: "#7dd3fc" },
        { text: "ได้เงิน 2 G", weight: 1, color: "#d8b4fe" },
        { text: "ได้เงิน 1 G", weight: 1, color: "#86efac" },
        { text: "ขโมยไอเทม 1 ชิ้น", weight: 1, color: "#fde047" },
        { text: "วาปไปช่องที่เลือก", weight: 1, color: "#7dd3fc" },
        { text: "ได้รับไอเทม 1 ชิ้น", weight: 1, color: "#d8b4fe" }
    ],
    // วงล้อของเสีย (ใช้โทนสีหม่น อึดอัด หรือเตือนภัย)
    BAD: [
        { text: "เสียเงินครึ่งนึง", weight: 1, color: "#fca5a5" },
        { text: "เสียเงิน 3 G", weight: 1, color: "#fdba74" },
        { text: "เสียเงิน 2 G", weight: 1, color: "#fde047" },
        { text: "เสียเงิน 1 G", weight: 1, color: "#d6d3d1" },
        { text: "มอบส้มให้คนอื่น", weight: 1, color: "#c4b5fd" },
        { text: "หมุนเพิ่ม 2 ครั้ง", weight: 1, color: "#fca5a5" },
        { text: "ไม่เกิดอะไรขึ้น", weight: 1, color: "#fdba74" },
        { text: "วาปไปช่องอื่นแบบสุ่ม", weight: 1, color: "#fde047" },
        { text: "มอบไอเทม 1 ชิ้น", weight: 1, color: "#d6d3d1" },
        { text: "เสียไอเทม 1 ชิ้น", weight: 1, color: "#c4b5fd" }
    ],
    BOARD: (function () {
        let arr = [];
        const colors = ["#f87171", "#fb923c", "#fde047", "#86efac", "#93c5fd", "#c4b5fd", "#f9a8d4"]; // สลับสีพาสเทล 7 สี
        let i = 1;
        for (i = 1; i <= 30; i++) {
            arr.push({ text: "ช่อง " + i, weight: 1, color: colors[i % colors.length] });
        }
        arr.push({ text: "ช่อง START", weight: 1, color: colors[i % colors.length] });
        return arr;
    })()
};

let currentMainRot = 0;
let isMainWheelSpinning = false;

function initMainWheel() {
    const type = document.getElementById('wheelSelector').value;
    let data;

    // ตรวจสอบว่าเป็นวงล้อสุ่มผู้เล่นหรือไม่
    if (type === 'PLAYER') {
        // ค้นหา Token ผู้เล่นทั้งหมดบนบอร์ดที่มี data-index
        const playerTokens = document.querySelectorAll('#game-board [data-index]');
        
        if (playerTokens.length > 0) {
            const colors = ["#4ade80", "#6ee7b7", "#7dd3fc", "#d8b4fe"]; // สีพาสเทลสำหรับผู้เล่น 1-4
            
            // สร้างข้อมูลช่องตามจำนวนผู้เล่นที่หาเจอ
            data = Array.from(playerTokens).map((token, index) => {
                const pIndex = parseInt(token.dataset.index) + 1;
                return {
                    text: `ผู้เล่น ${pIndex}`,
                    weight: 1,
                    color: colors[index % colors.length]
                };
            });
        } else {
            data = [{ text: "ไม่มีผู้เล่น", weight: 1, color: "#d1d5db" }];
        }
    } else {
        data = allWheelData[type];
    }

    const wheel = document.getElementById('mainWheelContainer');
    wheel.innerHTML = ''; 
    document.getElementById('mainWheelResult').textContent = `วงล้อ ${type} พร้อมใช้งาน!`;

    let totalWeight = data.reduce((sum, item) => sum + item.weight, 0);
    let currentAngle = 0;
    let gradientParts = [];

    data.forEach((item, index) => {
        const sliceAngle = (item.weight / totalWeight) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + sliceAngle;

        gradientParts.push(`${item.color} ${startAngle}deg ${endAngle}deg`);

        const label = document.createElement('div');
        label.className = 'absolute top-1/2 left-1/2 font-bold text-black drop-shadow-md origin-left pointer-events-none whitespace-nowrap';
        
        const midAngle = startAngle + (sliceAngle / 2);
        
        // ปรับขนาดฟอนต์ (สำหรับผู้เล่นให้ตัวใหญ่หน่อยเพราะมีแค่สูงสุด 4 ช่อง)
        if (type === 'PLAYER') {
            label.style.fontSize = '24px';
            label.textContent = item.text;
        } else if (type === 'CHANCE' && item.weight === 1) {
            label.style.fontSize = '8px'; 
            label.textContent = item.text.substring(0, 15); 
        } else if (type === 'BOARD') {
            label.style.fontSize = '12px';
            label.textContent = item.text;
        } else {
            label.style.fontSize = type === 'GAMBLE' ? '24px' : '14px';
            label.textContent = item.text;
        }

        let transX = (type === 'BOARD' || type === 'PLAYER') ? 85 : 55;

        label.style.transformOrigin = '0 50%';
        label.style.transform = `translateY(-50%) rotate(${midAngle - 90}deg) translateX(${transX}px)`;
        
        wheel.appendChild(label);
        currentAngle += sliceAngle;
    });

    // ปิดแอนิเมชันชั่วคราวตอนเปลี่ยนวงล้อ
    wheel.style.transition = 'none'; 
    wheel.style.background = `conic-gradient(from 0deg, ${gradientParts.join(', ')})`;
    
    currentMainRot = 0;
    wheel.style.transform = `rotate(0deg)`;
    
    void wheel.offsetWidth; 
    wheel.style.transition = ''; 
}

function spinMainWheel() {
    if (isMainWheelSpinning) return;
    
    const type = document.getElementById('wheelSelector').value;
    let data;

    // ดึงข้อมูลผู้เล่นปัจจุบันจากบอร์ด
    if (type === 'PLAYER') {
        const playerTokens = document.querySelectorAll('#game-board [data-index]');
        if (playerTokens.length > 0) {
            const colors = ["#4ade80", "#6ee7b7", "#7dd3fc", "#d8b4fe"];
            data = Array.from(playerTokens).map((token, index) => {
                const pIndex = parseInt(token.dataset.index) + 1;
                return {
                    text: `ผู้เล่น ${pIndex}`,
                    weight: 1,
                    color: colors[index % colors.length]
                };
            });
        } else {
            data = [{ text: "ไม่มีผู้เล่น", weight: 1, color: "#d1d5db" }];
        }
    } else {
        data = allWheelData[type];
    }

    // ส่วนการคำนวณการหมุน
    isMainWheelSpinning = true;
    const resultBox = document.getElementById('mainWheelResult');
    resultBox.innerHTML = '🎲 <i>กำลังสุ่ม...</i>';
    resultBox.classList.add("animate-pulse");

    const totalWeight = data.reduce((sum, item) => sum + item.weight, 0);
    const randomVal = Math.random() * totalWeight;
    let accumulated = 0;
    let winnerIndex = 0;

    for (let i = 0; i < data.length; i++) {
        accumulated += data[i].weight;
        if (randomVal <= accumulated) {
            winnerIndex = i;
            break;
        }
    }

    const winner = data[winnerIndex];

    let startAngleOfWinner = 0;
    for (let i = 0; i < winnerIndex; i++) {
        startAngleOfWinner += (data[i].weight / totalWeight) * 360;
    }
    const sliceAngle = (winner.weight / totalWeight) * 360;

    const randomJitter = (Math.random() * sliceAngle * 0.8) + (sliceAngle * 0.1);
    const stopAngle = startAngleOfWinner + randomJitter;

    const spins = (Math.floor(Math.random() * 3) + 5) * 360;
    const currentMod = currentMainRot % 360;

    const targetRotation = currentMainRot + spins + ((360 - stopAngle) - currentMod + 360) % 360;

    const wheel = document.getElementById('mainWheelContainer');
    wheel.style.transform = `rotate(${targetRotation}deg)`;
    currentMainRot = targetRotation;

    setTimeout(() => {
        resultBox.classList.remove("animate-pulse");
        resultBox.innerHTML = `🎉 ผลลัพธ์: <b class="text-red-600">${winner.text}</b> 🎉`;
        isMainWheelSpinning = false;
    }, 3500);
}

window.addEventListener('DOMContentLoaded', () => {
    initMainWheel();
});
