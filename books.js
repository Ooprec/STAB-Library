import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// TODO: import libraries for Cloud Firestore Database
// https://firebase.google.com/docs/firestore
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDBt6FCO7JIgv1DE5vEQTVUtIGeh_JFIrs",
    authDomain: "library-18c5c.firebaseapp.com",
    projectId: "library-18c5c",
    storageBucket: "library-18c5c.appspot.com",
    messagingSenderId: "910458485614",
    appId: "1:910458485614:web:16261dc0da1ff750a99f7f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
//this takes a file and uploads it to the database
//to run you need to make an upload file html input with
//id called URL

//runs the code once and don't call it again until you want to make some changes to the data already in the firebase 
export async function importToDatabase () {
  const booksInDatabase = await getDocs(collection(db, "library"));

    booksInDatabase.forEach((book) =>{
        deleteDoc(doc(db, "library", book.id)); //deleteDoc basically deletes everything in the firebase before uploading again
    }
    )
  // try{
   var file = document.getElementById("bookcsv").files[0];
   if (!file.files || file.files.length === 0) {
    alert('Please select a CSV file.');
    return;
  }
        var reader = new FileReader();
        reader.onload = function(event) {
          var csvData = event.target.result;
          var rows = csvData.split("\n");
          for (var i = 0; i < rows.length; i++) {
            var cells = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // split is just to include comma in the string without messing up the formatting, look at https://stackoverflow.com/questions/11456850/split-a-string-by-commas-but-ignore-commas-within-double-quotes-using-javascript
            console.log(cells);
            try {
                //console.log(cells[0]);
              const docRef = addDoc(collection(db, "library"), {
                title: cells[0], 
                subtitle: cells[2],
                author: cells[5],
                author_last_first: cells[6],
                translator: cells[9],
                publisher: cells[12],
                year_published: cells[15],
                genre: cells[19],
                summary: cells[20],
                number_of_page: cells[31],
                language: cells[37],
                ISBN: cells[43],
                building: "unknown",
                room: "unknown",
                shelf: "unknown",
                books_checked: 0,
                total_copies: parseInt(cells[16]),
                school_email: [],
                // need a list for each copies?
              });
              console.log("Document written with ID: ", docRef.id);
            } 
            catch (e) {
              console.error("Error adding to database: ", e);
            }
            
          }
        };
        reader.readAsText(file);

  document.getElementsByTagName("body").style.cursor = "auto";
}

// first check if the book already exists in the local storage (which means that the user hasn't closed the website since last load), it uses local data to display
// if local data not exists (which means the user just opened the website), then the 
// !!!!!!!!!!!!!!!do i need to clear localstorage using localStorage.clear() after a change in firebase??????????
export const getBookData = async function(){ 
    //if change in firebase: 
    //localStorage.clear();
    if(localStorage.getItem("book-data") !== null){ 
        var books = JSON.parse(localStorage.getItem("book-data"));
        display(books);
        console.log("suc-from-local-storage");
    }else{
        bookDataFirebase();
    }
}

// runs the function when first open the page: to get the books from firebase
export const bookDataFirebase = async function(){
    const booksInDatabase = await getDocs(collection(db, "library"));
    var books = [];
    booksInDatabase.forEach((book) => {
        books.push(book.data().title, book.data().author, book.data().summary, book.data().genre, book.data().room, book.data().shelf, book.data().ISBN, book.id);
    })
    localStorage.setItem("book-data", JSON.stringify(books));//send the data to local storage
    //console.log(JSON.parse(localStorage.getItem("book-data")));
    console.log("Store the data locally successful");
    //console.log("refresh");
    display(books);
}

//make button for the check out books, and set the value of the button to the id 
function makeButton(bookID) {
    const button = document.createElement('button');
    button.textContent = "Check out"; 
    button.addEventListener("click", showCheckOut); //call the function "showCheckOut" when click
    button.classList.add("check-out-button"); //add class for css use
    button.value = bookID;
    //return button =  `<button onclick="showCheckOut()" class="check-out-button" value='` + title + `'>` + "Check Out" + `</button>`
    return button;
}
// when checking out a book it no longer shows the books and shows the checkout page
function showCheckOut () { 
    document.getElementById("book-all").style.display = "none"
    document.getElementById("check-out-all").style.display = "grid"
}

// allows us to add an event listener to elements added to the DOM
// and pass the value of the button to the checkOut page; the value of the button is set in makeButton function
// in this case, pass the ID of the firebase document into the check_out page, so i can access the firebase data
$('body').on('click', '.check-out-button', function() {
    let fired_button = $(this).val();
    localStorage.setItem("checkOutBook", fired_button);  
    location.href = "checkOut.html"
});

// Select all checkboxes with the name 'genre' using querySelectorAll.
var checkboxes = document.querySelectorAll("input[type=checkbox][name=genre]");
let enabledSettings = []

export function display(books) {
    
    // displays the books, (but why it's slow though, probably need to fix that later?)
    document.getElementById("div-books").innerHTML = "";
    for (let i = 0; i < books.length; i += 8) {
        if (i < books.length - 8) {
            document.getElementById("div-books").innerHTML = document.getElementById("div-books").innerHTML + "<h3>" + books[i] + "</h3><p>" + books[i+1] + "</p><p>" + books[i+2] + "</p>" + "<p>Check Out Copy In Room: " + books[i+4] + "<br>On Shelf: " + books[i+5] + "</p></br>"; //make button here corresponds to the page of checkout book?
            document.getElementById("div-books").appendChild(makeButton(books[i + 7]));//pass on the book title to the makeButton function
            var hzRule = document.createElement('hr');// make a hr, as you cannot directly add a <hr> in appendChild
            document.getElementById("div-books").appendChild(hzRule);
            //console.log(books[i]);
            //console.log(books[i+5]);
        } else {
            document.getElementById("div-books").innerHTML = document.getElementById("div-books").innerHTML + "<h3>" + books[i] + "</h3><p>" + books[i+1] + "</p><p>" + books[i+2] + "</p>" + "<p>Check Out Copy In Room: " + books[i+4] + "<br>On Shelf: " + books[i+5] + "</p></br>";
            document.getElementById("div-books").appendChild(makeButton(books[i + 7]));
        }
    }

    // narrows down the displayed books when the person is typing in the search box
// goes through all of the books and see if the input matches to the title, description, or author
// if it the input does match to any of those then it adds that book to an array
// that array is then passed through a funciton and then displayed on the html
    document.getElementById("searching-for-books").oninput = () => {
        let search = document.getElementById("searching-for-books").value;
        var results = [];
        for (let i = 0; i < books.length; i += 8) {
            try{
                if (books[i].toLowerCase().includes(search.toLowerCase()) || books[i + 1].toLowerCase().includes(search.toLowerCase()) || books[i + 2].toLowerCase().includes(search.toLowerCase())) {
                    results.push(books[i], books[i + 1], books[i + 2], books[i + 3], books[i + 4], books[i + 5], books[i + 6], books[i + 7]);
                }
            }
            catch(e){// because there could be variables other than books in the firebase
                continue;
            }
        }
    // updates the page to display books that match the search
    updateSearching(results);
    }

/*
For IE11 support, replace arrow functions with normal functions and
use a polyfill for Array.forEach:
https://vanillajstoolkit.com/polyfills/arrayforeach/
*/

// Use Array.forEach to add an event listener to each checkbox.
    checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
            enabledSettings =
                Array.from(checkboxes) // Convert checkboxes to an array to use filter and map.
                    .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                    .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                //console.log(enabledSettings)
                limitGenre(enabledSettings, books)
        })
    });
}



// after somemone has searched for a book this will look through the title author and description
// if it finds a match it adds it to a new array that will then display only the items
// in that array on the screen
export function updateSearching(results) {
    document.getElementById("div-books").innerHTML = "";
    for (let i = 0; i < results.length; i += 8) {
        if (i < results.length - 8) {
            document.getElementById("div-books").innerHTML = document.getElementById("div-books").innerHTML + "<h3>" + results[i] + "</h3><p>" + results[i + 1] + "</p><p>" + results[i + 2] + "<br><br> Check Out Copy In Room: " + results[i + 4] + "<br>On Self: "+ results[i + 5] + "</p><br>";
            document.getElementById("div-books").appendChild(makeButton(results[i + 7]));
            var hzRule = document.createElement('hr');// make a hr, as you cannot directly add a <hr> in appendChild
            document.getElementById("div-books").appendChild(hzRule);
        } else {
            document.getElementById("div-books").innerHTML = document.getElementById("div-books").innerHTML + "<h3>" + results[i] + "</h3><p>" + results[i + 1] + "</p><p>" + results[i + 2]  + "<br><br> Check Out Copy in Room: " + results[i + 4] + "<br>On Self: "+ results[i + 5] + "</p><br>";
            document.getElementById("div-books").appendChild(makeButton(results[i + 7]));
        }
    }
    document.getElementById("div-books").scrollTop = 0;
}



// takes the array from when a check box is clicked on and if the array isn't empty
// then it adds all books that match any of the items in the genre array to a new array
// then the books in the new array are displayed on the page
// if the enabledSettings array is empty then all the books are displayed because no checkboxes are checked
export function limitGenre(enabledSettings, books) {
    var arr = []
    if (enabledSettings.length > 0) {
        for (let i = 0; i < books.length; i += 8) {
            if (enabledSettings.includes(books[i + 3])) {
                //console.log(1)
                arr.push(books[i], books[i + 1], books[i + 2], books[i + 3], books[i + 4], books[i + 5], books[i + 6], books[i + 7]);
                //console.log(arr)
            }
        }
        updateSearching(arr)
        return;
    }
    display(books)
}
