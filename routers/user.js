const express = require('express');
const { appendFile } = require('fs');
const router = express.Router();
const { signUp, logIn, readOne, readAll, logInWithUsername, logInWithEmail } = require('../controllers/user')

router.post('/signup', signUp)
router.get('/data/:id', readOne)
router.post('/loginwithusername', logInWithUsername)
router.post('/loginwithemail', logInWithEmail)

router.get('/data', readAll)

module.exports = router