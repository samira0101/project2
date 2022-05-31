// Dependencies
// Express.js connection
const router = require('express').Router();
// User, Post, Vote models
const { User, Post, Comment } = require('../../models');
// Express Session for the session data
const session = require('express-session');
// Authorization Helper
const withAuth = require('../../utils/auth');
// Sequelize store to save the session so the user can remain logged in
const SequelizeStore = require('connect-session-sequelize')(session.Store);

// Routes

// GET /api/users -- get all users
router.get('/', (req, res) => {
    // Access the User model and run .findAll() method to get all users
    User.findAll({
        // When sending the data back, omit off the password property.
        attributes: { exclude: ['password'] }
    })
      // return the data as JSON formatted
      .then(dbUserData => res.json(dbUserData))
      // if server error, return that error
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  });

// GET /api/users/1 -- get a single user by id
router.get('/:id', (req, res) => {
    // To acquire a single user depending on parameters, access the User model and use the findOne() function.
    User.findOne({
      // when the data is sent back, exclude the password property
      attributes: { exclude: ['password'] },
      where: {
        // use id as the parameter for the request
        id: req.params.id
      },
      // include the user's own posts, as well as the posts on which he/she has commented and uploaded.
      include: [
        {
          model: Post,
          attributes: ['id', 'title', 'post_text', 'created_at']
        },
        {
            model: Comment,
            attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
            include: {
                model: Post,
                attributes: ['title']
            }
        }
      ]
    })
      .then(dbUserData => {
        if (!dbUserData) {
          // if no user is found, return an error
          res.status(404).json({ message: 'There are no users with this id found.' });
          return;
        }
        // otherwise, return the data for the requested user
        res.json(dbUserData);
      })
      .catch(err => {
        // if there is a server error, return that error
        console.log(err);
        res.status(500).json(err);
      });
  });

// POST /api/users -- add a new user
router.post('/', (req, res) => {
  // creating method
  
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  })
    // Return the user data to the client as confirmation, then save the session.
    .then(dbUserData => {
      req.session.save(() => {
        req.session.user_id = dbUserData.id;
        req.session.username = dbUserData.username;
        req.session.loggedIn = true;
    
        res.json(dbUserData);
      });
    })
    // if server error, return that error
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// POST /api/users/login -- login route for a user
router.post('/login',  (req, res) => {
    // findOne method by email to search the database for an existing user with the email address entered
    
    User.findOne({
        where: {
        email: req.body.email
        }
    }).then(dbUserData => {
        // if the email is not found, return an error
        if (!dbUserData) {
        res.status(400).json({ message: 'There are no users with this email found!' });
        return;
        }
        // Otherwise, verify the user.
        // Invoke the instance method specified in the User model.
        const validPassword = dbUserData.checkPassword(req.body.password);
        // Return an error if the password is invalid (method returns false).
        if (!validPassword) {
            res.status(400).json({ message: 'Incorrect password!' });
            return;
        }
        // Save the session and return the user object with a success message if not.
        req.session.save(() => {
          // declare session variables
          req.session.user_id = dbUserData.id;
          req.session.username = dbUserData.username;
          req.session.loggedIn = true;
    
          res.json({ user: dbUserData, message: 'You are now logged in!' });
        });
    });  
});

// POST /api/users/logout -- log out an existing user
router.post('/logout', withAuth, (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      // The 204 status indicates that a request was successful, but the client does not need to navigate to another page.
        // (200 indicates success and that a newly updated page should be loaded, 201 is for a resource being created)
      res.status(204).end();
    });
  } else {
    // if there is no session, then the logout request will send back a no resource found status
    res.status(404).end();
  }
})

// PUT /api/users/1 -- update an existing user
router.put('/:id', withAuth, (req, res) => {
    // update method
  
  
    // allowing for updating only key/value pairs that are passed through
    User.update(req.body, {
        // since there is a hook to hash only the password, the option is noted here
        individualHooks: true,
        // use the id as the parameter for the individual user to be updated
        where: {
            id: req.params.id
        }
    })
      .then(dbUserData => {
        if (!dbUserData[0]) {
          res.status(404).json({ message: 'There are no users with this id found.' });
          return;
        }
        res.json(dbUserData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  })

// DELETE /api/users/1 -- delete an existing user
router.delete('/:id', withAuth, (req, res) => {
    // destroy method
    User.destroy({
      where: {
        id: req.params.id
      }
    })
      .then(dbUserData => {
        if (!dbUserData) {
          res.status(404).json({ message: 'There are no users with this id found.' });
          return;
        }
        res.json(dbUserData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  });

module.exports = router;