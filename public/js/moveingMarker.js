L.interpolatePosition = function (p1, p2, duration, t) {
  var k = t / duration;
  k = (k > 0) ? k : 0;
  k = (k > 1) ? 1 : k;
  return L.latLng(p1.lat + k * (p2.lat - p1.lat),
    p1.lng + k * (p2.lng - p1.lng));
};

L.getAngle = function (cx, cy, ex, ey) {
  var dy = ey - cy;
  var dx = ex - cx;
  var theta = Math.atan2(dy, dx); // range (-PI, PI]
  theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
  // if (theta < 0) theta = 360 + theta; // range [0, 360)
  return theta;
};

L.Marker.MovingMarker = L.Marker.extend({

  //state constants
  statics: {
    notStartedState: 0,
    endedState: 1,
    pausedState: 2,
    runState: 3
  },

  options: {
    autostart: false,
    loop: false,
    rotate: false,
    initialRotationAngle: 0,
    rotationOrigin: "center",
  },

  initialize: function (latlngs, durations, options) {
    L.Marker.prototype.initialize.call(this, latlngs[0], options);

    this._latlngs = latlngs.map(function (e, index) {
      return L.latLng(e);
    });

    if (durations instanceof Array) {
      this._durations = durations;
    } else {
      this._durations = this._createDurations(this._latlngs, durations);
    }

    this._currentDuration = 0;
    this._currentIndex = 0;

    this._state = L.Marker.MovingMarker.notStartedState;
    this._startTime = 0;
    this._startTimeStamp = 0; // timestamp given by requestAnimFrame
    this._pauseStartTime = 0;
    this._animId = 0;
    this._animRequested = false;
    this._currentLine = [];
    this._stations = {};
  },

  isRunning: function () {
    return this._state === L.Marker.MovingMarker.runState;
  },

  isEnded: function () {
    return this._state === L.Marker.MovingMarker.endedState;
  },

  isStarted: function () {
    return this._state !== L.Marker.MovingMarker.notStartedState;
  },

  isPaused: function () {
    return this._state === L.Marker.MovingMarker.pausedState;
  },

  start: function () {
    if (this.isRunning()) {
      return;
    }

    if (this.isPaused()) {
      this.resume();
    } else {
      this._loadLine(0);
      this._startAnimation();
      this.fire('start');
    }
  },

  resume: function () {
    if (!this.isPaused()) {
      return;
    }
    // update the current line
    this._currentLine[0] = this.getLatLng();
    this._currentDuration -= (this._pauseStartTime - this._startTime);
    this._startAnimation();
  },

  pause: function () {
    if (!this.isRunning()) {
      return;
    }

    this._pauseStartTime = Date.now();
    this._state = L.Marker.MovingMarker.pausedState;
    this._stopAnimation();
    this._updatePosition();
  },

  stop: function (elapsedTime) {
    if (this.isEnded()) {
      return;
    }

    this._stopAnimation();

    if (typeof (elapsedTime) === 'undefined') {
      // user call
      elapsedTime = 0;
      this._updatePosition();
    }

    this._state = L.Marker.MovingMarker.endedState;
    this.fire('end', {
      elapsedTime: elapsedTime
    });
  },

  addLatLng: function (latlng, duration) {
    this._latlngs.push(L.latLng(latlng));
    this._durations.push(duration);
  },

  isSamePlace: function (latlng) {
    let nowPos = this.getLatLng()
    // console.log(latlng)
    // console.log(nowPos)
    if (nowPos.lat === latlng[0] && nowPos.lng === latlng[1]) {
      // console.log('same position')
      return true
    } else {
      return false
    }
  },

  moveTo: function (latlng, duration, deg) {
    if (!this.isSamePlace(latlng)) {
      this._stopAnimation();
      this._latlngs = [this.getLatLng(), L.latLng(latlng)];
      this._durations = [duration];
      this._deg = deg || null
      this._state = L.Marker.MovingMarker.notStartedState;
      this.start();
      this.options.loop = false;
    } else if (deg) {
      this.setRotation(deg)
    }
  },

  setRotation: function (deg) {
    if (!this._icon) return
    this._icon.style[L.DomUtil.TRANSFORM + "Origin"] = this.options.rotationOrigin;
    // this._icon.style[L.DomUtil.TRANSFORM] += " rotateZ(" +
    //   (this.options.initialRotationAngle + deg) +
    //   "deg)";
    // console.log(this._icon.style[L.DomUtil.TRANSFORM])
    let transformText = this._icon.style[L.DomUtil.TRANSFORM]
    let regex = /rotateZ\([0-9]*deg\)/g
    let newStr = transformText.replace(regex, '')
    // console.log(newStr)
    // this._icon.style.transform = `${newStr} rotateZ(${this.options.initialRotationAngle + deg}deg)`
    let curDeg = this.options.initialRotationAngle + deg
    this._icon.style.transform = newStr + ' ' + 'rotateZ(' + curDeg + 'deg)'
    this._oldDeg = deg
  },

  addStation: function (pointIndex, duration) {
    if (pointIndex > this._latlngs.length - 2 || pointIndex < 1) {
      return;
    }
    this._stations[pointIndex] = duration;
  },

  onAdd: function (map) {
    L.Marker.prototype.onAdd.call(this, map);

    if (this.options.autostart && (!this.isStarted())) {
      this.start();
      return;
    }

    if (this.isRunning()) {
      this._resumeAnimation();
    }
  },

  onRemove: function (map) {
    L.Marker.prototype.onRemove.call(this, map);
    this._stopAnimation();
  },

  _createDurations: function (latlngs, duration) {
    var lastIndex = latlngs.length - 1;
    var distances = [];
    var totalDistance = 0;
    var distance = 0;

    // compute array of distances between points
    for (var i = 0; i < lastIndex; i++) {
      distance = latlngs[i + 1].distanceTo(latlngs[i]);
      distances.push(distance);
      totalDistance += distance;
    }

    var ratioDuration = duration / totalDistance;

    var durations = [];
    for (i = 0; i < distances.length; i++) {
      durations.push(distances[i] * ratioDuration);
    }

    return durations;
  },

  _startAnimation: function () {
    this._state = L.Marker.MovingMarker.runState;
    this._animId = L.Util.requestAnimFrame(function (timestamp) {
      this._startTime = Date.now();
      this._startTimeStamp = timestamp;
      this._animate(timestamp);
    }, this, true);
    this._animRequested = true;
  },

  _resumeAnimation: function () {
    if (!this._animRequested) {
      this._animRequested = true;
      this._animId = L.Util.requestAnimFrame(function (timestamp) {
        this._animate(timestamp);
      }, this, true);
    }
  },

  _stopAnimation: function () {
    if (this._animRequested) {
      L.Util.cancelAnimFrame(this._animId);
      this._animRequested = false;
    }
  },

  _updatePosition: function () {
    var elapsedTime = Date.now() - this._startTime;
    this._animate(this._startTimeStamp + elapsedTime, true);
  },

  _updateRotation: function () {
    if (this._rotationAngle && this._icon) {
      this._icon.style[
        L.DomUtil.TRANSFORM + "Origin"
      ] = this.options.rotationOrigin;

      this._icon.style[L.DomUtil.TRANSFORM] +=
        " rotateZ(" +
        (this.options.initialRotationAngle + this._rotationAngle) +
        "deg)";
    }
  },

  _loadLine: function (index) {
    this._currentIndex = index;
    this._currentDuration = this._durations[index];
    this._currentLine = this._latlngs.slice(index, index + 2);
    if (this.options.rotate) {
      // set direction
      this._rotationAngle = L.getAngle(
        this._currentLine[0].lat,
        this._currentLine[0].lng,
        this._currentLine[1].lat,
        this._currentLine[1].lng
      );
    }
  },

  /**
   * Load the line where the marker is
   * @param  {Number} timestamp
   * @return {Number} elapsed time on the current line or null if
   * we reached the end or marker is at a station
   */
  _updateLine: function (timestamp) {
    // time elapsed since the last latlng
    var elapsedTime = timestamp - this._startTimeStamp;

    // not enough time to update the line
    if (elapsedTime <= this._currentDuration) {
      return elapsedTime;
    }

    var lineIndex = this._currentIndex;
    var lineDuration = this._currentDuration;
    var stationDuration;

    while (elapsedTime > lineDuration) {
      // substract time of the current line
      elapsedTime -= lineDuration;
      stationDuration = this._stations[lineIndex + 1];

      // test if there is a station at the end of the line
      if (stationDuration !== undefined) {
        if (elapsedTime < stationDuration) {
          this.setLatLng(this._latlngs[lineIndex + 1]);
          return null;
        }
        elapsedTime -= stationDuration;
      }

      lineIndex++;

      // test if we have reached the end of the polyline
      if (lineIndex >= this._latlngs.length - 1) {

        if (this.options.loop) {
          lineIndex = 0;
          this.fire('loop', {
            elapsedTime: elapsedTime
          });
        } else {
          // place the marker at the end, else it would be at
          // the last position
          this.setLatLng(this._latlngs[this._latlngs.length - 1]);
          this.stop(elapsedTime);
          return null;
        }
      }
      lineDuration = this._durations[lineIndex];
    }

    this._loadLine(lineIndex);
    this._startTimeStamp = timestamp - elapsedTime;
    this._startTime = Date.now() - elapsedTime;
    return elapsedTime;
  },

  _animate: function (timestamp, noRequestAnim) {
    this._animRequested = false;

    // find the next line and compute the new elapsedTime
    var elapsedTime = this._updateLine(timestamp);

    if (this.isEnded()) {
      // no need to animate
      // 有角度就旋转角度
      if (this._deg || this._deg == 0) {
        // console.log('旋转角度')
        // 延迟3秒执行旋转方向，如果三秒后任然是结束状态，就旋转为应该旋转的方向
        setTimeout(() => {
          if (this.isEnded()) {
            this.setRotation(this._deg)
          }
        }, 3000)
      } else {
        this._updateRotation()
      }
      return
    }

    if (elapsedTime != null) {
      // compute the position
      var p = L.interpolatePosition(this._currentLine[0],
        this._currentLine[1],
        this._currentDuration,
        elapsedTime);
      this.setLatLng(p);
      if (this.options.rotate) {
        // console.log('旋转了方向')
        this._updateRotation();
      }
    }

    if (!noRequestAnim) {
      this._animId = L.Util.requestAnimFrame(this._animate, this, false);
      this._animRequested = true;
    }
  }
});

L.Marker.movingMarker = function (latlngs, duration, options) {
  return new L.Marker.MovingMarker(latlngs, duration, options);
};
