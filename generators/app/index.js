'use strict'
const Generator = require('yeoman-generator')
const chalk = require('chalk')
const yosay = require('yosay')
const prettyData = require('gulp-pretty-data')
const stripBom = require('gulp-stripbom')

module.exports = class extends Generator {
  initializing () {
    this.props = {}
  }

  prompting () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the stupendous ' + chalk.blue('exist-app') + ' generator!'
    ))

    const prompts = [{
      type: 'input',
      name: 'title',
      message: 'What would you like to call your exist-db application?',
      default: this.appname.toLowerCase(), // Defaults to current folder name
      validate: value => {
        const invalid = value.includes(' ')
        if (invalid) {
          return 'Please avoid spaces'
        }
        return true
      },
      required: true
    },
    {
      type: 'input',
      name: 'short',
      message: 'How should I abbreviate that?',
      default: response => {
        const short = response.title

        if (short.length > 6) {
          return short.substring(0, 6)
        }
        return short
      },
      required: true
    },
    {
      type: 'input',
      name: 'desc',
      message: 'Please add a short description?',
      default: response => { return 'My amazing ' + response.title + ' application' },
      required: true
    },
    {
      type: 'list',
      name: 'apptype',
      message: 'Pick an app template:',
      default: 0, // Aka 'exist-design'
      choices: [{
        name: 'exist-design',
        value: ['exist-design', 'application']
      },
      {
        name: 'plain',
        value: ['plain', 'application']
      },
      {
        name: 'empty',
        value: ['empty', 'application']
      },
      {
        name: 'library',
        value: ['empty', 'library']
      }]
    },
    // TODO: [yo] Make these options meaningful
    // {
    //   type: 'checkbox',
    //   choices: ['ant', 'gulp', 'maven', 'gradle'],
    //   name: 'builder',
    //   message: 'How would you like to build your app?',
    //   default: 'ant'
    // },
    {
      when: response => {
        return response.apptype[1] === 'application'
      },
      type: 'confirm',
      name: 'mysec',
      message: 'should your app have a secure area?',
      default: false,
      store: true
    },

    // Path related
    {
      when: response => {
        return response.apptype[1] === 'application'
      },
      type: 'input',
      name: 'defcoll',
      message: 'Will your application be deployed in the apps collection? (hit return for yes)',
      default: 'apps',
      required: true
    },
    {
      type: 'input',
      name: 'defuri',
      message: 'What should your module namespace begin with?',
      default: 'http://exist-db.org',
      validate: value => {
        if (encodeURI(value) === value) {
          return true
        }
        return 'Please select a valid URI'
      }
    },
    {
      type: 'input',
      name: 'version',
      message: 'Pick a version number?',
      default: '1.0.0'
    },
    {
      type: 'list',
      choices: ['alpha', 'beta', 'stable', 'SNAPSHOT'],
      name: 'status',
      message: 'Pick the release status',
      default: 'SNAPSHOT'
    },
    // TODO: [teipup] autoanswer pre,post, setperm, (license?) see#
    {
      type: 'confirm',
      name: 'pre',
      message: 'Would you like to generate a pre-install script?',
      default: true
    },
    {
      type: 'confirm',
      name: 'post',
      message: 'Would you like to generate a post-install script?',
      default: 'post-install.xq'
    },
    // TODO multi authors see #41
    {
      type: 'input',
      name: 'author',
      message: 'Who is the author of the application?',
      default: this.appauthor,
      store: true
    },
    {
      type: 'input',
      name: 'email',
      message: 'What is your email address?',
      default: this.appemail,
      validate: value => {
        const pass = value.match(/^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i)
        if (pass) {
          return true
        }
        return 'Please provide a valid email address'
      },
      store: true
    },
    {
      type: 'input',
      name: 'website',
      message: 'What is the author\'s website?',
      default: 'http://exist-db.org',
      store: true
    },
    {
      type: 'list',
      name: 'license',
      message: 'Please pick a license',
      default: 2, // Aka AGPL-3.0
      choices: [{
        name: 'Apache-2.0',
        value: ['Apache-2.0', 'Apache%202.0', 'https://opensource.org/licenses/Apache-2.0']
      }, {
        name: 'MIT',
        value: ['MIT', 'MIT', 'https://opensource.org/licenses/MIT']
      }, {
        name: 'AGPL-3.0',
        value: ['AGPL-3.0', 'AGPL%20v3', 'https://www.gnu.org/licenses/agpl-3.0']
      }, {
        name: 'LGPL-3.0',
        value: ['LGPL-3.0', 'LGPL%20v3', 'https://www.gnu.org/licenses/lgpl-3.0']
      }, {
        name: 'GPL-3.0',
        value: ['GPL-3.0', 'GPL%20v3', 'https://www.gnu.org/licenses/gpl-3.0']
      }, {
        name: 'unlicense',
        value: ['unlicense', 'unlicense', 'https://choosealicense.com/licenses/unlicense/']
      }]
    },
    // See #601
    {
      type: 'confirm',
      name: 'github',
      message: 'Will you host your code on GitHub?',
      default: true,
      store: true
    },
    {
      when: response => {
        return response.github
      },
      type: 'input',
      name: 'ghuser',
      message: 'What is your GitHub username?',
      default: this.appuser,
      store: true
    },
    {
      type: 'confirm',
      name: 'setperm',
      message: 'Would you like to assign db user roles and permissions for your app?',
      default: false
    },
    {
      when: response => {
        return response.setperm
      },
      type: 'input',
      name: 'owner',
      message: 'What is the owner\'s username?',
      default: 'tei'
    },
    {
      when: response => {
        return response.setperm
      },
      type: 'password',
      name: 'userpw',
      message: 'Please type the user\'s password',
      default: 'simple'
    },
    {
      when: response => {
        return response.setperm
      },
      type: 'input',
      name: 'group',
      message: 'What is the app owner\'s usergroup?',
      default: response => { return response.owner }
    },
    {
      when: response => {
        return response.setperm
      },
      type: 'input',
      name: 'mode',
      message: 'Please select the user\'s permissions',
      default: 'rw-rw-r--',
      validate: value => {
        const pass = value.match(/^[rwx-]{9}$/g)
        if (pass) {
          return true
        }
        return 'Must be a string of 9 unix permission flags (rwx-)'
      }
    },
    {
      type: 'list',
      choices: ['travis', 'GitHub Action'],
      name: 'ci',
      message: 'Whats your CI service',
      default: 'GitHub Action',
      store: true
    },
    {
      type: 'confirm',
      name: 'docker',
      message: 'Would you like to use docker for your app?',
      default: true,
      store: true
    },
    {
      when: response => {
        return response.docker
      },
      type: 'input',
      name: 'dockertag',
      message: 'Please type the docker tag you wish to use for your container.',
      default: 'release',
      store: true
    },
    // TODO add multi-stage option
    {
      type: 'confirm',
      name: 'atom',
      message: 'Would you like to add a' + chalk.grey('.existdb.json') + 'IDE config file for:' + chalk.green('atom') + ' or ' + chalk.magenta('vs-code') + '?',
      default: true,
      store: true
    },
    {
      when: response => {
        return response.atom
      },
      type: 'input',
      name: 'instance',
      message: 'What is the ' + chalk.blue('eXist') + ' instance\'s URI?',
      default: 'http://localhost:8080/exist',
      store: true
    },
    {
      when: response => {
        return response.atom
      },
      type: 'input',
      name: 'admin',
      message: 'What is user-name of the admin user?',
      default: 'admin',
      store: true
    },
    {
      when: response => {
        return response.atom
      },
      type: 'password',
      name: 'adminpw',
      message: 'What is the admin user\'s password',
      store: true
    }]

    // TODO: [yo]: js, css, gulp, funcdoc,
    // TODO: [gulp] https://github.com/bnjjj/generator-gulpfile-advanced

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props
      this.composeWith(require.resolve('generator-license'), {
        name: this.props.author, // (optional) Owner's name
        email: this.props.email, // (optional) Owner's email
        website: this.props.website, // (optional) Owner's website
        year: (new Date()).getFullYear(), // (optional) License year (defaults to current year)
        licensePrompt: 'Pick a license, default (AGPL-3.0)', // (optional) customize license prompt text
        defaultLicense: 'AGPL-3.0', // (optional) Select a default license
        license: this.props.license[0] // (optional) Select a license, so no license prompt will happen, in case you want to handle it outside of this generator
      })
      if (this.props.name) {
        this.props.elementClassName = this.props.name.replace(/(^|-)(\w)/g, (_match, _p0, p1) => p1.toUpperCase())
      }
    })
  }

  writing () {
    // try to clean invalid xml from streams
    this.registerTransformStream(
      stripBom({
        ext: ['xml', 'odd', 'xconf'],
        showLog: false
      }))
    // minify xml first …
    this.registerTransformStream(prettyData({
      type: 'minify',
      preserveComments: true,
      extensions: {
        xconf: 'xml',
        odd: 'xml'
      }
    }))
    // … then pretty print xml
    this.registerTransformStream(prettyData({
      type: 'prettify',
      extensions: {
        xconf: 'xml',
        odd: 'xml'
      }
    }))
    // global pkgJson
    const pkgJson = {
      name: this.props.title.toLowerCase(),
      version: this.props.version,
      description: this.props.desc,
      homepage: '',
      bugs: '',
      engines: {
        node: '>=14.0.0'
      },
      keywords: ['exist', 'exist-db', 'xml', 'xql', 'xquery'],
      author: {
        name: this.props.author,
        email: this.props.email
      },
      license: this.props.license[0],
      scripts: {
        test: 'mocha test/mocha/ --recursive --exit && mocha test/xqs/*.js'
      },
      repository: ''
    }
    this.env.options.nodePackageManager = 'npm'
    // see https://github.com/yeoman/generator/issues/1294
    this.npmInstall(['chai'], { 'save-dev': true })
    this.npmInstall(['chai-xml'], { 'save-dev': true })
    this.npmInstall(['fs-extra'], { 'save-dev': true })
    this.npmInstall(['mocha'], { 'save-dev': true })
    this.npmInstall(['supertest'], { 'save-dev': true })
    this.npmInstall(['xmldoc'], { 'save-dev': true })
    this.npmInstall(['yeoman-assert'], { 'save-dev': true })
    // Applies to all (without prompts)
    // TODO #56 html -> xhtml

    // EXPATH
    this.fs.copyTpl(
      this.templatePath('build.xml'),
      this.destinationPath('build.xml'), {
        apptype: this.props.apptype[0],
        title: this.props.title,
        github: this.props.github,
        desc: this.props.desc,
        docker: this.props.docker,
        dockerfiles: ', Dockerfile, .dockerignore',
        gitfiles: ', README.md, **/.git*/**'
      })

    this.fs.copyTpl(
      this.templatePath('repo.xml'),
      this.destinationPath('repo.xml'), {
        desc: this.props.desc,
        short: this.props.short,
        author: this.props.author,
        apptype: this.props.apptype[1],
        status: this.props.status,
        pre: this.props.pre,
        prexq: 'pre-install.xq',
        post: this.props.post,
        postxq: 'post-install.xq',
        setperm: this.props.setperm,
        website: this.props.website,
        license: this.props.license[0],
        owner: this.props.owner,
        userpw: this.props.userpw,
        group: this.props.group,
        mode: this.props.mode
      })

    this.fs.copyTpl(
      this.templatePath('expath-pkg.xml'),
      this.destinationPath('expath-pkg.xml'), {
        short: this.props.short,
        defcoll: this.props.defcoll,
        defuri: this.props.defuri,
        version: this.props.version,
        desc: this.props.desc,
        apptype: this.props.apptype[0]
      })

    // Unit Test
    this.fs.copyTpl(
      this.templatePath('specs/xqs/test-suite.xqm'),
      this.destinationPath('test/xqs/test-suite.xqm'), {
        apptype: this.props.apptype[0],
        short: this.props.short,
        defcoll: this.props.defcoll,
        defuri: this.props.defuri,
        version: this.props.version,
        author: this.props.author,
        website: this.props.website,
        title: this.props.title
      })
    this.fs.copyTpl(
      this.templatePath('specs/xqs/test-runner.xq'),
      this.destinationPath('test/xqs/test-runner.xq'), {
        short: this.props.short,
        defcoll: this.props.defcoll,
        defuri: this.props.defuri,
        version: this.props.version,
        author: this.props.author,
        title: this.props.title
      })

    this.fs.copy(
      this.templatePath('specs/mocha/app_spec.js'),
      this.destinationPath('test/mocha/app_spec.js')
    )

    this.fs.copyTpl(
      this.templatePath('specs/mocha/rest_spec.js'),
      this.destinationPath('test/mocha/rest_spec.js'), {
        apptype: this.props.apptype[0],
        short: this.props.short,
        defcoll: this.props.defcoll
      })

    this.fs.copyTpl(
      this.templatePath('specs/xqs/xqSuite.js'),
      this.destinationPath('test/xqs/xqSuite.js'), {
        apptype: this.props.apptype[1],
        short: this.props.short,
        defcoll: this.props.defcoll,
        version: this.props.version
      })

    // all application packages, …
    if (this.props.apptype[1] === 'application') {
      this.fs.copy(
        this.templatePath('img/icon.png'),
        this.destinationPath('icon.png')
      )
      this.fs.copy(
        this.templatePath('specs/cypress/'),
        this.destinationPath('test/cypress/')
      )

      this.fs.copy(
        this.templatePath('specs/cypress.config.js'),
        this.destinationPath('cypress.config.js')
      )

      this.fs.copy(
        this.templatePath('github/.gitkeep'),
        this.destinationPath('reports/screenshots/.gitkeep')
      )

      this.fs.copy(
        this.templatePath('github/.gitkeep'),
        this.destinationPath('reports/videos/.gitkeep')
      )

      this.fs.copyTpl(
        this.templatePath('specs/e2e/landing.cy.js'),
        this.destinationPath('test/cypress/e2e/landing.cy.js'), {
          apptype: this.props.apptype[0],
          short: this.props.short,
          defcoll: this.props.defcoll,
          desc: this.props.desc,
          mysec: this.props.mysec
        })

      this.npmInstall(['cypress'], { 'save-dev': true })

      Object.assign(pkgJson.scripts, {
        cypress: 'cypress run'
      })
    }
    // … except empty (flexible)
    if (this.props.apptype[0] !== 'empty') {
      this.fs.copyTpl(
        this.templatePath('pages/error-page.html'),
        this.destinationPath('error-page.html'), {
          apptype: this.props.apptype[0]
        })

      this.fs.copyTpl(
        this.templatePath('pages/index.html'),
        this.destinationPath('index.html'), {
          apptype: this.props.apptype[0]
        })
      this.fs.copyTpl(
        this.templatePath('styles/style.css'),
        this.destinationPath('resources/css/style.css'), {
          apptype: this.props.apptype[0]
        })

      this.fs.copyTpl(
        this.templatePath('collection.xconf'),
        this.destinationPath('collection.xconf'), {
          apptype: this.props.apptype[0],
          index: this.props.index
        })

      // XQuery
      this.fs.copyTpl(
        this.templatePath('xq/controller.xq'),
        this.destinationPath('controller.xq'), {
          apptype: this.props.apptype[0],
          mysec: this.props.mysec
        })

      this.fs.copyTpl(
        this.templatePath('xq/view.xq'),
        this.destinationPath('modules/view.xq'), {
          short: this.props.short,
          defcoll: this.props.defcoll,
          defuri: this.props.defuri,
          apptype: this.props.apptype[0],
          version: this.props.version
        })
      this.fs.copyTpl(
        this.templatePath('xq/app.xqm'),
        this.destinationPath('modules/app.xqm'), {
          short: this.props.short,
          defcoll: this.props.defcoll,
          defuri: this.props.defuri,
          apptype: this.props.apptype[0],
          version: this.props.version,
          author: this.props.author,
          website: this.props.website,
          title: this.props.title,
          mysec: this.props.mysec
        })
      this.fs.copyTpl(
        this.templatePath('xq/config.xqm'),
        this.destinationPath('modules/config.xqm'), {
          short: this.props.short,
          defcoll: this.props.defcoll,
          defuri: this.props.defuri,
          apptype: this.props.apptype[0],
          defview: this.props.defview,
          index: this.props.index,
          dataloc: this.props.dataloc,
          datasrc: this.props.datasrc,
          odd: this.props.odd
        })

      // #36 shared-resources
      this.fs.copy(
        this.templatePath('img/exist_icon_16x16.ico'),
        this.destinationPath('resources/images/exist_icon_16x16.ico')
      )
      this.fs.copy(
        this.templatePath('img/powered-by.svg'),
        this.destinationPath('resources/images/powered-by.svg')
      )

      this.npmInstall(['bootstrap@5'])

      // distinct contents (flexible)
      // see #28
      switch (this.props.apptype[0]) {
        case 'exist-design':
          this.fs.copyTpl(
            this.templatePath('pages/exist-design/page.html'),
            this.destinationPath('templates/page.html'), {
              title: this.props.title,
              mysec: this.props.mysec
            })
          this.fs.copy(
            this.templatePath('img/exist-design/**'),
            this.destinationPath('resources/images/')
          )
          // #36
          this.fs.copy(
            this.templatePath('styles/exist-2.2.css'),
            this.destinationPath('resources/css/exist-2.2.css')
          )
          break
        case 'plain':
          this.fs.copyTpl(
            this.templatePath('pages/plain/page.html'),
            this.destinationPath('templates/page.html'), {
              title: this.props.title,
              mysec: this.props.mysec
            })
          break
        default:
      }
    }

    // Prompt based
    // Pre-install
    if (this.props.pre) {
      this.fs.copyTpl(
        this.templatePath('xq/pre-install.xq'),
        this.destinationPath('pre-install.xq'), {
          version: this.props.version,
          author: this.props.author,
          website: this.props.website
        }
      )
    }
    // Post-install
    if (this.props.post) {
      this.fs.copyTpl(
        this.templatePath('xq/post-install.xq'),
        this.destinationPath('post-install.xq'), {
          apptype: this.props.apptype[0],
          version: this.props.version,
          author: this.props.author,
          website: this.props.website
        })
    }

    // Secure area (mysec)
    if (this.props.mysec) {
      this.fs.copy(
        this.templatePath('pages/mysec/admin/*.html'),
        this.destinationPath('admin/')
      )
      this.fs.copy(
        this.templatePath('xq/admin/**'),
        this.destinationPath('admin/')
      )
      this.fs.copy(
        this.templatePath('pages/mysec/templates/*.html'),
        this.destinationPath('templates/')
      )
      this.fs.copyTpl(
        this.templatePath('specs/e2e/login-*.cy.js'),
        this.destinationPath('test/cypress/e2e/'), {
          defcoll: this.props.defcoll,
          short: this.props.short
        })
    }

    // Github
    // TODO #601
    if (this.props.github) {
      this.fs.copy(
        this.templatePath('github/__gitignore__'),
        this.destinationPath('.gitignore')
      )
      // Is this needed how so?
      this.fs.copy(
        this.templatePath('github/.gitattributes'),
        this.destinationPath('.gitattributes')
      )
      this.fs.copy(
        this.templatePath('github/feature_request.md'),
        this.destinationPath('.github/ISSUE_TEMPLATE/feature_request.md')
      )
      this.fs.copy(
        this.templatePath('github/PULL_REQUEST_TEMPLATE.md'),
        this.destinationPath('.github/pull_request_template.md')
      )
      // Git-flex
      this.fs.copyTpl(
        this.templatePath('github/readme.md'),
        this.destinationPath('README.md'), {
          apptype: this.props.apptype[0],
          title: this.props.title,
          desc: this.props.desc,
          version: this.props.version,
          ghuser: this.props.ghuser,
          website: this.props.website,
          author: this.props.author,
          license: this.props.license[0],
          badge: this.props.license[1],
          badgelink: this.props.license[2],
          ci: this.props.ci
        })
      this.fs.copyTpl(
        this.templatePath('github/contributing.md'),
        this.destinationPath('.github/CONTRIBUTING.md'), {
          title: this.props.title
        })
      this.fs.copyTpl(
        this.templatePath('github/ISSUE_TEMPLATE.md'),
        this.destinationPath('.github/ISSUE_TEMPLATE/bug_report.md'), {
          title: this.props.title
        })
      // insert responses into pkgJson
      Object.assign(pkgJson, {
        homepage: 'https://github.com/' + this.props.ghuser + '/' + this.props.title.toLowerCase() + '#readme'
      }, {
        bugs: 'https://github.com/' + this.props.ghuser + '/' + this.props.title.toLowerCase() + '/issues'
      }, {
        repository: {
          type: 'git',
          url: 'https://github.com/' + this.props.ghuser + '/' + this.props.title.toLowerCase(),
          license: this.props.license[0]
        }
      })
    }

    // DOCKER
    if (this.props.docker) {
      this.fs.copy(
        this.templatePath('.dockerignore'),
        this.destinationPath('.dockerignore')
      )
      this.fs.copyTpl(
        this.templatePath('Dockerfile'),
        this.destinationPath('Dockerfile'), {
          dockertag: this.props.dockertag,
          title: this.props.title,
          version: this.props.version
        })
    }

    // Atom
    if (this.props.atom) {
      this.fs.copyTpl(
        this.templatePath('.existdb.json'),
        this.destinationPath('.existdb.json'), {
          short: this.props.short,
          defcoll: this.props.defcoll,
          instance: this.props.instance,
          admin: this.props.admin,
          adminpw: this.props.adminpw
        })
    }

    // CI
    switch (this.props.ci) {
      case 'travis':
        this.fs.copyTpl(
          this.templatePath('ci/.travis.yml'),
          this.destinationPath('.travis.yml'), {
            apptype: this.props.apptype[1]
          })
        break
      default:
        this.fs.copyTpl(
          this.templatePath('ci/exist.yml'),
          this.destinationPath('.github/workflows/exist.yml'), {
            apptype: this.props.apptype[1]
          }
        )
    }

    // Write the constructed pkgJson
    this.fs.writeJSON(this.destinationPath('package.json'), pkgJson)
  }

  install () {
    this.npmInstall()
  }

  end () {
    if (this.props.github) {
      this.spawnCommandSync('git', ['init'])
      this.spawnCommandSync('git', ['add', '--all'])
      this.spawnCommandSync('git', ['commit', '-q', '-m', '\'chore(init): scaffolding by Yeoman\''])
    }
    this.spawnCommandSync('ant', '-q')

    console.log(yosay('I believe we\'re done here.'))
  }
}
