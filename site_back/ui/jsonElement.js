/* global require, document */

'use strict';

import PanelComponent from './panelComponent';

import * as faceUtils from './_faceUtils';
import * as animationUtils from './_animationUtils';
import * as emotionUtils from './_emotionUtils';

require('gsap/src/minified/TweenMax.min.js');
const TimelineMax = require('gsap/src/minified/TimelineMax.min.js');

export default class JsonElement extends PanelComponent {
  constructor(reqPath = null, respPath = null) {
    super();

    this.reqPath = reqPath;
    this.respPath = respPath;

    this.reqJson = null;
    this.json = null;

    this.title = 'Foo Bar Baz';

    this.mainElt = null;
    this.textWrap = null;

    this.scrim = null;
    this.jsonElement = null;
    this.titleElt = null;

    this.reqJson = null;
    this.resJson = null;

    this.init();
  }

  init() {
    const mainElt = document.createElement('div');
    mainElt.classList.add('json');

    this.textWrap = document.createElement('div');
    this.textWrap.classList.add('json-text-wrap');

    this.scrim = document.createElement('div');
    this.scrim.classList.add('scrim');

    this.mainElt = mainElt;
    this.mainElt.appendChild(this.textWrap);
    this.mainElt.appendChild(this.scrim);
  }

  loadJSON(reqJson, respJson) {
    this.reqJson = reqJson;
    this.reinitFaces(respJson);
    this.killAnimations();
  }

  flash() {
    const tl = new TimelineMax({
      onComplete: () => {
        super.killTimeline(tl);
      }
    });
    tl.to(this.scrim, animationUtils.POINTS_FADE_DURATION, {opacity: 1});
    this.timelines.push(tl);
  }

  analyze(duration = 0) {
    this.injectJSON(this.reqJson, duration / this.timeFactor, '분석중...');
  }

  face(duration = 0) {
    this.injectJSON(this.getFaceInfo(), duration / this.timeFactor, '얼굴(Face)');
  }

  ears(duration = 0) {
    this.injectJSON(this.filterLandmarks(faceUtils.LANDMARK_SECTIONS.EARS), duration / this.timeFactor, '귀(Ears)');
  }

  forehead(duration = 0) {
    this.injectJSON(this.filterLandmarks(faceUtils.LANDMARK_SECTIONS.FOREHEAD), duration / this.timeFactor, '이마(Forehead)');
  }

  nose(duration = 0) {
    this.injectJSON(this.filterLandmarks(faceUtils.LANDMARK_SECTIONS.NOSE), duration / this.timeFactor, '코(Nose)');
  }

  mouth(duration = 0) {
    this.injectJSON(this.filterLandmarks(faceUtils.LANDMARK_SECTIONS.MOUTH), duration / this.timeFactor, '입(Mouth)');
  }

  chin(duration = 0) {
    this.injectJSON(this.filterLandmarks(faceUtils.LANDMARK_SECTIONS.CHIN), duration / this.timeFactor, '턱(Chin)');
  }

  eyes(duration = 0) {
    this.injectJSON(this.filterLandmarks(faceUtils.LANDMARK_SECTIONS.EYES), duration / this.timeFactor, '눈(Eyes)');
  }

  allFeatures(duration = 0) {
    this.injectJSON(this.filterLandmarks(faceUtils.LANDMARK_SECTIONS.FULL), duration / this.timeFactor, '얼굴(Face)');
  }

  emotion(duration = 0) {
    this.injectJSON([this.getEmotionInfo()], duration / this.timeFactor, '감정(Emotion)', false, true);
  }

  complete(duration = 0) {
    const json = [];
    this.json.forEach((item, i) => {
      json.push(this.getEmotionInfo(i));
    });
    this.injectJSON(
      json,
      duration / this.timeFactor,
      '처리 완료',
      true,
      true);
  }

  updateAllText() {
    this.injectTitle();
    this.injectJSON();
  }

  updateJSON(guide) {
    if (guide.TITLE) {
      this.injectTitle(guide.TITLE);
    }
  }

  injectTitle(title = null) {
    if (!title) {
      return;
    }

    if (!this.titleElt) {
      this.titleElt = document.createElement('h1');
      this.titleElt.classList.add('json-title');
      this.textWrap.insertBefore(this.titleElt, this.textWrap.children[0]);
    }

    while (this.titleElt.lastChild) {
      this.titleElt.removeChild(this.titleElt.lastChild);
    }

    this.titleElt.appendChild(document.createTextNode(title));
  }

  addTypeEmphasis(json, html) {
    json.forEach((item) => {
      if (item.type) {
        const re = new RegExp(`"${ item.type }"`, 'g');
        html = html.replace(re, `<span class="json-text-em">${ item.type }</span>`);
      }
    });
    return html;
  }

  syntaxHighlighting(json, breakString = '') {
    let html = JSON.stringify(json, null, breakString);
    let re = new RegExp('{\n</br>','g');
    html = html.replace(re, '{');
    re = new RegExp('\n}','g');
    html = html.replace(re, '}');

    if (json.length) {
      html = this.addTypeEmphasis(json, html);
    } else {
      for (const key in json) {
        if (emotionUtils.EMOTION_LIKELIHOODS.indexOf(key) > -1) {
          if (json[key] !== emotionUtils.EMOTION_STATES.VERY_UNLIKELY) {
            const emotion = `"${ key }": "${ json[key] }"`;
            const emoRe = new RegExp(emotion,'g');
            html = html.replace(emoRe, `<span class="json-text-em_${ key.replace('Likelihood', '') }">${ emotion }</span>`);
          }
        }
        if (key === 'landmarks') {
          html = this.addTypeEmphasis(json[key], html);
        }
      }
    }
    if (html[0] === '[') {
      html = html.slice(1, html.length - 1);
    }
    return html;
  }

  injectJSON(json, duration, title, isFinal, isEmotion) {
    if (!this.jsonElement) {
      this.jsonElement = document.createElement('div');
      this.jsonElement.classList.add('json-text');
      this.textWrap.appendChild(this.jsonElement);
    }

    if (!isEmotion) {
      this.jsonElement.innerHTML = this.syntaxHighlighting(json);
    } else {
      this.jsonElement.innerHTML = '';
      json.forEach((item) => {
        this.jsonElement.innerHTML += `${ this.syntaxHighlighting(item,
        '</br>') }</br></br>`;
      });
    }
    this.injectTitle(title);

    if (this.jsonElement.innerHTML.length > 2000 || (this.jsonElement.innerHTML.split('}').length > 5 && isFinal)) {
    // if (this.jsonElement.innerHTML.length > 2000) {
      this.jsonElement.classList.add('json-text_long');
    } else {
      this.jsonElement.classList.remove('json-text_long');
    }
    const tl = new TimelineMax({
      onComplete: () => {
        super.killTimeline(tl);
      }
    });
    tl.to(this.scrim, animationUtils.POINTS_FADE_DURATION, {
      opacity: 0
    }).to(this.scrim, (duration / this.timeFactor) - animationUtils.POINTS_FADE_DURATION * 2, {
      opacity: 0
    });

    if (!isFinal) {
      tl.to(this.scrim, animationUtils.POINTS_FADE_DURATION, {
        opacity: 1
      });
    }

    this.timelines.push(tl);
  }
}
