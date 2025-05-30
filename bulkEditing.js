import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// TODO: import libraries for Cloud Firestore Database
// https://firebase.google.com/docs/firestore
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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

// first check if the book already exists in the local storage (which means that the user hasn't closed the website since last load), it uses local data to display
// if local data not exists (which means the user just opened the website), then the 
export const getEditData = async function(){
    //if change in firebase: 
    localStorage.clear();
    //localStorage.removeItem("results");
    if(localStorage.getItem("book-data") !== null){ 
        var books = JSON.parse(localStorage.getItem("book-data"));
        displayeditpage(books);
        console.log("suc-from-local-storage");
    }else{
        bookDataFirebaseEdit();
    }
}

// runs the function when first open the page: to get the books from firebase
export const bookDataFirebaseEdit = async function(){
    const booksInDatabase = await getDocs(collection(db, "library"));
    var books = [];
    booksInDatabase.forEach((book) => {
        books.push(book.data().title, book.data().author, book.data().summary, book.data().genre, book.data().room, book.data().shelf, book.data().ISBN, book.id);
    })
    localStorage.setItem("book-data", JSON.stringify(books));//send the data to local storage
    //console.log(JSON.parse(localStorage.getItem("book-data")));
    console.log("Store the data locally successful");
    //console.log("refresh");
    displayeditpage(books);
}

let uncheckedCount = 0;

// to display book with a format of a checkbox followed by the book title and author
export function displayeditpage(books) {
    // to make a 'select-all' box at the beginning of the page so its easier to select and unselect all the books
    document.getElementById("bulk-edit-books").innerHTML = "";
    let checkAll = document.createElement("INPUT");
    checkAll.setAttribute("type", "checkbox");
    checkAll.id = "check-all";
    checkAll.className = "bulkEditCheckbox";
    checkAll.checked = true;
    checkAll.addEventListener("click", checkAllStatus);
    let checkAllLabel = document.createElement("label");
    checkAllLabel.htmlFor = "check-all";
    checkAllLabel.appendChild(document.createTextNode("Select All"));
    document.getElementById("bulk-edit-books").appendChild(checkAll);
    document.getElementById("bulk-edit-books").appendChild(checkAllLabel);
    let linebreak = document.createElement("br");
    document.getElementById("bulk-edit-books").appendChild(linebreak);
    var hzRule = document.createElement('hr');// make a hr, as you cannot directly add a <hr> in appendChild
    document.getElementById("bulk-edit-books").appendChild(hzRule);

    uncheckedCount = 0;
    // to have all the books with a checkbox in the front 
    for (let i = 0; i < books.length; i += 8) {
        let checkBox = document.createElement("INPUT");
        let checkName = "check-" + books[i+7];
        let checkContainer = document.createElement("div");
        checkContainer.setAttribute("class", "checkContainer");
        checkBox.setAttribute("type", "checkbox");
        checkBox.id = "check-" + books[i+7];
        checkBox.className = "bulkEditCheckbox";
        checkBox.checked = true;
        let label = document.createElement("label");
        label.textContent = "'" + books[i] + "' by "+books[i+1];
        // to make the div clickable, and when one label unchecks, the 'select-all' label also checks
        checkContainer.addEventListener('click', () => {
            checkBox.checked = !checkBox.checked;
            if(!checkBox.checked){
                uncheckedCount++;
            }else{
                uncheckedCount--;
            }
            //!checkBox.checked
            if(uncheckedCount > 0){
                let checkAll = document.getElementById('check-all');
                checkAll.checked = false;
            }else if(uncheckedCount == 0){
                let checkAll = document.getElementById('check-all');
                checkAll.checked = true;
            }
        });
        label.htmlFor = "checkName";
        //label.appendChild(document.createTextNode("'" + books[i] + "' by "+books[i+1]));
        checkContainer.appendChild(checkBox);
        checkContainer.appendChild(label);
        document.getElementById("bulk-edit-books").appendChild(checkContainer);
    }

    // Select all checkboxes with the name 'genre' using querySelectorAll.
    var checkboxes = document.querySelectorAll("input[type=checkbox][name=genre]");
    let enabledSettings = []

    // narrows down the displayed books when the person is typing in the search box
// goes through all of the books and see if the input matches to the title, description, or author
// if it the input does match to any of those then it adds that book to an array
// that array is then passed through a funciton and then displayed on the html
    document.getElementById("search-content").oninput = () => {
        enabledSettings =
            Array.from(checkboxes) // Convert checkboxes to an array to use filter and map.
                .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                .map(i => i.value.toLowerCase())
        if(document.getElementById("search-content").value == "" && enabledSettings.length == 0){
            displayeditpage(books);
        }else{
            let searchCategory;
        if(document.getElementById("category").value == "Room"){ // use getElementById().value because a it is a dropdown and thus needs a .value to get the value of the dropdown content
            searchCategory = 4;
        }else if(document.getElementById("category").value == "Author"){
            searchCategory = 1;
        }else if (document.getElementById("category").value == "Genre"){
            searchCategory = 3;
        }
        let search = document.getElementById("search-content").value;
        var results = [];
        for (let i = 0; i < books.length; i += 8) {
            try{
                if(enabledSettings.length > 0 && search != ""){
                    //console.log("both exist");
                    if (books[i + searchCategory].toLowerCase().includes(search.toLowerCase()) && enabledSettings.includes(books[i + 3].toLowerCase())) {
                        results.push(books[i], books[i + 1], books[i + 2], books[i + 3], books[i + 4], books[i + 5], books[i + 6], books[i + 7]);
                    }
                }else if(enabledSettings.length > 0 && search == ""){
                    //console.log("only genre");
                    if (enabledSettings.includes(books[i + 3].toLowerCase())) {
                        results.push(books[i], books[i + 1], books[i + 2], books[i + 3], books[i + 4], books[i + 5], books[i + 6], books[i + 7]);
                    }
                }else{
                    if (books[i + searchCategory].toLowerCase().includes(search.toLowerCase())) {
                        results.push(books[i], books[i + 1], books[i + 2], books[i + 3], books[i + 4], books[i + 5], books[i + 6], books[i + 7]);
                    }
                }
            }
            catch(e){// because there could be variables other than books in the firebase
                continue;
            }
        }
    // updates the page to display books that match the search
    updateSearching(results);
        }
    }

    //when the category select tab is changed, also update search
    document.getElementById("category").onchange = () => {
        enabledSettings =
            Array.from(checkboxes) // Convert checkboxes to an array to use filter and map.
                .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                .map(i => i.value.toLowerCase())
        if(document.getElementById("search-content").value == "" && enabledSettings.length == 0){
            displayeditpage(books);
            console.log("1")
        }else{
            let searchCategory;
        if(document.getElementById("category").value == "Room"){ // use getElementById().value because a it is a dropdown and thus needs a .value to get the value of the dropdown content
            searchCategory = 4;
        }else if(document.getElementById("category").value == "Author"){
            searchCategory = 1;
        }else if (document.getElementById("category").value == "Genre"){
            searchCategory = 3;
        }
        let search = document.getElementById("search-content").value;
        var results = [];
        for (let i = 0; i < books.length; i += 8) {
            try{
                if(enabledSettings.length > 0 && search != ""){
                    //console.log("both exist");
                    if (books[i + searchCategory].toLowerCase().includes(search.toLowerCase()) && enabledSettings.includes(books[i + 3].toLowerCase())) {
                        results.push(books[i], books[i + 1], books[i + 2], books[i + 3], books[i + 4], books[i + 5], books[i + 6], books[i + 7]);
                    }
                }else if(enabledSettings.length > 0 && search == ""){
                    //console.log("only genre");
                    if (enabledSettings.includes(books[i + 3].toLowerCase())) {
                        results.push(books[i], books[i + 1], books[i + 2], books[i + 3], books[i + 4], books[i + 5], books[i + 6], books[i + 7]);
                    }
                }else{
                    if (books[i + searchCategory].toLowerCase().includes(search.toLowerCase())) {
                        results.push(books[i], books[i + 1], books[i + 2], books[i + 3], books[i + 4], books[i + 5], books[i + 6], books[i + 7]);
                    }
                }
            }
            catch(e){// because there could be variables other than books in the firebase
                continue;
            }
        }
    // updates the page to display books that match the search
    updateSearching(results);
        }
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
                .map(i => i.value.toLowerCase()) // Use Array.map to extract only the checkbox values from the array of objects.
        let searchCategory;
        if(document.getElementById("category").value == "Room"){ // use getElementById().value because a it is a dropdown and thus needs a .value to get the value of the dropdown content
            searchCategory = 4;
        }else if(document.getElementById("category").value == "Author"){
            searchCategory = 1;
        }else if (document.getElementById("category").value == "Genre"){
            searchCategory = 3;
        }
        let search = document.getElementById("search-content").value;
        var results = [];
        if(enabledSettings.length == 0 && search == ""){
            displayeditpage(books);
        }else{
            for (let i = 0; i < books.length; i += 8) {
            try{
                if(enabledSettings.length > 0 && search != ""){
                    //console.log("both exist");
                    if (books[i + searchCategory].toLowerCase().includes(search.toLowerCase()) && enabledSettings.includes(books[i + 3].toLowerCase())) {
                        results.push(books[i], books[i + 1], books[i + 2], books[i + 3], books[i + 4], books[i + 5], books[i + 6], books[i + 7]);
                    }
                }else if(enabledSettings.length > 0 && search == ""){
                    //console.log("only genre");
                    if (enabledSettings.includes(books[i + 3].toLowerCase())) {
                        results.push(books[i], books[i + 1], books[i + 2], books[i + 3], books[i + 4], books[i + 5], books[i + 6], books[i + 7]);
                    }
                }else{
                    if (books[i + searchCategory].toLowerCase().includes(search.toLowerCase())) {
                        results.push(books[i], books[i + 1], books[i + 2], books[i + 3], books[i + 4], books[i + 5], books[i + 6], books[i + 7]);
                    }
                }
            }
            catch(e){// because there could be variables other than books in the firebase
                continue;
            }
        }
    // updates the page to display books that match the search
    updateSearching(results);
        }
        
                //console.log(enabledSettings)
                //limitGenre(enabledSettings, books)
        })
    });
}

function callUpdateSearch(books){
    
}


// after somemone has searched for a book this will look through the title, or the category that the user chose
// if it finds a match it adds it to a new array that will then display only the items
// in that array on the screen
export function updateSearching(results) {
    localStorage.removeItem("results");
    localStorage.setItem("results", JSON.stringify(results));
    document.getElementById("bulk-edit-books").innerHTML = "";
    let checkAll = document.createElement("INPUT");
    checkAll.setAttribute("type", "checkbox");
    checkAll.id = "check-all";
    checkAll.className = "bulkEditCheckbox";
    checkAll.addEventListener("click", checkAllStatus);
    checkAll.checked = true;
    let checkAllLabel = document.createElement("label");
    checkAllLabel.htmlFor = "check-all";
    checkAllLabel.appendChild(document.createTextNode("Select All"));
    document.getElementById("bulk-edit-books").appendChild(checkAll);
    document.getElementById("bulk-edit-books").appendChild(checkAllLabel);
    let linebreak = document.createElement("br");
    document.getElementById("bulk-edit-books").appendChild(linebreak);
    var hzRule = document.createElement('hr');
    document.getElementById("bulk-edit-books").appendChild(document.createElement('hr'));
    for (let i = 0; i < results.length; i += 8) {
        let checkBox = document.createElement("INPUT");
        // the id of the name is "check-" plus the name of the book
        let checkContainer = document.createElement("div");
        checkContainer.setAttribute("class", "checkContainer");
        let checkName = "check-" + results[i+7];
        checkBox.setAttribute("type", "checkbox");
        checkBox.id = "check-" + results[i+7];
        checkBox.className = "bulkEditCheckbox";
        checkBox.checked = true;
        let label = document.createElement("label");
        uncheckedCount = 0;
        checkContainer.addEventListener('click', () => {
            checkBox.checked = !checkBox.checked;
            if(!checkBox.checked){
                uncheckedCount++;
            }else{
                uncheckedCount--;
            }
            //!checkBox.checked
            if(uncheckedCount > 0){
                let checkAll = document.getElementById('check-all');
                checkAll.checked = false;
            }else if(uncheckedCount == 0){
                let checkAll = document.getElementById('check-all');
                checkAll.checked = true;
            }
        });
        label.htmlFor = "checkName";
        //label.appendChild(document.createTextNode("'" + results[i] + "' by "+results[i+1]));
        label.textContent = "'" + results[i] + "' by "+results[i+1];
        checkContainer.appendChild(checkBox);
        checkContainer.appendChild(label);
        document.getElementById("bulk-edit-books").appendChild(checkContainer);
    }

    document.getElementById("bulk-edit-books").appendChild(hzRule);
    //create the text that says room, genre, etc...
    let selectChangeCategory = document.createElement("select");
    selectChangeCategory.id = "selectChangeCategory";
    let changeCategory;
    selectChangeCategory.addEventListener('change', () => {
        if(document.getElementById("selectChangeCategory").value == "Room"){ // use getElementById().value because a it is a dropdown and thus needs a .value to get the value of the dropdown content
            changeCategory = "room";
        }else if(document.getElementById("selectChangeCategory").value == "Shelf"){
            changeCategory = "shelf";
        }else if (document.getElementById("selectChangeCategory").value == "Genre"){
            changeCategory = "genre";
        }else{
            changeCategory = "none";
            alert("An error happens...");
            location.href = "bulkEditing.html";
        }
    })
    let selectRoom = document.createElement("option");
    selectRoom.value = "Room";
    selectRoom.innerHTML = "Room";
    let selectGenre = document.createElement("option");
    selectGenre.value = "Genre";
    selectGenre.innerHTML = "Genre";
    let selectShelf = document.createElement("option");
    selectShelf.value = "Shelf";
    selectShelf.innerHTML = "Shelf";
    selectChangeCategory.appendChild(selectShelf);
    selectChangeCategory.appendChild(selectRoom);
    selectChangeCategory.appendChild(selectGenre);
    let changeTitle = document.createElement("p");
    changeTitle.textContent = "Change all selected books to the following category and content:";
    //add the change instruction
    document.getElementById("bulk-edit-books").appendChild(changeTitle);
    document.getElementById("bulk-edit-books").appendChild(selectChangeCategory);
    //create the input box
    let changeInput = document.createElement("input");
    changeInput.type = "text";
    changeInput.id = "change-content";
    //create the button to submit
    let submitChange = document.createElement("button");
    submitChange.textContent = "Submit Changes";
    submitChange.className = "check-out-button";
    // to update the information of the books when checked the button, which loops through the entire result book list and check if the checkbox is checked
    submitChange.addEventListener('click', async () => {
        for(let i = 0; i < results.length; i += 8){
            let checkName = "check-" + results[i+7];
            let cur_Ref = doc(db, "library", results[i+7]);
            let changeContent = document.getElementById("change-content").value;
            // if the checkbox is checked, then uupdate the information
            if(document.getElementById(checkName).checked){
                if(changeCategory == 'room'){
                    console.log(changeCategory);
                    await updateDoc(cur_Ref, {
                        room: changeContent
                        });
                }else if(changeCategory == 'shelf'){
                    console.log("shelf");
                    await updateDoc(cur_Ref, {
                        shelf: changeContent
                        });
                }else if(changeCategory == 'genre'){
                    changeContent = changeContent.charAt(0).toUpperCase() + changeContent.slice(1).toLowerCase();
                    await updateDoc(cur_Ref, {
                        genre: changeContent
                        });
                }else{
                    // alert("Bulk Edit FAILS...")
                    console.error("Bulk Edit Failed")
                    location.href = "bulkEditing.html";
                }
            }
        }
        alert("Bulk Edit Successfully...");
        location.href = "bulkEditing.html";
    });
    
    document.getElementById("bulk-edit-books").appendChild(changeInput);
    document.getElementById("bulk-edit-books").appendChild(submitChange);
    document.getElementById("bulk-edit-books").appendChild(document.createElement('br'));
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
    displayeditpage(books);
}

// to make the 'select all' button work
function checkAllStatus(){
    // to have it work on the 'results', if not, then work on all the books
    if(localStorage.getItem("results") !== null){ 
        var books = JSON.parse(localStorage.getItem("results"));
    }else{
        var books = JSON.parse(localStorage.getItem("book-data"));
    }
    if(document.getElementById("check-all").checked){
        for (let i = 0; i < books.length; i += 8) {
            let curName = "check-" + books[i+7];
            let curCheck = document.getElementById(curName);
            curCheck.checked = true;
            uncheckedCount = 0;
        }
    }else{
        for (let i = 0; i < books.length; i += 8) {
            let curName = "check-" + books[i+7];
            let curCheck = document.getElementById(curName);
            curCheck.checked = false;
            uncheckedCount = books.length;
        }
    }
}