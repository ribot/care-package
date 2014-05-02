// Dependencies
var express = require( 'express' ),
    http = require( 'http' ),
    Care = require( '../' );

var app = express(),
    server = http.createServer( app ),
    router = new express.Router(),
    port = 9000;

// Middleware
app.use( router );

// JS care test instance
var jsCare = new Care( {
  basePath: './assets/js',
  suffix: '.js',
  items: [
    {
      assets: [
        'base'
      ]
    },
    {
      yep: 'smallScreen',
      assets: [
        'small',
        'small-menu'
      ]
    },
    {
      nope: 'smallScreen',
      assets: [
        'large',
        'large-menu'
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
  basePath: './assets/css',
  suffix: '.css',
  items: [
    {
      assets: [
        'base'
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
  basePath: './assets/css',
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

    if ( bundle.length ) {
      return response.sendFile( bundle );
    }

    if ( bundle === false ) {
      return response.send( 200, 'Testing JS' );
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

    if ( bundle.length ) {
      return response.sendFile( bundle );
    }

    if ( bundle === false ) {
      return response.send( 200, 'Testing CSS' );
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

    if ( bundle.length ) {
      return response.sendFile( bundle );
    }

    if ( bundle === false ) {
      return response.send( 200, 'Testing CSS' );
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
