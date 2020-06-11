const express = require("express");
const morgan = require('morgan');
const cors = require('cors')
const fs = require('fs');
const app = express();
const bodyParser = require('body-parser');


app.use(morgan("dev"));
app.use(cors());
// creating and assigning a router
const highScoreRouter = express.Router();
const sentenceRouter = express.Router();
app.use("/highScores", highScoreRouter);
app.use("/sentences", sentenceRouter);


// request handling with a router
highScoreRouter.get("/", (req, res, next) => {
	const highScores = require("./highScores.json");
	res.status(200).json(highScores);
});

highScoreRouter.put("/newHighScore", bodyParser.json(), (req, res, next) => {
	const newScore = req.body;
	const highScores = require("./highScores.json");
	highScores.players.push(newScore);
	highScores.players.sort( (playerA, playerB) => {
		if ( playerA.score > playerB.score ) return -1;
		if ( playerA.score < playerB.score ) return 1;
		return 0;
	})
	highScores.players.pop();
	const highScoresAsData = JSON.stringify(highScores);
	fs.writeFileSync('./highScores.json', highScoresAsData);
	res.status(201).send(newScore);
});

sentenceRouter.get("/", (req, res, next) => {
	const sentences = require("./sentences.json");
	res.status(200).json(sentences);
});

sentenceRouter.post("/", bodyParser.json(), (req, res, next) => {
	const newSentence = req.body;
	const pendingSentences = require("./pendingSentences.json");
	console.log(" new sentence obj looks like ", newSentence);
	pendingSentences.array.push(newSentence);
	const pendingSentencesAsData = JSON.stringify(pendingSentences);
	fs.writeFileSync('./pendingSentences.json', pendingSentencesAsData);
	res.status(201).send(newSentence);
});

sentenceRouter.get("/validationList", (req, res, next) => {
	const sentences = require("./pendingSentences.json");
	res.status(200).json(sentences);
});

sentenceRouter.put("/validationList/add", (req, res, next) => {
	const pendingSentences = require("./pendingSentences.json");
	const sentenceToAdd = pendingSentences.array[pendingSentences.array.length - 1];
	console.log("adding from validation to sentenc:", sentenceToAdd);
	const sentences = require("./sentences.json");
	sentences.array.push(sentenceToAdd);
	const sentencessAsData = JSON.stringify(sentences);
	fs.writeFileSync('./sentences.json', sentencessAsData);
	popLastSentence();
	res.status(201).send(sentenceToAdd);
});

sentenceRouter.delete('/validationList/delete', (req, res, next) => {
	popLastSentence();
	res.status(204).send();
  });

app.listen(process.env.PORT || 5000, () => {
	console.log(`Listening on port ${process.env.PORT} or 5000`);
});

function popLastSentence() {
	const pendingSentences = require("./pendingSentences.json");
	console.log(" deleting last sentence in list ");
	pendingSentences.array.pop();
	pendingSentencesAsData = JSON.stringify(pendingSentences);
	fs.writeFileSync('./pendingSentences.json', pendingSentencesAsData);
}