const express = require('express');
const router = express.Router();
const {
	client,
	tweetToRecord,
	toPublicUser,
	recordContains,
	hashtagify,
	properValue,
	URLS,
} = require('../utils/twitter');
const { DEFAULT_DB } = process.env;

const base = async (req, res) => {
	try {
		const tweets = await client.get(URLS.get, { screen_name: DEFAULT_DB });
		const { user } = req.query;
		const users = user
			? tweets
				.map(tweetToRecord)
				.filter(recordContains('user')(user))
				.map(toPublicUser)
			: tweets
				.map(tweetToRecord)
				.map(toPublicUser);
		if (user && users.length === 0)
			throw new Error('single');
		res.json(user ? users[0] : users);
	} catch (err) {
		res.status(400).json({
			message: `Unable to get Public User${err.message !== 'single'
				? 's'
				: ''}.`
		});
	}
};
router.get('/', base);

const search = async (req, res) => {
	try {
		let users = (await client.get(URLS.get, { screen_name: DEFAULT_DB }))
			.map(tweetToRecord);
		for (const [k, v] of Object.entries(req.query))
			users = users.filter(u => u[k]
				? u[k].visibility === 'public'
					? u[k].value.toString().startsWith(v)
					: false
				: false
			);
		res.json(users.map(toPublicUser));
	} catch (err) {
		res.status(400).json({
			message: 'Unable to get Public Users.'
		});
	}
};
router.get('/search', search);

const create = async (req, res) => {
	try {
		const { user, password } = req.body;
		if (!user || user.visibility !== 'public' ||
			!password || password.visibility !== 'secret')
			throw new Error();

		const tweets = await client.get(URLS.get, { screen_name: DEFAULT_DB });

		const [userFound] = tweets
			.map(tweetToRecord)
			.filter(recordContains('user')(user.value));
		if (userFound)
			throw new Error();

		const newTweet = [];
		const userToAdd = {};
		for (const [k, v] of Object.entries(req.body)) {
			if (userToAdd[k])
				throw new Error();
			if (v.value === null)
				throw new Error();
			if (!Number(v.value.toString()) && v.type === 'numb')
				throw new Error();
			const fLetter = v.value.toString()[0];
			if (!Number(fLetter) && v.type !== 'numb' &&
				fLetter.toUpperCase() === fLetter)
				throw new Error();
			if (properValue(v)) {
				userToAdd[k] = v;
				newTweet.push(hashtagify([k, v]));
			}
			else throw new Error();
		}

		const { created_at: posted } =
			await client.post(URLS.create, {
				status: newTweet.join(' ')
			});
		if (!posted)
			throw new Error();

		res.json(toPublicUser(userToAdd));
	} catch (err) {
		res.status(400).json({
			message: 'Unable to create user.'
		});
	}
};
router.post('/create', create);

const update = async (req, res) => {
	try {
		const { user } = req.params;
		const tweets = await client.get(URLS.get, { screen_name: DEFAULT_DB });

		const [userFound] = tweets
			.map(tweetToRecord)
			.filter(recordContains('user')(user));
		if (!userFound)
			throw new Error();

		const id = userFound.id.value;
		delete userFound.id;
		for (const [k, v] of Object.entries(req.body)) {
			if (k === 'user')
				throw new Error();
			if (v.value !== null) {
				if (!Number(v.value.toString()) && v.type === 'numb')
					throw new Error();
				const fLetter = v.value.toString()[0];
				if (!Number(fLetter) && v.type !== 'numb' &&
					fLetter.toUpperCase() === fLetter)
					throw new Error();
			}
			if (userFound[k]) {
				if (userFound[k].type !== v.type)
					throw new Error();
				if (userFound[k].visibility === 'secret')
					throw new Error();
				if (v.value === null) {
					delete userFound[k];
					continue;
				}
			}
			if (!userFound[k] && properValue(v)) {
				userFound[k] = v;
				continue;
			}
			userFound[k].value = v.value;
		}

		const newTweet = [];
		for (const [k, v] of Object.entries(userFound))
			newTweet.push(hashtagify([k, v]));

		const { created_at: posted } =
			await client.post(URLS.create, {
				status: newTweet.join(' ')
			});
		if (!posted)
			throw new Error();

		const { created_at: deleted } = await client.post(URLS.delete, { id });
		if (!deleted)
			throw new Error();

		res.json(toPublicUser(userFound));
	} catch (err) {
		res.status(400).json({
			message: 'Unable to update user.'
		});
	}
};
router.put('/update/:user', update);

const deleteRoute = async (req, res) => {
	try {
		const { user } = req.params;
		const tweets = await client.get(URLS.get, { screen_name: DEFAULT_DB });
		const [userFound] = tweets
			.map(tweetToRecord)
			.filter(recordContains('user')(user));
		if (!userFound)
			throw new Error();
		const { created_at: deleted } =
			await client.post(URLS.delete, {
				id: userFound.id.value
			});
		if (!deleted)
			throw new Error();
		res.json(toPublicUser(userFound));
	} catch (err) {

		res.status(400).json({
			message: 'Unable to delete user.'
		});
	}
};
router.delete('/delete/:user', deleteRoute);

module.exports = router;
module.exports.base = base;
module.exports.search = search;
module.exports.create = create;
module.exports.update = update;
module.exports.deleteRoute = deleteRoute;
