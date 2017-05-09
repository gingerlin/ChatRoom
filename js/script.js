$(document).ready(function(){
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyBwwAH7l6CewtYYPO-6cDFjj_SN7AerV9k",
    authDomain: "chat-df70a.firebaseapp.com",
    databaseURL: "https://chat-df70a.firebaseio.com",
    projectId: "chat-df70a",
    storageBucket: "chat-df70a.appspot.com",
    messagingSenderId: "507766177156"
  };
  firebase.initializeApp(config);

  var dbRef = firebase.database().ref();
  var storageRef = firebase.storage().ref();

  // REGISTER DOM ELEMENTS
  const $messageField = $('#messageInput');
  const $nameField = $('#nameInput');
  const $messageList = $('#example-messages');
  const $email = $('#email');
  const $password = $('#password');
  const $userPhoto = $('#userPhoto');

  const $btnSignIn = $('#btnSignIn');
  const $btnSignUp = $("#btnSignUp");
  const $btnSignOut = $('#btnSignOut');
  const $btnSubmit = $("#btnSubmit");
  const $message = $('#example-messages');
  const $signInfo = $('#sign-info');
  const $file = $('#file');

  const $username = $('#username');
  const $displayName = $('#displayName');

  var user = firebase.auth().currentUser;


  function findData(currentUser){
    var dbUserInfo = firebase.database().ref('user/' + currentUser.uid);

    dbUserInfo.on("value", function(snapshot){
      var username = snapshot.val().username;
      var occupation = snapshot.val().occupation;
      var age = snapshot.val().age;
      var description = snapshot.val().description;

      $profileName.html(username);
      $profileEmail.html(currentUser.email);
      $profileOccupation.html(occupation);
      $profileAge.html(age);
      $profileDescription.html(description);

    });
  }

  function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var file = evt.target.files[0];

    var metadata = {
      'contentType': file.type
    };

    storageRef.child('images/' + file.name).put(file, metadata).then(function(snapshot) {
      console.log('Uploaded', snapshot.totalBytes, 'bytes.');
      console.log(snapshot.metadata);
      photoURL = snapshot.metadata.downloadURLs[0];
      console.log('File available at', photoURL);

      var user = firebase.auth().currentUser;
      const dbUserid = dbRef.child(user.uid);
      dbUserid.update({
        'imageUrl': photoURL
      });

      const promise = user.updateProfile({
        photoURL: photoURL
      })

      $userPhoto.attr('src', user.imageUrl);

    }).catch(function(error) {
      console.error('Upload failed:', error);
    });
  }

  $file.change(handleFileSelect);

  // SignIn
  $btnSignIn.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signIn
    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
  });

  // SignUp
  $btnSignUp.click(function(e){
    console.log('click')
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    const promise = auth.createUserWithEmailAndPassword(email,pass);

    promise.catch(function(e){
      console.log(e.message);
    })
    promise.then(function(user){
      const dbUserid = dbRef.child(user.uid);
      dbUserid.update({email:user.email});
    });
  })

  $btnSubmit.click(function() {
      var user = firebase.auth().currentUser;

      const promise = user.updateProfile({
        displayName: $username.val()
      })

      promise.then(function() {
        console.log("Update successful");
        user = firebase.auth().currentUser;
        if (user) {
          $displayName.html(user.displayName);
          $userPhoto.attr("src", user.photoURL);
        }
      })
  })



  // Listening Login User
  firebase.auth().onAuthStateChanged(function(user){

      console.log('SignIn '+user.email);
      $signInfo.html(user.email+" is login...");
      $btnSignIn.attr('disabled', 'disabled');
      $btnSignOut.removeAttr('disabled')


      $displayName.html(user.displayName);
      $userPhoto.attr('src', user.imageUrl);

      if (user) {
        findData(user);
        // Add a callback that is triggered for each chat message.
        dbRef.limitToLast(10).on('child_added', function (snapshot) {
        //GET DATA
        var data = snapshot.val();
        var username = data.user;
        var message = data.text;

        var imgUrl = data.imageUrl;
        console.log(imgUrl);

        //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
        findData(user);


        var $messageElement = $("<li>");
        var $image = $("<img>");
        $image.attr("src", imgUrl);
        $messageElement.text(message).prepend(username + ":  ");
        $messageElement.prepend($image);

        //ADD MESSAGE
        //if(username !== 'anonymous'){
          $messageList.append($messageElement);

        //SCROLL TO BOTTOM OF MESSAGE LIST
        $messageList[0].scrollTop = $messageList[0].scrollHeight;
      });
    } else {
      console.log("not logged in");
    }
  });


  // SignOut
  $btnSignOut.click(function(){
    firebase.auth().signOut();
    console.log('LogOut');
    $signInfo.html('No one login...');
    $btnSignOut.attr('disabled', 'disabled');
    $btnSignIn.removeAttr('disabled')
    $message.html('');
  });

  // LISTEN FOR KEYPRESS EVENT
  $messageField.keypress(function (e) {
    if (e.keyCode == 13) {
      var username = $username.val();
      var message = $messageField.val();

      dbRef.push({user:username, text:message});
      $messageField.val('');
    }
  });

});
