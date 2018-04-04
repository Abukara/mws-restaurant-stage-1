/*
 After you have changed the settings at "Your code goes here",
 run this with one of these options:
  "grunt" alone creates a new, completed images directory
  "grunt clean" removes the images directory
  "grunt responsive_images" re-processes images without removing the old ones
*/

module.exports = function( grunt ) {

    grunt.initConfig( {
        responsive_images: {
            dev: {
                options: {
                    rename: false,
                    engine: 'im',
                    sizes: [ {

                            width: 380,
                            suffix: '_small',
                            quality: 35,


          },
          {
            width: 610,
            suffix: '_medium',
            quality: 48,


          },



                        {

                            width: 840,
                            suffix: "_large",
                            quality: 60,


          } ]
                },

                /*
                You don't need to change this part if you don't change
                the directory structure.
                */
                files: [ {
                    expand: true,
                    src: [ '*.{gif,jpg,png}' ],
                    cwd: 'img/',
                    dest: 'imge/'
        } ]
            }
        },

        /* Clear out the images directory if it exists */


        /* Generate the images directory if it is missing */
        mkdir: {
            dev: {
                options: {
                    create: [ 'img' ]
                },
            },
        },

        /* Copy the "fixed" images that don't go through processing into the images/directory */
        copy: {
            dev: {
                files: [ {
                    expand: true,
                    src: 'images_src/fixed/*.{gif,jpg,png}',
                    dest: 'images/'
        } ]
            },
        },
    } );

    grunt.loadNpmTasks('grunt-responsive-images');

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.registerTask('default', [ 'mkdir', 'responsive_images' ] );

};
