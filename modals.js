// Modal open/close logic and form handlers for the Village Community Network app

// --- Define all modal functions first ---
let editingPersonId = null;
let editingConnectionIndex = null;

function openEditPersonModal(personId) {
    const modal = document.getElementById('editPersonModal');
    const form = document.getElementById('editPersonForm');
    const nameInput = document.getElementById('editPersonName');
    const roleInput = document.getElementById('editPersonRole');
    const person = window.people.find(p => p.id === personId);
    if (!person) return;
    editingPersonId = personId;
    nameInput.value = person.name;
    roleInput.value = person.role;
    modal.style.display = 'flex';
    nameInput.focus();
}

function openEditConnectionModal(connIndex) {
    const modal = document.getElementById('editConnectionModal');
    const form = document.getElementById('editConnectionForm');
    const conn = window.connections[connIndex];
    if (!conn) return;
    editingConnectionIndex = connIndex;
    document.getElementById('editConnLabel').value = conn.label || '';
    document.getElementById('editConnType').value = conn.type || '';
    document.getElementById('editConnSourceType').value = conn.source_type || '';
    document.getElementById('editConnSourceDetails').value = conn.source_details || '';
    document.getElementById('editConnDate').value = conn.date || '';
    document.getElementById('editConnLocation').value = conn.location || '';
    document.getElementById('editConnNotes').value = conn.notes || '';
    modal.style.display = 'flex';
    document.getElementById('editConnLabel').focus();
}

function openAddRelationshipModal() {
    const modal = document.getElementById('addRelationshipModal');
    const person1Select = document.getElementById('addRelPerson1');
    const person2Select = document.getElementById('addRelPerson2');
    person1Select.innerHTML = '';
    person2Select.innerHTML = '';
    window.people.forEach(p => {
        const opt1 = document.createElement('option');
        opt1.value = p.id;
        opt1.textContent = p.name;
        person1Select.appendChild(opt1);
        const opt2 = document.createElement('option');
        opt2.value = p.id;
        opt2.textContent = p.name;
        person2Select.appendChild(opt2);
    });
    document.getElementById('addRelLabel').value = '';
    document.getElementById('addRelType').value = '';
    document.getElementById('addRelSourceType').value = '';
    document.getElementById('addRelSourceDetails').value = '';
    document.getElementById('addRelDate').value = '';
    document.getElementById('addRelLocation').value = '';
    document.getElementById('addRelNotes').value = '';
    modal.style.display = 'flex';
    person1Select.focus();
}

function openDataEntryModal() {
    const modal = document.getElementById('dataEntryModal');
    document.getElementById('entryPerson1').value = '';
    document.getElementById('entryPerson2').value = '';
    document.getElementById('entryLabel').value = '';
    document.getElementById('entryType').value = '';
    document.getElementById('entrySourceType').value = '';
    document.getElementById('entrySourceDetails').value = '';
    document.getElementById('entryDate').value = '';
    document.getElementById('entryLocation').value = '';
    document.getElementById('entryNotes').value = '';
    modal.style.display = 'flex';
    document.getElementById('entryPerson1').focus();
}

function openAddPersonModal() {
    document.getElementById('addPersonModal').style.display = 'flex';
    document.getElementById('addPersonName').value = '';
    document.getElementById('addPersonRole').value = '';
    document.getElementById('addPersonName').focus();
}

// Attach modal openers to window for use in HTML
window.openEditPersonModal = openEditPersonModal;
window.openEditConnectionModal = openEditConnectionModal;
window.openAddRelationshipModal = openAddRelationshipModal;
window.openDataEntryModal = openDataEntryModal;
window.openAddPersonModal = openAddPersonModal;

// --- Now assign event handlers in DOMContentLoaded ---
window.addEventListener('DOMContentLoaded', function() {
    // --- EDIT PERSON MODAL HANDLERS ---
    document.getElementById('cancelEditPerson').onclick = function() {
        document.getElementById('editPersonModal').style.display = 'none';
        editingPersonId = null;
    };
    document.getElementById('editPersonForm').onsubmit = function(e) {
        e.preventDefault();
        if (!editingPersonId) return;
        const name = document.getElementById('editPersonName').value.trim();
        const role = document.getElementById('editPersonRole').value.trim();
        const idx = window.people.findIndex(p => p.id === editingPersonId);
        if (idx !== -1) {
            window.people[idx].name = name;
            window.people[idx].role = role;
        }
        document.getElementById('editPersonModal').style.display = 'none';
        editingPersonId = null;
        window.refreshMap();
    };

    // --- EDIT CONNECTION MODAL HANDLERS ---
    document.getElementById('cancelEditConnection').onclick = function() {
        document.getElementById('editConnectionModal').style.display = 'none';
        editingConnectionIndex = null;
    };
    document.getElementById('editConnectionForm').onsubmit = function(e) {
        e.preventDefault();
        const date = document.getElementById('editConnDate').value.trim();
        if (!isValidUKDate(date)) {
            alert('Please enter a valid date in DD/MM/YYYY format.');
            document.getElementById('editConnDate').focus();
            return;
        }
        if (editingConnectionIndex === null) return;
        const conn = window.connections[editingConnectionIndex];
        if (!conn) return;
        conn.label = document.getElementById('editConnLabel').value.trim();
        conn.type = document.getElementById('editConnType').value.trim();
        conn.source_type = document.getElementById('editConnSourceType').value.trim();
        conn.source_details = document.getElementById('editConnSourceDetails').value.trim();
        conn.date = date;
        conn.location = document.getElementById('editConnLocation').value.trim();
        conn.notes = document.getElementById('editConnNotes').value.trim();
        document.getElementById('editConnectionModal').style.display = 'none';
        editingConnectionIndex = null;
        window.refreshMap();
    };

    // --- ADD RELATIONSHIP MODAL HANDLERS ---
    document.getElementById('cancelAddRelationship').onclick = function() {
        document.getElementById('addRelationshipModal').style.display = 'none';
    };
    document.getElementById('addRelationshipForm').onsubmit = function(e) {
        e.preventDefault();
        const date = document.getElementById('addRelDate').value.trim();
        if (!isValidUKDate(date)) {
            alert('Please enter a valid date in DD/MM/YYYY format.');
            document.getElementById('addRelDate').focus();
            return;
        }
        const from = document.getElementById('addRelPerson1').value;
        const to = document.getElementById('addRelPerson2').value;
        let type = document.getElementById('addRelType').value.trim().toLowerCase();
        if (!["family", "work", "social"].includes(type)) {
            type = "social";
        }
        window.connections.push({
            from: from,
            to: to,
            type: type,
            label: document.getElementById('addRelLabel').value.trim(),
            source_type: document.getElementById('addRelSourceType').value.trim(),
            source_details: document.getElementById('addRelSourceDetails').value.trim(),
            date: date,
            location: document.getElementById('addRelLocation').value.trim(),
            notes: document.getElementById('addRelNotes').value.trim()
        });
        document.getElementById('addRelationshipModal').style.display = 'none';
        window.refreshMap();
        window.showUploadStatus('Relationship added!', 'success');
    };

    // --- DATA ENTRY MODAL HANDLERS ---
    document.getElementById('cancelDataEntry').onclick = function() {
        document.getElementById('dataEntryModal').style.display = 'none';
    };
    document.getElementById('dataEntryForm').onsubmit = function(e) {
        e.preventDefault();
        const name1 = document.getElementById('entryPerson1').value.trim();
        const name2 = document.getElementById('entryPerson2').value.trim();
        const label = document.getElementById('entryLabel').value.trim();
        let category = document.getElementById('entryType').value.trim().toLowerCase();
        if (!['family', 'work', 'social'].includes(category)) {
            category = 'social';
        }
        const sourceType = document.getElementById('entrySourceType').value.trim();
        const sourceDetails = document.getElementById('entrySourceDetails').value.trim();
        const date = document.getElementById('entryDate').value.trim();
        const location = document.getElementById('entryLocation').value.trim();
        const notes = document.getElementById('entryNotes').value.trim();
        if (!name1 || !name2 || !label) {
            alert('Please enter both person names and a relationship type.');
            return;
        }
        if (!isValidUKDate(date)) {
            alert('Please enter a valid date in DD/MM/YYYY format.');
            document.getElementById('entryDate').focus();
            return;
        }
        addPersonIfNotExists(name1, 'Unknown Role', window.people);
        addPersonIfNotExists(name2, 'Unknown Role', window.people);
        const person1Id = generatePersonId(name1);
        const person2Id = generatePersonId(name2);
        window.connections.push({
            from: person1Id,
            to: person2Id,
            type: category,
            label: label,
            source_type: sourceType,
            source_details: sourceDetails,
            date: date,
            location: location,
            notes: notes
        });
        document.getElementById('dataEntryModal').style.display = 'none';
        window.refreshMap();
        window.showUploadStatus('Relationship added!', 'success');
    };

    // --- ADD PERSON MODAL HANDLERS ---
    document.getElementById('cancelAddPerson').onclick = function() {
        document.getElementById('addPersonModal').style.display = 'none';
    };
    document.getElementById('addPersonForm').onsubmit = function(e) {
        e.preventDefault();
        const name = document.getElementById('addPersonName').value.trim();
        const role = document.getElementById('addPersonRole').value.trim();
        if (!name) {
            alert('Please enter a name.');
            return;
        }
        addPersonIfNotExists(name, role || 'Unknown Role', window.people);
        document.getElementById('addPersonModal').style.display = 'none';
        window.refreshMap();
        window.showUploadStatus('Person added!', 'success');
    };
}); 