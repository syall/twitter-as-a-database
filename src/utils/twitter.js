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

const toPublicUser = u => ({ user: u.user, active: u.active });

const recordContains = field => value => record => record[field] === value;

const {
	CONSUMER_PUBLIC_KEY: consumer_key,
	CONSUMER_SECRET_KEY: consumer_secret,
	ACCESS_PUBLIC_KEY: access_token_key,
	ACCESS_SECRET_KEY: access_token_secret,
} = process.env;

const twitter = require('twitter');
const client = new twitter({
	consumer_key,
	consumer_secret,
	access_token_key,
	access_token_secret,
});

const URLS = {
	get: 'statuses/user_timeline',
	delete: 'statuses/destroy',
	create: 'statuses/update',
};

module.exports = {
	client,
	tweetToRecord,
	startWithQuery,
	userIsActive,
	toPublicUser,
	recordContains,
	URLS,
};
