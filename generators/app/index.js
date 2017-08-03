'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the stupendous ' + chalk.blue('exist-app') + ' generator!'
    ));

    const prompts = [
    //   {
    //   type: 'list',
    //   choices: ['exist-design', 'plain', 'teipub', 'empty'],
    //   name: 'design',
    //   message: 'Which exist-db template would you like to use',
    //   default: 'exist-design'
    // },
    // {
    //   type: 'list',
    //   choices: ['application', 'library']
    //   name: 'applib',
    //   message: 'Will this be a webapp or a XQuery library?',
    //   default: 'application'
    // },
    {
      type: 'input',
      name: 'title',
      message: 'What would you like to call your exist-db application?',
      default: this.appname
    },{
      type: 'input',
      name: 'short',
      message: 'How should I abbreviate that?',
      default: 'None'
    },
    // {
    //   type: 'input',
    //   name: 'uri',
    //   message: 'please tell me the URI of your app',
    //   default: ['http://exist-db/apps/', 'this.props.short']
    // },
    {
      type: 'confirm',
      name: 'collection',
      message: 'will the application be deployed in the apps collection?',
      default: 'true'
    },
    // Version number comes from elsewhere
    // {
    //   type: 'input',
    //   name: 'version',
    //   message: 'what is the version number?'
    // },
    // {
    //   type: 'list',
    //   choices: ['alpha', 'beta', 'stable', ''],
    //   name: 'status',
    //   message: 'what is the release status of your app',
    //   default: ''
    // },{
    //   type: 'confirm',
    //   name: 'pre',
    //   message: 'Would you like a pre-install.xql?',
    //   default: 'true'
    // },{
    //   type: 'confirm',
    //   name: 'post',
    //   message: 'Would you like a post-install.xql?',
    //   default: 'false'
    // }
  ];

    // missing prompts: atom, ,js, css, git, gulp, funcdoc,
    // initiate and commit inside user git directory

    // Author, webpage and website from generator

    // permissions of app


    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    this.fs.copy(
      this.templatePath('exist-design/modules/**'),
      this.destinationPath('modules/')
    );
    this.fs.copy(
      this.templatePath('exist-design/resources/images/**'),
      this.destinationPath('resources/images/'),
    );
    this.fs.copy(
      this.templatePath('exist-design/collection.xconf'),
      this.destinationPath('collection.xconf')
    );

    // The basics: build, expath-pkg, and repo.
    this.fs.copyTpl(
      this.templatePath('build.xml'),
      this.destinationPath('build.xml'),
      {'title': this.props.title}
    );
    this.fs.copyTpl(
      this.templatePath('repo.xml'),
      this.destinationPath('repo.xml'),
      {'collection': this.props.collection}
    );
    this.fs.copyTpl(
      this.templatePath('expath-pkg.xml'),
      this.destinationPath('expath-pkg.xml'),
      {'short': this.props.short}
    );

    // html (with exist templating)
    this.fs.copyTpl(
      this.templatePath('exist-design/templates/page.html'),
      this.destinationPath('templates/page.html'),
      {'title': this.props.title}
    )
  }

  install() {
    this.installDependencies();
  }
};
