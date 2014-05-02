// Dependencies
var _ = require( 'underscore' ),
    async = require( 'async' );

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

    console.log( 'QUERY\n' );
    console.log( JSON.stringify( normalisedQuery, null, 2 ) );
    console.log( '\n' );

    console.log( 'REQUIRED\n' );
    console.log( JSON.stringify( requiredAssets, null, 2 ) );
    console.log( '\n' );

    // TODO: concat files

    done( null, false );

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

    // If item has no conditions, include asset
    if ( !item.hasOwnProperty( 'yep' ) && !item.hasOwnProperty( 'nope' ) ) {
      requiredAssets = _.union( requiredAssets, item.assets );
      return;
    }

    // If item has yep conditions
    if ( item.hasOwnProperty( 'yep' ) ) {

      conditionResults.push( _.every( item.yep, function ( yepCondition, index ) {
        if ( query.hasOwnProperty( yepCondition ) ) {
          return query[ yepCondition ];
        } else {
          return false;
        }
      } ) );

    }

    // If item has nope conditions
    if ( item.hasOwnProperty( 'nope' ) ) {

      conditionResults.push( _.every( item.nope, function ( nopeCondition, index ) {
        if ( query.hasOwnProperty( nopeCondition ) ) {
          return !query[ nopeCondition ];
        } else {
          return false;
        }
      } ) );

    }

    console.log( 'item results', conditionResults );

    if ( _.every( conditionResults ) ) {
      requiredAssets = _.union( requiredAssets, item.assets );
    }

  } );

  return requiredAssets;
};

/**
 * Concatenate files
 */
var concatFiles = function concatFiles ( required, done ) {

  done( null, [] );

};

/**
 * Check cache
 */
var checkCache = function checkCache () {

};

// Exports
module.exports = Care;
