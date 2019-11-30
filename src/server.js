const express = require('express');
const twitter = require('twitter');
const bodyParser = require('body-parser');
const { name, version } = require('../package.json');
require('dotenv').config();

const app = new express();

const { HOST, PORT } = process.env;
app.listen(PORT, () => {
	console.log(`${name} running on http://${HOST}:${PORT}`);
});


app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(bodyParser.json());

const {
	CONSUMER_PUBLIC_KEY: consumer_key,
	CONSUMER_SECRET_KEY: consumer_secret,
	ACCESS_PUBLIC_KEY: access_token_key,
	ACCESS_SECRET_KEY: access_token_secret,
	DEFAULT_DB,
} = process.env;

app.get('/users', async (req, res) => {
	try {
		const client = new twitter({
			consumer_key,
			consumer_secret,
			access_token_key,
			access_token_secret,
		});
		const tweets = await client.get('statuses/user_timeline', {
			screen_name: DEFAULT_DB,
		});
		const users = tweets
			.map(t => t.entities.hashtags.map(h => h.text))
			.map(tags => {
				const ret = {};
				tags.forEach(hashtag => {
					const [attr] = hashtag.match(/[A-Z]+/g);
					const [val] = hashtag.match(/[a-z0-9]+/g);
					const len = attr.length;
					if (attr.endsWith('STR'))
						ret[attr.substring(0, len - 3).toLowerCase()] = val;
					else if (attr.endsWith('BOOL'))
						ret[attr.substring(0, len - 4).toLowerCase()] = val === 'true';
					else if (attr.endsWith('NUM'))
						ret[attr.substring(0, len - 3).toLowerCase()] = Number.parseInt(val);
					else
						ret[attr.toLowerCase()] = val;
				});
				return ret;
			});
		res.json(users.map(u => {
			return {
				user: u.user,
				active: u.active
			};
		}));
	} catch (err) {
		res.status(400);
		res.json(err);
	}
});

app.get('/login', async (req, res) => {
	try {
		const { username, password } = req.body;
		const client = new twitter({
			consumer_key,
			consumer_secret,
			access_token_key,
			access_token_secret,
		});
		const users = await client.get('statuses/user_timeline', {
			screen_name: DEFAULT_DB,
		});
		const [user] = users
			.map(t => t.entities.hashtags.map(h => h.text))
			.filter(u => u.includes(`USERSTR${username}`))
			.map(tags => {
				const ret = {};
				tags.forEach(hashtag => {
					const [attr] = hashtag.match(/[A-Z]+/g);
					const [val] = hashtag.match(/[a-z0-9]+/g);
					const len = attr.length;
					if (attr.endsWith('STR'))
						ret[attr.substring(0, len - 3).toLowerCase()] = val;
					else if (attr.endsWith('BOOL'))
						ret[attr.substring(0, len - 4).toLowerCase()] = val === 'true';
					else if (attr.endsWith('NUM'))
						ret[attr.substring(0, len - 3).toLowerCase()] = Number.parseInt(val);
					else
						ret[attr.toLowerCase()] = val;
				});
				return ret;
			});
		if (!user)
			throw new Error('User not found.');
		if (password.localeCompare(user.password))
			throw new Error('Password incorrect.');
		res.json({
			message: 'Authentication Successful!'
		});
	} catch (err) {
		res.status(400).json({
			message: err.message
		});
	}
});

app.get('*', (req, res) => res.json({
	service: `${name} ${version}`,
	routes: [
		`/users`,
		`/login`,
	],
}));
