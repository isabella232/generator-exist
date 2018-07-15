'use strict'
const path = require('path')
const assert = require('yeoman-assert')
const chai = require('chai')
const expect = require('chai').expect
const chaiXml = require('chai-xml')
const helpers = require('yeoman-test')
const fs = require('fs-extra')
const glob = require('glob')
const xmldoc = require('xmldoc')

describe('eXide plain app', function () {
  before(function () {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({
        title: 'foo',
        author: 'tester',
        email: 'te@st.er',
        apptype: ['plain', 'application'],
        pre: false,
        post: false,
        setperm: false,
        github: false,
        atom: true
      })
      .then(function () {
        return assert.noFile(['resources/images/bold.gif', 'pre-install.xql'])
      })
  })

  describe('plain package has', function () {
    it('recommended files', function () {
      assert.file(['expath-pkg.xml', 'modules/config.xqm', 'modules/test-runner.xq', '.travis.yml'])
    })

    it('user specified uri for atom', function () {
      assert.fileContent('.existdb.json', 'http://localhost:8080/exist')
    })

    it('expanded title on index.html', function () {
      assert.fileContent('templates/page.html', 'foo')
    })
  })
  describe('markup well-formedness', function () {
    chai.use(chaiXml)
    it('html is xhtml', function () {
      let html = glob('**/*.html', {ignore: 'node_modules/**'}, function (err, files) {
        if (err) throw err
      })
      var i = 0

      while (html[i]) {
        let xhtml = fs.readFileSync(html[i], 'utf8')
        var hParsed = new xmldoc.XmlDocument(xhtml).toString()
        expect(hParsed).xml.to.be.valid()
        i++
      }
    })

    it('xml (and xconf)', function () {
      let xml = glob('**/*.xml', {ignore: 'node_modules/**'}, function (err, files) {
        if (err) throw err
      })
      var i = 0

      while (xml[i]) {
        let ml = fs.readFileSync(xml[i], 'utf8')
        var xParsed = new xmldoc.XmlDocument(ml).toString()
        expect(xParsed).xml.to.be.valid()
        i++
      }

      if (fs.existsSync('collection.xconf')) {
        let xconf = fs.readFileSync('collection.xconf', 'utf8')
        var cParsed = new xmldoc.XmlDocument(xconf).toString()
        expect(cParsed).xml.to.be.valid()
      }
    })
  })

  after('teardown', function () {
    fs.emptydirSync(process.cwd())
  })
})
