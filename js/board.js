let isSpinning = false;
let currentRotation = 0;

const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spinBtn');
const result = document.getElementById('result');

function spinWheel() {
    if (isSpinning) return;

    isSpinning = true;
    spinBtn.disabled = true;
    result.textContent = '';

    const randomRotation = Math.floor(Math.random() * 1800) + 700; // หมุนระหว่าง 700 ถึง 2500 องศา
    currentRotation -= randomRotation;

    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        const finalRotation = (currentRotation % 360) * -1;
        let resultNumber;

        if (finalRotation >= 0 && finalRotation < 216) {
            resultNumber = 1;
        } else if (finalRotation >= 216 && finalRotation < 324) {
            resultNumber = 2;
        } else {
            resultNumber = 3;
        }

        result.textContent = `ผลลัพธ์: ${resultNumber}`;
        isSpinning = false;
        spinBtn.disabled = false;
    }, 1500); // เวลา 1500
}

spinBtn.addEventListener('click', spinWheel);
wheel.addEventListener('click', spinWheel);

const TYPES = ["GOOD", "BAD", "CHANCE", "MONEY +1", "DUEL", "GAMBLE", "blank"];

let layout = [
    ["blank", "BAD", "CHANCE", "blank", "BAD", "blank", "CHANCE"],
    ["DUEL", "blank", null, "blank", "blank", null, "MONEY +1"],
    ["blank", "GOOD", "blank", "START", "blank", "CHANCE", "blank"],
    ["MONEY +1", "CHANCE", "MONEY +1", "blank", "GAMBLE", null, "CHANCE"],
    ["CHANCE", null, "blank", "GOOD", "blank", "CHANCE", "MONEY +1"]
];

const board = document.getElementById("game-board");
const lines = document.getElementById("lines");

const positions = {};

let cellNumber = 1;

// สร้าง cell ทั้งหมดก่อน
layout.forEach((row, y) => {
    row.forEach((type, x) => {
        if (type === null) {
            // ช่อง null: เว้นระยะห่าง
            const emptyDiv = document.createElement("div");
            emptyDiv.className = "w-28 h-20 opacity-0 pointer-events-none";
            board.appendChild(emptyDiv);
            return;
        }

        const div = document.createElement("div");
        div.className = "cell flex items-center justify-center border border-gray-400 rounded-md w-28 h-20 text-xs font-semibold text-center select-none transition hover:bg-gray-100 cursor-pointer relative";

        // เพิ่มสีตามประเภท
        if (type === "blank") {
            div.classList.add("bg-gray-300");
        } else if (type === "CHANCE") {
            div.classList.add("bg-purple-300");
        } else if (type === "MONEY +1") {
            div.classList.add("bg-yellow-200");
        } else if (type === "BAD") {
            div.classList.add("bg-gradient-to-r", "from-red-400", "to-orange-400");
        } else if (type === "DUEL") {
            div.classList.add("bg-gradient-to-r", "from-black", "to-blue-900");
        } else if (type === "GOOD") {
            div.classList.add("bg-gradient-to-r", "from-yellow-300", "to-sky-300");
        } else if (type === "GAMBLE") {
            div.classList.add("bg-gradient-to-r", "from-pink-400", "to-yellow-300");
        } else {
            div.classList.add("bg-white");
        }

        div.dataset.row = y;
        div.dataset.col = x;

        // สร้าง span สำหรับข้อความหลัก
        const typeSpan = document.createElement("span");
        typeSpan.className = "cell-type";
        typeSpan.textContent = type === "blank" ? "" : type;
        // กำหนดสีข้อความสำหรับ DUEL
        if (type === "DUEL") {
            typeSpan.classList.add("text-white");
        }
        div.appendChild(typeSpan);

        const id = `${y}-${x}`;
        positions[id] = { x, y };

        // เฉพาะช่อง START ไม่ต้องแสดงเลข
        if (type === "START") {
            div.classList.add("bg-white", "font-bold");
        } else {
            // เพิ่มเลขช่องที่มุมขวาล่าง
            const numSpan = document.createElement("span");
            numSpan.textContent = cellNumber;
            // ถ้าเป็น DUEL ให้เลขเป็นสีขาว
            numSpan.className = `absolute bottom-1 right-2 text-[10px] ${type === "DUEL" ? "text-white" : "text-black"}`;
            div.appendChild(numSpan);
            cellNumber++;
        }

        if (type !== "START") {
            // คลิกขวาเพื่อเปลี่ยนประเภทช่อง
            div.addEventListener("contextmenu", (e) => {
                e.preventDefault();

                // ถ้ามี select เดิมอยู่แล้ว ให้ลบก่อน
                const oldSelect = div.querySelector("select.cell-type-select");
                if (oldSelect) oldSelect.remove();

                // สร้าง select
                const select = document.createElement("select");
                select.className = "cell-type-select absolute bottom-1 left-1 text-xs bg-white border rounded shadow z-20";
                TYPES.forEach(optType => {
                    if (optType === "START") return; // ไม่ให้เลือก START
                    const option = document.createElement("option");
                    option.value = optType;
                    option.textContent = optType === "blank" ? "(blank)" : optType;
                    if ((typeSpan.textContent === "" && optType === "blank") || typeSpan.textContent === optType) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });

                // เมื่อเลือกแล้วเปลี่ยนประเภทช่อง
                select.addEventListener("change", () => {
                    const next = select.value;
                    loadLayout(next, div, typeSpan);
                    select.remove();
                });

                // เมื่อ select เสีย focus ให้ลบ
                select.addEventListener("blur", () => select.remove());

                div.appendChild(select);
                select.focus();
            });
        }

        board.appendChild(div);
    });
});

function loadLayout(next, div, typeSpan) {
    typeSpan.textContent = next === "blank" ? "" : next;

    // อัปเดต layout array
    layout[parseInt(div.dataset.row)][parseInt(div.dataset.col)] = next;

    // เปลี่ยนสีข้อความ DUEL
    typeSpan.classList.remove("text-white");
    if (next === "DUEL") typeSpan.classList.add("text-white");

    // เปลี่ยนสีพื้นหลัง
    div.classList.remove(
        "bg-gray-300", "bg-purple-300", "bg-yellow-200", "bg-white",
        "bg-gradient-to-br", "bg-gradient-to-r",
        "from-red-400", "to-orange-400",
        "from-black", "to-blue-900",
        "from-yellow-300", "to-sky-300",
        "from-pink-400", "to-yellow-300"
    );
    if (next === "blank") {
        div.classList.add("bg-gray-300");
    } else if (next === "CHANCE") {
        div.classList.add("bg-purple-300");
    } else if (next === "MONEY +1") {
        div.classList.add("bg-yellow-200");
    } else if (next === "BAD") {
        div.classList.add("bg-gradient-to-r", "from-red-400", "to-orange-400");
    } else if (next === "DUEL") {
        div.classList.add("bg-gradient-to-r", "from-black", "to-blue-900");
    } else if (next === "GOOD") {
        div.classList.add("bg-gradient-to-r", "from-yellow-300", "to-sky-300");
    } else if (next === "GAMBLE") {
        div.classList.add("bg-gradient-to-r", "from-pink-400", "to-yellow-300");
    } else {
        div.classList.add("bg-white");
    }

    // เปลี่ยนสีตัวเลข
    const numSpan = div.querySelector("span:not(.cell-type)");
    if (numSpan) {
        numSpan.classList.remove("text-white", "text-black");
        if (next === "DUEL") {
            numSpan.classList.add("text-white");
        } else {
            numSpan.classList.add("text-black");
        }
    }
}

// Define paths between tiles (manually based on visual layout)
const paths = [
    [[0, 0], [0, 6]], [[0, 0], [2, 0]], [[0, 1], [3, 1]], [[1, 0], [1, 1]], [[2, 0], [2, 6]],
    [[3, 0], [4, 0]], [[3, 0], [3, 4]], [[3, 2], [4, 2]], [[4, 2], [4, 6]], [[0, 3], [4, 3]],
    [[0, 4], [4, 4]], [[0, 6], [4, 6]]
];

function drawSpecialLine(x, y, directionX, directionY, color, side) {
    const fromCell = document.querySelector(`.cell[data-row="${x}"][data-col="${y}"]`);
    if (!fromCell) return;

    const fromRect = fromCell.getBoundingClientRect();

    let p1x, p1y;

    if (side === "left") {
        p1x = fromRect.left;
        p1y = fromRect.top + fromRect.height / 2;
    } else if (side === "right") {
        p1x = fromRect.right;
        p1y = fromRect.top + fromRect.height / 2;
    } else if (side === "top") {
        p1x = fromRect.left + fromRect.width / 2;
        p1y = fromRect.top;
    } else if (side === "bottom") {
        p1x = fromRect.left + fromRect.width / 2;
        p1y = fromRect.bottom;
    }

    const p2x = p1x + directionX;
    const p2y = p1y + directionY;

    const overlaySvg = document.getElementById('special-lines');
    if (!overlaySvg) return;

    const specialLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    specialLine.setAttribute("x1", p1x);
    specialLine.setAttribute("y1", p1y);
    specialLine.setAttribute("x2", p2x);
    specialLine.setAttribute("y2", p2y);
    specialLine.setAttribute("stroke", color);
    specialLine.setAttribute("stroke-width", "4");
    specialLine.setAttribute("stroke-linecap", "round");

    // ✅ เพิ่มเส้นประ
    specialLine.setAttribute("stroke-dasharray", "8, 10");

    overlaySvg.appendChild(specialLine);
}

function drawLine(x1, y1, x2, y2) {
    // หา cell ต้นทางและปลายทาง
    const fromCell = document.querySelector(`.cell[data-row="${y1}"][data-col="${x1}"]`);
    const toCell = document.querySelector(`.cell[data-row="${y2}"][data-col="${x2}"]`);
    if (!fromCell || !toCell) return;

    // หา offset ของ game-board
    const boardRect = board.getBoundingClientRect();

    // กึ่งกลาง cell ต้นทาง
    const fromRect = fromCell.getBoundingClientRect();
    const p1x = fromRect.left - boardRect.left + fromRect.width / 2;
    const p1y = fromRect.top - boardRect.top + fromRect.height / 2;

    // กึ่งกลาง cell ปลายทาง
    const toRect = toCell.getBoundingClientRect();
    const p2x = toRect.left - boardRect.left + toRect.width / 2;
    const p2y = toRect.top - boardRect.top + toRect.height / 2;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", p1x);
    line.setAttribute("y1", p1y);
    line.setAttribute("x2", p2x);
    line.setAttribute("y2", p2y);
    line.setAttribute("stroke", "#888");
    line.setAttribute("stroke-width", "3");
    line.setAttribute("stroke-linecap", "round");
    lines.appendChild(line);
}

// วาดเส้นหลัง DOM render แล้ว
setTimeout(() => {
    paths.forEach(([from, to]) => drawLine(from[1], from[0], to[1], to[0]));
    drawSpecialLine(0, 0, -10000, 0, "red", "left"); // เส้นพิเศษ
    drawSpecialLine(1, 6, 10000, 0, "red", "right");
    drawSpecialLine(0, 1, 0, -10000, "orange", "top");
    drawSpecialLine(4, 5, 0, 10000, "orange", "bottom");
    drawSpecialLine(0, 4, 0, -10000, "#ADD8E6", "top");
    drawSpecialLine(4, 0, 0, 10000, "#ADD8E6", "bottom");
}, 0);

// หลังจากสร้าง Game Board แล้ว ให้เพิ่มปุ่มเพิ่มผู้เล่น
window.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const addPlayerDiv = document.getElementById('add-player-buttons');

    // 🎯 สลับ input
    const urlWrapper = document.getElementById('url-input-wrapper');
    const textWrapper = document.getElementById('text-input-wrapper');
    const iconTypeRadios = document.querySelectorAll('input[name="icon-type"]');
    const uploadInputWrapper = document.getElementById('upload-input-wrapper');

    function hideModeInModalAll() {
        // เปลี่ยนใน Modal เป็น URL Mode
        urlWrapper.classList.add('hidden');
        textWrapper.classList.add('hidden');
        uploadInputWrapper.classList.add('hidden');
    }

    iconTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            hideModeInModalAll();

            if (radio.value === 'url') {
                urlWrapper.classList.remove('hidden');
            } else if (radio.value === 'text') {
                textWrapper.classList.remove('hidden');
            } else if (radio.value === 'upload') {
                uploadInputWrapper.classList.remove('hidden');
            }
        });
    });

    document.querySelectorAll('#character-space > div').forEach((card, index) => {
        // Gold buttons
        card.querySelector('.gold-plus').addEventListener('click', () => {
            updatePlayerStat(index, 'gold', 1);
        });
        card.querySelector('.gold-minus').addEventListener('click', () => {
            updatePlayerStat(index, 'gold', -1);
        });

        // Orange buttons
        card.querySelector('.orange-plus').addEventListener('click', () => {
            updatePlayerStat(index, 'orange', 1);
        });
        card.querySelector('.orange-minus').addEventListener('click', () => {
            updatePlayerStat(index, 'orange', -1);
        });
    });

    setTimeout(() => {
        const boardRect = gameBoard.getBoundingClientRect();
        const boardHeight = boardRect.height;

        const btnCount = 4;
        const btnGap = 16;
        const btnSize = (boardHeight - btnGap * (btnCount - 1)) / btnCount;

        addPlayerDiv.style.height = boardHeight + "px";
        addPlayerDiv.innerHTML = "";

        for (let i = 0; i < btnCount; i++) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = `add-player-btn flex items-center justify-center rounded-full bg-orange-400 hover:bg-orange-500 shadow w-[${btnSize}px] h-[${btnSize}px] text-white text-3xl transition-all`;
            btn.style.width = btn.style.height = btnSize + "px";
            btn.innerHTML = '<span class="pointer-events-none select-none">+</span>';
            btn.title = "เพิ่มผู้เล่น";
            btn.dataset.index = i;
            addPlayerDiv.appendChild(btn);
            if (i < btnCount - 1) {
                const gap = document.createElement("div");
                gap.style.height = btnGap + "px";
                addPlayerDiv.appendChild(gap);
            }
        }

        // Dummy left space
        const leftSpace = document.getElementById('left-space');
        leftSpace.style.height = boardHeight + "px";
        leftSpace.innerHTML = "";
        for (let i = 0; i < btnCount; i++) {
            const dummy = document.createElement("div");
            dummy.className = `rounded-full w-[${btnSize}px] h-[${btnSize}px] opacity-0`;
            dummy.style.width = dummy.style.height = btnSize + "px";
            leftSpace.appendChild(dummy);
            if (i < btnCount - 1) {
                const gap = document.createElement("div");
                gap.style.height = btnGap + "px";
                leftSpace.appendChild(gap);
            }
        }

        const addOrangeBtn = document.createElement("button");
        addOrangeBtn.type = "button";
        addOrangeBtn.className = "absolute bg-orange-300 hover:bg-orange-200 text-white font-bold px-4 py-4 rounded-full shadow transition-all";
        addOrangeBtn.innerHTML = '🍊';
        addOrangeBtn.title = "เพิ่มส้มลงในบอร์ด";

        // วางปุ่มในตำแหน่งกึ่งกลางของ left-space และใกล้ช่องที่ 1
        addOrangeBtn.style.top = "0px";
        addOrangeBtn.style.left = "100%";
        addOrangeBtn.style.transform = "translateX(-50%)";

        addOrangeBtn.addEventListener('click', createOrange);

        leftSpace.appendChild(addOrangeBtn);

        // Modal logic
        const modalBg = document.getElementById('player-modal-bg');
        const closeModal = document.getElementById('close-modal');
        const playerForm = document.getElementById('player-form');
        const playerImgInput = document.getElementById('player-img');
        const playerBorderInput = document.getElementById('player-border');
        let currentBtn = null;

        // เปิด modal เมื่อกดปุ่มเพิ่มผู้เล่น
        window.bindAddPlayerBtnEvents = function () {
            document.querySelectorAll('.add-player-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    currentBtn = btn;
                    playerForm.reset();
                    playerBorderInput.value = "#f97316";
                    modalBg.classList.remove('hidden');
                });
            });
        }
        bindAddPlayerBtnEvents();

        // ปิด modal
        closeModal.addEventListener('click', () => {
            modalBg.classList.add('hidden');
            // เปลี่ยนใน Modal เป็น URL Mode
            hideModeInModalAll();
            urlWrapper.classList.remove('hidden');
        });
        modalBg.addEventListener('click', (e) => {
            if (e.target === modalBg) modalBg.classList.add('hidden');
        });

        // เมื่อ submit ฟอร์ม
        const playerUploadInput = document.getElementById('player-upload');
        playerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!currentBtn) return;

            // เปลี่ยนใน Modal เป็น URL Mode
            hideModeInModalAll();
            urlWrapper.classList.remove('hidden');

            const borderColor = playerBorderInput.value;

            let imgUrl = "";
            const iconType = document.querySelector('input[name="icon-type"]:checked').value;

            if (iconType === "url") {
                imgUrl = playerImgInput.value;
            } else if (iconType === "text") {
                const emoji = document.getElementById("player-text").value.trim();
                if (!emoji) return alert("กรุณาใส่อิโมจิหรือข้อความ");
                imgUrl = generateImageFromText(emoji);
            } else if (iconType === "upload") {
                const file = playerUploadInput.files[0];
                if (!file) return alert("กรุณาเลือกรูปภาพก่อนนะคะ");
                imgUrl = await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = (ev) => resolve(ev.target.result);
                    reader.readAsDataURL(file);
                });
            }

            // สร้างรูปผู้เล่นแทนปุ่ม
            const img = document.createElement('img');
            img.src = imgUrl;
            img.alt = "Player";
            img.className = "player-img rounded-full object-cover cursor-pointer";
            img.style.width = img.style.height = currentBtn.style.width;
            img.style.border = `4px solid ${borderColor}`;
            img.style.background = "#fff";
            img.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
            img.dataset.index = currentBtn.dataset.index;

            // เพิ่ม contextmenu สำหรับลบ
            img.addEventListener('contextmenu', function (e) {
                e.preventDefault();
                // ลบเมนูเดิมถ้ามี
                document.querySelectorAll('.player-context-menu').forEach(m => m.remove());

                // สร้างเมนู
                const menu = document.createElement('div');
                menu.className = "player-context-menu absolute bg-white border rounded shadow px-3 py-2 text-sm z-50";
                menu.style.top = e.clientY + "px";
                menu.style.left = e.clientX + "px";
                menu.innerHTML = `<button class="text-red-600 hover:underline" type="button">ลบผู้เล่น</button>`;

                // ลบผู้เล่นเมื่อกด
                menu.querySelector('button').addEventListener('click', () => {
                    // สร้างปุ่มใหม่แทน img
                    const newBtn = createAddPlayerButton(img.dataset.index, parseFloat(img.style.width));
                    img.replaceWith(newBtn);
                    bindAddPlayerBtnEvents();
                    updateCharacterSpace();
                    menu.remove();

                    // 🔥 ลบตัวหมากผู้เล่นที่ตรงกับ dataset.index
                    const token = board.querySelector(`.absolute[data-index="${img.dataset.index}"]`);
                    if (token) token.remove();
                });


                // ลบเมนูเมื่อคลิกที่อื่น
                document.body.addEventListener('click', function removeMenu(ev) {
                    if (!menu.contains(ev.target)) {
                        menu.remove();
                        document.body.removeEventListener('click', removeMenu);
                    }
                });

                document.body.appendChild(menu);
            });

            currentBtn.replaceWith(img);
            updateCharacterSpace();

            modalBg.classList.add('hidden');
            currentBtn = null;

            // หา cell START
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
                token.style.borderColor = borderColor;
                token.style.backgroundColor = "#fff";
                token.dataset.index = img.dataset.index;

                // ตำแหน่งเริ่มต้น
                const rect = startCell.getBoundingClientRect();
                const boardRect = board.getBoundingClientRect();
                token.style.left = `${rect.left - boardRect.left + rect.width / 2 - 16}px`;
                token.style.top = `${rect.top - boardRect.top + rect.height / 2 - 16}px`;

                // ให้ลากได้
                token.draggable = true;
                token.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', token.dataset.index);
                    token.classList.add("opacity-50");
                });
                token.addEventListener('dragend', (e) => {
                    token.classList.remove("opacity-50");
                });

                // ✅ เพิ่มหมากเข้า board
                board.appendChild(token);
            }
        });
    }, 0);
});

// ให้วางไว้แค่ครั้งเดียวเท่านั้น
board.addEventListener('dragover', (e) => {
    e.preventDefault();
});

board.addEventListener('drop', (e) => {
    e.preventDefault();
    const index = e.dataTransfer.getData('text/plain');
    const droppedToken = board.querySelector(`.absolute[data-index="${index}"]`);
    if (droppedToken) {
        const offsetX = 24; // ครึ่งหนึ่งของขนาดหมาก
        const offsetY = 24;
        const boardBox = board.getBoundingClientRect();
        droppedToken.style.left = `${e.clientX - boardBox.left - offsetX}px`;
        droppedToken.style.top = `${e.clientY - boardBox.top - offsetY}px`;
    }
});

function generateImageFromText(text, color = "#000", fontSize = 48) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 128;
    canvas.height = 128;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    return canvas.toDataURL("image/png");
}

const orangeMap = new Map();

function getCellKey(cell) {
    return `${cell.dataset.row}-${cell.dataset.col}`;
}

function getBoardOffsetPos(cell) {
    const rect = cell.getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();
    return {
        left: rect.left - boardRect.left + rect.width / 2 - 46,
        top: rect.top - boardRect.top + rect.height / 2 - 46
    };
}

function updateOrangeDisplay(orange, count) {
    orange.dataset.count = count;
    orange.innerHTML = count > 1 ? `🍊x${count}` : '🍊';
}

function createOrUpdateOrangeAtCell(cell, amount = 1) {
    const key = getCellKey(cell);
    let orange = document.querySelector(`.orange-item[data-key="${key}"]`);

    if (orange) {
        const current = parseInt(orange.dataset.count || "1");
        updateOrangeDisplay(orange, current + amount);
    } else {
        const pos = getBoardOffsetPos(cell);
        orange = document.createElement('div');
        orange.className = "orange-item absolute cursor-pointer select-none";
        orange.dataset.key = key;
        orange.style.left = `${pos.left}px`;
        orange.style.top = `${pos.top}px`;
        orange.style.fontSize = '30px';
        orange.style.zIndex = '15';
        updateOrangeDisplay(orange, amount);
        bindOrangeContextMenu(orange);
        board.appendChild(orange);
    }
}

function getRandomCellForOrange() {
    const cells = document.querySelectorAll('.cell');
    return Array.from(cells).filter(c => c.querySelector('.cell-type')?.textContent !== 'START')
        .sort(() => 0.5 - Math.random())[0] || null;
}

function createOrange() {
    showToast("กำลังเพิ่มส้ม...");
    const cell = getRandomCellForOrange();
    if (cell) createOrUpdateOrangeAtCell(cell);
}

function bindOrangeContextMenu(orange) {
    orange.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        document.querySelectorAll('.orange-context-menu').forEach(m => m.remove());

        const menu = document.createElement('div');
        menu.className = "orange-context-menu absolute bg-white border rounded shadow px-3 py-2 text-sm z-50";
        menu.style.top = `${e.clientY}px`;
        menu.style.left = `${e.clientX}px`;
        menu.innerHTML = `
    <button class="block w-full text-left px-2 py-1 hover:bg-gray-100 text-blue-600">สุ่มที่อยู่ใหม่</button>
    <button class="block w-full text-left px-2 py-1 hover:bg-gray-100 text-purple-600">ย้ายที่</button>
    <button class="block w-full text-left px-2 py-1 hover:bg-gray-100 text-rose-600">ลบส้ม</button>
`;

        menu.children[0].addEventListener('click', () => {
            const count = parseInt(orange.dataset.count || "1");
            if (count > 1) updateOrangeDisplay(orange, count - 1);
            else orange.remove();
            createOrange();
            menu.remove();
        });

        menu.children[1].addEventListener('click', () => {
            menu.remove();
            showToast("คลิกที่ตำแหน่งใหม่เพื่อย้ายส้ม");
            setTimeout(() => {
                const moveHandler = (ev) => {
                    const cell = ev.target.closest('.cell');
                    if (!cell || cell.querySelector('.cell-type')?.textContent === 'START') return;

                    createOrUpdateOrangeAtCell(cell);

                    let count = parseInt(orange.dataset.count || "1");
                    if (count > 1) updateOrangeDisplay(orange, count - 1);
                    else orange.remove();

                    document.removeEventListener('click', moveHandler);
                    document.getElementById("result").innerHTML = "";
                };
                document.addEventListener('click', moveHandler);
            }, 10);
        });

        menu.children[2].addEventListener('click', () => {
            let count = parseInt(orange.dataset.count || "1");
            if (count > 1) updateOrangeDisplay(orange, count - 1);
            else orange.remove();
            menu.remove();
        });

        document.body.addEventListener('click', function closeMenu(ev) {
            if (!menu.contains(ev.target)) {
                menu.remove();
                document.body.removeEventListener('click', closeMenu);
            }
        });

        document.body.appendChild(menu);
    });
}
