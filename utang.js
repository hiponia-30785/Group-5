/* =========================================
   TINDATRACK UTANG WATCH
========================================= */


/* STORAGE KEYS */

const UTANG_SALES_KEY = "tindatrack_sales";
const UTANG_PAYMENTS_KEY = "tindatrack_debt_payments";


/* HTML ELEMENTS */

const utangForm = document.getElementById("utang-payment-form");

const utangSale = document.getElementById("utang-sale");
const utangCustomer = document.getElementById("utang-customer");
const utangCurrentBalance = document.getElementById("utang-current-balance");

const utangPaymentAmount = document.getElementById("utang-payment-amount");
const utangPaymentDate = document.getElementById("utang-payment-date");
const utangPaymentNotes = document.getElementById("utang-payment-notes");

const utangPaymentPreview = document.getElementById("utang-payment-preview");
const utangNewBalance = document.getElementById("utang-new-balance");

const utangTableBody = document.getElementById("utang-table-body");
const utangHistoryBody = document.getElementById("utang-history-body");

const emptyUtang = document.getElementById("empty-utang");
const emptyUtangHistory = document.getElementById("empty-utang-history");

const searchUtang = document.getElementById("search-utang");
const filterUtang = document.getElementById("filter-utang");


/* LOAD DATA */

let utangSales = loadUtangSales();
let debtPayments = loadDebtPayments();


/* =========================================
   LOAD SALES
========================================= */

function loadUtangSales() {

    try {

        const saved = JSON.parse(
            localStorage.getItem(UTANG_SALES_KEY) || "[]"
        );

        return Array.isArray(saved) ? saved : [];

    } catch (error) {

        console.error("Unable to load sales:", error);

        return [];

    }

}


/* =========================================
   LOAD DEBT PAYMENTS
========================================= */

function loadDebtPayments() {

    try {

        const saved = JSON.parse(
            localStorage.getItem(UTANG_PAYMENTS_KEY) || "[]"
        );

        return Array.isArray(saved) ? saved : [];

    } catch (error) {

        console.error("Unable to load debt payments:", error);

        return [];

    }

}


/* =========================================
   SAVE SALES
========================================= */

function saveUtangSales() {

    try {

        localStorage.setItem(
            UTANG_SALES_KEY,
            JSON.stringify(utangSales)
        );

        return true;

    } catch (error) {

        console.error(error);

        alert("Unable to save the updated sales records.");

        return false;

    }

}


/* =========================================
   SAVE DEBT PAYMENTS
========================================= */

function saveDebtPayments() {

    try {

        localStorage.setItem(
            UTANG_PAYMENTS_KEY,
            JSON.stringify(debtPayments)
        );

        return true;

    } catch (error) {

        console.error(error);

        alert("Unable to save the debt payment.");

        return false;

    }

}


/* =========================================
   HELPER FUNCTIONS
========================================= */

function utangPeso(amount) {

    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP"
    }).format(amount);

}


function utangToday() {

    const date = new Date();

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function utangCreateId() {

    if (
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
    ) {

        return window.crypto.randomUUID();

    }

    return Date.now().toString(36) +
        Math.random().toString(36).slice(2);

}


/* =========================================
   GET BALANCE
========================================= */

function getSaleBalance(sale) {

    return Math.max(0, Number(sale.balance) || 0);

}


/* =========================================
   GET AMOUNT PAID
========================================= */

function getSaleAmountPaid(sale) {

    return Number(sale.total) - getSaleBalance(sale);

}


/* =========================================
   GET SELECTED SALE
========================================= */

function getSelectedUtangSale() {

    return utangSales.find(function(sale) {

        return sale.id === utangSale.value;

    });

}


/* =========================================
   POPULATE UNPAID TRANSACTIONS
========================================= */

function populateUtangSales() {

    const previousValue = utangSale.value;

    utangSale.replaceChildren();

    const defaultOption = document.createElement("option");

    defaultOption.value = "";
    defaultOption.textContent = "Select an unpaid transaction";

    utangSale.appendChild(defaultOption);


    const unpaidSales = utangSales.filter(function(sale) {

        return getSaleBalance(sale) > 0 &&
            sale.customer &&
            sale.customer.trim() !== "";

    });


    unpaidSales.forEach(function(sale) {

        const option = document.createElement("option");

        option.value = sale.id;

        option.textContent =
            `${sale.customer} — ${sale.productName} — ` +
            `Balance: ${utangPeso(getSaleBalance(sale))}`;

        utangSale.appendChild(option);

    });


    if (unpaidSales.some(sale => sale.id === previousValue)) {

        utangSale.value = previousValue;

    }

    updateSelectedUtangSale();

}


/* =========================================
   UPDATE SELECTED TRANSACTION
========================================= */

function updateSelectedUtangSale() {

    const sale = getSelectedUtangSale();

    if (!sale) {

        utangCustomer.value = "";
        utangCurrentBalance.value = "0.00";

        calculateUtangPayment();

        return;

    }


    utangCustomer.value = sale.customer || "";

    utangCurrentBalance.value =
        getSaleBalance(sale).toFixed(2);

    calculateUtangPayment();

}


/* =========================================
   CALCULATE PAYMENT PREVIEW
========================================= */

function calculateUtangPayment() {

    const sale = getSelectedUtangSale();

    const balance = sale ? getSaleBalance(sale) : 0;

    const payment = Number(utangPaymentAmount.value) || 0;

    const validPayment = Math.min(
        Math.max(0, payment),
        balance
    );

    const newBalance = Math.max(
        0,
        balance - validPayment
    );


    utangPaymentPreview.value = validPayment.toFixed(2);

    utangNewBalance.value = newBalance.toFixed(2);

}


/* =========================================
   RECORD DEBT PAYMENT
========================================= */

utangForm.addEventListener("submit", function(event) {

    event.preventDefault();


    /* Reload data in case it changed elsewhere */

    utangSales = loadUtangSales();

    debtPayments = loadDebtPayments();


    const sale = getSelectedUtangSale();


    if (!sale) {

        alert("Please select an unpaid transaction.");

        return;

    }


    const balance = getSaleBalance(sale);

    const paymentAmount = Number(utangPaymentAmount.value);


    if (
        !Number.isFinite(paymentAmount) ||
        paymentAmount <= 0
    ) {

        alert("Enter a payment amount greater than zero.");

        return;

    }


    if (paymentAmount > balance) {

        alert(
            "The payment cannot be greater than the remaining balance."
        );

        return;

    }


    if (!utangPaymentDate.value) {

        alert("Please select the payment date.");

        return;

    }


    const payment = {

        id: utangCreateId(),

        saleId: sale.id,

        customer: sale.customer || "",

        productName: sale.productName,

        amount: Math.round(paymentAmount * 100) / 100,

        date: utangPaymentDate.value,

        notes: utangPaymentNotes.value.trim(),

        createdAt: new Date().toISOString()

    };


    const oldSales = JSON.stringify(utangSales);

    const oldPayments = JSON.stringify(debtPayments);


    /*
       Reduce the sale balance.
       Do not add the debt collection to the original sale amount.
    */

    sale.balance = Math.round(
        (balance - paymentAmount) * 100
    ) / 100;


    /*
       Update payment status.
    */

    if (sale.balance <= 0) {

        sale.balance = 0;

        sale.paymentStatus = "paid";

    } else {

        sale.paymentStatus = "partial";

    }


    /*
       Record the debt collection.
    */

    debtPayments.push(payment);


    /*
       Save both changes.
    */

    if (!saveUtangSales() || !saveDebtPayments()) {

        utangSales = JSON.parse(oldSales);

        debtPayments = JSON.parse(oldPayments);

        saveUtangSales();

        saveDebtPayments();

        alert(
            "The payment could not be saved. " +
            "Please try again."
        );

        return;

    }


    alert(
        "Debt payment recorded successfully!\n\n" +
        "Customer: " + (sale.customer || "Unknown") + "\n" +
        "Payment Received: " + utangPeso(paymentAmount) + "\n" +
        "Remaining Balance: " + utangPeso(sale.balance)
    );


    utangForm.reset();

    utangPaymentDate.value = utangToday();

    utangPaymentAmount.value = "";


    refreshUtangPage();

});


/* =========================================
   DISPLAY OUTSTANDING DEBTS
========================================= */

function displayUtang() {

    const searchText = searchUtang.value
        .trim()
        .toLowerCase();

    const selectedFilter = filterUtang.value;


    const filteredSales = utangSales.filter(function(sale) {

        const balance = getSaleBalance(sale);

        const matchesSearch =

            (sale.customer || "")
                .toLowerCase()
                .includes(searchText) ||

            (sale.productName || "")
                .toLowerCase()
                .includes(searchText);


        let matchesStatus = true;


        if (selectedFilter === "unpaid") {

            matchesStatus = balance > 0;

        } else if (selectedFilter === "paid") {

            matchesStatus = balance === 0;

        }


        return matchesSearch && matchesStatus;

    });


    utangTableBody.replaceChildren();

    emptyUtang.hidden = filteredSales.length !== 0;


    filteredSales.slice().reverse().forEach(function(sale) {

        const row = document.createElement("tr");

        const balance = getSaleBalance(sale);

        const amountPaid = getSaleAmountPaid(sale);


        addUtangCell(row, sale.date || "—");

        addUtangCell(row, sale.customer || "Walk-in Customer");

        addUtangCell(row, sale.productName || "Unknown Product");

        addUtangCell(row, utangPeso(sale.total));

        addUtangCell(row, utangPeso(amountPaid));

        addUtangCell(row, utangPeso(balance));


        /* STATUS */

        const statusCell = document.createElement("td");

        const statusLabel = document.createElement("span");

        statusLabel.className =
            "payment-status " +
            (balance === 0 ? "paid" : "utang");

        statusLabel.textContent =
            balance === 0 ? "Fully Paid" : "Unpaid";

        statusCell.appendChild(statusLabel);

        row.appendChild(statusCell);


        /* PAYMENT HISTORY BUTTON */

        const historyCell = document.createElement("td");

        const historyButton = document.createElement("button");

        historyButton.type = "button";

        historyButton.className = "utang-history-button";

        historyButton.textContent = "View History";


        historyButton.addEventListener("click", function() {

            showSalePaymentHistory(sale);

        });


        historyCell.appendChild(historyButton);

        row.appendChild(historyCell);


        utangTableBody.appendChild(row);

    });

}


/* =========================================
   DISPLAY PAYMENT HISTORY FOR ONE SALE
========================================= */

function showSalePaymentHistory(sale) {

    const payments = debtPayments.filter(function(payment) {

        return payment.saleId === sale.id;

    });


    if (payments.length === 0) {

        alert(
            "No debt payments have been recorded for this transaction yet."
        );

        return;

    }


    const lines = payments.map(function(payment) {

        return (
            payment.date + " — " +
            utangPeso(payment.amount) +
            (payment.notes ? " (" + payment.notes + ")" : "")
        );

    });


    alert(
        "Payment History\n\n" +
        "Customer: " + (sale.customer || "Unknown") + "\n" +
        "Product: " + sale.productName + "\n\n" +
        lines.join("\n")
    );

}


/* =========================================
   DISPLAY ALL PAYMENT HISTORY
========================================= */

function displayUtangHistory() {

    utangHistoryBody.replaceChildren();


    const sortedPayments = debtPayments
        .slice()
        .sort(function(a, b) {

            return b.createdAt.localeCompare(a.createdAt);

        });


    emptyUtangHistory.hidden = sortedPayments.length !== 0;


    sortedPayments.forEach(function(payment) {

        const row = document.createElement("tr");

        addUtangCell(row, payment.date);

        addUtangCell(row, payment.customer || "Unknown Customer");

        addUtangCell(row, payment.productName || "Unknown Product");

        addUtangCell(row, utangPeso(payment.amount));

        addUtangCell(row, payment.notes || "—");

        utangHistoryBody.appendChild(row);

    });

}


/* =========================================
   ADD TABLE CELL
========================================= */

function addUtangCell(row, value) {

    const cell = document.createElement("td");

    cell.textContent = value;

    row.appendChild(cell);

}


/* =========================================
   UPDATE SUMMARY CARDS
========================================= */

function updateUtangSummary() {

    let totalBalance = 0;

    const customersWithDebt = new Set();

    let fullyPaidCount = 0;


    utangSales.forEach(function(sale) {

        const balance = getSaleBalance(sale);

        totalBalance += balance;


        if (balance > 0 && sale.customer) {

            customersWithDebt.add(
                sale.customer.trim().toLowerCase()
            );

        }


        if (balance === 0) {

            fullyPaidCount++;

        }

    });


    const today = utangToday();

    const paymentsToday = debtPayments.filter(function(payment) {

        return payment.date === today;

    });


    const totalPaymentsToday = paymentsToday.reduce(
        function(total, payment) {

            return total + Number(payment.amount || 0);

        },
        0
    );


    document.getElementById("total-utang").textContent =
        utangPeso(totalBalance);


    document.getElementById("utang-customer-count").textContent =
        customersWithDebt.size;


    document.getElementById("utang-payments-today").textContent =
        utangPeso(totalPaymentsToday);


    document.getElementById("fully-paid-debts").textContent =
        fullyPaidCount;

}


/* =========================================
   UPDATE HEADER DATE
========================================= */

function updateUtangHeader() {

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
   REFRESH PAGE
========================================= */

function refreshUtangPage() {

    populateUtangSales();

    displayUtang();

    displayUtangHistory();

    updateUtangSummary();

}


/* =========================================
   EVENT LISTENERS
========================================= */

utangSale.addEventListener(
    "change",
    updateSelectedUtangSale
);


utangPaymentAmount.addEventListener(
    "input",
    calculateUtangPayment
);


searchUtang.addEventListener(
    "input",
    displayUtang
);


filterUtang.addEventListener(
    "change",
    displayUtang
);


document.getElementById("clear-utang-form").addEventListener(
    "click",
    function() {

        setTimeout(function() {

            utangPaymentDate.value = utangToday();

            calculateUtangPayment();

            updateSelectedUtangSale();

        }, 0);

    }
);


/* =========================================
   INITIALIZE PAGE
========================================= */

utangPaymentDate.value = utangToday();

refreshUtangPage();

updateUtangHeader();