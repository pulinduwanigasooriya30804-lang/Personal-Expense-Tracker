
const form = document.getElementById("transactionForm");

const typeInput = document.getElementById("type");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const transactionList = document.getElementById("transactionList");
const filterInput = document.getElementById("filter");


let transactions = [];

try {
    const savedData = localStorage.getItem("transactions");
    const parsedData = savedData ? JSON.parse(savedData) : [];

    if (Array.isArray(parsedData)) {
        transactions = parsedData.filter(transaction =>
            transaction &&
            typeof transaction.id === "string" &&
            ["Income", "Expense"].includes(transaction.type) &&
            typeof transaction.description === "string" &&
            Number.isFinite(Number(transaction.amount)) &&
            Number(transaction.amount) > 0 &&
            typeof transaction.category === "string" &&
            typeof transaction.date === "string"
        );
    }
} catch (error) {
    transactions = [];
    alert("Warning: Saved data could not be loaded.");
}


dateInput.value = new Date().toLocaleDateString("en-CA");


function formatMoney(amount) {
    return "LKR " + Number(amount).toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


function saveTransactions() {
    try {
        localStorage.setItem(
            "transactions",
            JSON.stringify(transactions)
        );

        return true;
    } catch (error) {
        alert(
            "Warning: Data could not be saved. " +
            "Check your browser storage."
        );

        return false;
    }
}


function updateSummary() {
    let income = 0;
    let expenses = 0;

    transactions.forEach(transaction => {
        if (transaction.type === "Income") {
            income += Number(transaction.amount);
        } else if (transaction.type === "Expense") {
            expenses += Number(transaction.amount);
        }
    });

    document.getElementById("totalIncome").textContent =
        formatMoney(income);

    document.getElementById("totalExpenses").textContent =
        formatMoney(expenses);

    document.getElementById("currentBalance").textContent =
        formatMoney(income - expenses);
}


function displayTransactions() {
    transactionList.replaceChildren();

    const selectedFilter = filterInput.value;

    const filteredTransactions = transactions.filter(transaction => {
        return selectedFilter === "All" ||
               transaction.type === selectedFilter;
    });

    if (filteredTransactions.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.className = "empty-message";
        cell.textContent = "No transactions found.";

        row.appendChild(cell);
        transactionList.appendChild(row);

        return;
    }

    filteredTransactions.forEach(transaction => {
        const row = document.createElement("tr");

        const values = [
            transaction.date,
            transaction.description,
            transaction.type,
            transaction.category,
            formatMoney(transaction.amount)
        ];

        values.forEach((value, index) => {
            const cell = document.createElement("td");

            cell.textContent = value;

            if (index === 2) {
                cell.className =
                    transaction.type === "Income"
                        ? "income-text"
                        : "expense-text";
            }

            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {
            deleteTransaction(transaction.id);
        });

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        transactionList.appendChild(row);
    });
}


function renderApp() {
    updateSummary();
    displayTransactions();
}


form.addEventListener("submit", function(event) {
    event.preventDefault();

    const type = typeInput.value;
    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

   
    if (!type || !description || !category || !date) {
        alert("Warning: Please complete all required fields.");
        return;
    }

   
    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Error: Amount must be greater than zero.");
        return;
    }

   
    if (!Number.isFinite(Date.parse(date))) {
        alert("Error: Please enter a valid date.");
        return;
    }

    const transaction = {
        id: crypto.randomUUID(),
        type: type,
        description: description,
        amount: amount,
        category: category,
        date: date
    };

    transactions.unshift(transaction);

    if (!saveTransactions()) {
        transactions.shift();
        return;
    }

    renderApp();

    alert("Success: Transaction added successfully!");

    form.reset();

    dateInput.value = new Date().toLocaleDateString("en-CA");
});


function deleteTransaction(id) {
    const transaction = transactions.find(item => item.id === id);

    if (!transaction) {
        alert("Error: Transaction not found.");
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) {
        return;
    }

    const previousTransactions = transactions;

    transactions = transactions.filter(item => item.id !== id);

    if (!saveTransactions()) {
        transactions = previousTransactions;
        return;
    }

    renderApp();

    alert("Success: Transaction deleted successfully!");
}


filterInput.addEventListener("change", function() {
    displayTransactions();
});


form.addEventListener("reset", function() {
    setTimeout(() => {
        dateInput.value = new Date().toLocaleDateString("en-CA");
    }, 0);
});


renderApp();
