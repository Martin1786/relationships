// Utility functions for the Village Community Network app

// Validate UK date in DD/MM/YYYY or D/M/YYYY format
function isValidUKDate(dateStr) {
    if (!dateStr) return true; // Allow empty
    // Match DD/MM/YYYY or D/M/YYYY
    const regex = /^([0-2]?\d|3[01])\/(0?\d|1[0-2])\/\d{4}$/;
    if (!regex.test(dateStr)) return false;
    const [day, month, year] = dateStr.split('/').map(Number);
    const d = new Date(year, month - 1, day);
    return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

// Generate a clean ID from a name
function generatePersonId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Add a person to the people array if not already present
function addPersonIfNotExists(name, role, people) {
    const id = generatePersonId(name);
    if (!people.find(p => p.id === id)) {
        people.push({
            id: id,
            name: name,
            role: role,
            x: Math.random() * 800 + 100,
            y: Math.random() * 400 + 100
        });
    }
}

// Export for use in main script (for browser, attach to window)
window.isValidUKDate = isValidUKDate;
window.generatePersonId = generatePersonId;
window.addPersonIfNotExists = addPersonIfNotExists; 