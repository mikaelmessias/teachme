const Mentor = require('../models/Mentor');
const User = require('../models/User');
const Tech = require('../models/Tech');
const mail = require('../config/mail/mail');

module.exports = {
  async index(req, res) {
    const { decoded } = req;
    
    if(!await User.findOne({ _id: decoded.id })) {
      return res.status(404).json({
        error: "User not found"
      })
    }

    if(!req.query.tech) {
      return res.status(400).json({
        error: "Tech paramater expected"
      });
    }

    const tech = await Tech.findOne({
      description: req.query.tech
    });

    if(!tech) {
      return res.status(404).json({
        error: "Tech not found"
      });
    }

    const mentors = await Mentor.find().where('skills.tech').equals(tech._id).populate('user_id').populate('skills.tech');
    
    if(mentors.length == 0) {
      return res.status(404).json({
        error: "No mentors found for given paramater"
      })
    }

    return res.json(mentors);
  },

  async show(req, res) {
    const { decoded } = req;

    let mentor = await Mentor.findOne({ user_id: decoded.id });

    if(!mentor || !(await User.findById(decoded.id))) {
      return res.status(404).json({
        error: "User not found"
      })
    }

    await mentor.populate('user_id').populate('skills.tech').execPopulate();

    return res.json(mentor);
  },

  async store(req, res) {
    const { email } = req.body;
    const { filename } = req.file;

    let user = await User.findOne({ email });
    
    if(!user) {
      user = await User.create({
        ...req.body,
        access: "MENTOR",
        avatar: filename
      });
    }

    let mentor = await Mentor.findOne({ user_id: user._id });

    if(mentor) {
      return res.status(400).json({
        error: "Mentor already exists"
      });
    }

    const availableAt = req.body.availableOn.split(',');
    const skills = req.body.skills.split(';').map(
      info => ({
        tech: info.split(',')[0],
        price: info.split(',')[1]
      })
    )

    try {
      mentor = await Mentor.create({
        user_id: user._id,
        skills,
        availableAt
      });
    }
    catch (err) {
      return res.status(400).json({
        error: err.message
      });
    }

    await mentor.populate('user_id').populate('skills.tech').execPopulate();

    mail.send("welcome", user);

    return res.json(mentor);
  }
};