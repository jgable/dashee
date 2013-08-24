Dashee
======

A Dashboard framework for Node.js

## Getting Started

```javascript
// > Install modules via > npm install dashee dashee-theme-default dashee-block-stocks dashee-block-twitter --save
// Get the dashee module
var dashee = require("dashee"),
	// Make a configuration
	config = {
		// Set the theme
		// Can be an npm module or path to custom theme
		theme: "dashee-theme-default",

		// Declare your blocks
		blocks: {
			// Standard npm module blocks
			"dashee-block-stocks": {
				symbol: ["FB"]
			},
			// Multiple instances by passing an array
			"dashee-block-twitter": [{
				handle: ["jacob4u2"]
			}, {
				handle: ["sproutsocial"]
			}],
			// Custom module path
			"./blocks/api-status": {
				endpoint: "billing"
			}
		}
	};

// Load the server
dashee.load(function (err, loaded) {
	console.log("Now running!");
});
```

## Custom Themes

Themes have the following structure and extend a common base theme module available in `dashee-core`.

**TODO**

## Custom Blocks

In addition to the blocks available from the community via npm, you can create your own custom blocks.

**TODO**

## Custom Services

We have a number of common base services for things like sending static data, watching a file for changes, polling a web site/service or responding to web posts from other services.

**TODO**