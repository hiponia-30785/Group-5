const INVENTORY_KEY = "tindatrack_inventory";
const SALES_KEY = "tindatrack_sales";
const DEBT_PAYMENTS_KEY = "tindatrack_debt_payments";

document.addEventListener("DOMContentLoaded", function () {
    displayCurrentDate();
    displayCurrentYear();
    loadDashboard();
    setupInventorySearch();
});

function readStorageArray(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Unable to read " + key, error);
        return [];
    }
}

function number(value) {
    const result = Number(value);
    return Number.isFinite(result) ? result : 0;
}

function peso(value) {
    return "₱" + number(value).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function todayString() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function loadDashboard() {
    const inventory = readStorageArray(INVENTORY_KEY);
    const sales = readStorageArray(SALES_KEY);
    const debtPayments = readStorageArray(DEBT_PAYMENTS_KEY);

    updateSummaryCards(sales, debtPayments);
    displayInventoryOverview(inventory);
    displayRecentSales(sales);
}

function updateSummaryCards(sales, debtPayments) {
    const today = todayString();

    const todaysSales = sales.filter(function (sale) {
        return sale.date === today;
    });

    const todaySales = todaysSales.reduce(function (total, sale) {
        return total + number(sale.total);
    }, 0);

    const grossProfit = todaysSales.reduce(function (total, sale) {
        return total + (number(sale.price) - number(sale.cost)) * number(sale.quantity);
    }, 0);

    // Cash actually kept from a sale = amount received minus change.
    const cashFromSales = sales.reduce(function (total, sale) {
        return total + Math.max(0, number(sale.amountReceived) - number(sale.change));
    }, 0);

    // Payments collected from customers with utang also add to store cash.
    const debtCollections = debtPayments.reduce(function (total, payment) {
        return total + number(payment.amount);
    }, 0);

    const customersOwe = sales.reduce(function (total, sale) {
        return total + Math.max(0, number(sale.balance));
    }, 0);

    setText("today-sales", peso(todaySales));
    setText("gross-profit", peso(grossProfit));
    setText("money-in-store", peso(cashFromSales + debtCollections));
    setText("customers-owe", peso(customersOwe));
}

function displayInventoryOverview(inventory) {
    const tableBody = document.getElementById("inventory-table-body");

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    if (inventory.length === 0) {
        tableBody.innerHTML =
            '<tr><td colspan="4">No products added yet.</td></tr>';
        return;
    }

    inventory.forEach(function (product) {
        const quantity = number(product.quantity);
        const threshold = number(product.threshold);

        let status = "In Stock";

        if (quantity <= 0) {
            status = "Out of Stock";
        } else if (quantity <= threshold) {
            status = "Low Stock";
        }

        const row = document.createElement("tr");

        row.innerHTML =
            "<td>" + escapeHtml(product.name || "Unnamed product") + "</td>" +
            "<td>" + quantity + "</td>" +
            "<td>" + peso(product.price) + "</td>" +
            "<td>" + status + "</td>";

        tableBody.appendChild(row);
    });
}

function displayRecentSales(sales) {
    const tableBody = document.getElementById("recent-sales-body");

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    const recentSales = sales
        .slice()
        .sort(function (a, b) {
            return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
        })
        .slice(0, 5);

    if (recentSales.length === 0) {
        tableBody.innerHTML =
            '<tr><td colspan="3">No sales recorded yet.</td></tr>';
        return;
    }

    recentSales.forEach(function (sale) {
        const row = document.createElement("tr");

        row.innerHTML =
            "<td>" + escapeHtml(sale.productName || "Unknown product") + "</td>" +
            "<td>" + number(sale.quantity) + "</td>" +
            "<td>" + peso(sale.total) + "</td>";

        tableBody.appendChild(row);
    });
}

function setupInventorySearch() {
    const searchInput = document.getElementById("inventory-search");
    const tableBody = document.getElementById("inventory-table-body");

    if (!searchInput || !tableBody) {
        return;
    }

    searchInput.addEventListener("input", function () {
        const searchText = searchInput.value.toLowerCase().trim();

        tableBody.querySelectorAll("tr").forEach(function (row) {
            const productCell = row.cells[0];

            if (!productCell || row.cells.length !== 4) {
                return;
            }

            const productName = productCell.textContent.toLowerCase();
            row.style.display = productName.includes(searchText) ? "" : "none";
        });
    });
}

function displayCurrentDate() {
    const dateElement = document.getElementById("current-date");

    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString("en-PH", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }
}

function displayCurrentYear() {
    const yearElement = document.getElementById("current-year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}

