'use strict';


class SpriteAnimation {
	constructor(frameSequence, 				    //array of numbers
							rowSpriteSheet, 			    //number
							frameWidth, 					    //number
							frameHeight, 					    //number
							offsetFrameX = 0, 		    //number, opt
							offsetFrameY = 0, 		    //number, opt
							animationTiming = 0, 	    //number, opt
							singleAnimation = false   //boolean, opt
							) {
								
		this.frameSequence = frameSequence;
		this.rowSpriteSheet = rowSpriteSheet;
		this.frameWidth = frameWidth;
		this.frameHeight = frameHeight;
		this.offsetFrameX = offsetFrameX;
		this.offsetFrameY = offsetFrameY;
		this.animationTiming = animationTiming;
		this.singleAnimation = singleAnimation;
		
		this.lastFrameIndex = this.frameSequence.length - 1;
	}
}

class AnimatedSprite {
  constructor(x,                                    //number
              y,                                    //number
              imageElem,                            //HTML image element
              currentAnimationPhase = 'init value', //string
              ticksPerFrame = 3) {                  //number, opt    

    this.x = x;
    this.y = y;

    this.imageElem = imageElem;
    this.ticksPerFrame = ticksPerFrame; 
    this.currentAnimationName = currentAnimationPhase;
    this.prevAnimationName = 'init value';
    this.animationSettings = new Map();

    this.frameIndex = 0;
    this.frameNumber = 0;
    this.tickCount = 0;
    this.animationFinished = false;
    this.animationCounter = 0;
    
    this.rowSpriteSheet;
    this.frameWidth;
    this.frameHeight;
    this.offsetFrameX;
    this.offsetFrameY;
    this.animationTiming;
    this.singleAnimation;
    this.lastFrameIndex;
  }

  addAnimation(name, animation) {
    if (animation instanceof SpriteAnimation) {
      this.animationSettings.set(name, animation);
    } else {
      throw new Error('Second argument must be instance of AnimationSettings class!');
    };
  }

  init() {
    this.loadAnimation(this.currentAnimationName);
  }

  update() {
    this.tickCount++;

    if (this.tickCount >= this.ticksPerFrame) {
      this.tickCount = 0;

      if (this.frameIndex < this.lastFrameIndex) { 
        this.frameIndex++;
      } else {
        this.animationFinished = true;
        this.frameIndex = 0;
      };
      this.frameNumber = this.getFrameNumber();
    };
  }

  getFrameNumber() {
    let frameSequence = this.getFrameSequence();

    if (this.singleAnimation && this.animationFinished) {
      return frameSequence[this.lastFrameIndex]; 
    } else {
      return frameSequence[this.frameIndex]; 
    }; 
  }

  getFrameSequence() {
    return this.getCurrentSettings().frameSequence;
  };

  getCurrentSettings() {
    return this.animationSettings.get(this.currentAnimationName);
  }

  loadAnimation(name) { 
    if ( !this.inAnimationSettings(name) )
      throw new Error(`There is not ${name} in animationMap!`);
  
    if (name !== this.prevAnimationName) {
      this.prevAnimationName = this.currentAnimationName;  
      this.currentAnimationName = name;
      this.dispatch();
      this.setCountersToZero();
    };
  }

  inAnimationSettings(name) {
    return this.animationSettings.has(name);
  }

  dispatch() {
    let currentSettings = this.getCurrentSettings();

    for (let property in currentSettings) { 
      if (currentSettings.hasOwnProperty(property)) {
        this[property] = currentSettings[property];
      };
    };
  }

  setCountersToZero() {
    this.frameIndex = 0;
    this.frameNumber = 0;
    this.tickCount = 0; //нужно ли обнулять?
    this.animationFinished = false;
    this.animationCounter = 0;
  }

  render() { 
    game.ctx.drawImage(this.imageElem, this.offsetFrameX + this.frameWidth * this.frameNumber,    
      this.offsetFrameY + this.frameHeight * this.rowSpriteSheet,
      this.frameWidth, this.frameHeight,
      this.x, this.y,
      this.frameWidth, this.frameHeight
    );
  }
}



class MovementSprite extends AnimatedSprite {
   constructor(x,                                    
               y,                                   
               imageElem,                           
               currentAnimationPhase,
               ticksPerFrame) {     

    super(...arguments);

    //physix 
    this.velX = 0;
    this.velY = 0;
    this.jumping = false;
    this.grounded = false;
    this.speed = 3;

    //animation
    this.gazeDirection = 'right';
	}

  startJump() {
    if (this.grounded && !this.jumping) { // grounded нужно для ограничения двойного прыжка
      this.jumping = true;
      this.grounded = false;
      this.velY = -this.speed * 2;
    };
  }

  offsetRight() {
    if (this.onHorisontalPlatform && this.velY == 0) {  
      this.velX += 2;
    } else if (this.velX < this.speed) {
      this.velX++;
    };
  }

  offsetLeft() {
    if (this.onHorisontalPlatform && this.velY == 0) {   
      this.velX -= 2;
    } else if (this.velX > -this.speed) {
      this.velX--;
    };
  }

  movementUp() {
    this.loadAnimation('jump');
    this.startJump();
    this.update();
  }

  stay() {
    this.loadAnimation('idle');
    this.update();
  }

  standing() {
    this.loadAnimation('standing');
    this.update();
  }

  attack() {
    this.loadAnimation('attack');
    this.update();
  }

  inAir() {
    return this.jumping && !this.grounded;
  }

	duck() {
		this.loadAnimation('duck');
		this.update();
	}

	movementRight() {
		this.gazeDirection = 'right';
		if ( !this.inAir() ) {
			this.loadAnimation('right');
		};
		this.offsetRight();
		this.update();
	}

	movementLeft() {
		this.gazeDirection = 'left';
		if ( !this.inAir() ) {
			this.loadAnimation('left');
    };
    this.offsetLeft();
    this.update();
  }
}

