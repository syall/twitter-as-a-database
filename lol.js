(async () => {
	console.log('start');
	try {
		const nock = require('nock');
		const scope = nock('https://api.twitter.com/1.1')
			.get(`/statuses/update.json?status=hello`)
			.reply(200, { message: 'mocked!' });
		// console.log(scope)
		require('dotenv').config();
		const { client } = require('./utils/twitter');

		// console.log(client.get.toString())
		const res = await client.get('statuses/user_timeline', {
			screen_name: 'tweets_as_a_db'
		});
		console.log(res);
	} catch (error) {
		console.log(error);
	}
	console.log('end');
})();
