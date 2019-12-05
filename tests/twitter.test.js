const {
	typeOf,
	visibilityOf,
	field,
	parseHashtag,
	tweetToRecord,
	toPublicUser,
	recordContains,
	hashtagify,
	properValue,
} = require('../utils/twitter');

describe('Tweet to Record Tests', () => {

	test('typeOf', () => {
		expect(typeOf('TEST')).toBe('test');
		expect(typeOf('USERPUBLICBOOL')).toBe('bool');
	});

	test('visibilityOf', () => {
		expect(visibilityOf('TESTERFOUR')).toBe('tester');
		expect(visibilityOf('USERPUBLICBOOL')).toBe('public');
	});

	test('field', () => {
		expect(field('FIELDtententen1')).toBe('field');
		expect(field('USERPUBLICBOOL')).toBe('user');
	});

	const emptyHashtag = { text: 'FIELDVISIONTYPEvalue' };
	test('parseHashtag default case', () => {
		expect(parseHashtag({})(emptyHashtag)).toEqual({});
	});

	const strgHashtag = { text: 'USERPUBLICSTRGbob' };
	const strgValue = {
		user: {
			value: 'bob',
			type: 'strg',
			visibility: 'public'
		}
	};
	test('parseHashtag strg case', () => {
		expect(parseHashtag({})(strgHashtag)).toEqual(strgValue);
	});

	const boolHashtag = { text: 'TESTPUBLICBOOLtrue' };
	const boolValue = {
		test: {
			value: true,
			type: 'bool',
			visibility: 'public'
		}
	};
	test('parseHashtag bool case', () => {
		expect(parseHashtag({})(boolHashtag)).toEqual(boolValue);
	});

	const numbHashtag = { text: 'BOOMPUBLICNUMB1' };
	const numbValue = {
		boom: {
			value: 1,
			type: 'numb',
			visibility: 'public'
		}
	};
	test('parseHashtag NUMB case', () => {
		expect(parseHashtag({})(numbHashtag)).toEqual(numbValue);
	});

	const emptyTweet = {
		id_str: 'id',
		entities: {
			hashtags: []
		}
	};
	const idValue = {
		id: {
			value: 'id',
			type: 'strg',
			visibility: 'secret'
		}
	};
	test('tweetToRecord empty case', () => {
		expect(tweetToRecord(emptyTweet)).toEqual(idValue);
	});

	test('tweetToRecord non-empty case', () => {
		const nonemptyTweet = {
			id_str: 'id',
			entities: {
				hashtags: [
					emptyHashtag,
					strgHashtag,
					boolHashtag,
					numbHashtag
				]
			}
		};
		expect(tweetToRecord(nonemptyTweet)).toEqual({
			...idValue,
			...strgValue,
			...boolValue,
			...numbValue,
		});
	});

});

describe('Public User Tests', () => {
	const bob = {
		user: {
			value: 'bob',
			type: 'strg',
			visibility: 'public'
		},
		password: {
			value: 'test',
			type: 'strg',
			visibility: 'secret'
		},
		active: {
			value: true,
			type: 'bool',
			visibility: 'public'
		}
	};
	const publicBob = {
		user: 'bob',
		active: true
	};

	test('toPublicUser', () => {
		expect(toPublicUser(bob)).toEqual(publicBob);
	});
});

describe('Record Tests', () => {
	const record = {
		user: {
			value: 'bob',
			type: 'strg',
			visibility: 'public'
		}
	};

	test('recordContains bob is true', () => {
		expect(recordContains('user')('bob')(record)).toEqual(true);
	});

	test('recordContains steven is false', () => {
		expect(recordContains('user')('steven')(record)).toEqual(false);
	});

	test('hashtagify user in record', () => {
		expect(hashtagify(['user', record['user']])).toEqual(
			'#USERPUBLICSTRGbob'
		);
	});

	test('properValue in record.user is valid', () => {
		expect(properValue(record.user)).toEqual(true);
	});
	
	test('properValue in record.user with added field test is invalid', () => {
		expect(properValue({ ...record.user, test: 'bad' })).toEqual(false);
	});
});
