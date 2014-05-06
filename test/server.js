// Dependencies
var path = require( 'path' ),
    express = require( 'express' ),
    http = require( 'http' ),
    _ = require( 'underscore' ),
    Care = require( '../' );

var app = express(),
    server = http.createServer( app ),
    router = new express.Router(),
    port = 9000;

// Middleware
app.use( router );

// JS care test instance
var jsCare = new Care( {
  basePath: path.join( __dirname, 'assets/js' ),
  suffix: '.js',
  items: [
    {
      assets: [
        'base',
        'some-lib'
      ]
    },
    {
      yep: 'smallScreen',
      assets: [
        'small'
      ]
    },
    {
      nope: 'smallScreen',
      assets: [
        'large'
      ]
    },
    {
      yep: [ 'geolocation', 'touch' ],
      assets: [
        'touch-map'
      ]
    },
    {
      yep: 'geolocation',
      nope: 'touch',
      assets: [
        'pointer-map'
      ]
    }
  ]
} );

// CSS care test instance
var cssCare = new Care( {
  basePath: path.join( __dirname, 'assets/css' ),
  suffix: '.css',
  items: [
    {
      assets: [
        'base',
        'build'
      ]
    },
    {
      yep: 'smallScreen',
      assets: [
        {
          path: 'small',
          wrap: {
            start: '@media only screen and (max-width: 767px) {',
            end: '}'
          }
        }
      ]
    }
  ]
} );

// Store care test instance
var cacheStoreCare = new Care( {
  basePath: path.join( __dirname, 'assets/css' ),
  suffix: '.css',
  store: '',
  conditions: [
    {
      assets: [
        'all',
        'small'
      ]
    }
  ]
} );

// JS route
router.get( '/js', function ( request, response, next ) {

  jsCare.bundle( request.query, function ( error, bundle ) {

    if ( error ) {
      return response.send( 500, error );
    }

    response.type( 'application/javascript' );

    if ( bundle.pipe && bundle.readable ) {
      return bundle.pipe( response );
    }

    if ( _.isString( bundle ) ) {
      return response.sendFile( bundle );
    }

  } );

} );

// CSS route
router.get( '/css', function ( request, response, next ) {

  cssCare.bundle( request.query, function ( error, bundle ) {

    if ( error ) {
      return response.send( 500, error );
    }

    response.type( 'text/css' );

    if ( bundle.pipe && bundle.readable ) {
      return bundle.pipe( response );
    }

    if ( _.isString( bundle ) ) {
      return response.sendFile( bundle );
    }

  } );

} );

// Cache route
router.get( '/cached', function ( request, response, next ) {

  cacheStoreCare.bundle( request.query, function ( error, bundle ) {

    if ( error ) {
      return response.send( 500, error );
    }

    response.type( 'text/css' );

    if ( bundle.pipe && bundle.readable ) {
      return bundle.pipe( response );
    }

    if ( _.isString( bundle ) ) {
      return response.sendFile( bundle );
    }

  } );

} );

// Start server
server.listen( port );
console.log( 'Care package test server running on port ' + port );

// Exports for testing
module.exports.jsCare = jsCare;
module.exports.cssCare = cssCare;
module.exports.cacheStoreCare = cacheStoreCare;
