/* global single */

'use strict';

import * as colorUtils from './../_colorUtils';

const PARTICLE_COUNT = 7;
const NEUTRAL_LINE_COLOR = 'rgba(0,0,0,.3)';

export default class Particles {
  constructor(imageElement, canvas, context) {
    this.imageElement = imageElement;
    this.particlesStarted = false;
    this.particles = [];
    this.particleCount = 0;
    this.particleFade = 1;
    this.killParticles = false;

    this.canvas = canvas;
    this.context = context;

    this.shapeScale = 1;
    if (single) {
      this.shapeScale = 2;
    }

    this.createParticles();
  }

  kill() {
    this.killParticles = true;
    this.imageElement = null;
    this.particles = null;
    this.canvas = null;
    this.context = null;
  }

  calculateWithScale(num) {
    const group = this.imageElement.facesAndEmotions.length !== 1;
    const radiusScale = this.imageElement.hexR / (225 * this.shapeScale);
    let total = num * this.shapeScale;
    if (group && this.imageElement.hexR > 225) {
      total = (num * radiusScale) * this.shapeScale;
    }
    return total;
  }

  createParticles() {
    let i = 0;
    let xPoint = 0;
    let yPoint = 0;

    let particlePoints = [
      { x: this.imageElement.eyesMidpoint.x, y: this.imageElement.eyesMidpoint.y - this.calculateWithScale(160) },
      { x: this.imageElement.eyesMidpoint.x + this.calculateWithScale(200), y: this.imageElement.eyesMidpoint.y + this.calculateWithScale(15) },
      { x: this.imageElement.eyesMidpoint.x + this.calculateWithScale(100), y: this.imageElement.eyesMidpoint.y + this.calculateWithScale(210) },
      { x: this.imageElement.eyesMidpoint.x - this.calculateWithScale(180), y: this.imageElement.eyesMidpoint.y - this.calculateWithScale(80) },
      { x: this.imageElement.eyesMidpoint.x + this.calculateWithScale(190), y: this.imageElement.eyesMidpoint.y - this.calculateWithScale(50) },
      { x: this.imageElement.eyesMidpoint.x - this.calculateWithScale(170), y: this.imageElement.eyesMidpoint.y + this.calculateWithScale(115) },
      { x: this.imageElement.eyesMidpoint.x + this.calculateWithScale(40), y: this.imageElement.eyesMidpoint.y + this.calculateWithScale(220) }
    ];

    const group = this.imageElement.facesAndEmotions.length !== 1;
    if (group) {
      particlePoints = [
        { x: this.imageElement.eyesMidpoint.x - this.calculateWithScale(20), y: this.imageElement.eyesMidpoint.y - this.calculateWithScale(220) },
        { x: this.imageElement.eyesMidpoint.x - this.calculateWithScale(290), y: this.imageElement.eyesMidpoint.y },
        { x: this.imageElement.eyesMidpoint.x + this.calculateWithScale(265), y: this.imageElement.eyesMidpoint.y - this.calculateWithScale(130) },
        { x: this.imageElement.eyesMidpoint.x - this.calculateWithScale(220), y: this.imageElement.eyesMidpoint.y + this.calculateWithScale(275) },
        { x: this.imageElement.eyesMidpoint.x + this.calculateWithScale(290), y: this.imageElement.eyesMidpoint.y + this.calculateWithScale(111) },
        { x: this.imageElement.eyesMidpoint.x + this.calculateWithScale(320), y: this.imageElement.eyesMidpoint.y + this.calculateWithScale(80) },
        { x: this.imageElement.eyesMidpoint.x + this.calculateWithScale(250), y: this.imageElement.eyesMidpoint.y + this.calculateWithScale(215) }
      ];
    }

    for (; i < PARTICLE_COUNT; i++) {
      xPoint = particlePoints[i].x;
      yPoint = particlePoints[i].y;

      this.particles.push({
        x: xPoint,
        y: yPoint,
        size: 2,
        speed: ((Math.random() * 0.5) + 0.5) / 30,
        radius: (Math.random() * 10) + 2
      });
    }
  }

  drawParticles() {
    if (this.killParticles) {
      return;
    }

    let i = 0;

    this.context.save();

    const emoColor = NEUTRAL_LINE_COLOR;
    const color = colorUtils.subAlpha(emoColor, this.particleFade * .3);

    this.context.fillStyle = color;

    for (; i < PARTICLE_COUNT; i++) {
      const p = this.particles[i];

      const x = p.x + Math.sin(this.particleCount * (p.speed)) * p.radius;
      const y = p.y + Math.cos(this.particleCount * (p.speed)) * p.radius;
      const s = p.size;
      this.context.beginPath();
      this.context.arc(x, y, s, 0, Math.PI * 2);
      this.context.fill();
      this.context.closePath();
    }

    this.context.restore();

    this.particleCount++;
  }

}
