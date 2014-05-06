// Dependencies
var path = require( 'path' ),
    stream = require( 'stream' ),
    fs = require( 'fs' ),
    _ = require( 'underscore' ),
    CombinedStream = require( 'combined-stream' );

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
  var normalisedCollection = [],
      assetDefaults;

  assetDefaults = {
    wrap: {
      start: '',
      end: ''
    }
  };

  _.each( items, function ( item, index ) {
    var normalised = {
      assets: []
    };

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
        return _.extend( {}, assetDefaults, {
          path: asset
        } );
      } else {
        return _.extend( {}, assetDefaults, asset );
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
 * Create and pipe concat stream
 */
var concatFiles = function concatFiles ( assets, done ) {
  var basePath = this.config.basePath || '',
      suffix = this.config.suffix || '',
      concatStream = CombinedStream.create();

  _.each( assets, function ( asset, index ) {
    var fileStream = fs.createReadStream( path.join( basePath, asset.path + suffix ) ),
        wrapStartStream = new stream.Readable(),
        wrapEndStream = new stream.Readable();

    wrapStartStream._read = noop;
    wrapEndStream._read = noop;

    // Append streams
    concatStream.append( wrapStartStream );
    concatStream.append( fileStream );
    concatStream.append( wrapEndStream );

    // Add wrap start
    if ( asset.wrap.start.length ) {
      wrapStartStream.push( asset.wrap.start + '\n' );
    }
    wrapStartStream.push( null );

    // Add wrap end on fileStream 'end' event
    fileStream.on( 'end', function () {
      wrapEndStream.push( '\n' );
      if ( asset.wrap.end.length ) {
        wrapEndStream.push( asset.wrap.end );
        wrapEndStream.push( '\n' );
      }
      wrapEndStream.push( null );
    } );

  } );

  // Callback
  done( null, concatStream );

  // TODO: write file to disk and cache as query string

};

/**
 * Check cache
 */
var checkCache = function checkCache () {

};

/**
 * No-op
 */
var noop = function noop () {};

// Exports
module.exports = Care;
