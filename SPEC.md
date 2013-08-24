dashee
======

A dashboard framework for node.js

### The Goal

It should be easy to get started with dashee.

There should be a default theme (dashee-theme-default) and other themes should be available via npm or custom means.  You should be able to create custom themes using LESS, SASS, CoffeeScript, TypeScript and Handlebars, Jade, Haml.

There should be a community of blocks avaiable via npm, and you should be able to build your own custom blocks.

```javascript
// Get the module
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

### Dashee Application

Should start an express server with the appropriate routes and configuration.  Should initialize the NeDB connection.  Should initialize the configured theme.  Should require and initialize all the configured blocks.  Should compile/initialize all the blocks assets.

### Themes

Themes should be exposed as a module that can be required.  They should be able to register their own directories for serving CSS and Script; the directory files will be compiled using mincer automatically before the server starts.

### Blocks

Blocks should be exposed as a module that can be required.  They should be able to declare their own data services (polling, listening for posts, sockets, etc.) to be run in the background.  They should have access to persistence via a NeDB key/value store.  They should expose a template and any assets (CSS, JS) that they need loaded on the page.  They should be able to render themselves completely on the server and be sent down as part of the page on load.  They should listen for web socket data events and update themselves.

### Services

There should be base classes for common types of services including; polling, listening for posts, socket connections.  They should have access to persistence via a NeDB key/value store.  They should be based on EventEmitters.