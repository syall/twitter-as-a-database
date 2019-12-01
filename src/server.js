const express = require('express');
const twitter = require('twitter');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const { name } = require('../package.json');

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

const client = new twitter({
	consumer_key,
	consumer_secret,
	access_token_key,
	access_token_secret,
});

const getURL = 'statuses/user_timeline';
const deleteURL = 'statuses/destroy';
const createURL = 'statuses/update';

const tweetToRecord = tweet => {
	const type = attr => attr.substring(attr.length - 4);
	const field = attr => attr.substring(0, attr.length - 4).toLowerCase();
	const parseHashtag = hashtag => {
		const [attr] = hashtag.text.match(/^[A-Z]+/g);
		const [val] = hashtag.text.match(/[a-z0-9][a-z0-9A-Z]*$/g);
		switch (type(attr)) {
			case 'STRG':
				ret[field(attr)] = val;
				break;
			case 'BOOL':
				ret[field(attr)] = val === 'true';
				break;
			case 'NUMB':
				ret[field(attr)] = Number.parseInt(val);
				break;
			default:
				break;
		}
	};
	const ret = { id: tweet.id_str };
	tweet.entities.hashtags.forEach(parseHashtag);
	return ret;
};

const startWithQuery = query => record => record.user.startsWith(query);

const userIsActive = record => record.active;

const toPublicUser = u => {
	return {
		user: u.user,
		active: u.active
	};
};

const recordContains = field => value => record => record[field] === value;

app.get('/users', async (req, res) => {
	try {
		const tweets = await client.get(getURL, { screen_name: DEFAULT_DB });
		const users = tweets.map(tweetToRecord);
		res.json(users.map(toPublicUser));
	} catch (err) {
		res.status(400).json({
			message: 'Unable to get Public Users.'
		});
	}
});

app.get('/users/active', async (req, res) => {
	try {
		const tweets = await client.get(getURL, { screen_name: DEFAULT_DB });
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

app.get('/users/search/:query', async (req, res) => {
	try {
		const { query } = req.params;
		const tweets = await client.get(getURL, { screen_name: DEFAULT_DB });
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

app.post('/users/create', async (req, res) => {
	try {
		const { user, password } = req.body;
		if (!user || !password)
			throw new Error();
		const tweets = await client.get(getURL, { screen_name: DEFAULT_DB });
		const [userFound] = tweets
			.map(tweetToRecord)
			.filter(recordContains('user')(user));
		if (userFound)
			throw new Error();
		const { created_at } = await client.post(createURL, {
			status:
				`#USERSTRG${user} ` +
				`#PASSWORDSTRG${password} ` +
				`#ACTIVEBOOLtrue`
		});
		if (!created_at)
			throw new Error();
		res.json({ user, active: true });
	} catch (err) {
		res.status(400).json({
			message: 'Unable to create user.'
		});
	}
});

app.get('/users/read/:user', async (req, res) => {
	try {
		const { user } = req.params;
		const tweets = await client.get(getURL, { screen_name: DEFAULT_DB });
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

app.put('/users/update/:user', async (req, res) => {
	try {
		const { user } = req.params;
		const tweets = await client.get(getURL, { screen_name: DEFAULT_DB });
		const [userFound] = tweets
			.map(tweetToRecord)
			.filter(recordContains('user')(user));
		if (!userFound)
			throw new Error();
		const resp = await client.post(deleteURL, {
			id: userFound.id
		});
		console.log(resp);
		const { created_at } = await client.post(createURL, {
			status:
				`#USERSTRG${userFound.user} ` +
				`#PASSWORDSTRG${userFound.password} ` +
				`#ACTIVEBOOL${(!userFound.active).toString()}`
		});
		if (!created_at)
			throw new Error();
		res.json({
			user: userFound.user,
			active: !userFound.active
		});
	} catch (err) {
		res.status(400).json({
			message: 'Unable to update user.'
		});
	}
});

app.delete('/users/delete/:user', async (req, res) => {
	try {
		const { user } = req.params;
		const tweets = await client.get(getURL, { screen_name: DEFAULT_DB });
		const [userFound] = tweets
			.map(tweetToRecord)
			.filter(recordContains('user')(user));
		if (!userFound)
			throw new Error();
		await client.post(deleteURL, {
			id: userFound.id
		});
		res.json(toPublicUser(userFound));
	} catch (err) {
		res.status(400).json({
			message: 'Unable to delete user.'
		});
	}
});


app.post('/login', async (req, res) => {
	try {
		const { username, password } = req.body;
		const tweets = await client.get(getURL, { screen_name: DEFAULT_DB });
		const [user] = tweets
			.map(tweetToRecord)
			.filter(recordContains('user')(username));
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

const swaggerDocument = require('../openapi.json');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('*', (req, res) =>
	res.redirect(`http://${HOST}:${PORT}/docs`)
);
