const express = require('express');
const multer = require('multer');

const authMiddleware = require('./middlewares/auth');

const thumbUploadConfig = require('./config/thumbUploadConfig');
const avatarUploadConfig = require('./config/avatarUploadConfig');

const MentorController = require('./controllers/MentorController');
const SkillController = require('./controllers/SkillController');
const TechController = require('./controllers/TechController');
const UserController = require('./controllers/UserController');
const BookingController = require('./controllers/BookingController');

// Roteador do Express
const routes = express.Router();
const thumbUpload = multer(thumbUploadConfig);
const avatarUpload = multer(avatarUploadConfig);

routes.get('/techs', TechController.index);
routes.post('/techs', thumbUpload.single('thumbnail'), TechController.store);

routes.post('/users', avatarUpload.single('avatar'), UserController.store);

routes.post('/mentors', avatarUpload.single('avatar'), MentorController.store);

routes.post('/users/authenticate', UserController.authenticate);

routes.use(authMiddleware);

routes.get('/users', UserController.show);
routes.get('/users/search', MentorController.index);

routes.post('/mentors/:id/bookings', BookingController.store);

routes.post('/users/edit', avatarUpload.single('avatar'), UserController.update);

routes.get('/mentors', MentorController.show);

routes.post('/mentors/skills', SkillController.store);
routes.delete('/mentors/skills/:tech_id', SkillController.destroy);

module.exports = routes;