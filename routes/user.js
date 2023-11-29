const express = require('express');
const router = express.Router();
const controllers = require('../controllers/user');

//private routes

router.get("/info", controllers.middlewareAuth, controllers.getUser)

//public routes

router.get('/', controllers.startApi)
router.post('/auth/signup', controllers.createNewUser)
router.post('/auth/signin', controllers.loginUser)
router.all('*', controllers.notFound)

module.exports = router;

