// Sign up form handler
async function signupFormHandler(event) {
    event.preventDefault();

    // get the information from the sign up form
    const username = document.querySelector('#username-signup').value.trim();
    const email = document.querySelector('#email-signup').value.trim();
    const password = document.querySelector('#password-signup').value.trim();

    
    if (username && email && password) {
         // POST the new user to the user table in the database
        const response = await fetch('/api/users', {
            method: 'post',
            body: JSON.stringify({
                username,
                email,
                password
            }),
            headers: {'Content-Type': 'application/json'}
        });
        if (response.ok) {
            alert('Account created! Logging you in now.');
            document.location.replace('/dashboard');
        } else {
            alert(response.statusText)
        }
    }
}

document.querySelector('.signup-form').addEventListener('submit', signupFormHandler);