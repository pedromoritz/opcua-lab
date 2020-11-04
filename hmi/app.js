const express = require("express");
const port = 8080;

(async () => {
    try {

        const app = express();
        app.set('view engine', 'html');
        app.use(express.static(__dirname + '/'));
        app.set('views', __dirname + '/');
        app.get("/", function(req, res) {
            res.render('index.html');
        });

        app.use(express.static(__dirname + '/'));

        app.listen(port);

        console.log("Listening on port " + port);
        console.log("visit http://localhost:" + port);

        let running = true;
        process.on("SIGINT", async () => {
            if (!running) {
                return;
            }
            console.log("shutting down client");
            console.log("Done");
            process.exit(0);
        });
    } catch (err) {
        console.log(chalk.bgRed.white("Error" + err.message));
        console.log(err);
        process.exit(-1);
    }
})();
