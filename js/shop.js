const shopSpace = document.getElementById("shop-space");
shopSpace.innerHTML = `
    <h2 class="text-2xl font-bold text-center text-orange-600">SHOP</h2>
    <h2 class="text-lg font-bold text-center text-yellow-500 mb-4">ทุกอย่าง 1 G</h2>
    <div class="grid grid-cols-9 gap-4">
        ${Array.from({ length: 45 }).map((_, i) => `
            <div id="data-index-${i}" class="aspect-square bg-white border-4 border-orange-300 rounded-lg shadow flex items-center justify-center text-xl font-bold text-orange-400 cursor-pointer" onclick="openItemModal(${i})">
                +
            </div>
        `).join('')}
    </div>
`;

function toggleItemIconType() {
    const selected = document.querySelector('input[name="icon-item"]:checked').value;
    document.getElementById('item-image-url').classList.add('hidden');
    document.getElementById('item-emoji').classList.add('hidden');
    document.getElementById('item-image-upload').classList.add('hidden');

    if (selected === 'url') {
        document.getElementById('item-image-url').classList.remove('hidden');
    } else if (selected === 'text') {
        document.getElementById('item-emoji').classList.remove('hidden');
    } else if (selected === 'upload') {
        document.getElementById('item-image-upload').classList.remove('hidden');
    }
}

function openItemModal(index) {
    const cell = document.getElementById(`data-index-${index}`);
    if (cell.classList.contains('disabled')) return;

    const modal = document.getElementById('item-modal');
    modal.classList.remove('hidden');
    modal.dataset.index = index;
    document.getElementById('item-form').reset();

    // รีเซ็ต icon type เป็น URL และอัปเดตการแสดงผล
    document.querySelector('input[name="icon-type"][value="url"]').checked = true;
    toggleItemIconType();
}

function closeItemModal() {
    document.getElementById('item-modal').classList.add('hidden');
    document.getElementById('item-modal').dataset.index = '';
    document.getElementById('item-image-url').value = '';
    document.getElementById('item-emoji').value = '';
    document.getElementById('item-image-upload').value = '';
    document.getElementById('item-description').value = '';
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

const cellSize = 20;

async function saveItem() {
    const index = document.getElementById('item-modal').dataset.index;
    const cell = document.getElementById(`data-index-${index}`);
    const description = document.getElementById('item-description').value;
    const selected = document.querySelector('input[name="icon-item"]:checked').value;

    if (!cell) return;
    cell.classList.add('disabled');

    let imgUrl = '';

    if (selected === "url") {
        const url = document.getElementById("item-img").value;
        if (!url) return alert("กรุณาใส่ URL รูปภาพค่ะ");
        imgUrl = url;
    }

    else if (selected === "text") {
        const text = document.getElementById("item-text").value;
        if (!text) return alert("กรุณาใส่อิโมจิหรือข้อความค่ะ");
        imgUrl = generateImageFromText(text);
    }

    else if (selected === "upload") {
        const fileInput = document.getElementById("item-upload");
        if (fileInput.files.length === 0) return alert("กรุณาเลือกไฟล์ภาพก่อนค่ะ");
        const file = fileInput.files[0];
        imgUrl = await readFileAsDataURL(file);
    }

    // ใส่ภาพลงช่อง
    cell.innerHTML = `<img src="${imgUrl}" class="w-${cellSize} h-${cellSize} object-cover rounded">`;
    cell.dataset.description = description;
    bindItemContextMenu(cell, index, description);
    closeItemModal();
}

function bindItemContextMenu(cell, index, description) {
    cell.oncontextmenu = (e) => {
        e.preventDefault();
        document.querySelectorAll('.item-context-menu').forEach(m => m.remove());

        const menu = document.createElement('div');
        menu.className = "item-context-menu absolute bg-white border rounded shadow px-3 py-2 text-sm z-50";
        menu.style.top = `${e.clientY}px`;
        menu.style.left = `${e.clientX}px`;
        menu.innerHTML = `
            <button class="block w-full text-left px-2 py-1 hover:bg-gray-100 text-blue-600">คัดลอกรายละเอียด</button>
            <button class="block w-full text-left px-2 py-1 hover:bg-gray-100 text-green-600">ย้ายไปยังบอร์ด</button>
            <button class="block w-full text-left px-2 py-1 hover:bg-gray-100 text-orange-600">ย้ายไปยังหน้าตัวละคร</button>
            <button class="block w-full text-left px-2 py-1 hover:bg-gray-100 text-rose-600">ลบไอเทม</button>
        `;

        // คัดลอกรายละเอียด
        menu.children[0].onclick = () => {
            navigator.clipboard.writeText(description || "")
                .then(() => showToast("คัดลอกข้อมูลไอเทมเรียบร้อยแล้ว"))
                .catch(() => showToast("ไม่สามารถคัดลอกข้อมูลได้"));
            menu.remove();
        };

        // ย้ายไปยังบอร์ด
        menu.children[1].onclick = () => {
            const newItem = cell.cloneNode(true);
            newItem.className = `absolute z-30 w-${cellSize / 2} h-${cellSize / 2} disabled destroy-immediately`;
            newItem.style.top = "100px";
            newItem.style.left = "100px";
            // ปรับขนาดให้เล็กลง
            const imageElement = newItem.querySelector('img');
            imageElement.classList.replace(`w-${cellSize}`, `w-${cellSize / 2}`);
            imageElement.classList.replace(`h-${cellSize}`, `h-${cellSize / 2}`);

            const description = cell.dataset.description || "";
            bindItemContextMenu(newItem, index, description);
            makeItemDraggable(newItem);
            document.getElementById("game-board-space").appendChild(newItem);

            // ลบจากร้านค้า
            if (cell.classList.contains('destroy-immediately')) {
                cell.remove();
            } else {
                // ถ้าไม่ใช่ destroy-immediately ให้แค่ลบข้อมูล
                cell.innerHTML = "+";
                cell.removeAttribute("data-description");
                cell.classList.remove('disabled');
            }
            menu.remove();
        };

        // ย้ายไปยังหน้าตัวละคร
        menu.children[2].onclick = () => {
            const newItem = cell.cloneNode(true);
            newItem.className = `absolute z-30 w-${cellSize} h-${cellSize} disabled destroy-immediately`;
            newItem.style.top = "100px";
            newItem.style.left = "100px";
            // ปรับขนาดให้ปกติ
            const imageElement = newItem.querySelector('img');
            imageElement.classList.replace(`w-${cellSize / 2}`, `w-${cellSize}`);
            imageElement.classList.replace(`h-${cellSize / 2}`, `h-${cellSize}`);

            const description = cell.dataset.description || "";
            bindItemContextMenu(newItem, index, description);
            makeItemDraggable(newItem);
            document.getElementById("character-space").appendChild(newItem);

            // ลบจากร้านค้า
            if (cell.classList.contains('destroy-immediately')) {
                cell.remove();
            } else {
                // ถ้าไม่ใช่ destroy-immediately ให้แค่ลบข้อมูล
                cell.innerHTML = "+";
                cell.removeAttribute("data-description");
                cell.classList.remove('disabled');
            }
            menu.remove();
        };

        // ลบไอเทม
        menu.children[3].onclick = () => {
            if (cell.classList.contains('destroy-immediately')) {
                cell.remove();
            } else {
                // ถ้าไม่ใช่ destroy-immediately ให้แค่ลบข้อมูล
                cell.innerHTML = "+";
                cell.removeAttribute("data-description");
                cell.classList.remove('disabled');
            }
            menu.remove();
        };

        // ปิดเมนูเมื่อคลิกที่อื่น
        document.body.addEventListener('click', function removeMenu(ev) {
            if (!menu.contains(ev.target)) {
                menu.remove();
                document.body.removeEventListener('click', removeMenu);
            }
        });

        document.body.appendChild(menu);
    };
}

function makeItemDraggable(item) {
    item.style.position = "absolute";
    item.style.cursor = "grab";
    item.draggable = false;

    item.onmousedown = (e) => {
        e.preventDefault();

        const shiftX = e.clientX - item.getBoundingClientRect().left;
        const shiftY = e.clientY - item.getBoundingClientRect().top;

        function moveAt(pageX, pageY) {
            item.style.left = pageX - shiftX + 'px';
            item.style.top = pageY - shiftY + 'px';
        }

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        document.addEventListener('mousemove', onMouseMove);

        item.onmouseup = () => {
            document.removeEventListener('mousemove', onMouseMove);
            item.onmouseup = null;
        };
    };

    item.ondragstart = () => false;
}
