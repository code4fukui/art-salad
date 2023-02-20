
/*
This is a page that gets added or removed to the main UI panel by the UI module.
This one is a static page with a step by step guide on how to use the controllers.
*/

import * as THREE from 'three';
import ThreeMeshUI from 'three-mesh-ui';

import params from './params.js';
import { json } from "../json.js";

//const firaJSON = await json("../assets/fonts/Fira.json");
//const firaImage = "../assets/fonts/Fira.png";
const sourceJSON = await json("../assets/fonts/Source.json");
const sourceImage = "../assets/fonts/Source.png";

const joystickURL = "../assets/UI-images/joystick.jpg";
const triggerURL = "../assets/UI-images/trigger-button.jpg";
const squeezeURL = "../assets/UI-images/squeeze-button.jpg";

//

const PADDING_X = 0.40;
const PADDING_Y = 0.08;

const data = [
	{
		text: '1. Push the trigger button of your controller to enable "ray mode". The "ray mode" allows you to highlight puzzle pieces far away from you.',
		imageURL: triggerURL
	},
	{
		text: "2. Push the squeeze button of your controller to grip a puzzle piece while it is highlighted.",
		imageURL: squeezeURL
	},
	{
		text: "3. Push the joystick up or down to attract or repel a puzzle piece while it is gripped.",
		imageURL: joystickURL
	},
	{
		text: "4. Assemble the puzzle pieces together by bringing them closer. When two pieces are close enough or their final position, they will automatically merge."
	}
]

const textureLoader = new THREE.TextureLoader();

//

const tutorial = new ThreeMeshUI.Block( {
	width: params.panelWidth - PADDING_X * 2,
	height: params.panelHeight - PADDING_Y * 2,
	backgroundColor: params.white,
	backgroundOpacity: 1,
	fontColor: params.black,
	// contentDirection: "column-reverse",
	fontFamily: sourceJSON,
	fontTexture: sourceImage,
	justifyContent: "space-between"
} );

//

data.forEach( lineData => {

	const line = new ThreeMeshUI.Block( {
		width: params.panelWidth - PADDING_X * 2,
		height: ( params.panelHeight - PADDING_Y * 2 ) * 0.23,
		backgroundOpacity: 0,
		contentDirection: 'row',
		justifyContent: 'space-between'
	} );

	const lineHeight = ( params.panelHeight - PADDING_Y * 2 ) * 0.23;

	const textContainer = new ThreeMeshUI.Block( {
		width: ( params.panelWidth - PADDING_X * 2 ) - lineHeight,
		height: lineHeight,
		backgroundOpacity: 0,
		justifyContent: 'center',
		textAlign: 'left'
	} );

	const text = new ThreeMeshUI.Text( {
		content: lineData.text,
		offset: 0
	} );

	const imageContainer = new ThreeMeshUI.Block( {
		width: ( params.panelHeight - PADDING_Y * 2 ) * 0.23,
		height: ( params.panelHeight - PADDING_Y * 2 ) * 0.23,
		backgroundColor: params.white,
		backgroundOpacity: 1,
	} );

	textContainer.add( text );
	line.add( textContainer, imageContainer );

	if ( lineData.imageURL ) {

		textureLoader.load( lineData.imageURL, texture => {

			imageContainer.set( {
				backgroundTexture: texture
			} );

		} );

	}

	tutorial.add( line );

} );

export default tutorial