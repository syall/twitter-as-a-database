const express = require('express');
const router = express.Router();
const {
	client,
	tweetToRecord,
	recordContains,
	URLS,
} = require('../utils/twitter');
const { DEFAULT_DB } = process.env;

const login = async (req, res) => {
	try {
		const { username, password } = req.body;
		const tweets = await client.get(URLS.get, { screen_name: DEFAULT_DB });
		const [user] = tweets
			.map(tweetToRecord)
			.filter(recordContains('user')(username));
		if (!user)
			throw new Error('User not found.');
		if (password.localeCompare(user.password.value))
			throw new Error('Password incorrect.');
		res.json({
			message: 'Authentication Successful!'
		});
	} catch (err) {
		console.log(err);
		res.status(400).json({
			message: err.message
		});
	}
};
router.post('/login', login);

module.exports = router;
module.exports.login = login;
