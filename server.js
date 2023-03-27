import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { join, dirname } from 'path';
import path from 'path';
import { fileURLToPath } from 'url';
import { Low, JSONFile } from 'lowdb';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbFile = join(__dirname, '/data/db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

const app = express();
app.use(cors());
app.use(express.json());
const port = 5889;

const staticDirectory = path.join(__dirname, './public');
app.use(express.static(staticDirectory));

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'public/uploadedFiles/');
	},
	filename: (req, file, cb) => {
		console.log('opt2', req.params.optionalFileName);

		cb(null, req.params.id + '.jpg');
	}
});
const upload = multer({ storage });

app.get('/fileitems', async (req, res) => {
	await db.read();
	res.send(db.data.fileItems);
});

app.post(
	'/uploadfile/:optionalFileName',
	upload.single('file'),
	async (req, res) => {
		await db.read();
		const fileName = req.body.fileName;
		let iconPathAndFileName = '';
		if (fileName.endsWith('.xlsx')) {
			iconPathAndFileName = 'uploadedFiles/general/iconExcel.png';
		} else if (fileName.endsWith('.json')) {
			iconPathAndFileName = 'uploadedFiles/general/iconJson.png';
		} else if (fileName.endsWith('.txt')) {
			iconPathAndFileName = 'uploadedFiles/general/iconText.png';
		} else {
			iconPathAndFileName = `uploadedFiles/${fileName}`;
		}
		console.log('opt1', req.params.optionalFileName);
		db.data.fileItems.push({
			title: req.body.title,
			description: req.body.description,
			notes: req.body.notes,
			fileName: req.body.fileName,
			iconPathAndFileName
		});
		await db.write();
		res.json({});
	}
);

app.listen(port, () => {
	console.log(`listening at http://localhost:${port}`);
});
