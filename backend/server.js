require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const port = process.env.PORT || 5000;

async function startServer() {
	await connectDB();
	app.listen(port, () => {
		console.log(`Server listening on port ${port}`);
	});
}

startServer().catch((error) => {
	console.error(`Server startup failed: ${error.message}`);
	process.exit(1);
});
