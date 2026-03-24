// เพิ่มตัวแปรเก็บข้อมูลผู้เล่น
let playerStats = {
    0: { gold: 2, orange: 0 },
    1: { gold: 2, orange: 0 },
    2: { gold: 2, orange: 0 },
    3: { gold: 2, orange: 0 }
};

// ฟังก์ชันอัปเดตสถิติผู้เล่น
function updatePlayerStat(index, type, change) {
    if (playerStats[index]) {
        playerStats[index][type] = playerStats[index][type] + change;
        updateCharacterSpace();
    }
}

// ฟังก์ชันดึงข้อมูลผู้เล่นจาก add-player-buttons
function getPlayerData(index) {
    const playerElement = document.querySelector(`.player-img[data-index="${index}"]`);
    if (playerElement) {
        return {
            src: playerElement.src,
            border: playerElement.style.borderColor || "#f97316"
        };
    }
    return null;
}

// ฟังก์ชันอัปเดต character-space
function updateCharacterSpace() {
    const characterCards = document.querySelectorAll('#character-space > div');

    for (let i = 0; i < 4; i++) {
        const playerData = getPlayerData(i);
        const card = characterCards[i];
        const img = card.querySelector('img');
        const goldCount = card.querySelector('.gold-count');
        const orangeCount = card.querySelector('.orange-count');

        // อัปเดตรูปและขอบ
        if (playerData) {
            img.src = playerData.src;
            img.style.borderColor = playerData.border;
            img.style.opacity = '1';
        } else {
            img.src = '';
            img.style.borderColor = '#f97316';
            img.style.opacity = '0.3';
        }

        // อัปเดตสถิติ
        goldCount.textContent = playerStats[i].gold;
        orangeCount.textContent = playerStats[i].orange;
    }
}
