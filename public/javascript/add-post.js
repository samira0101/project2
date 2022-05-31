// New Post Form Handler
async function newFormHandler(event) {
    event.preventDefault();

    // Get the post title and post text from the form
    const title = document.querySelector('input[name="post-title"]').value;
    const post_text = document.querySelector('textarea[name="post-text"]').value;

    // To add a new post, use the create a new post POST route. The post user id is taken from the route's session information.
    const response = await fetch(`/api/posts`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        post_text
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // If the response is satisfactory, reload the page, which will now display the most recent post in the user's post list.
    if (response.ok) {
      document.location.replace('/dashboard');
      // or else, display the error
    } else {
      alert(response.statusText);
    }
  }
  
  //The new post submit button has an event listener.
  document.querySelector('.new-post-form').addEventListener('submit', newFormHandler);