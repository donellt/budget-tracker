// create a variable to hold db connection
let db;

//establish a connection to IndexedDB database called "budget_tracker" and set it to version 1
const request = indexedDB.open("budget_tracker", 1);

// event will emit if the database version changes
request.onupgradeneeded = function (target) {
  // save reference to the database
  let db = target.result;
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

request.onerror = function(event) {
  console.log("Uh oh!" + event.target.errorCode);
};

