test('Bot connects to Discord', done => {
    require('child_process').exec('node index.js --test 1000', (err, stdout, stderr) => {
        expect(stdout).toBe('Ready!\n'); // \n because console.log ends with a new line
        done();
    });
})
