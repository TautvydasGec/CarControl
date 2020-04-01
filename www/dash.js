var client;

const navBar = document.getElementById('navbar');
const navItem = document.getElementsByClassName('nav-item');
const coordButton = document.getElementById('coordButton');
const zone = document.getElementById('zone');
const zone2 = document.getElementById('zone2');
const circle = document.getElementById('circle');
const zoneCircle = document.getElementById('zoneCircle');
const values = document.getElementById('values');
const directions = document.getElementById('directions');
const explanation = document.getElementById('explanation');
const modeButton = document.getElementById('modeButton');
const controllerButton = document.getElementById('controllerButton');
const buttons = document.getElementById('button-container');
let width =
  window.innerWidth ||
  document.documentElement.clientWidth ||
  document.body.clientWidth;
let height =
  window.innerHeight ||
  document.documentElement.clientHeight ||
  document.body.clientHeight;
let coords = 1;

window.onload = joyStickControll;

function coordsButton() {
  if (coords === 1) {
    values.style.display = 'none';
    coordButton.style.color = 'red';
    coords = 0;
  } else {
    values.style.display = 'block';
    coordButton.style.color = '#b6b6b6';
    coords = 1;
  }
}

let mode = 1;
function modesButton() {
  /* light mode */
  if (mode === 1) {
    zone.style.backgroundColor = 'rgba(235, 235, 235, 1)';
    values.style.color = 'black';
    explanation.style.color = 'black';
    circle.style.background = 'rgb(30, 30, 30)';
    zoneCircle.style.background = 'rgb(60, 60, 60)';
    modeButton.style.color = 'yellow';
    mode = 0;
  } else {
    /* dark mode */
    zone.style.backgroundColor = 'rgb(54, 54, 54)';
    values.style.color = 'white';
    explanation.style.color = 'white';
    circle.style.background = 'rgb(238, 238, 238)';
    zoneCircle.style.background = 'rgba(238, 238, 238, 0.95)';
    modeButton.style.color = '#b6b6b6';
    mode = 1;
  }
}

let controller = 1;
joyStickControll();
function controllersButton() {
  if (controller === 1) {
    controllerButton.style.color = 'red';
    controller = 0;
    joyStickControll();
  } else {
    controllerButton.style.color = '#b6b6b6';
    controller = 1;
    joyStickControll();
  }
}

function moveup() {
  directions.textContent = 'UP';
}

function moveleft() {
  directions.textContent = 'LEFT';
}

function moveright() {
  directions.textContent = 'RIGHT';
}

function movedown() {
  directions.textContent = 'DOWN';
}

/* MQTT SEND */
function mqtt_send_XY(distx, disty) {
  message = new Paho.Message(distx.toFixed(3) + ' ' + disty.toFixed(3));
  message.destinationName = '/cariot/dash/XY';
  client.send(message);
}

/////////////////////////////////////////////////
//////////////////* main controller *///////////
///////////////////////////////////////////////
function joyStickControll() {
  if (controller === 1) {
    explanation.style.display = 'block';
    zone2.style.display = 'none';
    buttons.style.display = 'none';

    let on = document.addEventListener.bind(document);
    let xmouse, ymouse, xStaticMouse, yStaticMouse;
    let xtouch, ytouch, xStaticTouch, yStaticTouch;
    let dist = 0,
      distx = 0,
      disty = 0,
      barrierDist = 75;

    let destroy = false;

    on('mousemove', function(e) {
      xmouse = e.clientX || e.pageX;
      ymouse = e.clientY || e.pageY;
    });
    on('mousedown', function(e) {
      xStaticMouse = e.clientX || e.pageX;
      yStaticMouse = e.clientY || e.pageY;
    });

    on('touchmove', function(e) {
      xtouch = e.touches[0].clientX || e.pageX;
      ytouch = e.touches[0].clientY || e.pageY;
    });
    on('touchstart', function(e) {
      xStaticTouch = e.touches[0].clientX || e.pageX;
      yStaticTouch = e.touches[0].clientY || e.pageY;
      xtouch = xStaticTouch;
      ytouch = yStaticTouch;
    });

    let x = void 0,
      y = void 0,
      dx = void 0,
      dy = void 0,
      tx = 0,
      ty = 0,
      key = -1,
      xs = void 0,
      ys = void 0;

    let followMouse = function followMouse() {
      key = requestAnimationFrame(followMouse);
      xs = xStaticMouse;
      ys = yStaticMouse;
      if (!destroy) {
        if (x || !y) {
          x = xmouse;
          y = ymouse;
        } else {
          dx = (xmouse - x) * 0.125;
          dy = (ymouse - y) * 0.125;
          if (Math.abs(dx) + Math.abs(dy) < 0.1) {
            x = xmouse;
            y = ymouse;
          } else {
            x += dx;
            y += dy;
          }
        }

        /*      barrier fo x movement*/
        if (x < xs - barrierDist) {
          x = xs - barrierDist;
        } else if (x > xs + barrierDist) {
          x = xs + barrierDist;
        } else {
          x = x;
        }
        /*      barrier for y movement*/
        if (y < ys - barrierDist) {
          y = ys - barrierDist;
        } else if (y > ys + barrierDist) {
          y = ys + barrierDist;
        } else {
          y = y;
        }
        /*      animation*/
        circle.style.left = x + 'px';
        circle.style.top = y + 'px';
        zoneCircle.style.left = xStaticMouse + 'px';
        zoneCircle.style.top = yStaticMouse + 'px';
        if (yStaticMouse > height - 170) {
          values.style.marginTop = -90 + 'px';
        } else {
          values.style.marginTop = 200 + 'px';
        }
        if (xStaticMouse < 200) {
          values.style.marginLeft = 100 + 'px';
        } else {
          values.style.marginLeft = 0 + 'px';
        }
        /*      distance calculation*/
        dist = Math.sqrt((x - xs) ** 2 + (y - ys) ** 2);
        distx = x - xs;
        disty = ys - y;
      } else {
        //when mouse is not pressed sending 0
        dist = 0;
        distx = 0;
        disty = 0;
      }
      let sendDistx = (2 * (distx + 75)) / (75 + 75) - 1;
      let sendDisty = (2 * (disty + 75)) / (75 + 75) - 1;

      document.getElementById('x-value').textContent = distx;
      document.getElementById('y-value').textContent = disty;

      mqtt_send_XY(sendDistx, sendDisty);
    };

    /* mouse */
    function generateJoyStick(event, bMouse, type) {
      if (bMouse) {
        zoneCircle.style.display = 'block';
        circle.style.display = 'block';
        destroy = false;
        /* Changing the values position to not hide under screen */
        followMouse();
      }
    }
    function destroyJoyStick(event, bMouse, type) {
      if (bMouse) {
        circle.style.display = 'none';
        zoneCircle.style.display = 'none';
        destroy = true;
      }
    }
    function e_m_down(event) {
      generateJoyStick(event, true, 'down');
    }
    function e_m_up(event) {
      destroyJoyStick(event, true, 'up');
      generateJoyStick(event, false, 'down');
    }
    function e_m_out(event) {
      destroyJoyStick(event, true, 'up');
      generateJoyStick(event, false, 'down');
    }

    ////////////////////////////////////////////////////////
    ////////////////////followTouch/////////////////////////
    /////////////////////////////////////////////////////
    let followTouch = function followTouch() {
      key = requestAnimationFrame(followTouch);
      xs = xStaticTouch;
      ys = yStaticTouch;
      if (!destroy) {
        if (x || !y) {
          x = xtouch;
          y = ytouch;
        } else {
          dx = (xtouch - x) * 0.125;
          dy = (ytouch - y) * 0.125;
          if (Math.abs(dx) + Math.abs(dy) < 0.1) {
            x = xtouch;
            y = ytouch;
          } else {
            x += dx;
            y += dy;
          }
        }

        /*      barrier fo x movement*/
        if (x < xs - barrierDist) {
          x = xs - barrierDist;
        } else if (x > xs + barrierDist) {
          x = xs + barrierDist;
        } else {
          x = x;
        }
        /*      barrier for y movement*/
        if (y < ys - barrierDist) {
          y = ys - barrierDist;
        } else if (y > ys + barrierDist) {
          y = ys + barrierDist;
        } else {
          y = y;
        }
        /*      animation*/
        circle.style.left = x + 'px';
        circle.style.top = y + 'px';

        zoneCircle.style.left = xStaticTouch + 'px';
        zoneCircle.style.top = yStaticTouch + 'px';

        /* values */
        if (yStaticTouch > height - 250) {
          values.style.marginTop = -90 + 'px';
        } else {
          values.style.marginTop = 200 + 'px';
        }
        if (xStaticTouch < 90) {
          values.style.marginLeft = 100 + 'px';
        } else {
          values.style.marginLeft = 0 + 'px';
        }
        /*      distance calculation*/
        dist = Math.sqrt((x - xs) ** 2 + (y - ys) ** 2);
        distx = x - xs;
        disty = ys - y;
      } else {
        //when Touch is not pressed sending 0
        dist = 0;
        distx = 0;
        disty = 0;
      }
      let sendDistx = (2 * (distx + 75)) / (75 + 75) - 1;
      let sendDisty = (2 * (disty + 75)) / (75 + 75) - 1;

      document.getElementById('x-value').textContent = distx;
      document.getElementById('y-value').textContent = disty;

      mqtt_send_XY(sendDistx, sendDisty);
    };

    /* Touch */
    function generateJoyStickT(event, bTouch, type) {
      if (bTouch) {
        zoneCircle.style.display = 'block';
        circle.style.display = 'block';
        destroy = false;
        followTouch();
      }
    }
    function destroyJoyStickT(event, bTouch, type) {
      if (bTouch) {
        circle.style.display = 'none';
        zoneCircle.style.display = 'none';
        destroy = true;
      }
    }
    function e_t_start(event) {
      generateJoyStickT(event, true, 'start');
    }
    function e_t_end(event) {
      destroyJoyStickT(event, true, 'end');
      generateJoyStickT(event, false, 'start');
    }
    function e_t_cancel(event) {
      destroyJoyStickT(event, true, 'end');
      generateJoyStickT(event, false, 'start');
    }

    /* EVENT Listeners */

    if ('ontouchstart' in document.documentElement) {
      zone.addEventListener('touchstart', e_t_start, false);
      zone.addEventListener('touchcancel', e_t_cancel, false);
      zone.addEventListener('touchend', e_t_end, false);
      //zone.addEventListener("touchmove", e_t_move, false);
    } else {
      zone.addEventListener('mousedown', e_m_down, false);
      zone.addEventListener('mouseup', e_m_up, false);
      //zone.addEventListener("mousemove", e_m_move, false);
      zone.addEventListener('mouseleave', e_m_out, false);
    }
  } else {
    buttons.style.display = 'block';
    explanation.style.display = 'none';
    zone2.style.display = 'block';
  }
}

/* MQTT callbacks
 */

// called when the client connects
function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  mqtt_log_update('onConnect');

  client.subscribe('/cariot/car/#');
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    mqtt_log_update('onConnectionLost:' + responseObject.errorMessage);
  }
}

function get_started() {
  var mosquitto_host = window.location.hostname;
  var mosquitto_port = 80; // window.location.port;

  var val_host = document.getElementById('val_host');
  var val_port = document.getElementById('val_port');

  val_host.innerHTML = mosquitto_host;
  val_port.innerHTML = mosquitto_port.toString();

  // Create a client instance
  var client_id = 'web-dash-' + Math.random().toString();
  client = new Paho.Client(mosquitto_host, Number(mosquitto_port), client_id);

  // set callback handlers
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;

  // connect the client
  client.connect({ onSuccess: onConnect });
}

window.onload = get_started;
