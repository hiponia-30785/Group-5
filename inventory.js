/* =========================================
   TINDATRACK INVENTORY MANAGEMENT
========================================= */


/* =========================================
   1. SELECT HTML ELEMENTS
========================================= */

const productForm = document.getElementById("product-form");

const productIdInput = document.getElementById("product-id");
const productNameInput = document.getElementById("product-name");
const productQuantityInput = document.getElementById("product-quantity");
const productCostInput = document.getElementById("product-cost");
const productPriceInput = document.getElementById("product-price");
const productExpirationInput = document.getElementById("product-expiration");
const productThresholdInput = document.getElementById("product-threshold");

const searchProductInput = document.getElementById("search-product");
const stockFilterSelect = document.getElementById("stock-filter");

const inventoryTableBody = document.getElementById("inventory-table-body");
const emptyInventoryMessage = document.getElementById("empty-inventory");

const totalProductsElement = document.getElementById("total-products");
const totalStockElement = document.getElementById("total-stock");
const lowStockCountElement = document.getElementById("low-stock-count");
const inventoryValueElement = document.getElementById("inventory-value");

const displayedProductsElement = document.getElementById("displayed-products");

const formTitle = document.getElementById("form-title");
const saveProductButton = document.getElementById("save-product-button");
const cancelEditButton = document.getElementById("cancel-edit-button");
const clearFormButton = document.getElementById("clear-form-button");


/* =========================================
   2. INVENTORY DATA
========================================= */

const STORAGE_KEY = "tindatrack_inventory";

let products = loadProducts();


/* =========================================
   3. LOAD SAVED PRODUCTS
========================================= */

function loadProducts() {

    try {

        const savedProducts = localStorage.getItem(STORAGE_KEY);

        if (!savedProducts) {
            return [];
        }

        const parsedProducts = JSON.parse(savedProducts);

        if (!Array.isArray(parsedProducts)) {
            return [];
        }

        return parsedProducts;

    } catch (error) {

        console.error("Unable to load inventory:", error);

        return [];

    }

}


/* =========================================
   4. SAVE PRODUCTS
========================================= */

function saveProducts() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(products)
        );

        return true;

    } catch (error) {

        console.error("Unable to save inventory:", error);

        alert(
            "Unable to save your inventory in this browser. " +
            "Check your browser storage settings."
        );

        return false;

    }

}


/* =========================================
   5. FORMAT PHILIPPINE PESOS
========================================= */

function formatPeso(amount) {

    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP"
    }).format(amount);

}


/* =========================================
   6. DETERMINE STOCK STATUS
========================================= */

function getStockStatus(product) {

    if (product.quantity === 0) {

        return {
            label: "Out of Stock",
            className: "out-of-stock"
        };

    }

    if (product.quantity <= product.threshold) {

        return {
            label: "Low Stock",
            className: "low-stock"
        };

    }

    return {
        label: "In Stock",
        className: "in-stock"
    };

}


/* =========================================
   7. FORMAT EXPIRATION DATE
========================================= */

function formatExpirationDate(dateString) {

    if (!dateString) {
        return "No expiration date";
    }

    const parts = dateString.split("-");

    if (parts.length !== 3) {
        return "Invalid date";
    }

    return `${parts[1]}/${parts[2]}/${parts[0]}`;

}


/* =========================================
   8. CHECK EXPIRATION STATUS
========================================= */

function getExpirationStatus(dateString) {

    if (!dateString) {
        return "";
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const expirationDate = new Date(
        dateString + "T00:00:00"
    );

    const difference =
        expirationDate.getTime() - today.getTime();

    const daysRemaining = Math.round(
        difference / (1000 * 60 * 60 * 24)
    );

    if (daysRemaining < 0) {

        return "expiration-danger";

    }

    if (daysRemaining <= 30) {

        return "expiration-warning";

    }

    return "";

}


/* =========================================
   9. DISPLAY INVENTORY
========================================= */

function displayProducts() {

    const searchText = searchProductInput.value
        .trim()
        .toLowerCase();

    const selectedFilter = stockFilterSelect.value;

    let filteredProducts = products.filter(function(product) {

        const matchesSearch = product.name
            .toLowerCase()
            .includes(searchText);

        const stockStatus = getStockStatus(product);

        let matchesFilter = true;

        if (selectedFilter === "in-stock") {
            matchesFilter = stockStatus.className === "in-stock";
        }

        if (selectedFilter === "low-stock") {
            matchesFilter = stockStatus.className === "low-stock";
        }

        if (selectedFilter === "out-of-stock") {
            matchesFilter = stockStatus.className === "out-of-stock";
        }

        return matchesSearch && matchesFilter;

    });


    /* Clear previous table rows */

    inventoryTableBody.replaceChildren();


    /* Display an empty message if no products match */

    if (filteredProducts.length === 0) {

        emptyInventoryMessage.hidden = false;

    } else {

        emptyInventoryMessage.hidden = true;

    }


    /* Create a row for every matching product */

    filteredProducts.forEach(function(product) {

        const row = document.createElement("tr");

        const stockStatus = getStockStatus(product);

        const stockValue = product.quantity * product.cost;

        const expirationClass = getExpirationStatus(
            product.expirationDate
        );


        /* Product Name */

        const nameCell = document.createElement("td");

        nameCell.textContent = product.name;


        /* Quantity */

        const quantityCell = document.createElement("td");

        quantityCell.textContent = product.quantity;


        /* Cost per Item */

        const costCell = document.createElement("td");

        costCell.textContent = formatPeso(product.cost);


        /* Selling Price */

        const priceCell = document.createElement("td");

        priceCell.textContent = formatPeso(product.price);


        /* Expiration Date */

        const expirationCell = document.createElement("td");

        expirationCell.textContent = formatExpirationDate(
            product.expirationDate
        );

        if (expirationClass) {
            expirationCell.classList.add(expirationClass);
        }


        /* Stock Value */

        const valueCell = document.createElement("td");

        valueCell.textContent = formatPeso(stockValue);


        /* Stock Status */

        const statusCell = document.createElement("td");

        const statusLabel = document.createElement("span");

        statusLabel.className =
            "stock-status " + stockStatus.className;

        statusLabel.textContent = stockStatus.label;

        statusCell.appendChild(statusLabel);


        /* Action Buttons */

        const actionsCell = document.createElement("td");

        const actionContainer = document.createElement("div");

        actionContainer.className = "action-buttons";


        /* Edit Button */

        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.className = "action-button";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", function() {

            editProduct(product.id);

        });


        /* Delete Button */

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";

        deleteButton.className =
            "action-button delete-button";

        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {

            deleteProduct(product.id);

        });


        actionContainer.appendChild(editButton);
        actionContainer.appendChild(deleteButton);

        actionsCell.appendChild(actionContainer);


        /* Add Cells to the Row */

        row.appendChild(nameCell);
        row.appendChild(quantityCell);
        row.appendChild(costCell);
        row.appendChild(priceCell);
        row.appendChild(expirationCell);
        row.appendChild(valueCell);
        row.appendChild(statusCell);
        row.appendChild(actionsCell);


        /* Add Row to the Table */

        inventoryTableBody.appendChild(row);

    });


    /* Update the table count */

    displayedProductsElement.textContent =
        filteredProducts.length;


    /* Update dashboard totals */

    updateInventorySummary();

}


/* =========================================
   10. UPDATE INVENTORY SUMMARY
========================================= */

function updateInventorySummary() {

    const totalProducts = products.length;

    let totalStock = 0;
    let lowStockCount = 0;
    let inventoryValue = 0;

    products.forEach(function(product) {

        totalStock += product.quantity;

        inventoryValue +=
            product.quantity * product.cost;

        const status = getStockStatus(product);

        if (status.className === "low-stock") {
            lowStockCount++;
        }

    });


    totalProductsElement.textContent = totalProducts;

    totalStockElement.textContent = totalStock;

    lowStockCountElement.textContent = lowStockCount;

    inventoryValueElement.textContent =
        formatPeso(inventoryValue);

}


/* =========================================
   11. ADD OR UPDATE A PRODUCT
========================================= */

productForm.addEventListener("submit", function(event) {

    event.preventDefault();


    /* Get form values */

    const productId = productIdInput.value;

    const productName = productNameInput.value.trim();

    const quantity = Number(productQuantityInput.value);

    const cost = Number(productCostInput.value);

    const price = Number(productPriceInput.value);

    const expirationDate = productExpirationInput.value;

    const threshold = Number(productThresholdInput.value);


    /* Validate the values */

    if (productName === "") {

        alert("Please enter a product name.");

        productNameInput.focus();

        return;

    }

    if (
        !Number.isSafeInteger(quantity) ||
        quantity < 0
    ) {

        alert("Quantity must be a whole number of zero or more.");

        productQuantityInput.focus();

        return;

    }

    if (
        !Number.isFinite(cost) ||
        cost < 0 ||
        !Number.isFinite(price) ||
        price < 0
    ) {

        alert("Cost and selling price must be zero or more.");

        return;

    }

    if (
        !Number.isSafeInteger(threshold) ||
        threshold < 0
    ) {

        alert("The low-stock alert level must be a whole number.");

        productThresholdInput.focus();

        return;

    }


    /* Check for duplicate product names */

    const duplicateProduct = products.find(function(product) {

        return (
            product.name.toLowerCase() === productName.toLowerCase() &&
            product.id !== productId
        );

    });

    if (duplicateProduct) {

        alert(
            "A product with this name already exists. " +
            "Edit the existing product instead."
        );

        productNameInput.focus();

        return;

    }


    /* Prepare product information */

    const productData = {

        id: productId || createProductId(),

        name: productName,

        quantity: quantity,

        cost: cost,

        price: price,

        expirationDate: expirationDate,

        threshold: threshold

    };


    /* Save new product or update an existing one */

    const previousProducts = JSON.stringify(products);

    if (productId) {

        products = products.map(function(product) {

            if (product.id === productId) {
                return productData;
            }

            return product;

        });

    } else {

        products.push(productData);

    }


    /* Save to browser storage */

    if (!saveProducts()) {

        products = JSON.parse(previousProducts);

        return;

    }


    /* Reset and refresh the page */

    resetProductForm();

    displayProducts();

    alert(
        productId
            ? "Product updated successfully!"
            : "Product added successfully!"
    );

});


/* =========================================
   12. GENERATE A PRODUCT ID
========================================= */

function createProductId() {

    if (window.crypto && typeof window.crypto.randomUUID === "function") {

        return window.crypto.randomUUID();

    }

    return (
        Date.now().toString(36) +
        Math.random().toString(36).slice(2, 10)
    );

}


/* =========================================
   13. EDIT A PRODUCT
========================================= */

function editProduct(productId) {

    const product = products.find(function(item) {

        return item.id === productId;

    });

    if (!product) {

        alert("Product not found.");

        return;

    }


    /* Put the product details into the form */

    productIdInput.value = product.id;

    productNameInput.value = product.name;

    productQuantityInput.value = product.quantity;

    productCostInput.value = product.cost;

    productPriceInput.value = product.price;

    productExpirationInput.value = product.expirationDate || "";

    productThresholdInput.value = product.threshold;


    /* Change the form to edit mode */

    formTitle.textContent = "Edit Product";

    saveProductButton.textContent = "Update Product";

    cancelEditButton.hidden = false;


    /* Scroll to the form */

    productForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================
   14. DELETE A PRODUCT
========================================= */

function deleteProduct(productId) {

    const product = products.find(function(item) {

        return item.id === productId;

    });

    if (!product) {
        return;
    }


    const confirmed = confirm(
        'Are you sure you want to delete "' +
        product.name +
        '" from your inventory?'
    );

    if (!confirmed) {
        return;
    }


    const previousProducts = JSON.stringify(products);

    products = products.filter(function(item) {

        return item.id !== productId;

    });


    if (!saveProducts()) {

        products = JSON.parse(previousProducts);

        return;

    }


    /* Reset the form if the deleted product was being edited */

    if (productIdInput.value === productId) {

        resetProductForm();

    }


    displayProducts();

    alert("Product deleted successfully.");

}


/* =========================================
   15. RESET THE PRODUCT FORM
========================================= */

function resetProductForm() {

    productForm.reset();

    productIdInput.value = "";

    productThresholdInput.value = 10;

    formTitle.textContent = "Add New Product";

    saveProductButton.textContent = "Add Product";

    cancelEditButton.hidden = true;

}


/* =========================================
   16. CANCEL EDITING
========================================= */

cancelEditButton.addEventListener("click", function() {

    resetProductForm();

});


/* =========================================
   17. CLEAR FORM
========================================= */

clearFormButton.addEventListener("click", function() {

    resetProductForm();

});


/* =========================================
   18. SEARCH PRODUCTS
========================================= */

searchProductInput.addEventListener("input", function() {

    displayProducts();

});


/* =========================================
   19. FILTER PRODUCTS
========================================= */

stockFilterSelect.addEventListener("change", function() {

    displayProducts();

});


/* =========================================
   20. DISPLAY CURRENT DATE
========================================= */

function displayCurrentDate() {

    const dateElement = document.getElementById("current-date");

    if (!dateElement) {
        return;
    }

    dateElement.textContent = new Date().toLocaleDateString(
        "en-PH",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


/* =========================================
   21. DISPLAY CURRENT YEAR
========================================= */

function displayCurrentYear() {

    const yearElement = document.getElementById("current-year");

    if (yearElement) {

        yearElement.textContent = new Date().getFullYear();

    }

}


/* =========================================
   22. INITIALIZE INVENTORY PAGE
========================================= */

displayCurrentDate();

displayCurrentYear();

displayProducts();