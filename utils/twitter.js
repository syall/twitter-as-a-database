const tweetToRecord = tweet => {
	const typeOf = attr => attr.substring(attr.length - 4);
	const visibilityOf = attr => attr.substring(
		attr.length - 10,
		attr.length - 4
	);
	const field = attr => attr.substring(0, attr.length - 10).toLowerCase();
	const parseHashtag = hashtag => {
		const [attr] = hashtag.text.match(/^[A-Z]+/g);
		const [value] = hashtag.text.match(/[a-z0-9][a-z0-9A-Z]*$/g);
		const type = typeOf(attr);
		const visibility = visibilityOf(attr);
		switch (type) {
			case 'STRG':
				ret[field(attr)] = {
					value,
					type,
					visibility,
				};
				break;
			case 'BOOL':
				ret[field(attr)] = {
					value: value === 'true',
					type,
					visibility,
				};
				break;
			case 'NUMB':
				ret[field(attr)] = {
					value: Number.parseInt(value),
					type,
					visibility,
				};
				break;
			default:
				break;
		}
	};
	const ret = {
		id: {
			value: tweet.id_str,
			type: 'STRG',
			visibility: 'SECRET'
		}
	};
	tweet.entities.hashtags.forEach(parseHashtag);
	return ret;
};

const startWithQuery = query => record =>
	record.user.value.startsWith(query);

const userIsActive = record => record.active.value;

const toPublicUser = u => {
	ret = {};
	for (const [k, v] of Object.entries(u))
		if (v.visibility === 'PUBLIC')
			ret[k] = v.value;
	return ret;
};

const recordContains = field => value => record =>
	record[field].value === value;

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
