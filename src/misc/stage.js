
/* module responsible for creating and fetching all the scene background decorations */

import * as THREE from 'three';
import files from '../files/files.js';

//

const bg = false;

const stageGroup = new THREE.Group();

if (bg) {

	files.getModelDirect('museum').then( model => {

		model.rotation.y -= Math.PI * 0.5;
		model.position.z -= 0.7;

		stageGroup.add( model );

	} );
}

//

export default stageGroup