let contentIdeas = JSON.parse(localStorage.getItem('contentIdeas')) || [];
let editIndex = null;

// Form State
let currentType = 'Video';
let currentStatus = 'Draft';
let currentFilterType = 'All';
let currentFilterStatus = 'All';

const titleInput = document.getElementById('titleInput');
const descInput = document.getElementById('descInput');
const saveBtn = document.getElementById('saveBtn');
const saveBtnText = document.getElementById('saveBtnText');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');
const ideasList = document.getElementById('ideasList');
const ideaCount = document.getElementById('ideaCount');
const searchInput = document.getElementById('searchInput');

const typeIcons = { Video: '🎥 Video', Blog: '✍️ Blog', Post: '📱 Post' };

// Toggle Dropdown
window.toggleDropdown = function(id) {
    document.querySelectorAll('.custom-dropdown').forEach(dd => {
        if (dd.id !== id) dd.classList.remove('active');
    });
    document.getElementById(id).classList.toggle('active');
};

// Close dropdowns on outside click
document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-dropdown')) {
        document.querySelectorAll('.custom-dropdown').forEach(dd => dd.classList.remove('active'));
    }
});

// Select Form Options
window.selectOption = function(dropdownId, val, label) {
    if (dropdownId === 'dropdownType') {
        currentType = val;
        document.getElementById('selectedTypeVal').textContent = label;
    } else if (dropdownId === 'dropdownStatus') {
        currentStatus = val;
        document.getElementById('selectedStatusVal').textContent = label;
    }
    document.getElementById(dropdownId).classList.remove('active');
};

// Select Filter Options
window.selectFilterOption = function(dropdownId, val, label) {
    if (dropdownId === 'filterDropdownType') {
        currentFilterType = val;
        document.getElementById('filterTypeVal').textContent = label;
    } else if (dropdownId === 'filterDropdownStatus') {
        currentFilterStatus = val;
        document.getElementById('filterStatusVal').textContent = label;
    }
    document.getElementById(dropdownId).classList.remove('active');
    renderIdeas();
};

// Render Ideas
function renderIdeas() {
    ideasList.innerHTML = '';
    const searchQuery = searchInput.value.toLowerCase().trim();

    const filtered = contentIdeas.filter(idea => {
        const matchesType = currentFilterType === 'All' || idea.type === currentFilterType;
        const matchesStatus = currentFilterStatus === 'All' || idea.status === currentFilterStatus;
        const matchesSearch = idea.title.toLowerCase().includes(searchQuery) || idea.desc.toLowerCase().includes(searchQuery);
        return matchesType && matchesStatus && matchesSearch;
    });

    ideaCount.textContent = filtered.length;

    if (filtered.length === 0) {
        ideasList.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color:#64748b; padding:40px; font-size:14px;">No content ideas found.</div>`;
        return;
    }

    filtered.forEach((idea) => {
        const originalIndex = contentIdeas.indexOf(idea);

        const card = document.createElement('div');
        card.className = 'idea-card';

        let statusClass = 'status-draft';
        if (idea.status === 'Published') statusClass = 'status-published';
        if (idea.status === 'Archived') statusClass = 'status-archived';

        card.innerHTML = `
            <div>
                <div class="idea-header">
                    <span class="tag-type">${typeIcons[idea.type] || idea.type}</span>
                    <span class="tag-status ${statusClass}">${idea.status}</span>
                </div>
                <div class="idea-body" style="margin-top: 12px;">
                    <h4>${escapeHTML(idea.title)}</h4>
                    <p>${escapeHTML(idea.desc) || '<em>No notes added.</em>'}</p>
                </div>
            </div>
            <div class="idea-actions">
                <button onclick="editIdea(${originalIndex})" class="btn-edit">✏️ Edit</button>
                <button onclick="deleteIdea(${originalIndex})" class="btn-delete">🗑️ Delete</button>
            </div>
        `;
        ideasList.appendChild(card);
    });
}

// Save or Update Idea
function saveIdea() {
    const title = titleInput.value.trim();
    if (!title) return alert('Please enter an idea title!');

    const desc = descInput.value.trim();

    if (editIndex !== null) {
        contentIdeas[editIndex] = { title, type: currentType, status: currentStatus, desc };
        editIndex = null;
    } else {
        contentIdeas.push({ title, type: currentType, status: currentStatus, desc });
    }

    localStorage.setItem('contentIdeas', JSON.stringify(contentIdeas));
    resetForm();
    renderIdeas();
}

// Edit Idea
window.editIdea = function(index) {
    editIndex = index;
    const idea = contentIdeas[index];

    titleInput.value = idea.title;
    descInput.value = idea.desc;

    currentType = idea.type;
    currentStatus = idea.status;

    document.getElementById('selectedTypeVal').textContent = typeIcons[idea.type] || idea.type;
    document.getElementById('selectedStatusVal').textContent = idea.status;

    formTitle.textContent = 'Edit Content Idea';
    saveBtnText.textContent = 'Update Idea';
    cancelBtn.classList.remove('hidden');
    titleInput.focus();
};

// Delete Idea
window.deleteIdea = function(index) {
    contentIdeas.splice(index, 1);
    localStorage.setItem('contentIdeas', JSON.stringify(contentIdeas));
    renderIdeas();
};

// Reset Form
function resetForm() {
    titleInput.value = '';
    descInput.value = '';
    currentType = 'Video';
    currentStatus = 'Draft';
    document.getElementById('selectedTypeVal').textContent = '🎥 Video';
    document.getElementById('selectedStatusVal').textContent = '📝 Draft';
    editIndex = null;
    formTitle.textContent = 'Add Content Idea';
    saveBtnText.textContent = 'Save Idea';
    cancelBtn.classList.add('hidden');
}

// Escape HTML Helper
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Event Listeners
saveBtn.addEventListener('click', saveIdea);
cancelBtn.addEventListener('click', resetForm);
searchInput.addEventListener('input', renderIdeas);

// Initial Render
renderIdeas();
