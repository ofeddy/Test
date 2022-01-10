document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

    // By default, load the inbox
    load_mailbox('inbox');

    // on click on email submit button
    document.querySelector('input[type="submit"]').addEventListener('click',() => {    
      sendMail();
    });


});

//Composing  emails

function compose_email() {

  // Show compose view and hide other views 
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#readEmail-view').style.display = 'none';



  var recepient = document.querySelector('#compose-recipients').value;
  if (recepient = "")
    console.log("no recepient");
  else
    console.log(recepient); 


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

//Send email on submit

function sendMail() {
  //Get recepient, subject and body info
  var recepient = document.querySelector('#compose-recipients').value; 
  var subject = document.querySelector('#compose-subject').value; 
  var mbody = document.querySelector('#compose-body').value;

  //Post request
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recepient,
      subject: subject,
      body: mbody,
  })
})
  .then(response => response.json())
  .then(result => {
    // Print result
    console.log(result);

   //load sent mailbox
   load_mailbox('sent'); 

    //message notification
    //document.querySelector('#email-message').innerHTML = result;
});
}

//Load mailbox based on name

function fetchContent(mailboxName) {
  // Show the email and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#readEmail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';


  //Fetch emails 
  fetch(`/emails/${mailboxName}`)
  .then(response => response.json())
  .then(emails => {

     //.childNodes, (child)
     emails.forEach(email =>  {
       //console.log(email);

        // Display emails received
        var emailcont = document.createElement('div');
        // css classes for read/unread mails
        if (email.read === false) {
          emailcont.classList.add('email-wrap','d-flex','justify-content-between','unread');
        } else {
          emailcont.classList.add('email-wrap','d-flex','justify-content-between','read');
        }
        
        document.querySelector('#emails-view').append(emailcont);
        //add email id data value property on div 
        emailcont.setAttribute("data-myval", `${email.id}`);

        //add on click attribute on div
        emailcont.setAttribute("onclick", `viewEmail(${email.id})`);

        //Display contents
        var htmltag = '<div id="email-content"></div>';
        emailcont.innerHTML =  htmltag + email.sender +  htmltag  + email.subject + htmltag + email.timestamp + htmltag;
        
     });
     
});
}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#readEmail-view').innerHTML = '';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //load by Mailbox name
  if (mailbox === 'inbox') {
    fetchContent('inbox');
  } else if (mailbox === 'sent') {
    fetchContent('sent');
  } else if (mailbox === 'archive'){
    fetchContent('archive');
  }

}





//View email contents
function viewEmail(id){
  

  // Show the email and hide other views
  document.querySelector('#readEmail-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  //get email id
  var emailId = id;

  //fetch email based on email id
  fetch(`/emails/${emailId}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    //Display email contents and add html tags
    var emaildetail = document.createElement('div');
    document.querySelector('#readEmail-view').append(emaildetail);

    //get mailbox email address
    let mailboxAddress = document.querySelector('h2').innerHTML;

    //Archive/Unarchive button variables
    var archiveBtn = `<button class="btn btn-sm btn-outline-danger" id="archive" onclick="archiveEmail(${email.id})">Archive</button>`;

    var unarchiveBtn = `<button class="btn btn-sm btn-outline-secondary" id="unarchive" onclick="unarchiveEmail(${email.id})">UnArchive</button>`;
    if (email.sender === mailboxAddress){
      archiveBtn = '';
      unarchiveBtn = '';
    } if (email.archived === true){
      unarchiveBtn = `<button class="btn btn-sm btn-outline-secondary" id="unarchive" onclick="unarchiveEmail(${email.id})">UnArchive</button>`;
      archiveBtn = '';
    } else {
      archiveBtn = `<button class="btn btn-sm btn-outline-danger" id="archive" onclick="archiveEmail(${email.id})">Archive</button>`
      unarchiveBtn = '';
    }

    
    //Show sender, recipients, subject, timestamp, and body.

    emaildetail.innerHTML = `<strong>From: </strong> ${email.sender} <br> 
                             <strong>To: </strong> ${email.recipients} <br> 
                             <strong>Subject: </strong> ${email.subject} <br>
                             <strong>Timestamp: </strong> ${email.timestamp} <hr>
                             <strong>Actions: </strong>
                             <button class="btn btn-sm btn-outline-info" id="reply" onclick="replyMail(${email.id})">Reply</button> 
                             ${archiveBtn} 
                             ${unarchiveBtn}
                             <hr> ${email.body}
    `;

    //Mark email as read
    fetch(`/emails/${emailId}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })


});

}

//Archive email
function archiveEmail(id){
  //get email id
  var emailId = id;

  //Mark email as archived
  fetch(`/emails/${emailId}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
      })
    })

     //Load inbox mailbox
     load_mailbox('archive');

    }

  
//UnArchive email
function unarchiveEmail(id){
  //get email id
  var emailId = id;
    
  //Mark email as archived
  fetch(`/emails/${emailId}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
          })
        })
      //Load inbox mailbox
      load_mailbox('inbox');
        }


 //Reply email 
function replyMail(id) {
  var mailid = id;
  //test 
  console.log('reply' + mailid);

 // Show compose view and hide other views 
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#readEmail-view').style.display = 'none';

  //fetch email based on email id
  fetch(`/emails/${mailid}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    //Check if subject line begins with "Re:"
    var subjectLine;
    if(email.subject.startsWith("Re:")){
      subjectLine = email.subject;
    } else{
      subjectLine = "Re: " + email.subject;
    }
    
  //Pre-popupulate recepient, subject and body info
   document.querySelector('#compose-recipients').value = email.sender;
   document.querySelector('#compose-subject').value = subjectLine;
   document.querySelector('#compose-body').innerHTML = "On " + email.timestamp + " " + email.sender + " wrote: " + email.body;

  });

}

