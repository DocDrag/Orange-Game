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

        // ฟังก์ชันช่วยเหลือในการลบไอเทมออกจากโค้ดและคืนค่าช่อง
        function removeCellAndRestoreSlot(itemCell) {
            const parent = itemCell.parentElement;
            
            if (itemCell.classList.contains('destroy-immediately')) {
                itemCell.remove();
            } else {
                // ถ้าไม่ใช่ destroy-immediately ให้แค่ลบข้อมูล (สำหรับช่องในร้านค้า)
                itemCell.innerHTML = "+";
                itemCell.removeAttribute("data-description");
                itemCell.classList.remove('disabled');
            }
            
            // ถ้าไอเทมอยู่ในช่องเก็บของตอนลบ ให้แสดงปุ่ม + คืนมา
            if (parent && parent.classList && parent.classList.contains('inventory-slot')) {
                parent.innerHTML = '<i class="fas fa-plus"></i>';
            }
        }

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
            // ล้าง style ที่อาจติดมาจากช่องเก็บของ
            newItem.style.position = "absolute";
            newItem.style.zIndex = "30";
            
            newItem.className = `absolute z-30 w-${cellSize / 2} h-${cellSize / 2} disabled destroy-immediately`;
            newItem.style.top = "100px";
            newItem.style.left = "100px";
            
            // บังคับเปลี่ยนคลาสรูปภาพป้องกัน w-full 
            const imageElement = newItem.querySelector('img');
            if (imageElement) {
                imageElement.className = `w-${cellSize / 2} h-${cellSize / 2} object-cover rounded`;
            }

            const description = cell.dataset.description || "";
            bindItemContextMenu(newItem, index, description);
            makeItemDraggable(newItem);
            document.getElementById("game-board-space").appendChild(newItem);

            // ลบจากร้านค้าหรือช่อง
            removeCellAndRestoreSlot(cell);
            menu.remove();
        };

        // ย้ายไปยังหน้าตัวละคร
        menu.children[2].onclick = () => {
            const newItem = cell.cloneNode(true);
            // ล้าง style ที่อาจติดมาจากช่องเก็บของ
            newItem.style.position = "absolute";
            newItem.style.zIndex = "30";
            
            newItem.className = `absolute z-30 w-${cellSize} h-${cellSize} disabled destroy-immediately`;
            newItem.style.top = "100px";
            newItem.style.left = "100px";
            
            // บังคับเปลี่ยนคลาสรูปภาพป้องกัน w-full 
            const imageElement = newItem.querySelector('img');
            if (imageElement) {
                imageElement.className = `w-${cellSize} h-${cellSize} object-cover rounded`;
            }

            const description = cell.dataset.description || "";
            bindItemContextMenu(newItem, index, description);
            makeItemDraggable(newItem);
            document.getElementById("character-space").appendChild(newItem);

            // ลบจากร้านค้าหรือช่อง
            removeCellAndRestoreSlot(cell);
            menu.remove();
        };

        // ลบไอเทม
        menu.children[3].onclick = () => {
            removeCellAndRestoreSlot(cell);
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
    item.style.cursor = "grab";
    item.draggable = false;

    item.onmousedown = (e) => {
        // ป้องกันลากเว้นแต่จะคลิกเมาส์ซ้าย
        if (e.button !== 0) return;
        
        e.preventDefault();
        const itemRect = item.getBoundingClientRect();
        
        // ถ้าถูกดึงออกมาจากช่องเก็บของ ให้เอา + กลับมาแล้วย้ายไปอยู่ใน character-space หรือ document.body
        const slot = item.parentElement;
        if (slot && slot.classList.contains('inventory-slot')) {
            slot.innerHTML = '<i class="fas fa-plus"></i>';
            document.getElementById("character-space").appendChild(item);
            
            // คืนขนาดรูปภาพและปรับเป็น Absolute คืนเฉพาะตอนดึงออกจากช่องเก็บของ
            item.classList.remove('w-full', 'h-full');
            const img = item.querySelector('img');
            if (img) {
                img.className = `w-${cellSize} h-${cellSize} object-cover rounded`;
                item.className = `absolute z-50 w-${cellSize} h-${cellSize} disabled destroy-immediately`;
            }
        }

        // ทำให้ลากได้โดยไม่เปลี่ยนขนาดเดิม (ยกเว้นเพิ่งดึงออกจากช่อง)
        item.style.position = "absolute";
        item.classList.add('absolute', 'z-50');

        const shiftX = e.clientX - itemRect.left;
        const shiftY = e.clientY - itemRect.top;

        moveAt(e.pageX, e.pageY);

        function moveAt(pageX, pageY) {
            item.style.left = pageX - shiftX + 'px';
            item.style.top = pageY - shiftY + 'px';
        }

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        function onMouseUp(ev) {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            // ตรวจหา container ที่ผู้ใช้เอาไปวาง (โดยซ่อนตัวมันเองชั่วคราว)
            item.hidden = true;
            let elemBelow = document.elementFromPoint(ev.clientX, ev.clientY);
            item.hidden = false;

            if (elemBelow) {
                let dropZone = elemBelow.closest('.inventory-slot');
                if (dropZone && !dropZone.querySelector('img')) {
                    // หากช่องเก็บของนั้นว่าง (ไม่มีรูปข้างใน) ก็จับใส่ได้เลย
                    dropZone.innerHTML = '';
                    
                    item.style.position = 'relative';
                    item.style.left = 'auto';
                    item.style.top = 'auto';
                    item.style.zIndex = 'auto';
                    
                    // ถอดคลาสขนาดทั้งหมดออกเพื่อให้เป็น w-full h-full ตามช่องเก็บของ
                    item.classList.remove('absolute', 'z-50', `w-${cellSize}`, `h-${cellSize}`, `w-${cellSize/2}`, `h-${cellSize/2}`);
                    item.classList.add('w-full', 'h-full');
                    
                    const img = item.querySelector('img');
                    if (img) {
                        img.className = 'w-full h-full object-cover rounded-xl';
                    }
                    
                    dropZone.appendChild(item);
                }
            }
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    item.ondragstart = () => false;
}
