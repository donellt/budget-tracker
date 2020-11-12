// create a variable to hold db connection
let db;

//establish a connection to IndexedDB database called "budget_tracker" and set it to version 1
const request = indexedDB.open("budget_tracker", 1);

// event will emit if the database version changes
request.onupgradeneeded = function(target) {
  // save reference to the database
  let db = event.target.result;
  // creates an object store/table called "pending" with auto incrementing key
  db.createObjectStore('pending', { autoIncrement: true });
};

// upon a successful request
request.onsuccess = function (target) {
  //save reference to global variable when object store is successfully created
  db = target.result;

  // check if app in online, if so, run the checkDatabase()
  if (navigator.onLine) {
    checkDatabase();
  }
};

//error log
request.onerror = function (event) {
  console.log("Uh oh!" + event.target.errorCode);
};

//function will be executed if attempting to submit transaction with no connection
function saveRecord(record) {
  //open a new transaction with the database with read and write permissions
  const transaction = db.transaction(['pending'], 'readwrite');
  //access the object store for 'pending'
  const budgetStore = transaction.objectStore('pending');
  //add record to the budgetStore with add method
  budgetStore.add(record);
}

//function that handles the collection and posting of data from budgetStore to the server
function checkDatabase() {
  //open transation
  const transaction = db.transaction(['pending'], 'readwrite');
  //access budgetStore
  const budgetStore = transaction.objectStore('pending');
  //get all records from budgetStore and set to the variable getAll
  const getAll = budgetStore.getAll();

  //upon a successful .getAll() execution, run this function
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          //open another transaction
          const transaction = db.transaction(['pending'], 'readwrite');
          const budgetStore = transaction.objectStore('pending');
          budgetStore.clear();

          alert('All saved transactions have been submitted!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};

//listen for online app
window.addEventListener('online', checkDatabase);