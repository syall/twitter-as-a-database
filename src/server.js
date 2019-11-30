const express = require('express');
const twitter = require('twitter');

const { name, version } = require('../package.json');
require('dotenv').config();

const app = new express();

const { HOST, PORT } = process.env;
app.listen(PORT, () => {
	console.log(`${name} running on http://${HOST}:${PORT}`);
});

const {
	CONSUMER_PUBLIC_KEY: consumer_key,
	CONSUMER_SECRET_KEY: consumer_secret,
	ACCESS_PUBLIC_KEY: access_token_key,
	ACCESS_SECRET_KEY: access_token_secret,
	DEFAULT_DB,
} = process.env;

app.get('/db/:user?', async (req, res) => {
	try {
		const client = new twitter({
			consumer_key,
			consumer_secret,
			access_token_key,
			access_token_secret,
		});
		const tweets = await client.get('statuses/user_timeline', {
			screen_name: req.params.user || DEFAULT_DB,
		});
		const users = tweets.map(tweet => {
			const ret = {};
			tweet.entities.hashtags.forEach(hashtag => {
				const [attr] = hashtag.text.match(/[A-Z]+/g);
				const [val] = hashtag.text.match(/[a-z0-9]+/g);
				const len = attr.length;
				if (attr.endsWith('STR'))
					ret[attr.substring(0, len - 3)] = val;
				else if (attr.endsWith('BOOL'))
					ret[attr.substring(0, len - 4)] = val === 'true';
				else if (attr.endsWith('NUM'))
					ret[attr.substring(0, len - 3)] = Number.parseInt(val);
				else
					ret[attr] = val;
			});
			return ret;
		});
		res.json(users);
	} catch (err) {
		res.status(400);
		res.json(err);
	}
});

app.get('*', (req, res) => res.json({
	service: `${name} ${version}`,
	routes: [
		`/db/:user?`,
	],
}));
