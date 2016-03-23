/**********************************************************
 * Copyright (c) SESHENGHUO.COM All rights reserved       *
 **********************************************************/

/**
 * AliasMethod
 * @charset utf-8
 * @author lijun
 * @git: https://github.com/zwlijun/se.lib
 * @date 2014.7
 */
;define(function AM(require, exports, module){

    require("mod/polyfill/array");

    /**
     * File: aliasmethod.js
     * Original Algorithm: Keith Schwarz (htiek@cs.stanford.edu)
     * Ported to Javascript by: jdiscar (j.discar+github@gmail.com)
     * 
     * TLDR: Simulates rolling a n-sided loaded dice.
     *
     * Full Description:
     *  An implementation of the alias method implemented using Vose's algorithm.
     *  The alias method allows for efficient sampling of random values from a
     *  discrete probability distribution in O(1) time each, after a one-time 
     *  O(n) preprocessing time.
     *
     *  For a complete writeup on the alias method, including the intuition and
     *  important proofs, please see the article "Darts, Dice, and Coins- Sampling
     *  from a Discrete Distribution" at: http://www.keithschwarz.com/darts-dice-coins/
     *
     *
     * Sample Use:
     *   var generator = new AliasMethod([.1, .2, .3, .4]);
     *   var chosenIndex1 = generator.next();
     *   var chosenIndex2 = generator.next();
     **/

    var AliasMethod = function(probabilities){
        this.probabilityLength = 0;
        this.probability = [];
        this.alias = [];

        this.init(probabilities);
    };

    AliasMethod.prototype = {
        /**
         * Get a random number between @min and @max
         * Assume parameters are correct.
         */
        getRandomInt : function(min, max){
            return Math.floor(Math.random() * (max - min + 1) + min);
        },
        /**
         * Scales an array of numbers to add up to one.
         * Assume parameters are correct.
         * @probabilities - An array of probabilities
         */
        scale : function(probabilities){
            var total = probabilities.reduce(function(a,b) {return a+b;}); 

            if (total > 1 ) {
                // Divide every element by the total
                probabilities = probabilities.map(function(val){return val / total});
            } else if( total < 1 ) {
                // Add a final element so the total is one
                probabilities.push(1 - total);
            }

            return probabilities;
        },
        /**
         * O(n) time to build the probability/alias tables out of the given probabilities.
         * If the given probabilities do not add up to one, the array will be automatically
         * scaled to add up to one.  So [10,20,30,40] will become [.1,.2,.3,.4], 
         * [10,10] will become [.5,.5], and [.1,.2,.3] will become [.1,.2,.3,0].
         * @probabilities - An array where each value is the probability of that index being chosen
         */
        init : function(probabilities){
            var average, small, large, i, less, more;

            // Probabilities should be defined
            if( probabilities === null ) {
                throw new Error("Undefined Probabilities Array");
            }

            // Cache important numbers
            this.probabilityLength = probabilities.length;
            average = 1.0 / this.probabilityLength;

            // There should be some probabilities
            if( this.probabilityLength <= 0 ) {
                throw new Error("Empty probabilities array");
            }

            // Probabilities should be all numeric
            for ( i = 0; i < this.probabilityLength; i++ ) {
                if(isNaN(parseFloat(probabilities[i])) || !isFinite(probabilities[i])) {
                    throw new Error("All elements in probabilities array must be numeric");
                }
            }

            // Make a copy of the probabilities list so that we can modify it in place
            // Shallow clone is okay since we are only holding numbers
            probabilities = probabilities.slice(0);

            // Ensure the probabilities add up to one
            probabilities = this.scale(probabilities);

            this.probability = [];
            this.alias = [];

            // Create two stacks to act as worklists as we populate the tables.
            small = [];
            large = [];

            // Populate the stacks with the input probabilities indexes.
            // If the probability is below the average probability, 
            // then we add it to the small list.  Otherwise, we add
            // it to the large list.
            for ( i = 0; i < probabilities.length; i++ ) {
                probabilities[i] >= average ? large.push(i) : small.push(i);
            }

            // Process probabilities until one stack is empty
            while( small.length > 0 && large.length > 0 ) {
                less = small.shift();
                more = large.shift();

                // Scale up probabilities such that 1/n is given weight 1.0
                this.probability[less] = probabilities[less] * this.probabilityLength;
                this.alias[less] = more;

                // Decrease the probability of the large one by the appropriate amount
                probabilities[more] = (probabilities[more] + probabilities[less]) - average;

                // Push the new probability onto the correct list
                probabilities[more] >= average ? large.push(more) : small.push(more);
            }

            // At this point, everything is in one list, which means that the remaining probabilities
            // should all be 1/n, so set them to 1.  We can't be sure which stack will hold the entries, 
            // so we empty both.
            while (large.length !== 0) {
                this.probability[large.shift()] = 1;
            }

            while (small.length !== 0) {
                this.probability[small.shift()] = 1;
            }
        },
        /**
         * Get the next random index.
         */
        next : function(){
            var column, coinToss;

            // Generate a fair die roll to determine which column to inspect
            column = this.getRandomInt(0, this.probabilityLength-1);

            // Generate a biased coin toss to determine which option to pick
            coinToss = Math.random() < this.probability[column];

            return coinToss ? column : this.alias[column];
        }
    };

    module.exports = function(probabilities){
        var am = new AliasMethod(probabilities);

        return {
            "next": function(){
                return am.next();
            }
        };
    };
});