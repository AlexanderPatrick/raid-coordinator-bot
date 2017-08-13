test('Bot connects to Discord', done => {
    require('child_process').exec('node index.js --test 1000', (err, stdout, stderr) => {
        expect(stderr).not.toBe('An invalid token was provided.\n');
        expect(stdout).toBe('Ready!\n');
        done();
    });
});

test('createListForChannelIfNotExists function', () => {
    const createListForChannelIfNotExists = require('./functions').createListForChannelIfNotExists;
    var input = {
        list: {},
        channelId: 1,
    };
    var expectedOutput = {
        1: [],
    };
    var actualOutput = createListForChannelIfNotExists(input.list, input.channelId);
    expect(actualOutput).toMatchObject(expectedOutput);
});

test('createListForChannelIfNotExists function where channel exists', () => {
    const createListForChannelIfNotExists = require('./functions').createListForChannelIfNotExists;
    var input = {
        list: {
            1: [{some: 'data'}],
        },
        channelId: 1,
    };
    var expectedOutput = {
        1: [{some: 'data'}],
    };
    var actualOutput = createListForChannelIfNotExists(input.list, input.channelId);
    expect(actualOutput).toMatchObject(expectedOutput);
});

test('addDefaultRaiderToRaiderListIfNotExist function', () => {
    const addDefaultRaiderToRaiderListIfNotExist = require('./functions').addDefaultRaiderToRaiderListIfNotExist;
    var input = {
        list: [],
        raiderName: 'Test',
    };
    var expectedOutput = [
        {name: 'Test', count: 1, here: false},
    ];
    var actualOutput = addDefaultRaiderToRaiderListIfNotExist(input.list, input.raiderName);
    expect(actualOutput).toMatchObject(expectedOutput);
});

test('addDefaultRaiderToRaiderListIfNotExist function where raider exists', () => {
    const addDefaultRaiderToRaiderListIfNotExist = require('./functions').addDefaultRaiderToRaiderListIfNotExist;
    var input = {
        list: [
            {name: 'Test', count: 2, here: true}
        ],
        raiderName: 'Test',
    };
    var expectedOutput = [
        {name: 'Test', count: 2, here: true},
    ];
    var actualOutput = addDefaultRaiderToRaiderListIfNotExist(input.list, input.raiderName);
    expect(actualOutput).toMatchObject(expectedOutput);
});

test('addDefaultRaiderTallyToTallyListIfNotExist function', () => {
    const addDefaultRaiderTallyToTallyListIfNotExist = require('./functions').addDefaultRaiderTallyToTallyListIfNotExist;
    var input = {
        list: [],
        raiderName: 'Test',
    };
    var expectedOutput = [
        {name: 'Test', caught: 0, ran: 0},
    ];
    var actualOutput = addDefaultRaiderTallyToTallyListIfNotExist(input.list, input.raiderName);
    expect(actualOutput).toMatchObject(expectedOutput);
});

test('addDefaultRaiderTallyToTallyListIfNotExist function where raider exists', () => {
    const addDefaultRaiderTallyToTallyListIfNotExist = require('./functions').addDefaultRaiderTallyToTallyListIfNotExist;
    var input = {
        list: [
            {name: 'Test', caught: 2, ran: 1},
        ],
        raiderName: 'Test',
    };
    var expectedOutput = [
        {name: 'Test', caught: 2, ran: 1},
    ];
    var actualOutput = addDefaultRaiderTallyToTallyListIfNotExist(input.list, input.raiderName);
    expect(actualOutput).toMatchObject(expectedOutput);
});
