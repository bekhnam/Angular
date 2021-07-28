exports.config = {
    framework: 'jasmine',
    seleniumAddress: 'http://localhost:4200',
    specs: ['app.e2e-spec.ts'],
    multiCapabilities: [{
        browserName: 'chrome'
    }, {
        bowserName: 'firefox'
    }
    ]
}