const Application = require('spectron').Application
const assert = require('assert')
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')
const chai = require('chai')
describe('Application launch', function () {
  this.timeout(30000)

  before(function () {
    this.app = new Application({
      path: electronPath,
      // The following line tells spectron to look and use the main.js file
      // and the package.json located 1 level above.
      args: [path.join(__dirname, '..')]
    })
    return this.app.start()
  })

  after(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  })

  it('shows an initial window', function () {
    return this.app.client.getWindowCount().then(function (count) {
      assert.equal(count, 1)
      // Please note that getWindowCount() will return 2 if `dev tools` are opened.
      // assert.equal(count, 2)
    })
  })

  it('has a native coin list that takes <Tab>', function () {
    // Wait for the left button for native mode coins is visible
    this.app.client.element('#react-select-3--value').waitForVisible(3000)
    // Click on it and hit <Tab> to select the 1st - VerusCoin
    return this.app.client.element('#react-select-3--value').click().keys("Tab")
  })

  it('removes the coin selector', function() {
    return this.app.client.element('#react-select-3--value').waitForVisible(4000, true)
  })
})

