
/*
This is where we load the files. The files module has a getFile function that returns a
Promise resolved when the model has loaded. Model loading is done in a loader, to limit
rendering stuttering as much as possible.
*/

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { json } from "../json.js";

const museum = '../assets/museum.glb';

// TODO: find a better way to import URLs and build the dist folder, as this method
// will quickly get out of hands.

const doubleHeadSculpt = "../../assets/puzzles/double-head-sculpt/double-head-sculpt.glb";
const paintedTrash = "../../assets/puzzles/painted-trash/painted-trash.glb";
const mexicoGraffiti = "../../assets/puzzles/mexico-graffiti/mexico-graffiti.glb";
const louviersCastle = "../../assets/puzzles/louviers-castle/louviers-castle.glb";
const seatedCupid = "../../assets/puzzles/seated-cupid/seated-cupid.glb";
const hydriaVase = "../../assets/puzzles/hydria-vase/hydria-vase.glb";
const nTomoMask = "../../assets/puzzles/n-tomo-mask/n-tomo-mask.glb";
const pentecostRederos = "../../assets/puzzles/pentecost-rederos/pentecost-rederos.glb";
const nazcaVessel = "../../assets/puzzles/nazca-vessel/nazca-vessel.glb";
const paleoEngraving = "../../assets/puzzles/paleolithic-engraving/paleolithic-engraving.glb";
const torzoTanku = "../../assets/puzzles/torzo-tanku/torzo-tanku.glb";

const doubleHeadSculptInfo = await json("../assets/puzzles/double-head-sculpt/info.json");
const paintedTrashInfo = await json("../assets/puzzles/painted-trash/info.json");
const mexicoGraffitiInfo = await json("../assets/puzzles/mexico-graffiti/info.json");
const louviersCastleInfo = await json("../assets/puzzles/louviers-castle/info.json");
const seatedCupidInfo = await json("../assets/puzzles/seated-cupid/info.json");
const hydriaVaseInfo = await json("../assets/puzzles/hydria-vase/info.json");
const nTomoMaskInfo = await json("../assets/puzzles/n-tomo-mask/info.json");
const pentecostRederosInfo = await json("../assets/puzzles/pentecost-rederos/info.json");
const nazcaVesselInfo = await json("../assets/puzzles/nazca-vessel/info.json");
const paleoEngravingInfo = await json("../assets/puzzles/paleolithic-engraving/info.json");
const torzoTankuInfo = await json("../assets/puzzles/torzo-tanku/info.json");

const doubleHeadSculptImg = "../assets/puzzles/double-head-sculpt/thumbnail.jpg";
const paintedTrashImg = "../assets/puzzles/painted-trash/thumbnail.jpg";
const mexicoGraffitiImg = "../assets/puzzles/mexico-graffiti/thumbnail.jpg";
const louviersCastleImg = "../assets/puzzles/louviers-castle/thumbnail.jpg";
const seatedCupidImg = "../assets/puzzles/seated-cupid/thumbnail.jpg";
const hydriaVaseImg = "../assets/puzzles/hydria-vase/thumbnail.jpg";
const nTomoMaskImg = "../assets/puzzles/n-tomo-mask/thumbnail.jpg";
const pentecostRederosImg = "../assets/puzzles/pentecost-rederos/thumbnail.jpg";
const nazcaVesselImg = "../assets/puzzles/nazca-vessel/thumbnail.jpg";
const paleoEngravingImg = "../assets/puzzles/paleolithic-engraving/thumbnail.jpg";
const torzoTankuImg = "../assets/puzzles/torzo-tanku/thumbnail.jpg";

const modelURLs = {
	museum,
	doubleHeadSculpt,
	paintedTrash,
	mexicoGraffiti,
	louviersCastle,
	seatedCupid,
	hydriaVase,
	nTomoMask,
	pentecostRederos,
	nazcaVessel,
	paleoEngraving,
	torzoTanku
};

const modelInfos = [
	doubleHeadSculptInfo,
	paintedTrashInfo,
	mexicoGraffitiInfo,
	louviersCastleInfo,
	seatedCupidInfo,
	hydriaVaseInfo,
	nTomoMaskInfo,
	pentecostRederosInfo,
	nazcaVesselInfo,
	paleoEngravingInfo,
	torzoTankuInfo
];

const modelImgs = {
	doubleHeadSculpt: doubleHeadSculptImg,
	paintedTrash: paintedTrashImg,
	mexicoGraffiti: mexicoGraffitiImg,
	louviersCastle: louviersCastleImg,
	seatedCupid: seatedCupidImg,
	hydriaVase: hydriaVaseImg,
	nTomoMask: nTomoMaskImg,
	pentecostRederos: pentecostRederosImg,
	nazcaVessel: nazcaVesselImg,
	paleoEngraving: paleoEngravingImg,
	torzoTanku: torzoTankuImg
};

// Here we just make sure that every file has all the attributes it is supposed to have
// in order to display a rich documentation panel.

modelInfos.forEach( info => {

	if (
		!info.piecesNumber ||
		!info.fileName ||
		!info.artName ||
		!info.artAuthor ||
		!info.modelAuthor ||
		!info.tags ||
		!info.description
	) {
		console.warn( 'this file has a missing attribute : ', info )
	}

} );

//

let worker, onFileReady;

const gltfLoader = new GLTFLoader();
const objectLoader = new THREE.ObjectLoader();

// Loading is done in a loader to avoid rendering stuttering as much as possible

if ( typeof Worker !== 'undefined' ) {

	worker = new Worker( new URL('worker.js', import.meta.url ), { type: "module" } );

	worker.onmessage = function( e ) {

		const geometries = e.data.geometries;
		const texture = e.data.texture;
		const error = e.data.error;
		// not used to display loading progress because three.js requires the server to set the Content-Length header.
		// https://threejs.org/docs/index.html?q=gltfload#examples/en/loaders/GLTFLoader.load
		const isInProgress = e.data.isInProgress;

		if ( error ) console.log( error );

		if ( geometries ) {

			// create a new THREE.BufferGeometry from the shallow object sent by the worker

			geometries.forEach( ( shallowGeometry, i, array) => {

				const geometry = new THREE.BufferGeometry();

				if ( shallowGeometry.index ) {

					const index = new THREE.BufferAttribute(
						shallowGeometry.index.array,
						shallowGeometry.index.itemSize,
						false
					);

					geometry.setIndex( index );

				}

				for ( const attributeName of Object.keys( shallowGeometry.attributes ) ) {

					const shallowAttribute = shallowGeometry.attributes[ attributeName ];

					const attribute = new THREE.BufferAttribute(
						shallowAttribute.array,
						shallowAttribute.itemSize,
						false
					);

					geometry.setAttribute( attributeName, attribute );

				}

				array[i] = geometry;

			} );

			// Recreate the material shared by all meshes of the puzzle
			// As explained in https://github.com/felixmariotto/art-salad/edit/master/../assets/puzzles/README.md
			// It is necessary to make important trade-off to support the Oculus Quest 1,
			// So the only type of material allowed in the application is basic material.

			const newTexture = new THREE.CanvasTexture(
				texture.source.data,
				texture.mapping,
				texture.wrapS,
				texture.wrapT,
				texture.magFilter,
				texture.minFilter,
				texture.format,
				texture.type,
				texture.anisotropy
			);

			newTexture.encoding = THREE.sRGBEncoding;

			const material = new THREE.MeshBasicMaterial( {
				map: newTexture,
				side: THREE.DoubleSide
			} );

			// create meshes from the geometries

			const meshes = geometries.map( geometry => new THREE.Mesh( geometry, material ) );

			const group = new THREE.Group().add( ...meshes );

			//

			if ( onFileReady ) onFileReady( group );

		}

	}

}

// Called by other modules to get a model from a name.
// It returns a Promise, so other modules just have to listen to the promise resolution
// and continue what they wanted to do once they get handed the model.

function getModel( modelName ) {

	return new Promise( (resolve, reject) => {

		const url = modelURLs[ modelName ];

		if ( !url ) reject( new Error('file url is not defined') )

		if ( worker ) {

			onFileReady = ( file ) => {

				resolve( file );

				onFileReady = undefined;

			}

			worker.postMessage( { url } );

		} else {

			reject( new Error('WebWorker not supported by this browser') );

		}

	} );

}

// load a file without going through the webworker.
// Only used to load the museum model so far.

function getModelDirect( modelName ) {

	return new Promise( (resolve, reject) => {

		const url = modelURLs[ modelName ];

		if ( !url ) reject( new Error('file url is not defined') )

		gltfLoader.load( url, 

			function ( gltf ) {

				resolve( gltf.scene );

			},

			// called while loading is progressing
			function ( xhr ) {

				//

			},

			// called when loading has errors
			function ( error ) {

				reject( error )

			}

		);

	} );

}

//

const files = {
	getModel,
	getModelDirect,
	modelInfos,
	modelImgs,
	// this gets filled by UI/browser when it loads model thumbnail, in order to reuse them later.
	modelThumbTextures: []
};

export default files