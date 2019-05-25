//Constantes
const Twit = require('twit');
const fs = require('fs');
const download = require('download-file');
const fetch = require('node-fetch');
const BitLy = require('bit.ly');

//Arranque
const T = new Twit({
		consumer_key: process.env.consumerKey,
		consumer_secret: process.env.consumerSecret,
		access_token: process.env.accesstoken,
		access_token_secret: process.env.accesstokensecret,
});

var bl = new BitLy(process.env.userbit, process.env.bitly);

var tiempoEntreEnvio = 5400000/2;

var urla;
var extension = ".png";
var linkpost, enlacepostcorto;
console.log("FUNCIONANDO MEMES");
//-------------

mainprogram();
setInterval(mainprogram, tiempoEntreEnvio);

function mainprogram() {
	subr = ["memes", "me_irl", "dank_meme", "MinecraftMemes", "wholesomememes", "funny", "dankmemes"];
	let aleatoriosubr = Math.floor((Math.random() * subr.length));
	var enlaceFetch = "https://www.reddit.com/r/" + subr[aleatoriosubr] + "/random.json?limit=1";
	//console.log("REDDIT: " + subr[aleatoriosubr]);
	fetch(enlaceFetch)
	.then(res => res.json())
	.then(res => EnvioReddit(res, subr));
}

//Función de envio de contenido a Reddit después de la consulta
function EnvioReddit(res, subreddits) {
	//VARIABLES
	let urls,
	hint,
	isNSFW,
	isNSFWpost,
	over18;

	try {
		urls = res[0].data.children[0].data.url;
		hint = res[0].data.children[0].data.post_hint;
		isNSFW = res[0].data.children[0].data.parent_whitelist_status;
		isNSFWpost = res[0].data.children[0].data.whitelist_status;
		esover18 = res[0].data.children[0].data.over_18;
		linkpost = res[0].data.children[0].data.permalink;
	} catch (err) {
		console.log("ERROR: ENVÍO REDDIT");
	}

	//Si no se encuentra una imagen envia la de por defecto
	if ((hint != 'image')) {
		mainprogram();
		return;
	} else //Si es imagen miramos que no es NSFW y enviamos
	{

		if (isNSFW == undefined || isNSFW == null) {
			isNSFW = " ";
		}
		if (isNSFWpost == undefined || isNSFWpost == null) {
			isNSFWpost = " ";
		}

		if ((esover18 == true) || (isNSFW == 'promo_adult_nsfw') || (isNSFWpost.includes('nsfw'))) //Si es NSFW se envia otra imagen
		{
			//console.log("ERA NSFW SE VUELVE A BUSCAR");
			mainprogram();
			return;

		} else //Si está todo correcto se realiza el envío del post
		{
			urla = urls;

			//console.log("CONSULTA REDDIT: " + urls);
		}

	}

	descarga(); //Se descarga la imagen

}

//-----------------------------------------------------------------------------------------------

//Función que descarga la imagen
function descarga() {

	/*fs.unlink('/img/imagen.png/', (err) => {
	if (err)
	throw err;
	console.log('Imagen borrada correctamente.');
	});*/

	extension = urla.slice(-4);
	//console.log("Extensión: " + extension);

	var opcionimg = {
		directory: "./img/",
		filename: "imagen" + extension
	}

	download(urla, opcionimg, function (err) {
		if (err) {
		    return console.error("ERROR 1: " + err);
		} else
			enviar();
	})

}

//-----------------------------------------------------------------------------------------------

//Función que envia el Tweet

function enviar() {

	wait(15000);

	try {
		var b64content = fs.readFileSync("img/imagen" + extension, {
				encoding: 'base64'
			});
	} catch (err) {
	    return console.error("ERROR 2: " + err);
	}

	wait(15000);

	// first we must post the media to Twitter
	T.post('media/upload', {
		media_data: b64content
	}, function (err, data, response) {
		if (!err) {
			var mediaIdStr = data.media_id_string
				var altText = "Meme"
				var meta_params = {
				media_id: mediaIdStr,
				alt_text: {
					text: altText
				}
			}

			wait(15000);

			bl.shorten("http://sh.st/st/bb6c14a58d222943ff7e9f976095b38d/https://www.reddit.com" + linkpost, function (erroraso, res) {
			    if (erroraso)
			        return console.error(erroraso);
			    else {
			        console.log(res);
			        enlacepostcorto = res;
			    }

			});

            if(enlacepostcorto != undefined)
			T.post('media/metadata/create', meta_params, function (erro, data, response) {
				if (!erro) {



					var params = {
					    status: '#Meme #Memes \nReddit post: ' + enlacepostcorto,
						media_ids: [mediaIdStr]
					}

					T.post('statuses/update', params, function (error, data, response) {
						if (error)
						{
							//console.log("Meme enviado: " + urla);
						    return console.error("ERROR 4: " + error);
						}
					})
				}
				else
				    return console.error("ERROR 5: " + erro);
			})
		} else
			return console.error("ERROR 3: " + err);
	})

}
//-------------------------------------------------------
//Función de Esperar

function wait(ms) {
	var start = new Date().getTime();
	var end = start;
	while (end < start + ms) {
		end = new Date().getTime();
	}
}

//----------------------------------------
