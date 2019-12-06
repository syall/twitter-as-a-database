require('dotenv').config();
const nock = require('nock');
const {
	URLS,
	toPublicUser,
	tweetToRecord
} = require('../../utils/twitter');
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

const mockRequest = body => query => params => ({
	body,
	query,
	params,
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
describe('Path /users Tests', () => {

	afterEach(() => {
		nock.cleanAll();
	});

	test('Get all users', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [normalRes]);
		try {
			const temp = mockResponse();
			await router.base(
				mockRequest({})({})({}),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith([
				toPublicUser(tweetToRecord(normalRes))
			]);
		} catch (error) {
			console.error(error);
		}
	});

	const failUsersMsg = { message: 'Unable to get Public Users.' };
	test('Bad get response for users', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, { message: 'bad' });
		try {
			const temp = mockResponse();
			await router.base(
				mockRequest({})({})({}),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failUsersMsg);
		} catch (error) {
			console.error(error);
		}
	});

	test('Get single user bob', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [normalRes]);
		try {
			const temp = mockResponse();
			await router.base(
				mockRequest({})({ user: 'bob' })({}),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(
				toPublicUser(tweetToRecord(normalRes))
			);
		} catch (error) {
			console.error(error);
		}
	});

	const failUserMsg = { message: 'Unable to get Public User.' };
	test('Fail to get single user bo', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [normalRes]);
		try {
			const temp = mockResponse();
			await router.base(
				mockRequest({})({ user: 'bo' })({}),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failUserMsg);
		} catch (error) {
			console.error(error);
		}
	});

	test('Bad get response for user', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, { message: 'bad' });
		try {
			const temp = mockResponse();
			await router.base(
				mockRequest({})({ user: 'bob' })({}),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failUserMsg);
		} catch (error) {
			console.error(error);
		}
	});

});

const searchRes = [
	{
		id_str: '1',
		entities: {
			hashtags: [
				{ text: 'USERPUBLICSTRGbob' },
				{ text: 'PASSWORDSECRETSTRGtest' },
				{ text: 'TRUSTSECRETBOOLtrue' },
				{ text: 'BOOMPUBLICBOOLfalse' },
				{ text: 'AGEPUBLICNUMB1' },
			]
		}
	},
	{
		id_str: '2',
		entities: {
			hashtags: [
				{ text: 'USERPUBLICSTRGsteven' },
				{ text: 'PASSWORDSECRETSTRGtest123' },
				{ text: 'TRUSTSECRETBOOLtrue' },
				{ text: 'BOOMPUBLICBOOLtrue' },
				{ text: 'AGEPUBLICNUMB20' },
			]
		}
	}
];
describe('Path /users/search Tests', () => {

	afterEach(() => {
		nock.cleanAll();
	});

	const bSearch = { user: 'b' };
	test('Search for bob with public strg b', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, searchRes);
		try {
			const temp = mockResponse();
			await router.search(
				mockRequest({})(bSearch)({}),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith([
				toPublicUser(tweetToRecord(searchRes[0]))
			]);
		} catch (error) {
			console.error(error);
		}
	});

	const secretSearch = { trust: true };
	test('Search for Secret Field', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, searchRes);
		try {
			const temp = mockResponse();
			await router.search(
				mockRequest({})(secretSearch)({}),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith([]);
		} catch (error) {
			console.error(error);
		}
	});

	const nonSearch = { false: 'nonexistent' };
	test('Search for nonexistent field', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, searchRes);
		try {
			const temp = mockResponse();
			await router.search(
				mockRequest({})(nonSearch)({}),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith([]);
		} catch (error) {
			console.error(error);
		}
	});

	const failMsg = { message: 'Unable to get Public Users.' };
	test('Bad get response', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, { message: 'bad' });
		try {
			const temp = mockResponse();
			await router.search(
				mockRequest({})({ bSearch })({}),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

});

describe('Path /users/create Tests', () => {

	afterEach(() => {
		nock.cleanAll();
	});

	const bobby = {
		"user": {
			"value": "bobby",
			"type": "strg",
			"visibility": "public"
		},
		"password": {
			"value": "test",
			"type": "strg",
			"visibility": "secret"
		},
		"active": {
			"value": "true",
			"type": "bool",
			"visibility": "public"
		}
	};
	const bobbyStatus =
		'#USERPUBLICSTRGbobby #PASSWORDSECRETSTRGtest #ACTIVEPUBLICBOOLtrue';
	test('Successfully create bobby', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [normalRes]);
		const postScope = nock(URLS.base)
			.post(postTimeline, {
				status: bobbyStatus
			})
			.reply(200, { created_at: '1' });
		try {
			const temp = mockResponse();
			await router.create(
				mockRequest(bobby)({})({}),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith({
				user: 'bobby',
				active: 'true'
			});
		} catch (error) {
			console.error(error);
		}
	});

	const bobbySecretUser = {
		"user": {
			"value": "bobby",
			"type": "strg",
			"visibility": "secret"
		},
		"password": {
			"value": "test",
			"type": "strg",
			"visibility": "secret"
		},
		"active": {
			"value": "true",
			"type": "bool",
			"visibility": "public"
		}
	};
	const failMsg = { message: 'Unable to create user.' };
	test('Secret User Visibility Fail', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [normalRes]);
		const postScope = nock(URLS.base)
			.post(postTimeline, {
				status: bobbyStatus
			})
			.reply(200, { created_at: '1' });
		try {
			const temp = mockResponse();
			await router.create(
				mockRequest(bobbySecretUser)({})({}),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

	const bobbyPublicPassword = {
		"user": {
			"value": "bobby",
			"type": "strg",
			"visibility": "public"
		},
		"password": {
			"value": "test",
			"type": "strg",
			"visibility": "public"
		},
		"active": {
			"value": "true",
			"type": "bool",
			"visibility": "public"
		}
	};
	test('Public Password Visibility Fail', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [normalRes]);
		const postScope = nock(URLS.base)
			.post(postTimeline, {
				status: bobbyStatus
			})
			.reply(200, { created_at: '1' });
		try {
			const temp = mockResponse();
			await router.create(
				mockRequest(bobbyPublicPassword)({})({}),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

	const bobbyNoUser = {
		"password": {
			"value": "test",
			"type": "strg",
			"visibility": "secret"
		},
		"active": {
			"value": "true",
			"type": "bool",
			"visibility": "public"
		}
	};
	test('No User field Fail', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [normalRes]);
		const postScope = nock(URLS.base)
			.post(postTimeline, {
				status: bobbyStatus
			})
			.reply(200, { created_at: '1' });
		try {
			const temp = mockResponse();
			await router.create(
				mockRequest(bobbyNoUser)({})({}),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

	const bobbyNoPassword = {
		"user": {
			"value": "bobby",
			"type": "strg",
			"visibility": "secret"
		},
		"active": {
			"value": "true",
			"type": "bool",
			"visibility": "public"
		}
	};
	test('No Password Field Fail', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [normalRes]);
		const postScope = nock(URLS.base)
			.post(postTimeline, {
				status: bobbyStatus
			})
			.reply(200, { created_at: '1' });
		try {
			const temp = mockResponse();
			await router.create(
				mockRequest(bobbyNoPassword)({})({}),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

	const bob = {
		"user": {
			"value": "bob",
			"type": "strg",
			"visibility": "public"
		},
		"password": {
			"value": "test",
			"type": "strg",
			"visibility": "secret"
		},
		"active": {
			"value": "true",
			"type": "bool",
			"visibility": "public"
		}
	};
	test('Bob already exists Fail', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [normalRes]);
		const postScope = nock(URLS.base)
			.post(postTimeline, {
				status: bobbyStatus
			})
			.reply(200, { created_at: '1' });
		try {
			const temp = mockResponse();
			await router.create(
				mockRequest(bob)({})({}),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

	const bobbyNull = {
		"user": {
			"value": "bobby",
			"type": "strg",
			"visibility": "public"
		},
		"password": {
			"value": "test",
			"type": "strg",
			"visibility": "secret"
		},
		"active": {
			"value": null,
			"type": "bool",
			"visibility": "public"
		}
	};
	test('Field has null value Fail', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [normalRes]);
		const postScope = nock(URLS.base)
			.post(postTimeline, {
				status: bobbyStatus
			})
			.reply(200, { created_at: '1' });
		try {
			const temp = mockResponse();
			await router.create(
				mockRequest(bobbyNull)({})({}),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

	const bobbyBadNumb = {
		"user": {
			"value": "bobby",
			"type": "strg",
			"visibility": "public"
		},
		"password": {
			"value": "test",
			"type": "strg",
			"visibility": "secret"
		},
		"active": {
			"value": "hi",
			"type": "numb",
			"visibility": "public"
		}
	};
	test('Bad Number Fail', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [normalRes]);
		const postScope = nock(URLS.base)
			.post(postTimeline, {
				status: bobbyStatus
			})
			.reply(200, { created_at: '1' });
		try {
			const temp = mockResponse();
			await router.create(
				mockRequest(bobbyBadNumb)({})({}),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

	const bobbyBadType = {
		"user": {
			"value": "bobby",
			"type": "strg",
			"visibility": "public"
		},
		"password": {
			"value": "test",
			"type": "strg",
			"visibility": "secret"
		},
		"active": {
			"value": "True",
			"type": "bool",
			"visibility": "public"
		}
	};
	test('Bad Type (uppercase) Fail', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [normalRes]);
		const postScope = nock(URLS.base)
			.post(postTimeline, {
				status: bobbyStatus
			})
			.reply(200, { created_at: '1' });
		try {
			const temp = mockResponse();
			await router.create(
				mockRequest(bobbyBadType)({})({}),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

	const bobbyBadValue = {
		"user": {
			"value": "bobby",
			"type": "strg",
			"visibility": "public"
		},
		"password": {
			"value": "test",
			"type": "strg",
			"visibility": "secret"
		},
		"active": {
			"value": "true",
			"type": "bool",
			"visibility": "public",
			"boo": "bad"
		}
	};
	test('Extra property on field Fail', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [normalRes]);
		const postScope = nock(URLS.base)
			.post(postTimeline, {
				status: bobbyStatus
			})
			.reply(200, { created_at: '1' });
		try {
			const temp = mockResponse();
			await router.create(
				mockRequest(bobbyBadValue)({})({}),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

	test('Bad get response', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, { message: 'bad' });
		try {
			const temp = mockResponse();
			await router.create(
				mockRequest(bobby)({})({}),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

	test('Bad post response', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [normalRes]);
		const postScope = nock(URLS.base)
			.post(postTimeline, {
				status: bobbyStatus
			})
			.reply(200, { message: 'bad' });
		try {
			const temp = mockResponse();
			await router.create(
				mockRequest(bobby)({})({}),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

});

describe('Path /users/update Tests', () => {

	afterEach(() => {
		nock.cleanAll();
	});

	const updateRes = {
		id_str: '1',
		entities: {
			hashtags: [
				{ text: 'USERPUBLICSTRGbob' },
				{ text: 'PASSWORDSECRETSTRGtest' },
				{ text: 'ACTIVEPUBLICBOOLtrue' },
				{ text: 'TRUSTSECRETBOOLtrue' },
			]
		}
	};

	const updateActive = {
		"active": {
			"value": "false",
			"type": "bool",
			"visibility": "public"
		}
	};
	test('Update active to false on bob', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [updateRes]);
		const postScope = nock(URLS.base)
			.post(postTimeline)
			.reply(200, { created_at: '2' });
		const deleteScope = nock(URLS.base)
			.post(deleteTimeline, {
				id: '1'
			})
			.reply(200, { created_at: '1' });
		try {
			const temp = mockResponse();
			await router.update(
				mockRequest(updateActive)({})({ user: 'bob' }),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith({
				user: 'bob',
				active: 'false'
			});
		} catch (error) {
			console.error(error);
		}
	});

	const failMsg = { message: 'Unable to update user.' };
	test('Fail to find bo', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [updateRes]);
		const postScope = nock(URLS.base)
			.post(postTimeline)
			.reply(200, { created_at: '2' });
		const deleteScope = nock(URLS.base)
			.post(deleteTimeline, {
				id: '1'
			})
			.reply(200, { created_at: '1' });
		try {
			const temp = mockResponse();
			await router.update(
				mockRequest(updateActive)({})({ user: 'bo' }),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

	const updateUser = {
		"user": {
			"value": "false",
			"type": "bool",
			"visibility": "public"
		}
	};
	test('Update User field fail', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [updateRes]);
		const postScope = nock(URLS.base)
			.post(postTimeline)
			.reply(200, { created_at: '2' });
		const deleteScope = nock(URLS.base)
			.post(deleteTimeline, {
				id: '1'
			})
			.reply(200, { created_at: '1' });
		try {
			const temp = mockResponse();
			await router.update(
				mockRequest(updateUser)({})({ user: 'bob' }),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

	const updateBadNumb = {
		"boom": {
			"value": "hi",
			"type": "numb",
			"visibility": "public"
		}
	};
	test('Bad Numb value fail', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [updateRes]);
		const postScope = nock(URLS.base)
			.post(postTimeline)
			.reply(200, { created_at: '2' });
		const deleteScope = nock(URLS.base)
			.post(deleteTimeline, {
				id: '1'
			})
			.reply(200, { created_at: '1' });
		try {
			const temp = mockResponse();
			await router.update(
				mockRequest(updateBadNumb)({})({ user: 'bob' }),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

	const updateBadType = {
		"boom": {
			"value": "Hi",
			"type": "strg",
			"visibility": "public"
		}
	};
	test('Bad Type (uppercase) value fail', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [updateRes]);
		const postScope = nock(URLS.base)
			.post(postTimeline)
			.reply(200, { created_at: '2' });
		const deleteScope = nock(URLS.base)
			.post(deleteTimeline, {
				id: '1'
			})
			.reply(200, { created_at: '1' });
		try {
			const temp = mockResponse();
			await router.update(
				mockRequest(updateBadType)({})({ user: 'bob' }),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

	const updateNullAndType = {
		"active": {
			"value": null,
			"type": "numb",
			"visibility": "public"
		}
	};
	test('Null and Type Mismatch fail', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [updateRes]);
		const postScope = nock(URLS.base)
			.post(postTimeline)
			.reply(200, { created_at: '2' });
		const deleteScope = nock(URLS.base)
			.post(deleteTimeline, {
				id: '1'
			})
			.reply(200, { created_at: '1' });
		try {
			const temp = mockResponse();
			await router.update(
				mockRequest(updateNullAndType)({})({ user: 'bob' }),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

	const updateNullAndSecret = {
		"trust": {
			"value": null,
			"type": "bool",
			"visibility": "secret"
		}
	};
	test('Null and Secret fail', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [updateRes]);
		const postScope = nock(URLS.base)
			.post(postTimeline)
			.reply(200, { created_at: '2' });
		const deleteScope = nock(URLS.base)
			.post(deleteTimeline, {
				id: '1'
			})
			.reply(200, { created_at: '1' });
		try {
			const temp = mockResponse();
			await router.update(
				mockRequest(updateNullAndSecret)({})({ user: 'bob' }),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

	const updateRemove = {
		"active": {
			"value": null,
			"type": "bool",
			"visibility": "public"
		}
	};
	test('Remove active field', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [updateRes]);
		const postScope = nock(URLS.base)
			.post(postTimeline)
			.reply(200, { created_at: '2' });
		const deleteScope = nock(URLS.base)
			.post(deleteTimeline, {
				id: '1'
			})
			.reply(200, { created_at: '1' });
		try {
			const temp = mockResponse();
			await router.update(
				mockRequest(updateRemove)({})({ user: 'bob' }),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith({
				user: 'bob'
			});
		} catch (error) {
			console.error(error);
		}
	});

	const updateNewProper = {
		"new": {
			"value": true,
			"type": "bool",
			"visibility": "public"
		}
	};
	test('Add new field', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [updateRes]);
		const postScope = nock(URLS.base)
			.post(postTimeline)
			.reply(200, { created_at: '2' });
		const deleteScope = nock(URLS.base)
			.post(deleteTimeline, {
				id: '1'
			})
			.reply(200, { created_at: '1' });
		try {
			const temp = mockResponse();
			await router.update(
				mockRequest(updateNewProper)({})({ user: 'bob' }),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith({
				active: true,
				new: true,
				user: 'bob'
			});
		} catch (error) {
			console.error(error);
		}
	});

	test('Bad get response', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, { message: 'bad' });
		try {
			const temp = mockResponse();
			await router.update(
				mockRequest(updateActive)({})({ user: 'bob' }),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

	test('Bad post response', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [updateRes]);
		const postScope = nock(URLS.base)
			.post(postTimeline)
			.reply(200, { message: 'bad' });
		try {
			const temp = mockResponse();
			await router.update(
				mockRequest(updateActive)({})({ user: 'bob' }),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

	test('Bad delete response', async () => {
		const getScope = nock(URLS.base)
			.get(getTimeline)
			.reply(200, [updateRes]);
		const postScope = nock(URLS.base)
			.post(postTimeline)
			.reply(200, { created_at: '2' });
		const deleteScope = nock(URLS.base)
			.post(deleteTimeline, {
				id: '1'
			})
			.reply(200, { message: 'bad' });
		try {
			const temp = mockResponse();
			await router.update(
				mockRequest(updateActive)({})({ user: 'bob' }),
				temp
			);
			expect(temp.json).toHaveBeenCalledWith(failMsg);
		} catch (error) {
			console.error(error);
		}
	});

});

describe('Path /users/delete Tests', () => {

	afterEach(() => {
		nock.cleanAll();
	});

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
