// Dependencies
var path = require( 'path' ),
    stream = require( 'stream' ),
    _ = require( 'underscore' ),
    async = require( 'async' ),
    Kat = require( 'kat' );

/**
 * Care constructor
 */
var Care = function Care ( config ) {

  this.config = _.extend( {}, config );
  this.items = normaliseItems( config.items );

  return this;
};

Care.prototype = {

  /**
   * Bundle
   */
  bundle: function bundle ( query, done ) {
    var normalisedQuery = normaliseQuery( query ),
        requiredAssets = filterRequiredAssets.call( this, normalisedQuery );

    // TODO: check cache with serialised normalised query

    // Concat files
    concatFiles.call( this, requiredAssets, function ( error, fileStream ) {
      if ( error ) { return done( error ); }
      done( null, fileStream );
    } );

  }

};

/**
 * Normalise config items from user-facing sugar
 */
var normaliseItems = function normaliseItems ( items ) {
  var normalisedCollection = [];

  _.each( items, function ( item, index ) {
    var normalised = {};

    if ( _.isString( item.yep ) ) {
      normalised.yep = [ item.yep ];
    } else {
      if ( _.isArray( item.yep ) ) {
        normalised.yep = item.yep;
      }
    }

    if ( _.isString( item.nope ) ) {
      normalised.nope = [ item.nope ];
    } else {
      if ( _.isArray( item.nope ) ) {
        normalised.nope = item.nope;
      }
    }

    normalised.assets = _.map( item.assets, function ( asset, index ) {
      if ( _.isString( asset ) ) {
        return {
          path: asset
        };
      } else {
        return asset;
      }
    } );

    normalisedCollection.push( normalised );

  } );

  return normalisedCollection;
};

/**
 * Normalise query types
 */
var normaliseQuery = function normaliseQuery ( query ) {
  var normalisedQuery = {};

  _.each( query, function ( value, key ) {

    if ( value === 'true' || value === '1' ) {
      normalisedQuery[ key ] = true;
    }

    if ( value === 'false' || value === '0' ) {
      normalisedQuery[ key ] = false;
    }

  } );

  return normalisedQuery;
};

/**
 * Filter array of required assets
 */
var filterRequiredAssets = function filterRequiredAssets ( query ) {
  var requiredAssets = [];

  // Loop through items
  _.each( this.items, function ( item, index ) {
    var include = false,
        conditionResults = [];

    // If item has no conditions, merge required assets and return early
    if ( !item.hasOwnProperty( 'yep' ) && !item.hasOwnProperty( 'nope' ) ) {
      requiredAssets = _.union( requiredAssets, item.assets );
      return;
    }

    // Check yep conditions
    if ( item.hasOwnProperty( 'yep' ) ) {

      conditionResults.push( _.every( item.yep, function ( yepCondition, index ) {
        if ( query.hasOwnProperty( yepCondition ) ) {
          return query[ yepCondition ];
        } else {
          return false;
        }
      } ) );

    }

    // Check nope conditions
    if ( item.hasOwnProperty( 'nope' ) ) {

      conditionResults.push( _.every( item.nope, function ( nopeCondition, index ) {
        if ( query.hasOwnProperty( nopeCondition ) ) {
          return !query[ nopeCondition ];
        } else {
          return false;
        }
      } ) );

    }

    // Merge required assets
    if ( _.every( conditionResults ) ) {
      requiredAssets = _.union( requiredAssets, item.assets );
    }

  } );

  return requiredAssets;
};

/**
 * Concatenate files
 */
var concatFiles = function concatFiles ( assets, done ) {
  var basePath = this.config.basePath || '',
      suffix = this.config.suffix || '',
      concatStream = new Kat(),
      i = 0;

  concatStream.on( 'start', function () {

    // Close wrap for previous file
    if ( assets[ i - 1 ] ) {
      if ( assets[ i - 1 ].wrap ) {
        if ( assets[ i - 1 ].wrap.end ) {
          concatStream.push( '\n' );
          concatStream.push( assets[ i - 1 ].wrap.end );
        }
      }
    }

    // Open wrap for current file
    if ( assets[ i ].wrap ) {
      if ( assets[ i ].wrap.start ) {
        concatStream.push( '\n' );
        concatStream.push( assets[ i ].wrap.start );
        if ( i === 0 ) {
          concatStream.push( '\n' );
        }
      }
    }

    if ( i > 0 ) {
      // Ensure line break before every file
      concatStream.push( '\n' );
    }

    // Iterate
    ++i;

  } );

  concatStream.on( 'files', function () {

    if ( assets[ i - 1 ] ) {
      if ( assets[ i - 1 ].wrap ) {
        if ( assets[ i - 1 ].wrap.end ) {
          concatStream.push( '\n' + assets[ i - 1 ].wrap.end );
        }
      }
    }

    // Final line break
    concatStream.push( '\n' );

  } );

  _.each( assets, function ( asset, index ) {
    concatStream.add( path.join( basePath, asset.path + suffix ) );
  } );

  // TODO: write file to disk and cache as query string

  done( null, concatStream );

};

/**
 * Check cache
 */
var checkCache = function checkCache () {

};

// Exports
module.exports = Care;
