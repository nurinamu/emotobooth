/* global require */

'use strict';

import * as ease from './../../../_easings';
import * as colorUtils from './../../../_colorUtils';
import canvasUtils from './../../_canvasUtils';
import {EMOTION_STRENGTHS} from './../../../_emotionUtils';

const Timeline = require('gsap/src/minified/TimelineMax.min.js');

export default class HaloStep {
  constructor(imageElement, canvas, context, duration) {
    this.imageElement = imageElement;
    this.canvas = canvas;
    this.context = context;
    this.canvasUtils = new canvasUtils(imageElement, canvas, context);

    this.animateInHalo(duration);
  }

  kill() {
    this.imageElement = null;
    this.canvas = null;
    this.context = null;
    this.canvasUtils = null;
  }

  getStrongestColor() {
    const emo = this.imageElement.facesAndStrongestEmotions;
    let strongestEmotion = 0;

    const strength1 = EMOTION_STRENGTHS[emo[0][Object.keys(emo[0])[0]]];
    const strength2 = EMOTION_STRENGTHS[emo[1][Object.keys(emo[1])[0]]];
    
    if (strength2 > strength1) {
      strongestEmotion = 1;
    }

    let returnColor;

    returnColor = this.imageElement.treatments.personalAuraColors[strongestEmotion][0];

    if(returnColor === 'rgba(34, 45, 51, 1)') {
      const changeTo = (strongestEmotion === 1) ? 0 : 1;
      returnColor = this.imageElement.treatments.personalAuraColors[changeTo][0];
    }

    return returnColor;
  }

  animateInHaloFrame(prg = 1) {
    const progress = prg / 2;
    const gradientColors = this.imageElement.treatments.personalAuraColors;
    const group = this.imageElement.facesAndEmotions.length !== 1;

    this.canvasUtils.redrawBaseImage();
    this.context.save();
    this.canvasUtils.createShapeBackground(0.75);

    if (!this.imageElement.noEmotions) {

      if(this.imageElement.treatments.treatment) {
        if (this.imageElement.treatments.treatment.halo.outerColor === colorUtils.TRANSPARENT && this.imageElement.treatments.treatment.halo.innerColor ===  colorUtils.TRANSPARENT) {
          this.canvasUtils.createTopShapes(false, prg);
          return;
        }
      }

      if (this.imageElement.totalEmotions === 1) {
        const alpha = ease.expOut(0, 0.5, progress);
        const r = ease.expOut(this.canvas.height * 0.1, this.canvas.height * 1.6, progress);

        const gradient = this.context.createRadialGradient(this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y, this.imageElement.hexR, this.imageElement.eyesMidpoint.x, this.imageElement.eyesMidpoint.y, r);

        if (group) {
          gradient.addColorStop(0, this.getStrongestColor());
        } else {
          gradient.addColorStop(0, this.imageElement.treatments.treatment.halo.innerColor);

          if (this.imageElement.treatments.treatment.halo.outerColor !== colorUtils.TRANSPARENT) {
            gradient.addColorStop(0.5, this.imageElement.treatments.treatment.halo.outerColor);
          }
        }
        gradient.addColorStop(1, colorUtils.TRANSPARENT);

        this.context.fillStyle = gradient;
        this.context.globalCompositeOperation = 'source-over';
        this.context.globalAlpha = alpha;

        this.context.fill();

        this.context.restore();
      } else {
        const alpha = ease.expOut(0.2, 0.5, progress);
        const r = ease.expOut(0.1, 1.2, progress);

        if (group) {
          this.context.fillStyle = this.canvasUtils.createSimpleGradient(gradientColors[0][0], colorUtils.TRANSPARENT, r, false);
        } else {
          this.context.fillStyle = this.canvasUtils.createSimpleGradient(this.imageElement.treatments.treatment.halo.outerColor, colorUtils.TRANSPARENT, r, false);
        }

        this.context.globalCompositeOperation = 'source-over';
        this.context.globalAlpha = alpha;

        this.context.fill();

        const alpha2 = ease.expOut(0, 0.5, progress);
        let r2;
        if (group) {
          r2 = ease.expOut(0, (this.imageElement.hexR * (3) / this.canvas.height), progress);
          this.context.fillStyle = this.canvasUtils.createSimpleGradient(colorUtils.subAlpha(gradientColors[1][0], 1), colorUtils.TRANSPARENT, r2, false, 0.4, 1);
        } else {
          r2 = ease.expOut(0, (this.imageElement.hexR * (Object.keys(this.imageElement.facesAndEmotions[0]).length === 1 ? this.imageElement.treatments.treatment.halo.radius : 3) / this.canvas.height), progress);
          this.context.fillStyle = this.canvasUtils.createSimpleGradient(colorUtils.subAlpha(this.imageElement.treatments.treatment.halo.innerColor, Object.keys(this.imageElement.facesAndEmotions[0]).length === 1 ? this.imageElement.treatments.treatment.halo.alpha : 1), colorUtils.TRANSPARENT, r2, false, 0.3, 1);
        }

        this.context.globalAlpha = alpha2;
        this.context.fill();

        this.context.restore();
      }
    }
    this.canvasUtils.createTopShapes(false, prg);
  }

  animateInHalo(duration = 1) {
    const group = this.imageElement.facesAndEmotions.length !== 1;

    if (duration === 0) {
      this.imageElement.ifNotDrawing(() => {
        this.animateInHaloFrame();
      });
    } else {
      let active = null;
      let progress = 0;

      const haloTimeline = new Timeline({
        onStart: () => {
          this.imageElement.timelines.push(haloTimeline);
        },
        onComplete: () => {
          this.imageElement.killTimeline(haloTimeline);
          this.context.restore();
          this.imageElement.allDone = true;
        }
      });

      haloTimeline.to(this.canvas, duration, {
        onStart: () => {
          this.context.save();
          active = haloTimeline.getActive()[0];
          this.imageElement.tweens.push(active);
          this.context.restore();
        },
        onUpdate: () => {
          progress = active.progress();
          if (!group) {
            if (!this.imageElement.treatments.treatment.noEmotionScrim) {
              this.animateInHaloFrame(progress, this.imageElement.treatments.treatment.halo.radius);
            } else {
              this.animateInHaloFrame(progress);
            }
          } else {
            this.animateInHaloFrame(progress);
          }
        },
        onComplete: () => {
          this.imageElement.canvasSnapshot = this.context.createPattern(this.canvas, 'no-repeat');
          this.imageElement.killTween(active);
        }
      });
    }
  }

}
