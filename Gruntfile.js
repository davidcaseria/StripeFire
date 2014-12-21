'use strict';

module.exports = function (grunt) {
  // Show elapsed time at the end
  require('time-grunt')(grunt);
  // Load all grunt tasks
  require('load-grunt-tasks')(grunt);

  // Project configuration
  grunt.initConfig({
    nodeunit: {
      files: ['test/**/*_test.js']
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: ['lib/**/*.js']
      },
      test: {
        src: ['test/**/*.js']
      }
    },
    mochacli: {
      options: {
        reporter: 'nyan',
        bail: true
      },
      all: ['test/*.js']
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib: {
        files: '<%= jshint.lib.src %>',
        tasks: ['jshint:lib', 'mochacli']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'mochacli']
      }
    },
    bump: {
      options: {
        files: ['package.json'],
        updateConfigs: [],
        commit: true,
        commitMessage: 'release v%VERSION%',
        commitFiles: ['package.json', 'CHANGELOG.md'],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: '<a href="CHANGELOG.md#%VERSION%">CHANGELOG</a>',
        push: true,
        pushTo: 'origin',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
        globalReplace: false
      }
    },
    changelog: {
      options: {}
    }
  });

  // Default task
  grunt.registerTask('default', ['jshint', 'mochacli']);
  
  // Release tasks
  grunt.registerTask('release', ['bump-only', 'changelog', 'bump-commit']);
  grunt.registerTask('release:patch', ['bump-only', 'changelog', 'bump-commit']);
  grunt.registerTask('release:minor', ['bump-only:minor', 'changelog', 'bump-commit']);
  grunt.registerTask('release:major', ['bump-only:major', 'changelog', 'bump-commit']);
};