/**
 *
 * Get twitter statuses and then automatic convert date string to date type
 *
 */

var eve = require("../index.js")
	, type = eve.type
	, statuses = require("./fixtures/public_timeline.json");

var statusSchema = type.object({
	created_at: 
		type.date() 
	, user: {
		"profile_link_color": 
			type.string()
		, "created_at": 
			type.date()
	}
});


statuses = type.array( statusSchema ).val( statuses ).val();

statuses.forEach( function( status ) {
	console.log( typeof status.created_at );
} );

