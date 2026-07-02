// ==============================
// Clinic Operations Tracker
// script.js
// ==============================

let allData = [];
let filteredData = [];
let changedRows = new Map();

const STATUS_OPTIONS = [
    "Pending",
    "In Progress",
    "Completed",
    "On Hold"
];

document.addEventListener("DOMContentLoaded", () => {
    loadData();

    document
        .getElementById("searchInput")
        .addEventListener("input", applyFilters);

    document
        .getElementById("cityFilter")
        .addEventListener("change", applyFilters);

    document
        .getElementById("categoryFilter")
        .addEventListener("change", applyFilters);

    document
        .getElementById("statusFilter")
        .addEventListener("change", applyFilters);

    document
        .getElementById("refreshBtn")
        .addEventListener("click", loadData);

    document
        .getElementById("saveBtn")
        .addEventListener("click", saveChanges);
});


// ==========================================
// LOAD DATA
// ==========================================
async function loadData() {

    try {

        showLoading(true);

        changedRows.clear();

        const response = await fetch(CONFIG.API_URL);

        const data = await response.json();

        allData = Array.isArray(data) ? data : [];

        populateFilters();

        applyFilters();

    } catch (err) {

        console.error(err);
        alert("Unable to load data.");

    } finally {

        showLoading(false);

    }

}


// ==========================================
// POPULATE FILTERS
// ==========================================
function populateFilters() {

    populateDropdown(
        "cityFilter",
        [...new Set(allData.map(r => r.City).filter(Boolean))]
    );

    populateDropdown(
        "categoryFilter",
        [...new Set(allData.map(r => r.Category).filter(Boolean))]
    );

    populateDropdown(
        "statusFilter",
        [...new Set(allData.map(r => r.Status).filter(Boolean))]
    );

}


function populateDropdown(id, values) {

    const dropdown = document.getElementById(id);

    const current = dropdown.value;

    dropdown.innerHTML = `<option value="">All</option>`;

    values
        .sort()
        .forEach(v => {

            const option = document.createElement("option");
            option.value = v;
            option.textContent = v;

            dropdown.appendChild(option);

        });

    dropdown.value = current;

}


// ==========================================
// SEARCH + FILTER
// ==========================================
function applyFilters() {

    const search = document
        .getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    const city = document.getElementById("cityFilter").value;

    const category = document.getElementById("categoryFilter").value;

    const status = document.getElementById("statusFilter").value;

    filteredData = allData.filter(row => {

        const matchesSearch = Object.values(row)
            .join(" ")
            .toLowerCase()
            .includes(search);

        const matchesCity =
            !city || row.City === city;

        const matchesCategory =
            !category || row.Category === category;

        const matchesStatus =
            !status || row.Status === status;

        return (
            matchesSearch &&
            matchesCity &&
            matchesCategory &&
            matchesStatus
        );

    });

    renderTable();

}


// ==========================================
// TABLE
// ==========================================
function renderTable() {

    const tbody = document.getElementById("tableBody");

    tbody.innerHTML = "";

    filteredData.forEach(row => {

        const tr = document.createElement("tr");

        tr.appendChild(createCell(row.City));
        tr.appendChild(createCell(row["City Head Name"]));
        tr.appendChild(createCell(row.Clinic));
        tr.appendChild(createCell(row.Category));
        tr.appendChild(createCell(row.Notes));

        tr.appendChild(createStatusCell(row));

        tr.appendChild(createETACell(row));

        tr.appendChild(createCommentCell(row));

        tbody.appendChild(tr);

    });

}


// ==========================================
// NORMAL CELL
// ==========================================
function createCell(value) {

    const td = document.createElement("td");

    td.textContent = value || "";

    return td;

}


// ==========================================
// STATUS
// ==========================================
function createStatusCell(row) {

    const td = document.createElement("td");

    const select = document.createElement("select");

    STATUS_OPTIONS.forEach(status => {

        const option = document.createElement("option");

        option.value = status;
        option.textContent = status;

        if (status === row.Status) {
            option.selected = true;
        }

        select.appendChild(option);

    });

    select.addEventListener("change", () => {

        row.Status = select.value;

        markChanged(row);

    });

    td.appendChild(select);

    return td;

}


// ==========================================
// ETA
// ==========================================
function createETACell(row) {

    const td = document.createElement("td");

    const input = document.createElement("input");

    input.type = "date";

    input.value = formatDate(row.ETA);

    input.addEventListener("change", () => {

        row.ETA = input.value;

        markChanged(row);

    });

    td.appendChild(input);

    return td;

}


// ==========================================
// COMMENTS
// ==========================================
function createCommentCell(row) {

    const td = document.createElement("td");

    const textarea = document.createElement("textarea");

    textarea.value = row["Additional Comments"] || "";

    textarea.rows = 2;

    textarea.addEventListener("input", () => {

        row["Additional Comments"] = textarea.value;

        markChanged(row);

    });

    td.appendChild(textarea);

    return td;

}


// ==========================================
// TRACK CHANGES
// ==========================================
function markChanged(row) {

    changedRows.set(row.rowNumber, {
        rowNumber: row.rowNumber,
        Status: row.Status,
        ETA: row.ETA,
        "Additional Comments": row["Additional Comments"]
    });

}


// ==========================================
// SAVE
// ==========================================
async function saveChanges() {

    if (changedRows.size === 0) {
        alert("No changes to save.");
        return;
    }

    try {

        showLoading(true);

        const formData = new FormData();

        formData.append("action", "updateTasks");
        formData.append("tasks", JSON.stringify(Array.from(changedRows.values())));

        const response = await fetch(CONFIG.API_URL, {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (result.success) {

            alert("Changes saved successfully.");

            changedRows.clear();

            await loadData();

        } else {

            alert(result.message || "Save failed.");

        }

    } catch (err) {

        console.error(err);
        alert("Error saving data.");

    } finally {

        showLoading(false);

    }

}// ==========================================
// LOADING
// ==========================================
function showLoading(show) {

    const loader = document.getElementById("loading");

    if (!loader) return;

    loader.style.display = show ? "block" : "none";

}


// ==========================================
// DATE FORMAT
// ==========================================
function formatDate(value) {

    if (!value) return "";

    const date = new Date(value);

    if (isNaN(date.getTime())) {

        return value;

    }

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}
