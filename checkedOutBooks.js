// This js will be for CHECKEDOUTBOOKS.HTml
//make it so when we enter an email it will show the books with your email and marked as Checked-Out
//if there are no books with your email, then it will return "your email is not associated with any books"
//if your email is only associated with returned books then it will show the books and say it is returned
//if your have a book checkedout under your email then it will show the book
//next to the checkout book there will be a "return" button and maybe other buttons

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

//or book.data().school_email.includes(school)

export const showCheckedOut = async function(books){
  let books_display = document.getElementById("checked-books-display");
  books_display.innerHTML = "";
  const booksInDatabase = await getDocs(collection(db, "library"));
    booksInDatabase.forEach((book) => {
      try{
          let cur_email_list = book.data().school_email;
          let email_searched = document.getElementById("email-searched").value;
        for(let i = 0; i < cur_email_list.length; i++){
          if(cur_email_list[i].includes(email_searched)){
            document.getElementById("checked-books-display").style.transform = "translateY(100px)";
            document.getElementById("search-for-checked-out-books").style.transform = "translateY(-100px)";
            document.getElementById("search-for-checked-out-books-search").style.transform = "translateY(-78px)";
            document.getElementById("enter-email").style.transform = "translateY(-18px)";
            document.getElementById("checked-books-display-for-search").style.display = 'block';
            document.getElementById("checked-books-display-for-search").style.transform = "translateY(-358px)";
            let add_book = document.createElement("p");
            let cur_email = cur_email_list[i];
            let button = document.createElement('button');
            button.textContent = "Return Book"; 
            button.onclick = async function(){
              cur_email_list.splice(i, 1);
              const cur_Ref = doc(db, "library", book.id); //doc(db, "library", "book");
              let new_checked_out_number = book.data().books_checked -= 1;
              try{
                await updateDoc(cur_Ref, {
                  books_checked: new_checked_out_number,
                  school_email: cur_email_list
                  });
                alert("Book '" + book.data().title + "' successfully returned for '" + cur_email + "'.");
                location.reload();
              }
              catch(e){
                alert("Failed to return due to technical issue...please contact Mr. Taylor...");
              }
            }
            button.classList.add("return-button"); //add class for css use
            //button.value = bookID;
            add_book.innerHTML = "Book Title: " + book.data().title + "  <br />Author: " + book.data().author + "<br /> Checked out by: " + cur_email + "<br />"; //also need 'checkout out by which student'
            add_book.appendChild(button);
            let hzRule = document.createElement('hr');// make a hr, as you cannot directly add a <hr> in appendChild
            add_book.appendChild(hzRule);
            //add style to the words
            books_display.appendChild(add_book);
          }
        }
        }
        catch(e){

        }
    })
}
    

//what iM THINKING OF DOING IS MAKING A FOR LOOP THEN DOING arr[i].includes(SCHOOL EMAil)
  //when email entered and the books checkut shows, it will show the Title and the Author
  //on the backend, however, it will also have the books ISBN
  //the reason is because we want to make it so when the return button is pressed..
  //we get the data from the firebase and search it for the book using the associated ISBN
  //once the books code is found, we write the code so that it changes the email associated with that book
  
  //how will we be able to check to see if the book has succesfully being returned
  //i dont want to grab the firebase data once more to confirm that it worked because I feel like it would lag the site

