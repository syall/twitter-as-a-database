require('dotenv').config();
const nock = require('nock');
const { URLS } = require('../../utils/twitter');
const { DEFAULT_DB } = process.env;

const router = require('../../routes/users');

const getTimeline = `/${URLS.get}.json?screen_name=${DEFAULT_DB}`;
const postTimeline = `/${URLS.create}.json`;
const deleteTimeline = `/${URLS.delete}.json`;

const mockResponse = () => {
	const res = {};
	res.status = jest.fn().mockReturnValue(res);
	res.json = jest.fn().mockReturnValue(res);
	return res;
};

const mockRequest = data => query => params => ({
	body: data,
	query: query,
	params: params,
});

const normalRes = {
	id_str: '1',
	entities: {
		hashtags: [
			{ text: 'USERPUBLICSTRGbob' },
			{ text: 'PASSWORDSECRETSTRGtest' },
		]
	}
};

describe('Path /users/delete Tests', () => {

	const deleteUser = { user: 'bob' };
	const deleteRes = { created_at: '1' };
	test('Successfully delete bob', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [normalRes]);
		const deleteScope = nock(URLS.base)
			.post(deleteTimeline, {
				id: '1'
			})
			.reply(200, deleteRes);
		try {
			const temp = mockResponse();
			await router.deleteRoute(
				mockRequest({})({})(deleteUser),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(deleteUser);
		} catch (error) {
			console.error(error);
		}
	});

	const notFoundUser = { user: 'bo' };
	const failMsg = { message: 'Unable to delete user.' };
	test('Unsuccessfully delete bo not found', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [normalRes]);
		try {
			const temp = mockResponse();
			await router.deleteRoute(mockRequest(notFoundUser)({})({}), temp);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

	test('Bad get response', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [{ bad: 'bad' }]);
		try {
			const temp = mockResponse();
			await router.deleteRoute(mockRequest({})({})(deleteUser), temp);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

	test('Bad post response', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [normalRes]);
		const deleteScope = nock(URLS.base)
			.post(deleteTimeline)
			.reply(200, { message: 'bad' });
		try {
			const temp = mockResponse();
			await router.deleteRoute(mockRequest({})({})(deleteUser), temp);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

});
