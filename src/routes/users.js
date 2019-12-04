const express = require('express');
const router = express.Router();
const {
	client,
	tweetToRecord,
	startWithQuery,
	userIsActive,
	toPublicUser,
	recordContains,
	URLS,
} = require('../utils/twitter');
const { DEFAULT_DB } = process.env;

router.get('/', async (req, res) => {
	try {
		const tweets = await client.get(URLS.get, { screen_name: DEFAULT_DB });
		const users = tweets.map(tweetToRecord);
		res.json(users.map(toPublicUser));
	} catch (err) {
		res.status(400).json({
			message: 'Unable to get Public Users.'
		});
	}
});

router.get('/active', async (req, res) => {
	try {
		const tweets = await client.get(URLS.get, { screen_name: DEFAULT_DB });
		const users = tweets
			.map(tweetToRecord)
			.filter(userIsActive);
		res.json(users.map(toPublicUser));
	} catch (err) {
		res.status(400).json({
			message: 'Unable to get Public Users.'
		});
	}
});

router.get('/search/:query', async (req, res) => {
	try {
		const { query } = req.params;
		const tweets = await client.get(URLS.get, { screen_name: DEFAULT_DB });
		const users = tweets
			.map(tweetToRecord)
			.filter(startWithQuery(query));
		res.json(users.map(toPublicUser));
	} catch (err) {
		res.status(400).json({
			message: 'Unable to get Public Users.'
		});
	}
});

router.post('/create', async (req, res) => {
	try {
		const { user, password } = req.body;
		if (!user || !password)
			throw new Error();
		const tweets = await client.get(URLS.get, { screen_name: DEFAULT_DB });
		const [userFound] = tweets
			.map(tweetToRecord)
			.filter(recordContains('user')(user));
		if (userFound)
			throw new Error();
		const { created_at: posted } = await client.post(URLS.create, {
			status:
				`#USERPUBLICSTRG${user} ` +
				`#PASSWORDSECRETSTRG${password} ` +
				`#ACTIVEPUBLICBOOLtrue`
		});
		if (!posted)
			throw new Error();
		res.json({ user, active: true });
	} catch (err) {
		res.status(400).json({
			message: 'Unable to create user.'
		});
	}
});

router.get('/read/:user', async (req, res) => {
	try {
		const { user } = req.params;
		const tweets = await client.get(URLS.get, { screen_name: DEFAULT_DB });
		const [userFound] = tweets
			.map(tweetToRecord)
			.filter(recordContains('user')(user));
		if (!userFound)
			throw new Error();
		res.json(toPublicUser(userFound));
	} catch (err) {
		res.status(400).json({
			message: 'Unable to get user.'
		});
	}
});

router.put('/update/:user', async (req, res) => {
	try {
		const { user } = req.params;
		const tweets = await client.get(URLS.get, { screen_name: DEFAULT_DB });
		const [userFound] = tweets
			.map(tweetToRecord)
			.filter(recordContains('user')(user));
		if (!userFound)
			throw new Error();
		const { created_at: deleted } = await client.post(URLS.delete, {
			id: userFound.id.value
		});
		if (!deleted)
			throw new Error();
		const { created_at: posted } = await client.post(URLS.create, {
			status:
				`#USERPUBLICSTRG${userFound.user.value} ` +
				`#PASSWORDSECRETSTRG${userFound.password.value} ` +
				`#ACTIVEPUBLICBOOL${(!userFound.active.value).toString()}`
		});
		if (!posted)
			throw new Error();
		res.json({
			user: userFound.user.value,
			active: !userFound.active.value
		});
	} catch (err) {
		res.status(400).json({
			message: 'Unable to update user.'
		});
	}
});

router.delete('/delete/:user', async (req, res) => {
	try {
		const { user } = req.params;
		const tweets = await client.get(URLS.get, { screen_name: DEFAULT_DB });
		const [userFound] = tweets
			.map(tweetToRecord)
			.filter(recordContains('user')(user));
		if (!userFound)
			throw new Error();
		await client.post(URLS.delete, {
			id: userFound.id.value
		});
		res.json(toPublicUser(userFound));
	} catch (err) {
		res.status(400).json({
			message: 'Unable to delete user.'
		});
	}
});

module.exports = router;
