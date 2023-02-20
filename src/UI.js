
/*
Central module for all UI-related stuff.
Each individual page has its own module in the /UI folder.
For information on three-mesh-ui API, see https://github.com/felixmariotto/three-mesh-ui
*/

import * as THREE from 'three';
import ThreeMeshUI from 'three-mesh-ui';

import { loopCallbacks } from './misc/init.js';
import gameManager from './gameManager.js';
import events from './misc/events.js';

import params from './UI/params.js';
import homepage from './UI/homepage.js';
import tutorial from './UI/tutorial.js';
import browser from './UI/browser.js';
import infoPanel from './UI/info.js';
import loading from './UI/loading.js';

const sourceJSON = "../assets/fonts/Source.json";
const sourceImage = "../assets/fonts/Source.png";
const exitIconURL = "../assets/UI-images/exit-icon.png";

// constents for animations

const TRANSLATION_SPEED = 0.03;
const ANGLE_SPEED = 0.03;

const CENTRE_POS = new THREE.Vector3( 0, 1, -1.8 );
const CENTRE_QUAT = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, 0, 0 ) );
const RIGHT_POS = new THREE.Vector3( 2.5, 1, 0 );
const RIGHT_QUAT = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, -Math.PI * 0.5, 0 ) );
const vec3 = new THREE.Vector3();
const quat = new THREE.Quaternion();

let targetPos = CENTRE_POS;
let targetQuat = CENTRE_QUAT;

//

const textureLoader = new THREE.TextureLoader();

// The loading panel is never used as a child of container,
// but this module is still responsible for showing/hiding it and for its animation.

const loadingGroup = new THREE.Group();
loadingGroup.position.copy( CENTRE_POS );
loadingGroup.quaternion.copy( CENTRE_QUAT );

// Base container, pages will be added and remove from this component.

const group = new THREE.Group();

const UI = {
	findIntersection,
	group,
	setTutorial,
	setHomepage,
	loadingGroup
}

//

const container = new ThreeMeshUI.Block( {
	width: params.panelWidth,
	height: params.panelHeight,
	justifyContent: 'center',
	textAlign: 'left',
	fontColor: params.black,
	backgroundColor: params.white,
	backgroundOpacity: 1,
	borderRadius: 0.05
} );

group.position.copy( CENTRE_POS );
group.quaternion.copy( CENTRE_QUAT );

group.add( container );
container.add( homepage );

// EXIT BUTTON
// The exit button is placed on top of the main container, in the same group.
// When the container group is animated, the exit button moves along with it.

const exitContainer = new ThreeMeshUI.Block( {
	width: 0.8,
	height: 0.15,
	fontFamily: sourceJSON,
	fontTexture: sourceImage,
	backgroundColor: params.white,
	backgroundOpacity: 1,
	borderRadius: 0.075,
	justifyContent: 'center'
} );

exitContainer.buttonName = 'exitPuzzle';

exitContainer.setupState( {
	state: 'hovered',
	attributes: { backgroundColor: params.warningColor }
} );

exitContainer.setupState( {
	state: 'idle',
	attributes: { backgroundColor: params.white }
} );

const exitText = new ThreeMeshUI.Text( {
	content: 'Quit puzzle ',
	fontSize: 0.09,
	fontColor: params.black
} );

exitText.onAfterUpdate = function () { this.position.y = 0.02 }

const exitIcon = new ThreeMeshUI.InlineBlock( {
	width: 0.09,
	height: 0.09,
	borderRadius: 0,
	backgroundColor: params.white
} );

exitIcon.onAfterUpdate = function () { this.position.y = -0.005 }

textureLoader.load( exitIconURL, texture => {

	exitIcon.set( { backgroundTexture: texture } );

} );

exitContainer.add(
	exitText,
	new ThreeMeshUI.Text( {
		content: ' ',
		fontSize: 0.09,
		fontColor: params.black
	} ),
	exitIcon
);

exitContainer.position.y += ( params.panelHeight + exitContainer.height ) * 0.5 + 0.05;

///////////////
// EVENTS

events.on( 'clicked-ui', e => {

	findButton( e.detail.element, handleButtonClick );

} );

events.on( 'hovered-ui', e => {

	findButton( e.detail.element, handleButtonHovered );

} );

events.on( 'tutorial-finished', e => {

	group.remove( exitContainer );
	setHomepage();

} );

events.on( 'start-loading', e => {

	loadingGroup.add( loading );

} );

events.on( 'end-loading', e => {

	loadingGroup.remove( loading );

} );

events.on( 'start-puzzle', e => {

	group.add( exitContainer );

} );	

events.on( 'exit-puzzle-request', e => {

	group.remove( exitContainer );
	setBrowser();

} );

// recursive function that look for an element with the property .buttonName among
// the passed element ancestors.

function findButton( element, callback ) {

	// if ( element.buttonName && element.buttonName.includes( 'browserCell' ) ) debugger

	if ( element.buttonName ) {

		callback( element.buttonName, element )

	} else if ( element.parent ) {

		findButton( element.parent, callback );

	}

}

// Used as a callback of an event handler above.
// Triggers stuff based on the clicked button's name, within our outside of this module.

function handleButtonClick( buttonName, button ) {

	if ( buttonName.includes( 'browserNav' ) ) {

		browser.setChunk( Number( buttonName[ buttonName.length - 1 ] ) - 1 );

	}

	if ( buttonName.includes( 'browserCell' ) ) {

		browser.populateInfo( Number( buttonName[ buttonName.length - 1 ] ) - 1 );

	}

	switch ( buttonName ) {

		case 'Puzzles':
			setBrowser();
			break

		case 'Tutorial' :
			setTutorial();
			gameManager.startTutorial();
			break

		case 'arrowLeft' :
			browser.setChunk( 'down' );
			break

		case 'arrowRight' :
			browser.setChunk( 'up' );
			break

		case 'startPuzzle' :
			setInfoPanel( browser.currentPuzzle.fileName );
			gameManager.startPuzzle( browser.currentPuzzle.fileName );
			break

		case 'exitPuzzle' :
			events.emit( 'exit-puzzle-request' );
			break

		default : return

	}

}

// Same as above, for hovered events instead of click events.

function handleButtonHovered( buttonName, button ) {

	if ( buttonName.includes( 'browserNav' ) ) {

		browser.navButtons[ Number( buttonName[ buttonName.length - 1 ] ) - 1 ].isHovered = true;

	}

	if ( buttonName.includes( 'browserCell' ) ) {

		browser.cells[ Number( buttonName[ buttonName.length - 1 ] ) - 1 ].isHovered = true;

	}

	switch ( buttonName ) {

		case 'arrowLeft' :
		case 'arrowRight' :
		case 'startPuzzle' :
		case 'Tutorial' :
		case 'Puzzles' :
			button.isHovered = true;
			break

		case 'exitPuzzle' :
			exitContainer.isHovered = true;
			break

		default : return

	}

}

///////////////
// FUNCTIONS

loopCallbacks.push( update );

function update( frameSpeed ) {

	// triggers style changes

	if ( exitContainer.isHovered ) {

		exitContainer.isHovered = false;
		exitContainer.setState( 'hovered' );

	} else {

		exitContainer.setState( 'idle' );

	}

	// When we want to move the panel to the side or to the front of the side,
	// we do it when a linear animation because it's nicer.

	browser.animate( frameSpeed );
	loading.animate( frameSpeed );
	homepage.animate( frameSpeed );

	if ( !group.position.equals( targetPos ) ) {

		const nominalLength = TRANSLATION_SPEED * frameSpeed;

		vec3
		.copy( targetPos )
		.sub( group.position );

		const newLength = Math.min( vec3.length(), nominalLength );

		if ( newLength !== nominalLength ) {

			group.position.copy( targetPos );

		} else {

			vec3.setLength( newLength );

			group.position.add( vec3 );

		}

	}

	if ( !group.quaternion.equals( targetQuat ) ) {

		const nominalAngle = ANGLE_SPEED * frameSpeed;

		const leftAngle = group.quaternion.angleTo( targetQuat );

		group.quaternion.rotateTowards(
			targetQuat,
			Math.min( leftAngle, nominalAngle )
		)

	}

}

// When we switch page, we actually empty the container and add the new page instead.

function clearContainer() {

	for ( let i=container.children.length-1 ; i>-1 ; i-- ) {

		const child = container.children[i];

		if ( child.isUI ) container.remove( child );

	}

}

// Called by the controls module to find intersection with controller rays.

function findIntersection( raycaster ) {

	const intersects = raycaster.intersectObject( group, true );

	if ( intersects.length ) {

		const intersect = {
			element: findUIParent( intersects[0].object ),
			point: intersects[0].point
		}

		return intersect

	} else {

		return null

	}

}

function findUIParent( object3D ) {

	if ( object3D.isUI ) return object3D
	else if ( object3D.parent ) return findUIParent( object3D.parent )
	return null

}

function setTutorial() {

	clearContainer();

	container.add( tutorial );

	targetPos = RIGHT_POS;
	targetQuat = RIGHT_QUAT;

}

function setHomepage() {

	clearContainer();

	container.add( homepage );

	targetPos = CENTRE_POS;
	targetQuat = CENTRE_QUAT;

}

function setBrowser() {

	clearContainer();

	container.add( browser );

	targetPos = CENTRE_POS;
	targetQuat = CENTRE_QUAT;

}

function setInfoPanel( modelName ) {

	clearContainer();

	infoPanel.setInfo( modelName )

	container.add( infoPanel );

	targetPos = RIGHT_POS;
	targetQuat = RIGHT_QUAT;

}

//

export default UI