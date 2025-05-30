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

export const autoFill = async function(){
    //document.getElementById("return-body").style.transform = "translateY(-10px)";
    if (typeof localStorage.getItem("editID") !== null) {
        var cur_ID = localStorage.getItem("editID");

        if(localStorage.getItem("book-data") !== null){ 
            var books = JSON.parse(localStorage.getItem("book-data"));
            console.log("suc-from-local-storage");
        }
        for(let i = 0; i < books.length; i += 8){
            if(books[i + 7] == cur_ID){
                var cur_TITLE = books[i];
                var cur_AUTHOR = books[i + 1];
            }
        }
        const cur_Ref = doc(db, "library", cur_ID);; //doc(db, "library", "book");
        const cur_bookSnap = await getDoc(cur_Ref);
        // display default value
        document.getElementById("return-form-book-title").innerHTML = "Book Title:  " + cur_TITLE;
        document.getElementById("cur_Author").innerHTML = "Author:  " + cur_AUTHOR;
        document.getElementById("cur-genre-display").innerHTML = "Change Genre  (current: " + cur_bookSnap.data().genre+ ") :"
        document.getElementById("cur-room-display").innerHTML = "Change Room  (current: " + cur_bookSnap.data().room+ ") :";
        document.getElementById("cur-shelf-display").innerHTML = "Change Shelf  (current: " + cur_bookSnap.data().shelf+ ") :";
        document.getElementById("cur-copy-display").innerHTML = "Change Total Copies  (current: " + cur_bookSnap.data().total_copies+ ") :";
        document.getElementById("return-form-name-label").innerHTML = "Delete Student Email With Copy (Currently "+ cur_bookSnap.data().books_checked+ " copy has been checked out";
        document.getElementById("add-student-display").innerHTML = "Add Another Student Email Who Checked Out Book Manually (Optional)";
        // to replace the innerHTML
        var input_description = document.getElementById("new-description");
        input_description.innerHTML = cur_bookSnap.data().summary;
        var input_room = document.getElementById("new-room");
        input_room.value = cur_bookSnap.data().room;
        var input_shelf = document.getElementById("new-shelf");
        input_shelf.value = cur_bookSnap.data().shelf;
        var input_shelf = document.getElementById("new-copy");
        input_shelf.value = cur_bookSnap.data().total_copies;
        // add dropdown options for student emails
        for(let i = 0; i < cur_bookSnap.data().school_email.length; i++){
            var student_dropdown = document.getElementById("student-with-copy");
            var option = document.createElement("option");
            option.text = cur_bookSnap.data().school_email[i];
            option.value = i; // add value as the position in the list, so you can delete that particular position
            student_dropdown.add(option); // add a dropdown of the student email
        }
    }
    document.getElementById("update-book-button").addEventListener("click", ()=> {
        submitForm(cur_ID);
    })
}

export const submitForm = async function (ID){
    try{
        const booksInDatabase = await getDocs(collection(db, "library"));
        //booksInDatabase.forEach((book) => {
            //if(book.data().ISBN == ISBN){
                const cur_Ref = doc(db, "library", ID);; //doc(db, "library", "book");
                const cur_bookSnap = await getDoc(cur_Ref);
                // to get "copy on shelf", "check out email list"...of that doc and update them in the upDateDoc
                let changed_description = document.getElementById("new-description").value;
                let changed_room = document.getElementById("new-room").value;
                let changed_genre = document.getElementById("new-genre").value;
                if(changed_genre == 'no-change'){
                    changed_genre = cur_bookSnap.data().genre;
                }
                let changed_copies_checked = cur_bookSnap.data().books_checked;
                let changed_shelf = document.getElementById("new-shelf").value;
                let changed_total_copies = document.getElementById("new-copy").value;
                let deleted_student = document.getElementById("student-with-copy").value;
                let student_list = cur_bookSnap.data().school_email;
                if(deleted_student != "no-change"){
                    var deleted_student_email = student_list[deleted_student];
                    student_list.splice(deleted_student, 1); //use splice to delete the student selected(ref to line 56)
                    changed_copies_checked -= 1;
                }
                let new_student = document.getElementById("new-student").value;
                if(new_student != ""){
                    changed_copies_checked += 1;
                    student_list.push(new_student);
                }
                
                // make the pop-up page display (no description right now)
                let is_changed = false;
                document.querySelector('.bg-pop-up').style.display = 'flex';
                document.querySelector('.close-edit-button').addEventListener('click', function(){
                    document.querySelector('.bg-pop-up').style.display = 'none';
                    document.getElementById("confirm-description").innerHTML = "";
                    document.getElementById("confirm-genre").innerHTML = "";
                    document.getElementById("confirm-room").innerHTML = "";
                    document.getElementById("confirm-shelf").innerHTML = "";
                    document.getElementById("confirm-copy").innerHTML = "";
                    document.getElementById("confirm-student-deleted").innerHTML = "";
                    document.getElementById("confirm-student-added").innerHTML = "";
                    document.getElementById("no-change").innerHTML = "";
                })
                document.getElementById("edit-page-title").innerHTML = "Title: " + cur_bookSnap.data().title;
                document.getElementById("edit-page-author").innerHTML = "Author: " + cur_bookSnap.data().author;
                if(cur_bookSnap.data().summary != changed_description){
                    
                    let oldText = "",     
                    text = '';
                    changed_description.split('').forEach(function(val, i){
                    if (val != cur_bookSnap.data().summary.charAt(i))
                        text += "<span class='edit-highlight'>"+val+"</span>";  
                    else
                        text += val;            
                    });
                    document.getElementById("confirm-genre").innerHTML = "Old Summary: " + cur_bookSnap.data().summary + "<br /> <br />" + "New Summary: " + text;
                    is_changed = true;
                }
                if(cur_bookSnap.data().genre != changed_genre){
                    document.getElementById("confirm-genre").innerHTML = "Genre: " + cur_bookSnap.data().genre + "  ->  " + changed_genre;
                    is_changed = true;
                }
                if(cur_bookSnap.data().room != changed_room){
                    document.getElementById("confirm-room").innerHTML = "Room: " + cur_bookSnap.data().room + "  ->  " + changed_room;
                    is_changed = true;
                }
                if(cur_bookSnap.data().shelf != changed_shelf){
                    document.getElementById("confirm-shelf").innerHTML = "Shelf: " + cur_bookSnap.data().shelf + "  ->  " + changed_shelf;
                    is_changed = true;
                }
                if(cur_bookSnap.data().total_copies != changed_total_copies){
                    document.getElementById("confirm-copy").innerHTML = "Total Copies: " + cur_bookSnap.data().total_copies + "  ->  " + changed_total_copies;
                    is_changed = true;
                }
                if(deleted_student != "no-change"){
                    document.getElementById("confirm-student-deleted").innerHTML = "Student Deleted: " + deleted_student_email;
                    is_changed = true;
                }
                if(new_student != ""){
                    document.getElementById("confirm-student-added").innerHTML = "Student Added: " + new_student;
                    is_changed = true;
                }
                if(!is_changed){
                    document.getElementById("no-change").innerHTML = "No Change";
                }
                //console.log(booksChecked);
                //console.log(checkedOutEmail);
                //console.log(ID);
                // need to use a documentReference type instead of a documentSnapshot
                document.querySelector('.confirm-edit-button').addEventListener('click', async function(){
                    await updateDoc(cur_Ref, {
                        summary: changed_description,
                        genre: changed_genre,
                        room: changed_room,
                        shelf: changed_shelf,
                        total_copies: changed_total_copies,
                        books_checked: changed_copies_checked,
                        school_email: student_list
                    });
                    document.getElementById("update-book-button").value = "";
                    alert("Book successfully updated! Return to the book page...");
                    location.href = "admin.html";
                })
            //}
            
        //})
    }
    catch(e){
        alert("Failed to update the book, please contact a technician...Return to the book page...");
        location.href = "admin.html";
    }
}
