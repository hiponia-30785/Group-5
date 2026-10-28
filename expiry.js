/* =========================================
   TINDATRACK EXPIRY GUARD
========================================= */


/* STORAGE KEY */

const EXPIRY_INVENTORY_KEY = "tindatrack_inventory";


/* HTML ELEMENTS */

const expiryTableBody = document.getElementById("expiry-table-body");

const emptyExpiry = document.getElementById("empty-expiry");

const searchExpiry = document.getElementById("search-expiry");

const filterExpiryStatus = document.getElementById("filter-expiry-status");

const expirySort = document.getElementById("expiry-sort");

const displayedExpiry = document.getElementById("displayed-expiry");

const refreshExpiryButton = document.getElementById("refresh-expiry");


/* LOAD INVENTORY */

let expiryInventory = loadExpiryInventory();


/* =========================================
   LOAD INVENTORY
========================================= */

function loadExpiryInventory() {

    try {

        const savedInventory = JSON.parse(
            localStorage.getItem(EXPIRY_INVENTORY_KEY) || "[]"
        );

        return Array.isArray(savedInventory)
            ? savedInventory
            : [];

    } catch (error) {

        console.error("Unable to load inventory:", error);

        return [];

    }

}


/* =========================================
   FORMAT DATE
========================================= */

function expiryToday() {

    const now = new Date();

    return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

}


function parseExpiryDate(dateString) {

    if (!dateString) {
        return null;
    }

    const parts = dateString.split("-");

    if (parts.length !== 3) {
        return null;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    const date = new Date(year, month - 1, day);

    /*
       Reject invalid calendar dates.
    */

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;

}


/* =========================================
   CALCULATE DAYS REMAINING
========================================= */

function getDaysRemaining(expirationDate) {

    const parsedDate = parseExpiryDate(expirationDate);

    if (!parsedDate) {
        return null;
    }

    const today = expiryToday();

    const difference =
        parsedDate.getTime() - today.getTime();

    return Math.round(
        difference / (1000 * 60 * 60 * 24)
    );

}


/* =========================================
   GET EXPIRATION STATUS
========================================= */

function getExpiryStatus(product) {

    const days = getDaysRemaining(product.expiryDate);

    if (days === null) {

        return {
            key: "none",
            label: "No Expiry Date",
            days: null
        };

    }

    if (days < 0) {

        return {
            key: "expired",
            label: "Expired",
            days: days
        };

    }

    if (days <= 30) {

        return {
            key: "soon",
            label: "Expiring Soon",
            days: days
        };

    }

    return {
        key: "safe",
        label: "Safe Stock",
        days: days
    };

}


/* =========================================
   FORMAT EXPIRATION DATE
========================================= */

function formatExpiryDate(dateString) {

    const date = parseExpiryDate(dateString);

    if (!date) {
        return "Not recorded";
    }

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });

}


/* =========================================
   UPDATE SUMMARY CARDS
========================================= */

function updateExpirySummary() {

    let expiredCount = 0;

    let expiringSoonCount = 0;

    let safeStockCount = 0;

    let noExpiryCount = 0;


    expiryInventory.forEach(function(product) {

        const status = getExpiryStatus(product);


        if (status.key === "expired") {

            expiredCount++;

        } else if (status.key === "soon") {

            expiringSoonCount++;

        } else if (status.key === "safe") {

            safeStockCount++;

        } else {

            noExpiryCount++;

        }

    });


    document.getElementById("expired-count").textContent =
        expiredCount;


    document.getElementById("expiring-soon-count").textContent =
        expiringSoonCount;


    document.getElementById("safe-stock-count").textContent =
        safeStockCount;


    document.getElementById("no-expiry-count").textContent =
        noExpiryCount;

}


/* =========================================
   DISPLAY EXPIRATION LIST
========================================= */

function displayExpiry() {

    const searchText = searchExpiry.value
        .trim()
        .toLowerCase();

    const selectedStatus = filterExpiryStatus.value;

    const sortBy = expirySort.value;


    let filteredProducts = expiryInventory.filter(function(product) {

        const productName = String(product.name || "");

        const matchesSearch = productName
            .toLowerCase()
            .includes(searchText);

        const status = getExpiryStatus(product);

        const matchesStatus =
            selectedStatus === "all" ||
            status.key === selectedStatus;

        return matchesSearch && matchesStatus;

    });


    /* SORT PRODUCTS */

    filteredProducts.sort(function(a, b) {

        if (sortBy === "name") {

            return String(a.name || "").localeCompare(
                String(b.name || "")
            );

        }

        if (sortBy === "quantity") {

            return Number(b.quantity || 0) -
                Number(a.quantity || 0);

        }


        /*
           Products with recorded dates appear before
           products without expiration dates.
        */

        const daysA = getDaysRemaining(a.expiryDate);

        const daysB = getDaysRemaining(b.expiryDate);


        if (daysA === null && daysB === null) {
            return String(a.name || "").localeCompare(
                String(b.name || "")
            );
        }

        if (daysA === null) {
            return 1;
        }

        if (daysB === null) {
            return -1;
        }

        return daysA - daysB;

    });


    /* CLEAR TABLE */

    expiryTableBody.replaceChildren();


    /* EMPTY STATE */

    emptyExpiry.hidden = filteredProducts.length !== 0;


    /* ADD PRODUCT ROWS */

    filteredProducts.forEach(function(product) {

        const row = document.createElement("tr");

        const status = getExpiryStatus(product);


        addExpiryCell(row, product.name || "Unnamed Product");

        addExpiryCell(row, Number(product.quantity || 0));

        addExpiryCell(
            row,
            formatExpiryDate(product.expiryDate)
        );


        /* DAYS REMAINING */

        const daysCell = document.createElement("td");


        if (status.days === null) {

            daysCell.textContent = "—";

        } else if (status.days < 0) {

            daysCell.textContent =
                Math.abs(status.days) +
                (Math.abs(status.days) === 1
                    ? " day overdue"
                    : " days overdue");

            daysCell.className = "expiry-days-expired";

        } else if (status.days === 0) {

            daysCell.textContent = "Expires today";

            daysCell.className = "expiry-days-soon";

        } else {

            daysCell.textContent =
                status.days +
                (status.days === 1
                    ? " day remaining"
                    : " days remaining");

            daysCell.className =
                status.key === "soon"
                    ? "expiry-days-soon"
                    : "expiry-days-safe";

        }


        row.appendChild(daysCell);


        /* STATUS BADGE */

        const statusCell = document.createElement("td");

        const statusBadge = document.createElement("span");

        statusBadge.className =
            "expiry-status " + status.key;

        statusBadge.textContent = status.label;

        statusCell.appendChild(statusBadge);

        row.appendChild(statusCell);


        expiryTableBody.appendChild(row);

    });


    displayedExpiry.textContent = filteredProducts.length;

}


/* =========================================
   ADD TABLE CELL
========================================= */

function addExpiryCell(row, value) {

    const cell = document.createElement("td");

    cell.textContent = value;

    row.appendChild(cell);

}


/* =========================================
   UPDATE HEADER DATE
========================================= */

function updateExpiryHeader() {

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
   REFRESH INVENTORY DATA
========================================= */

function refreshExpiryData() {

    expiryInventory = loadExpiryInventory();

    updateExpirySummary();

    displayExpiry();

}


/* =========================================
   EVENT LISTENERS
========================================= */

searchExpiry.addEventListener(
    "input",
    displayExpiry
);


filterExpiryStatus.addEventListener(
    "change",
    displayExpiry
);


expirySort.addEventListener(
    "change",
    displayExpiry
);


refreshExpiryButton.addEventListener(
    "click",
    refreshExpiryData
);


/* =========================================
   INITIALIZE PAGE
========================================= */

updateExpirySummary();

displayExpiry();

updateExpiryHeader();