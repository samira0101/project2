// Login form handler
async function loginFormHandler(event) {
    event.preventDefault();

    // Collect values from the login form
    const email = document.querySelector('#email-login').value.trim();
    const password = document.querySelector('#password-login').value.trim();

    if (email && password) {
        // Send a POST request to the API endpoint
        const response = await fetch('/api/users/login', {
            method: 'post',
            body: JSON.stringify({
                email,
                password
            }),
            headers: {'Content-Type': 'application/json'}
        });
        // If successful, redirect the browser to the profile page
        if (response.ok) {
            document.location.replace('/dashboard');
        } else {
            let result = await response.json()
            alert(result.message)
        }
    }
}

document.querySelector('.login-form').addEventListener('submit', loginFormHandler);