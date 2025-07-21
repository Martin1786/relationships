// Data handling and import/export functions for the Village Community Network app

function parseGedcomData(gedcomContent, people, connections) {
    const lines = gedcomContent.split('\n');
    const individuals = {};
    const families = {};
    let currentRecord = null;
    let currentType = null;
    lines.forEach(line => {
        const parts = line.trim().split(' ');
        const level = parseInt(parts[0]);
        if (level === 0 && parts[2] === 'INDI') {
            currentRecord = parts[1].replace(/@/g, '');
            currentType = 'INDI';
            individuals[currentRecord] = { id: currentRecord };
        } else if (level === 0 && parts[2] === 'FAM') {
            currentRecord = parts[1].replace(/@/g, '');
            currentType = 'FAM';
            families[currentRecord] = { id: currentRecord };
        } else if (level === 1 && currentRecord) {
            const tag = parts[1];
            const value = parts.slice(2).join(' ').replace(/@/g, '');
            if (currentType === 'INDI') {
                if (tag === 'NAME') {
                    individuals[currentRecord].name = value.replace(/\//g, '');
                } else if (tag === 'OCCU') {
                    individuals[currentRecord].occupation = value;
                }
            } else if (currentType === 'FAM') {
                if (tag === 'HUSB') {
                    families[currentRecord].husband = value;
                } else if (tag === 'WIFE') {
                    families[currentRecord].wife = value;
                } else if (tag === 'CHIL') {
                    if (!families[currentRecord].children) {
                        families[currentRecord].children = [];
                    }
                    families[currentRecord].children.push(value);
                }
            }
        }
    });
    addGedcomDataToMap(individuals, families, people, connections);
}

function addGedcomDataToMap(individuals, families, people, connections) {
    Object.values(individuals).forEach(person => {
        if (person.name) {
            addPersonIfNotExists(person.name, person.occupation || 'Unknown Role', people);
        }
    });
    Object.values(families).forEach(family => {
        if (family.husband && family.wife) {
            const husband = individuals[family.husband];
            const wife = individuals[family.wife];
            if (husband && wife && husband.name && wife.name) {
                const husbandId = generatePersonId(husband.name);
                const wifeId = generatePersonId(wife.name);
                connections.push({
                    from: husbandId,
                    to: wifeId,
                    type: 'family',
                    label: 'Married'
                });
            }
        }
        if (family.children) {
            family.children.forEach(childId => {
                const child = individuals[childId];
                if (child && child.name) {
                    const childCleanId = generatePersonId(child.name);
                    if (family.husband) {
                        const father = individuals[family.husband];
                        if (father && father.name) {
                            const fatherCleanId = generatePersonId(father.name);
                            connections.push({
                                from: fatherCleanId,
                                to: childCleanId,
                                type: 'family',
                                label: 'Parent-Child'
                            });
                        }
                    }
                    if (family.wife) {
                        const mother = individuals[family.wife];
                        if (mother && mother.name) {
                            const motherCleanId = generatePersonId(mother.name);
                            connections.push({
                                from: motherCleanId,
                                to: childCleanId,
                                type: 'family',
                                label: 'Parent-Child'
                            });
                        }
                    }
                }
            });
        }
    });
}

function parseCsvData(csvContent, people, connections) {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length >= 4 && values[0] && values[1]) {
            const person1Name = values[0];
            const person2Name = values[1];
            addPersonIfNotExists(person1Name, 'Unknown Role', people);
            addPersonIfNotExists(person2Name, 'Unknown Role', people);
            const person1Id = generatePersonId(person1Name);
            const person2Id = generatePersonId(person2Name);
            const relationship = {
                from: person1Id,
                to: person2Id,
                type: values[3] || 'social',
                label: values[2] || 'connection',
                source: values[5] || 'CSV import'
            };
            connections.push(relationship);
        }
    }
}

function downloadMapAsJSON(people, connections) {
    const formattedConnections = connections.map(conn => {
        const person1 = people.find(p => p.id === conn.from) || {};
        const person2 = people.find(p => p.id === conn.to) || {};
        return {
            person1_name: person1.name || '',
            person2_name: person2.name || '',
            relationship_type: conn.label || '',
            relationship_category: conn.type || '',
            source_type: conn.source_type || '',
            source_details: conn.source_details || '',
            date: conn.date || '',
            location: conn.location || '',
            notes: conn.notes || ''
        };
    });
    const data = {
        people: people,
        connections: formattedConnections,
        box_color: (typeof BOX_COLOR !== 'undefined' ? BOX_COLOR : '#ffffff'),
        box_text_color: (typeof BOX_TEXT_COLOR !== 'undefined' ? BOX_TEXT_COLOR : '#2c3e50')
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'village_map.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Attach to window for use in main script
window.parseGedcomData = parseGedcomData;
window.addGedcomDataToMap = addGedcomDataToMap;
window.parseCsvData = parseCsvData;
window.downloadMapAsJSON = downloadMapAsJSON; 