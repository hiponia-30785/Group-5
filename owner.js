javascript
// ==========================================
// TINDATRACK - STORE OWNER PAGE
// Prototype storage: browser localStorage
// ==========================================

const OWNER_STORAGE_KEY = "tindatrack_owner";

const ownerForm = document.getElementById("ownerForm");
const resetOwnerBtn = document.getElementById("resetOwnerBtn");

// Load saved owner information when the page opens.
document.addEventListener("DOMContentLoaded", function () {
    loadOwnerInformation();
});

// Collect information from the form.
function getOwnerFormData() {
    return {
        ownerName: document.getElementById("ownerName").value.trim(),
        storeName: document.getElementById("storeName").value.trim(),
        ownerPhone: document.getElementById("ownerPhone").value.trim(),
        ownerEmail: document.getElementById("ownerEmail").value.trim(),
        storeAddress: document.getElementById("storeAddress").value.trim(),
        storeType: document.getElementById("storeType").value,
        businessStart: document.getElementById("businessStart").value
    };
}

// Save owner information.
ownerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const ownerData = getOwnerFormData();

    if (!ownerData.ownerName || !ownerData.storeName) {
        alert("Please enter the owner's full name and store name.");
        return;
    }

    try {
        localStorage.setItem(
            OWNER_STORAGE_KEY,
            JSON.stringify(ownerData)
        );

        updateOwnerSummary(ownerData);

        alert("Store owner information saved successfully.");
    } catch (error) {
        console.error("Unable to save owner information:", error);
        alert("The information could not be saved. Please try again.");
    }
});

// Load information from localStorage into the form.
function loadOwnerInformation() {
    try {
        const savedData = localStorage.getItem(OWNER_STORAGE_KEY);

        if (!savedData) {
            updateOwnerSummary({});
            return;
        }

        const ownerData = JSON.parse(savedData);

        document.getElementById("ownerName").value =
            ownerData.ownerName || "";

        document.getElementById("storeName").value =
            ownerData.storeName || "";

        document.getElementById("ownerPhone").value =
            ownerData.ownerPhone || "";

        document.getElementById("ownerEmail").value =
            ownerData.ownerEmail || "";

        document.getElementById("storeAddress").value =
            ownerData.storeAddress || "";

        document.getElementById("storeType").value =
            ownerData.storeType || "Sari-Sari Store";

        document.getElementById("businessStart").value =
            ownerData.businessStart || "";

        updateOwnerSummary(ownerData);

    } catch (error) {
        console.error("Unable to load owner information:", error);
        alert("There was a problem loading the saved store information.");
    }
}

// Update the profile summary.
function updateOwnerSummary(ownerData) {
    document.getElementById("summaryStoreName").textContent =
        ownerData.storeName || "Not set";

    document.getElementById("summaryOwnerName").textContent =
        ownerData.ownerName || "Not set";

    document.getElementById("summaryOwnerPhone").textContent =
        ownerData.ownerPhone || "Not set";

    document.getElementById("summaryStoreType").textContent =
        ownerData.storeType || "Not set";
}

// Clear the form and saved owner profile after confirmation.
resetOwnerBtn.addEventListener("click", function () {
    const confirmed = confirm(
        "Are you sure you want to reset the owner information? " +
        "This will also remove the saved owner profile."
    );

    if (!confirmed) {
        return;
    }

    try {
        localStorage.removeItem(OWNER_STORAGE_KEY);
        ownerForm.reset();

        // Restore the default store type.
        document.getElementById("storeType").value = "Sari-Sari Store";

        updateOwnerSummary({});

        alert("Store owner information has been reset.");

    } catch (error) {
        console.error("Unable to reset owner information:", error);
        alert("The information could not be reset. Please try again.");
    }
});
