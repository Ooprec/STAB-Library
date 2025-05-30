import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// TODO: import libraries for Cloud Firestore Database
// https://firebase.google.com/docs/firestore
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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

// autofill the title, author, copies left, and allows the user to input email address to check out
export const autoFill = async function(){
    if (typeof localStorage.getItem("checkOutBook") !== null) {//item in the localStorage is the ID of the element in the firebase, and get data of the book based on the ID
        var cur_ID = localStorage.getItem("checkOutBook");

        if(localStorage.getItem("book-data") !== null){ // get book data from local
            var books = JSON.parse(localStorage.getItem("book-data"));
            console.log("suc-from-local-storage");
        }

        const cur_Ref = doc(db, "library", cur_ID);; // get data from firebase
        const cur_bookSnap = await getDoc(cur_Ref);

        var cur_TITLE = cur_bookSnap.data().title;// get title and author from firebase
        var cur_AUTHOR = cur_bookSnap.data().author;
        document.getElementById("check-out-form-book-title").innerHTML = "Title:  " + cur_TITLE; //display author and title
        document.getElementById("cur_Author").innerHTML = "Author:  " + cur_AUTHOR;
        var copies_left = cur_bookSnap.data().total_copies - cur_bookSnap.data().books_checked; // display current copies left
        document.getElementById("cur_Copies").innerHTML = "Copies Left:  " + copies_left;
    }
    document.getElementById("check-out-book-button").addEventListener("click", ()=> {
        submitForm(cur_ID, copies_left);
    })
}

export const submitForm = async function (ID, copies_left){
    try{
        // email verification that checks if the user enters a valid STAB email
        if(!document.getElementById("check-out-form-name-book").value.includes("stab.org")){
            alert("Please type in a valid STAB email address...");
            location.href = "checkOut.html";
        }
        const booksInDatabase = await getDocs(collection(db, "library"));
        //booksInDatabase.forEach((book) => {
            //if(book.data().ISBN == ISBN){
                const cur_Ref = doc(db, "library", ID); //get data of the current book from firebase
                const cur_bookSnap = await getDoc(cur_Ref);
                var booksChecked = cur_bookSnap.data().books_checked;
                booksChecked += 1; // add 1 to the number of copies that are checked out
                var checkedOutEmail = cur_bookSnap.data().school_email; // to get "copy on shelf", "check out email list"...of that doc and update them in the upDateDoc
                if(copies_left == 0){ 
                    alert("There is no copy left...Sorry...Return to the book page..."); // if there's no copy left, than it's not possible to check out
                    location.href = "books.html";
                }else{   
                    let cur_student_email = document.getElementById("check-out-form-name-book").value;
                    checkedOutEmail.push(cur_student_email); // add the new student email to the email list
                }
                
                // need to use a documentReference type instead of a documentSnapshot
                // update data to the firebase
                await updateDoc(cur_Ref, {
                    books_checked: booksChecked,
                    school_email: checkedOutEmail
                });
                document.getElementById("check-out-book-button").value = "";
                alert("Book successfully checked out! Return to the book page...");
                location.href = "books.html";
            //}
            
        //})
    }
    catch(e){
        alert("Failed to check out due to upload error. Please contact Mr. Taylor...Return to the book page...");
        location.href = "books.html";
    }
}
