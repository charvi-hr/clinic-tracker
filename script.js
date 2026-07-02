// ================================
// Clinic Operations Tracker
// ================================

const API_URL = CONFIG.API_URL;

let allTasks = [];
let filteredTasks = [];
let changedRows = new Map();

const tableBody = document.querySelector("#trackerTable tbody");
const searchInput = document.getElementById("searchInput");
const cityFilter = document.getElementById("cityFilter");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");
const saveBtn = document.getElementById("saveBtn");
const refreshBtn = document.getElementById("refreshBtn");
const message = document.getElementById("message");

document.addEventListener("DOMContentLoaded", () => {
    loadData();

    searchInput.addEventListener("input", applyFilters);
    cityFilter.addEventListener("change", applyFilters);
    categoryFilter.addEventListener("change", applyFilters);
    statusFilter.addEventListener("change", applyFilters);

    saveBtn.addEventListener("click", saveChanges);
    refreshBtn.addEventListener("click", loadData);
});
async function loadData() {

    message.textContent = "Loading...";

    try {

        const response = await fetch(API_URL);
        allTasks = await response.json();

        populateFilters();

        filteredTasks = [...allTasks];

        renderTable(filteredTasks);

        message.textContent = "";

    } catch (err) {

        console.error(err);

        message.textContent = "Unable to load data.";

        message.className = "save-error";
    }

}
function populateFilters() {

    cityFilter.innerHTML = '<option value="">All Cities</option>';
    categoryFilter.innerHTML = '<option value="">All Categories</option>';

    const cities = [...new Set(allTasks.map(t => t.City))].sort();
    const categories = [...new Set(allTasks.map(t => t.Category))].sort();

    cities.forEach(city => {
        cityFilter.innerHTML += `<option>${city}</option>`;
    });

    categories.forEach(category => {
        categoryFilter.innerHTML += `<option>${category}</option>`;
    });

}
