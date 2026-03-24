// รายชื่อปุ่มและหน้า (จัดเก็บแบบ Array เพื่อง่ายต่อการวนลูป)
const navItems = [
    { id: "btnPageBoard", spaceId: "game-board-space" },
    { id: "btnPageChar", spaceId: "character-space" },
    { id: "btnPageShop", spaceId: "shop-space" },
    { id: "btnPageWheel", spaceId: "wheel-space" },
    { id: "btnPageDuel", spaceId: "duel-space" }
];

// คลาสของปุ่มเวลาปกติ (ยังไม่ได้เลือก) - อัปเกรดให้เด้งขวานิดๆ เมื่อ Hover
const inactiveBtnClass = "w-full flex items-center gap-4 px-4 py-3.5 text-gray-500 bg-transparent rounded-2xl hover:bg-orange-50 hover:text-orange-600 hover:translate-x-1 transition-all duration-300 font-medium group cursor-pointer border border-transparent";
const inactiveIconDivClass = "w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-orange-500 group-hover:shadow-sm transition-all duration-300 transform group-hover:rotate-6";

// คลาสของปุ่มเวลาที่กำลังถูกเลือก (Active) - อัปเกรดแบบไล่สี และดันขวาถาวร
const activeBtnClass = "w-full flex items-center gap-4 px-4 py-3.5 text-orange-700 bg-gradient-to-r from-orange-100/80 to-orange-50/30 rounded-2xl transition-all duration-300 font-bold shadow-sm border border-orange-200/50 translate-x-2 group cursor-default relative";
const activeIconDivClass = "w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-md shadow-orange-500/40 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300";

// ฟังก์ชันล้างสถานะปุ่มทั้งหมดให้กลับเป็นค่าเริ่มต้น
function resetNavButtons() {
    navItems.forEach(item => {
        const btn = document.getElementById(item.id);
        btn.className = inactiveBtnClass;
        // ไอคอนด้านใน <div> ตัวแรก
        btn.firstElementChild.className = inactiveIconDivClass;
        document.getElementById(item.spaceId).classList.add("hidden");
    });
}


// ฟังก์ชันจัดการตอนเปลี่ยนหน้า
function setActivePage(btnId, spaceId) {
    resetNavButtons();
    const btn = document.getElementById(btnId);
    btn.className = activeBtnClass;
    btn.firstElementChild.className = activeIconDivClass;
    
    document.getElementById(spaceId).classList.remove("hidden");
    
    // ปิด Sidebar อัตโนมัติในหน้าจอมือถือ/แท็บเล็ต
    if(window.innerWidth < 768) {
        const sidebarEl = document.getElementById("sidebar");
        if (!sidebarEl.classList.contains("-translate-x-full")) {
            sidebar(); 
        }
    }
}

// เชื่อมฟังก์ชันคลิก
function changePageBoard() { setActivePage("btnPageBoard", "game-board-space"); }
function changePageChar() { setActivePage("btnPageChar", "character-space"); }
function changePageShop() { setActivePage("btnPageShop", "shop-space"); }
function changePageWheel() { setActivePage("btnPageWheel", "wheel-space"); initMainWheel(); }
function changePageDuel() { setActivePage("btnPageDuel", "duel-space"); updateDuelWheel(); }

// เริ่มต้นด้วยหน้า Board เสมอ (ตั้งค่าให้ตรงกัน)
window.addEventListener('DOMContentLoaded', () => {
    changePageBoard();
});

// ฟังก์ชันเปิด/ปิด Sidebar ตัวใหม่
function sidebar() {
    const sidebarEl = document.getElementById("sidebar");
    const icon = document.getElementById("sidebarIcon");
    const toggleBtn = document.getElementById("toggleSidebar");
    
    sidebarEl.classList.toggle("-translate-x-full");
    
    // สลับลูกศร และปรับขนาดปุ่มให้สมดุลตอนเปิด/ปิด
    if (sidebarEl.classList.contains("-translate-x-full")) {
        icon.classList.remove("fa-chevron-left");
        icon.classList.add("fa-chevron-right");
        toggleBtn.classList.remove("hover:w-14");
        toggleBtn.classList.add("hover:w-16"); // ยื่นออกไปนิดนึงตอนปิดเรียกร้องความสนใจ
    } else {
        icon.classList.remove("fa-chevron-right");
        icon.classList.add("fa-chevron-left");
        toggleBtn.classList.remove("hover:w-16");
        toggleBtn.classList.add("hover:w-14");
    }
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.remove("hidden");
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
            toast.classList.add("hidden");
        }, 500);
    }, 2000); 
}

function createAddPlayerButton(index, size) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `add-player-btn flex items-center justify-center rounded-full bg-orange-400 hover:bg-orange-500 shadow text-white text-3xl transition-all`;
    btn.style.width = btn.style.height = `${size}px`;
    btn.innerHTML = '<span class="pointer-events-none select-none">+</span>';
    btn.title = "เพิ่มผู้เล่น";
    btn.dataset.index = index;
    return btn;
}

// SAVE LOGIC
document.getElementById('saveBtn').addEventListener('click', () => {
    const saveData = { layout };

    for (let i = 0; i < 4; i++) {
        const player = document.querySelector(`.player-img[data-index="${i}"]`);
        if (player) {
            saveData[`player${i + 1}`] = {
                src: player.src,
                border: player.style.borderColor || "#f97316"
            };
        } else {
            saveData[`player${i + 1}`] = null;
        }
    }

    // Save shop items
    for (let i = 0; i < 45; i++) {
        const cell = document.getElementById(`data-index-${i}`);
        if (cell && cell.innerHTML.trim() !== '+') {
            saveData[`shop${i}`] = {
                content: cell.innerHTML,
                title: cell.dataset.description || ''
            };
        }
    }

    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game_save.json';
    a.click();
    URL.revokeObjectURL(url);
});

// LOAD LOGIC
let hasLoadedBefore = false;
document.getElementById('loadFile').addEventListener('change', (e) => {
    changePageBoard(); // เปลี่ยนหน้าเป็นหน้า Game Board

    if (!hasLoadedBefore) {
        const confirmRefresh = confirm("การโหลดจะแทนที่ข้อมูลทั้งหมดในที่นี้\n\nคุณต้องการโหลดไฟล์ต่อเลยหรือไม่?");
        if (!confirmRefresh) {
            e.target.value = ''; // เคลียร์ input เพื่อให้เลือกใหม่ได้
            return;
        }
        hasLoadedBefore = true;
    }

    // ตรวจสอบว่าไฟล์ถูกเลือกหรือไม่
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result);
            if (!Array.isArray(data.layout)) throw "layout missing";

            // อัปเดต layout ตัวแปร
            layout = data.layout;

            // เปลี่ยน playerStats เป็นค่าเริ่มต้น
            playerStats = {
                0: { gold: 2, orange: 0 },
                1: { gold: 2, orange: 0 },
                2: { gold: 2, orange: 0 },
                3: { gold: 2, orange: 0 }
            };

            // อัปเดตทุกช่องบนบอร์ด
            data.layout.forEach((row, y) => {
                row.forEach((type, x) => {
                    const div = document.querySelector(`.cell[data-row="${y}"][data-col="${x}"]`);
                    if (!div) return;  // ช่อง null ก็ข้าม
                    const typeSpan = div.querySelector('.cell-type');
                    loadLayout(type, div, typeSpan);
                });
            });

            // ลบ token ที่มี data-index (ตัวหมาก)
            document.querySelectorAll('#game-board .absolute[data-index]').forEach(el => el.remove());

            // แสดงผู้เล่นจากข้อมูล JSON
            for (let i = 0; i < 4; i++) {
                const key = `player${i + 1}`;
                const src = data[key];
                if (src) {
                    createPlayerFromSrc(i, src);
                }
            }

            // อัปเดต shop space
            for (let i = 0; i < 45; i++) {
                const cell = document.getElementById(`data-index-${i}`);
                const saved = data[`shop${i}`];
                if (cell && saved) {
                    cell.innerHTML = saved.content;
                    if (saved.title) {
                        cell.dataset.description = saved.title;
                    }
                    bindItemContextMenu(cell, i, saved.title);
                    cell.classList.add('disabled');
                }
            }
        } catch (err) {
            console.error("Error loading file:", err);
            alert("ไม่สามารถโหลดไฟล์นี้ได้ กรุณาใช้ไฟล์ที่ถูกต้องค่ะ 🍊");
        }
        // ลบค่า loadFile เพื่อสามารถโหลดเดิมซ้ำได้
        e.target.value = '';
    };
    reader.readAsText(file);
});

function createPlayerFromSrc(index, data) {
    const addPlayerDiv = document.getElementById('add-player-buttons');
    const currentBtn = addPlayerDiv.querySelector(`[data-index="${index}"]`);
    if (!currentBtn) return;

    const btnSize = currentBtn.offsetWidth;
    const imgUrl = typeof data === "string" ? data : data.src;
    const border = typeof data === "string" ? "#f97316" : data.border || "#f97316";

    const img = document.createElement('img');
    img.src = imgUrl;
    img.alt = "Player";
    img.className = "player-img rounded-full object-cover cursor-pointer";
    img.style.width = img.style.height = btnSize + "px";
    img.style.border = `4px solid ${border}`;
    img.style.background = "#fff";
    img.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
    img.dataset.index = index;


    // เพิ่ม contextmenu สำหรับลบ (copy logic เดิม)
    img.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        document.querySelectorAll('.player-context-menu').forEach(m => m.remove());

        const menu = document.createElement('div');
        menu.className = "player-context-menu absolute bg-white border rounded shadow px-3 py-2 text-sm z-50";
        menu.style.top = e.clientY + "px";
        menu.style.left = e.clientX + "px";
        menu.innerHTML = `<button class="text-red-600 hover:underline" type="button">ลบผู้เล่น</button>`;

        menu.querySelector('button').addEventListener('click', () => {
            const newBtn = createAddPlayerButton(index, btnSize);
            img.replaceWith(newBtn);
            window.bindAddPlayerBtnEvents();
            updateCharacterSpace();
            menu.remove();

            board.querySelectorAll(`.absolute[data-index="${index}"]`).forEach(token => token.remove());
        });

        document.body.addEventListener('click', function removeMenu(ev) {
            if (!menu.contains(ev.target)) {
                menu.remove();
                document.body.removeEventListener('click', removeMenu);
            }
        });

        document.body.appendChild(menu);
    });

    currentBtn.replaceWith(img);

    // เพิ่ม token ที่ตำแหน่ง START
    const startCell = [...document.querySelectorAll('.cell')].find(cell => {
        return cell.textContent.includes("START");
    });

    if (startCell) {
        const token = document.createElement('div');
        token.className = "absolute rounded-full border-4 cursor-grab active:cursor-grabbing";
        token.style.width = "48px";
        token.style.height = "48px";
        token.style.backgroundImage = `url(${imgUrl})`;
        token.style.backgroundSize = "cover";
        token.style.borderColor = border;
        token.style.backgroundColor = "#fff";
        token.dataset.index = index;

        const rect = startCell.getBoundingClientRect();
        const boardRect = board.getBoundingClientRect();
        token.style.left = `${rect.left - boardRect.left + rect.width / 2 - 16}px`;
        token.style.top = `${rect.top - boardRect.top + rect.height / 2 - 16}px`;

        token.draggable = true;
        token.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', token.dataset.index);
            token.classList.add("opacity-50");
        });
        token.addEventListener('dragend', (e) => {
            token.classList.remove("opacity-50");
        });

        board.appendChild(token);
        updateCharacterSpace();
    }
}
