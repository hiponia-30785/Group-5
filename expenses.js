/* =========================================
   TINDATRACK EXPENSES MANAGEMENT
========================================= */


/* STORAGE KEY */

const EXPENSES_KEY = "tindatrack_expenses";


/* HTML ELEMENTS */

const expenseForm = document.getElementById("expense-form");

const expenseName = document.getElementById("expense-name");
const expenseCategory = document.getElementById("expense-category");
const expenseAmount = document.getElementById("expense-amount");
const expenseDate = document.getElementById("expense-date");
const expensePaidTo = document.getElementById("expense-paid-to");
const expensePaymentMethod = document.getElementById("expense-payment-method");
const expenseDescription = document.getElementById("expense-description");

const expensesTableBody = document.getElementById("expenses-table-body");
const emptyExpenses = document.getElementById("empty-expenses");

const searchExpense = document.getElementById("search-expense");
const filterExpenseCategory = document.getElementById("filter-expense-category");
const filterExpenseDate = document.getElementById("filter-expense-date");

const displayedExpenses = document.getElementById("displayed-expenses");


/* LOAD SAVED EXPENSES */

let expenses = loadExpenses();


/* =========================================
   LOAD EXPENSES
========================================= */

function loadExpenses() {

    try {

        const savedExpenses = JSON.parse(
            localStorage.getItem(EXPENSES_KEY) || "[]"
        );

        return Array.isArray(savedExpenses) ? savedExpenses : [];

    } catch (error) {

        console.error("Unable to load expenses:", error);

        return [];

    }

}


/* =========================================
   SAVE EXPENSES
========================================= */

function saveExpenses() {

    try {

        localStorage.setItem(
            EXPENSES_KEY,
            JSON.stringify(expenses)
        );

        return true;

    } catch (error) {

        console.error("Unable to save expenses:", error);

        alert(
            "Unable to save the expense. " +
            "Check your browser storage and try again."
        );

        return false;

    }

}


/* =========================================
   HELPER FUNCTIONS
========================================= */

function formatPeso(amount) {

    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP"
    }).format(amount);

}


function getToday() {

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


function createExpenseId() {

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
   SAVE A NEW EXPENSE
========================================= */

expenseForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = expenseName.value.trim();

    const category = expenseCategory.value;

    const amount = Number(expenseAmount.value);

    const date = expenseDate.value;

    const paidTo = expensePaidTo.value.trim();

    const paymentMethod = expensePaymentMethod.value;

    const description = expenseDescription.value.trim();


    /* VALIDATION */

    if (name === "") {

        alert("Please enter an expense name.");

        expenseName.focus();

        return;

    }


    if (category === "") {

        alert("Please select an expense category.");

        expenseCategory.focus();

        return;

    }


    if (!Number.isFinite(amount) || amount <= 0) {

        alert("Please enter an amount greater than zero.");

        expenseAmount.focus();

        return;

    }


    if (date === "") {

        alert("Please select an expense date.");

        expenseDate.focus();

        return;

    }


    /* CREATE EXPENSE RECORD */

    const newExpense = {

        id: createExpenseId(),

        name: name,

        category: category,

        amount: Math.round(amount * 100) / 100,

        date: date,

        paidTo: paidTo,

        paymentMethod: paymentMethod,

        description: description,

        createdAt: new Date().toISOString()

    };


    /* SAVE NEW RECORD */

    expenses.push(newExpense);

    if (!saveExpenses()) {

        expenses.pop();

        return;

    }


    /* CONFIRMATION */

    alert(
        "Expense recorded successfully!\n\n" +
        "Expense: " + name + "\n" +
        "Category: " + category + "\n" +
        "Amount: " + formatPeso(amount)
    );


    /* RESET FORM */

    expenseForm.reset();

    expenseDate.value = getToday();


    /* REFRESH PAGE */

    displayExpenses();

    updateExpenseSummary();

});


/* =========================================
   DISPLAY EXPENSE HISTORY
========================================= */

function displayExpenses() {

    const searchText = searchExpense.value
        .trim()
        .toLowerCase();

    const selectedCategory = filterExpenseCategory.value;

    const selectedDate = filterExpenseDate.value;


    /* FILTER EXPENSES */

    const filteredExpenses = expenses.filter(function(expense) {

        const matchesSearch =

            expense.name.toLowerCase().includes(searchText) ||

            (expense.paidTo || "")
                .toLowerCase()
                .includes(searchText) ||

            (expense.description || "")
                .toLowerCase()
                .includes(searchText);


        const matchesCategory =

            selectedCategory === "all" ||

            expense.category === selectedCategory;


        const matchesDate =

            selectedDate === "" ||

            expense.date === selectedDate;


        return matchesSearch && matchesCategory && matchesDate;

    });


    /* CLEAR EXISTING TABLE */

    expensesTableBody.replaceChildren();


    /* SHOW EMPTY MESSAGE */

    emptyExpenses.hidden = filteredExpenses.length !== 0;


    /* DISPLAY NEWEST EXPENSES FIRST */

    filteredExpenses.slice().reverse().forEach(function(expense) {

        const row = document.createElement("tr");


        addExpenseCell(row, expense.date);

        addExpenseCell(row, expense.name);

        addExpenseCell(row, expense.category);

        addExpenseCell(row, expense.paidTo || "—");

        addExpenseCell(row, expense.paymentMethod);

        addExpenseCell(row, formatPeso(expense.amount));

        addExpenseCell(row, expense.description || "—");


        /* ACTIONS */

        const actionCell = document.createElement("td");


        /* VIEW BUTTON */

        const viewButton = document.createElement("button");

        viewButton.type = "button";

        viewButton.className = "sales-action-button";

        viewButton.textContent = "View";

        viewButton.addEventListener("click", function() {

            alert(
                "Expense Details\n\n" +
                "Name: " + expense.name + "\n" +
                "Category: " + expense.category + "\n" +
                "Amount: " + formatPeso(expense.amount) + "\n" +
                "Date: " + expense.date + "\n" +
                "Paid To: " + (expense.paidTo || "Not specified") + "\n" +
                "Payment Method: " + expense.paymentMethod + "\n" +
                "Description: " + (expense.description || "None")
            );

        });


        /* DELETE BUTTON */

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";

        deleteButton.className = "sales-action-button";

        deleteButton.textContent = "Delete";

        deleteButton.style.marginLeft = "5px";


        deleteButton.addEventListener("click", function() {

            const confirmed = confirm(
                "Are you sure you want to delete this expense?\n\n" +
                expense.name + " — " +
                formatPeso(expense.amount)
            );


            if (!confirmed) {
                return;
            }


            const originalExpenses = expenses.slice();

            expenses = expenses.filter(function(item) {

                return item.id !== expense.id;

            });


            if (!saveExpenses()) {

                expenses = originalExpenses;

                return;

            }


            displayExpenses();

            updateExpenseSummary();

        });


        actionCell.appendChild(viewButton);

        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);


        expensesTableBody.appendChild(row);

    });


    displayedExpenses.textContent = filteredExpenses.length;

}


/* =========================================
   ADD TABLE CELL
========================================= */

function addExpenseCell(row, value) {

    const cell = document.createElement("td");

    /* textContent prevents HTML from being interpreted as markup */
    cell.textContent = value;

    row.appendChild(cell);

}


/* =========================================
   UPDATE EXPENSE SUMMARY
========================================= */

function updateExpenseSummary() {

    const today = getToday();

    const currentMonth = today.substring(0, 7);


    let todayTotal = 0;

    let monthTotal = 0;

    let allTotal = 0;


    expenses.forEach(function(expense) {

        const amount = Number(expense.amount) || 0;


        allTotal += amount;


        if (expense.date === today) {

            todayTotal += amount;

        }


        if (expense.date.substring(0, 7) === currentMonth) {

            monthTotal += amount;

        }

    });


    document.getElementById("today-expenses").textContent =
        formatPeso(todayTotal);


    document.getElementById("month-expenses").textContent =
        formatPeso(monthTotal);


    document.getElementById("all-expenses").textContent =
        formatPeso(allTotal);


    document.getElementById("expense-count").textContent =
        expenses.length;

}


/* =========================================
   UPDATE HEADER DATE
========================================= */

function updateExpenseHeader() {

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
   SEARCH AND FILTER EVENTS
========================================= */

searchExpense.addEventListener("input", displayExpenses);

filterExpenseCategory.addEventListener("change", displayExpenses);

filterExpenseDate.addEventListener("change", displayExpenses);


/* =========================================
   CLEAR FORM
========================================= */

document.getElementById("clear-expense-form").addEventListener(
    "click",
    function() {

        setTimeout(function() {

            expenseDate.value = getToday();

        }, 0);

    }
);


/* =========================================
   INITIALIZE PAGE
========================================= */

expenseDate.value = getToday();

displayExpenses();

updateExpenseSummary();

updateExpenseHeader();