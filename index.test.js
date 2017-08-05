test('Bot connects to Discord', done => {
    require('child_process').exec('node index.js --test 1000', (err, stdout, stderr) => {
        expect(stderr).not.toBe('An invalid token was provided.\n');
        expect(stdout).toBe('Ready!\n');
        done();
    });
});
