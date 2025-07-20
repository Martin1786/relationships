// Map rendering functions for the Village Community Network app

function createPeople() {
    const container = document.getElementById('mapContainer');
    window.people.forEach(person => {
        const personEl = document.createElement('div');
        personEl.className = 'person';
        personEl.id = person.id;
        personEl.style.left = person.x + 'px';
        personEl.style.top = person.y + 'px';
        personEl.innerHTML = `
            <div class="person-name">${person.name}</div>
            <div class="person-role">${person.role}</div>
        `;
        // --- DRAGGABLE FUNCTIONALITY START ---
        let offsetX, offsetY, isDragging = false;
        personEl.addEventListener('mousedown', function(e) {
            isDragging = true;
            offsetX = e.clientX - personEl.offsetLeft;
            offsetY = e.clientY - personEl.offsetTop;
            personEl.style.zIndex = 1000;
            document.body.style.userSelect = 'none';
        });
        document.addEventListener('mousemove', function moveHandler(e) {
            if (!isDragging) return;
            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;
            const containerRect = container.getBoundingClientRect();
            newX = Math.max(0, Math.min(newX, containerRect.width - personEl.offsetWidth));
            newY = Math.max(0, Math.min(newY, containerRect.height - personEl.offsetHeight));
            personEl.style.left = newX + 'px';
            personEl.style.top = newY + 'px';
        });
        document.addEventListener('mouseup', function upHandler(e) {
            if (!isDragging) return;
            isDragging = false;
            personEl.style.zIndex = '';
            document.body.style.userSelect = '';
            const idx = window.people.findIndex(p => p.id === person.id);
            if (idx !== -1) {
                window.people[idx].x = parseInt(personEl.style.left);
                window.people[idx].y = parseInt(personEl.style.top);
            }
            window.refreshMap();
        });
        // --- DRAGGABLE FUNCTIONALITY END ---
        // --- RIGHT-CLICK EDIT MODAL ---
        personEl.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            window.openEditPersonModal(person.id);
        });
        // --- END RIGHT-CLICK EDIT MODAL ---
        container.appendChild(personEl);
    });
}

function createConnections() {
    const container = document.getElementById('mapContainer');
    const pairMap = {};
    window.connections.forEach((conn, idx) => {
        const key = [conn.from, conn.to].sort().join('__');
        if (!pairMap[key]) pairMap[key] = [];
        pairMap[key].push({conn, idx});
    });
    const renderedPairs = new Set();
    const placedLabels = [];
    function isOverlapping(x, y, w, h) {
        for (const box of placedLabels) {
            if (
                x < box.x + box.w &&
                x + w > box.x &&
                y < box.y + box.h &&
                y + h > box.y
            ) {
                return true;
            }
        }
        return false;
    }
    function findSpiralPosition(baseLeft, baseTop, labelW, labelH) {
        const spiralStep = 18;
        const spiralTurns = 16;
        for (let i = 0; i < spiralTurns; i++) {
            const angle = (i * 137.5) * Math.PI / 180;
            const radius = spiralStep * Math.ceil(i / 2);
            const dx = Math.cos(angle) * radius;
            const dy = Math.sin(angle) * radius;
            const testLeft = baseLeft + dx;
            const testTop = baseTop + dy;
            if (!isOverlapping(testLeft - labelW/2, testTop - labelH/2, labelW, labelH)) {
                return {left: testLeft, top: testTop};
            }
        }
        return {left: baseLeft, top: baseTop};
    }
    window.connections.forEach((conn, index) => {
        const fromPerson = window.people.find(p => p.id === conn.from);
        const toPerson = window.people.find(p => p.id === conn.to);
        if (!fromPerson || !toPerson) {
            console.warn(`Connection skipped: Could not find person for IDs '${conn.from}' or '${conn.to}'`);
            return;
        }
        const fromX = fromPerson.x + 60;
        const fromY = fromPerson.y + 40;
        const toX = toPerson.x + 60;
        const toY = toPerson.y + 40;
        const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
        const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;
        const connectionEl = document.createElement('div');
        connectionEl.className = `connection ${conn.type}-connection`;
        connectionEl.style.left = fromX + 'px';
        connectionEl.style.top = fromY + 'px';
        connectionEl.style.width = distance + 'px';
        connectionEl.style.transform = `rotate(${angle}deg)`;
        connectionEl.dataset.type = conn.type;
        container.appendChild(connectionEl);
        const reverse = window.connections.find(c => c.from === conn.to && c.to === conn.from);
        const pairKey = [conn.from, conn.to].sort().join('__');
        const baseLeft = (fromX + (toX - fromX) / 2);
        const baseTop = (fromY + (toY - fromY) / 2);
        let labelW = 120, labelH = 28;
        if (reverse && !renderedPairs.has(pairKey)) {
            const labelContainer = document.createElement('div');
            labelContainer.style.position = 'absolute';
            labelContainer.style.background = 'rgba(255,255,255,0.97)';
            labelContainer.style.border = '2px solid #bbb';
            labelContainer.style.borderRadius = '10px';
            labelContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
            labelContainer.style.padding = '10px 18px';
            labelContainer.style.display = 'flex';
            labelContainer.style.flexDirection = 'column';
            labelContainer.style.alignItems = 'center';
            labelContainer.style.width = 'auto';
            labelContainer.style.minWidth = '80px';
            labelContainer.style.maxWidth = '200px';
            labelContainer.style.boxSizing = 'border-box';
            const labels = [conn.label, reverse.label].filter((v, i, a) => a.indexOf(v) === i);
            labels.forEach((label, i) => {
                const labelEl = document.createElement('div');
                labelEl.className = 'connection-label';
                labelEl.textContent = label;
                labelEl.style.display = 'block';
                labelEl.style.textAlign = 'center';
                labelEl.style.wordBreak = 'break-word';
                labelEl.style.overflowWrap = 'break-word';
                labelEl.style.whiteSpace = 'normal';
                labelEl.style.width = 'auto';
                labelEl.style.boxSizing = 'border-box';
                labelEl.style.margin = '0';
                labelEl.style.padding = '4px 0';
                labelEl.style.fontWeight = '500';
                labelEl.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                    window.openEditConnectionModal(index);
                });
                labelContainer.appendChild(labelEl);
                if (i === 0 && labels.length > 1) {
                    const divider = document.createElement('div');
                    divider.style.width = '90%';
                    divider.style.height = '1px';
                    divider.style.background = '#ddd';
                    divider.style.margin = '6px 0';
                    labelContainer.appendChild(divider);
                }
            });
            labelContainer.style.visibility = 'hidden';
            labelContainer.style.left = '-9999px';
            labelContainer.style.top = '-9999px';
            container.appendChild(labelContainer);
            labelW = labelContainer.offsetWidth;
            labelH = labelContainer.offsetHeight;
            container.removeChild(labelContainer);
            const pos = findSpiralPosition(baseLeft, baseTop, labelW, labelH);
            labelContainer.style.left = pos.left + 'px';
            labelContainer.style.top = pos.top + 'px';
            labelContainer.style.transform = 'translate(-50%, -50%)';
            labelContainer.style.visibility = '';
            container.appendChild(labelContainer);
            placedLabels.push({x: pos.left - labelW/2, y: pos.top - labelH/2, w: labelW, h: labelH});
            renderedPairs.add(pairKey);
        } else if (!reverse) {
            const labelEl = document.createElement('div');
            labelEl.className = 'connection-label';
            labelEl.textContent = conn.label;
            labelEl.dataset.type = conn.type;
            labelEl.style.display = 'block';
            labelEl.style.textAlign = 'center';
            labelEl.style.wordBreak = 'break-word';
            labelEl.style.overflowWrap = 'break-word';
            labelEl.style.whiteSpace = 'normal';
            labelEl.style.width = 'auto';
            labelEl.style.boxSizing = 'border-box';
            labelEl.style.margin = '0';
            labelEl.style.padding = '4px 0';
            labelEl.style.fontWeight = '500';
            labelEl.style.position = 'absolute';
            labelEl.style.left = '-9999px';
            labelEl.style.top = '-9999px';
            labelEl.style.visibility = 'hidden';
            container.appendChild(labelEl);
            labelW = labelEl.offsetWidth;
            labelH = labelEl.offsetHeight;
            container.removeChild(labelEl);
            const pos = findSpiralPosition(baseLeft, baseTop, labelW, labelH);
            labelEl.style.left = pos.left + 'px';
            labelEl.style.top = pos.top + 'px';
            labelEl.style.position = 'absolute';
            labelEl.style.transform = 'translate(-50%, -50%)';
            labelEl.style.visibility = '';
            labelEl.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                window.openEditConnectionModal(index);
            });
            container.appendChild(labelEl);
            placedLabels.push({x: pos.left - labelW/2, y: pos.top - labelH/2, w: labelW, h: labelH});
        }
    });
}

window.createPeople = createPeople;
window.createConnections = createConnections; 