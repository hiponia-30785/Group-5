/* =========================================
   TINDATRACK DAILY SALES
========================================= */


/* HTML ELEMENTS */

const salesForm = document.getElementById("sales-form");

const saleProduct = document.getElementById("sale-product");
const saleQuantity = document.getElementById("sale-quantity");
const salePrice = document.getElementById("sale-price");
const saleCustomer = document.getElementById("sale-customer");
const saleDate = document.getElementById("sale-date");
const salePaymentStatus = document.getElementById("sale-payment-status");

const saleTotal = document.getElementById("sale-total");
const saleAmountReceived = document.getElementById("sale-amount-received");
const saleChange = document.getElementById("sale-change");
const saleBalance = document.getElementById("sale-balance");
const saleNotes = document.getElementById("sale-notes");

const salesTableBody = document.getElementById("sales-table-body");
const emptySales = document.getElementById("empty-sales");

const searchSale = document.getElementById("search-sale");
const filterSaleStatus = document.getElementById("filter-sale-status");
const filterSaleDate = document.getElementById("filter-sale-date");

const displayedSales = document.getElementById("displayed-sales");


/* STORAGE KEYS */

const INVENTORY_KEY = "tindatrack_inventory";
const SALES_KEY = "tindatrack_sales";


/* LOAD DATA */

let inventory = loadInventory();
let sales = loadSales();


/* =========================================
   LOAD INVENTORY
========================================= */

function loadInventory() {
    try {
        const data = JSON.parse(
            localStorage.getItem(INVENTORY_KEY) || "[]"
        );

        return Array.isArray(data) ? data : [];

    } catch (error) {
        console.error("Unable to load inventory:", error);
        return [];
    }
}


/* =========================================
   LOAD SALES
========================================= */

function loadSales() {
    try {
        const data = JSON.parse(
            localStorage.getItem(SALES_KEY) || "[]"
        );

        return Array.isArray(data) ? data : [];

    } catch (error) {
        console.error("Unable to load sales:", error);
        return [];
    }
}


/* =========================================
   SAVE INVENTORY
========================================= */

function saveInventory() {
    try {
        localStorage.setItem(
            INVENTORY_KEY,
            JSON.stringify(inventory)
        );

        return true;

    } catch (error) {
        alert("Unable to save inventory.");
        console.error(error);
        return false;
    }
}


/* =========================================
   SAVE SALES
========================================= */

function saveSales() {
    try {
        localStorage.setItem(
            SALES_KEY,
            JSON.stringify(sales)
        );

        return true;

    } catch (error) {
        alert("Unable to save sales.");
        console.error(error);
        return false;
    }
}


/* =========================================
   HELPER FUNCTIONS
========================================= */

function peso(amount) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP"
    }).format(amount);
}


function todayString() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function createId() {
    if (window.crypto &&
        typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }

    return Date.now().toString(36) +
        Math.random().toString(36).slice(2);
}


/* =========================================
   POPULATE PRODUCT DROPDOWN
========================================= */

function populateProducts() {

    const previousValue = saleProduct.value;

    saleProduct.replaceChildren();

    const defaultOption = document.createElement("option");

    defaultOption.value = "";
    defaultOption.textContent = "Select a product";

    saleProduct.appendChild(defaultOption);

    inventory.forEach(function(product) {

        const option = document.createElement("option");

        option.value = product.id;

        option.textContent =
            `${product.name} — ${product.quantity} available`;

        saleProduct.appendChild(option);

    });

    if (inventory.some(product => product.id === previousValue)) {
        saleProduct.value = previousValue;
    }

    updateSelectedProduct();
}


/* =========================================
   GET SELECTED PRODUCT
========================================= */

function getSelectedProduct() {

    return inventory.find(function(product) {
        return product.id === saleProduct.value;
    });
}


/* =========================================
   UPDATE SELECTED PRODUCT PRICE
========================================= */

function updateSelectedProduct() {

    const product = getSelectedProduct();

    if (!product) {

        salePrice.value = "";
        saleTotal.value = "0.00";

        calculatePayment();

        return;
    }

    salePrice.value = Number(product.price).toFixed(2);

    calculateTotal();
}


/* =========================================
   CALCULATE TOTAL
========================================= */

function calculateTotal() {

    const quantity = Number(saleQuantity.value);
    const price = Number(salePrice.value);

    const total = quantity * price;

    saleTotal.value = Number.isFinite(total)
        ? total.toFixed(2)
        : "0.00";

    calculatePayment();
}


/* =========================================
   CALCULATE PAYMENT
========================================= */

function calculatePayment() {

    const total = Number(saleTotal.value) || 0;
    const received = Number(saleAmountReceived.value) || 0;

    const change = Math.max(0, received - total);
    const balance = Math.max(0, total - received);

    saleChange.value = change.toFixed(2);
    saleBalance.value = balance.toFixed(2);
}


/* =========================================
   UPDATE PAYMENT STATUS
========================================= */

function updatePaymentStatus() {

    const total = Number(saleTotal.value) || 0;
    const received = Number(saleAmountReceived.value) || 0;

    if (received >= total && total > 0) {

        salePaymentStatus.value = "paid";

    } else if (received > 0) {

        salePaymentStatus.value = "partial";

    } else {

        salePaymentStatus.value = "utang";

    }
}


/* =========================================
   VALIDATE PAYMENT STATUS
========================================= */

function validatePaymentStatus() {

    const total = Number(saleTotal.value);
    const received = Number(saleAmountReceived.value);

    if (received > total) {

        return salePaymentStatus.value === "paid";

    }

    if (received === total) {

        return salePaymentStatus.value === "paid";

    }

    if (received > 0 && received < total) {

        return salePaymentStatus.value === "partial";

    }

    return salePaymentStatus.value === "utang";
}


/* =========================================
   SAVE A SALE
========================================= */

salesForm.addEventListener("submit", function(event) {

    event.preventDefault();

    /*
       Reload inventory in case it changed in another tab.
       This is still browser-only storage, not a database.
    */

    inventory = loadInventory();

    const product = getSelectedProduct();

    if (!product) {
        alert("Please select a product.");
        return;
    }

    const quantity = Number(saleQuantity.value);
    const price = Number(product.price);
    const total = quantity * price;
    const received = Number(saleAmountReceived.value);

    if (!Number.isSafeInteger(quantity) || quantity < 1) {
        alert("Quantity sold must be a whole number greater than zero.");
        return;
    }

    if (quantity > product.quantity) {
        alert("Not enough stock available for this sale.");
        return;
    }

    if (!Number.isFinite(received) || received < 0) {
        alert("Enter a valid amount received.");
        return;
    }

    if (received > total &&
        salePaymentStatus.value !== "paid") {

        alert("Change can only be given for a fully paid sale.");
        return;
    }

    if (!validatePaymentStatus()) {
        alert("Please select the correct payment status.");
        return;
    }

    const balance = Math.max(0, total - received);
    const change = Math.max(0, received - total);

    const sale = {
        id: createId(),
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        cost: Number(product.cost),
        price: price,
        total: total,
        customer: saleCustomer.value.trim(),
        date: saleDate.value,
        paymentStatus: salePaymentStatus.value,
        amountReceived: received,
        change: change,
        balance: balance,
        notes: saleNotes.value.trim(),
        createdAt: new Date().toISOString()
    };


    /*
       Save original values so we can roll back if saving fails.
    */

    const previousInventory = JSON.stringify(inventory);
    const previousSales = JSON.stringify(sales);


    /*
       Reduce stock when the sale is recorded.
    */

    product.quantity -= quantity;


    /*
       Add the sale to the sales history.
    */

    sales.push(sale);


    /*
       Save both changes.
    */

    if (!saveInventory() || !saveSales()) {

        inventory = JSON.parse(previousInventory);
        sales = JSON.parse(previousSales);

        saveInventory();
        saveSales();

        alert(
            "The sale could not be saved. " +
            "Please check your browser storage and try again."
        );

        return;
    }


    alert(
        "Sale recorded successfully!\n\n" +
        "Total: " + peso(total) + "\n" +
        "Amount Received: " + peso(received) + "\n" +
        "Change: " + peso(change) + "\n" +
        "Remaining Balance: " + peso(balance)
    );


    salesForm.reset();

    saleDate.value = todayString();
    saleQuantity.value = "1";
    saleAmountReceived.value = "0.00";

    populateProducts();
    displaySales();
    updateSummary();

});


/* =========================================
   DISPLAY SALES HISTORY
========================================= */

function displaySales() {

    const searchText = searchSale.value
        .trim()
        .toLowerCase();

    const selectedStatus = filterSaleStatus.value;
    const selectedDate = filterSaleDate.value;

    const filteredSales = sales.filter(function(sale) {

        const matchesSearch =
            sale.productName.toLowerCase().includes(searchText) ||
            (sale.customer || "").toLowerCase().includes(searchText);

        const matchesStatus =
            selectedStatus === "all" ||
            sale.paymentStatus === selectedStatus;

        const matchesDate =
            selectedDate === "" ||
            sale.date === selectedDate;

        return matchesSearch && matchesStatus && matchesDate;

    });


    salesTableBody.replaceChildren();

    emptySales.hidden = filteredSales.length !== 0;


    /*
       Display newest transactions first.
    */

    filteredSales.slice().reverse().forEach(function(sale) {

        const row = document.createElement("tr");

        addCell(row, sale.date);
        addCell(row, sale.productName);
        addCell(row, sale.quantity);
        addCell(row, sale.customer || "Walk-in Customer");
        addCell(row, peso(sale.total));
        addCell(row, peso(sale.amountReceived));
        addCell(row, peso(sale.balance));


        /* Payment status */

        const statusCell = document.createElement("td");
        const statusLabel = document.createElement("span");

        statusLabel.className =
            "payment-status " + sale.paymentStatus;

        statusLabel.textContent =
            sale.paymentStatus === "paid"
                ? "Fully Paid"
                : sale.paymentStatus === "partial"
                    ? "Partial"
                    : "Utang";

        statusCell.appendChild(statusLabel);
        row.appendChild(statusCell);


        /* Transaction details button */

        const actionCell = document.createElement("td");

        const detailsButton = document.createElement("button");

        detailsButton.type = "button";
        detailsButton.className = "sales-action-button";
        detailsButton.textContent = "Details";

        detailsButton.addEventListener("click", function() {

            alert(
                "Sale Details\n\n" +
                "Product: " + sale.productName + "\n" +
                "Quantity: " + sale.quantity + "\n" +
                "Customer: " + (sale.customer || "Walk-in Customer") + "\n" +
                "Date: " + sale.date + "\n" +
                "Total: " + peso(sale.total) + "\n" +
                "Received: " + peso(sale.amountReceived) + "\n" +
                "Change: " + peso(sale.change) + "\n" +
                "Balance: " + peso(sale.balance) + "\n" +
                "Notes: " + (sale.notes || "None")
            );

        });

        actionCell.appendChild(detailsButton);
        row.appendChild(actionCell);

        salesTableBody.appendChild(row);

    });


    displayedSales.textContent = filteredSales.length;

}


/* =========================================
   ADD A TABLE CELL SAFELY
========================================= */

function addCell(row, value) {

    const cell = document.createElement("td");

    cell.textContent = value;

    row.appendChild(cell);

}


/* =========================================
   UPDATE SALES SUMMARY
========================================= */

function updateSummary() {

    const today = todayString();

    const todaysSales = sales.filter(function(sale) {
        return sale.date === today;
    });

    let totalSales = 0;
    let totalReceived = 0;
    let totalBalance = 0;

    todaysSales.forEach(function(sale) {

        totalSales += sale.total;
        totalReceived += sale.amountReceived;

    });

    /*
       Outstanding balance includes unpaid amounts from
       all dates, not just today's transactions.
    */

    sales.forEach(function(sale) {

        totalBalance += sale.balance;

    });


    document.getElementById("today-sales").textContent =
        peso(totalSales);

    document.getElementById("cash-received").textContent =
        peso(totalReceived);

    document.getElementById("outstanding-balance").textContent =
        peso(totalBalance);

    document.getElementById("transaction-count").textContent =
        todaysSales.length;

}


/* =========================================
   REFRESH PAGE DATE
========================================= */

function updatePageDate() {

    const dateElement = document.getElementById("current-date");

    if (dateElement) {

        dateElement.textContent = new Date().toLocaleDateString(
            "en-PH",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );

    }

    const yearElement = document.getElementById("current-year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

}


/* =========================================
   EVENT LISTENERS
========================================= */

saleProduct.addEventListener("change", updateSelectedProduct);

saleQuantity.addEventListener("input", calculateTotal);

saleAmountReceived.addEventListener("input", function() {
    calculatePayment();
    updatePaymentStatus();
});

salePaymentStatus.addEventListener("change", function() {

    if (salePaymentStatus.value === "utang") {
        saleAmountReceived.value = "0.00";
    }

    calculatePayment();

});


searchSale.addEventListener("input", displaySales);

filterSaleStatus.addEventListener("change", displaySales);

filterSaleDate.addEventListener("change", displaySales);


document.getElementById("clear-sale-form").addEventListener(
    "click",
    function() {

        setTimeout(function() {

            saleDate.value = todayString();
            saleQuantity.value = "1";
            saleAmountReceived.value = "0.00";

            populateProducts();

        }, 0);

    }
);


/* =========================================
   INITIALIZE SALES PAGE
========================================= */

saleDate.value = todayString();

populateProducts();

displaySales();

updateSummary();

updatePageDate();