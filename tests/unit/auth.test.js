require('dotenv').config();
const nock = require('nock');
const { URLS } = require('../../utils/twitter');
const { DEFAULT_DB } = process.env;

const router = require('../../routes/auth');

describe('Path /login Tests', () => {

	const mockResponse = () => {
		const res = {};
		res.status = jest.fn().mockReturnValue(res);
		res.json = jest.fn().mockReturnValue(res);
		return res;
	};

	const mockRequest = data => ({ body: data });

	const timeline = `/${URLS.get}.json?screen_name=${DEFAULT_DB}`;

	const normalRes = {
		id_str: '1',
		entities: {
			hashtags: [
				{ text: 'USERPUBLICSTRGbob' },
				{ text: 'PASSWORDSECRETSTRGtest' },
			]
		}
	};

	const logInUser = {
		username: 'bob',
		password: 'test'
	};
	const successMsg = { message: 'Authentication Successful!' };
	test('Authentication Successful', async () => {
		const scope = nock(URLS.base)
			.get(timeline)
			.reply(200, [normalRes]);
		try {
			const temp = mockResponse();
			await router.login(mockRequest(logInUser), temp);
			expect(temp.json).toHaveBeenCalledWith(successMsg);
		} catch (error) {
			console.error(error);
		}
	});

	const notFoundUser = {
		username: 'bo',
		password: 'test'
	};
	const notFoundMsg = { message: 'User not found.' };
	test('User not found', async () => {
		const scope = nock(URLS.base)
			.get(timeline)
			.reply(200, [normalRes]);
		const temp = mockResponse();
		try {
			await router.login(mockRequest(notFoundUser), temp);
			expect(temp.json).toHaveBeenCalledWith(notFoundMsg);
		} catch (error) {
			console.error(error);
		}
	});

	const badPasswordUser = {
		username: 'bob',
		password: 'test123'
	};
	const badPasswordMsg = { message: 'Password incorrect.' };
	test('Password Incorrect', async () => {
		const scope = nock(URLS.base)
			.get(timeline)
			.reply(200, [normalRes]);
		try {
			const temp = mockResponse();
			await router.login(mockRequest(badPasswordUser), temp);
			expect(temp.json).toHaveBeenCalledWith(badPasswordMsg);
		} catch (error) {
			console.error(error);
		}
	});

});
