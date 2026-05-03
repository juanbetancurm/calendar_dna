/* ══════════════════════════════════════════════════════════════
 *  app.js — Meeting Scheduler for Juan Betancur
 * ══════════════════════════════════════════════════════════════
 *
 *  HOW THIS APP WORKS:
 *  ────────────────────
 *  This is a PUBLIC scheduling page. Visitors come here to
 *  book a meeting with Juan Betancur.
 *
 *  1. The visitor sees a weekly grid (Mon–Sat) with green
 *     "Disponible" slots and gray unavailable slots.
 *
 *  2. They click a green slot → a confirmation modal appears
 *     showing the exact date and time.
 *
 *  3. The visitor can optionally add a meeting subject.
 *
 *  4. They click "Confirmar y agendar" → Google Calendar opens
 *     in a new tab with the event PRE-FILLED:
 *       • Title: "Reunión con Juan Betancur"
 *       • Date & time from the selected slot (30 min)
 *       • Juan's email (juan.jbetancur852@gmail.com) already
 *         added as attendee via the `add` URL parameter
 *       • Timezone: America/Bogota (GMT-5)
 *
 *  5. The visitor just clicks "Save" in Google Calendar →
 *     Google sends Juan a calendar invitation automatically.
 *
 *  The `add` parameter pre-fills the attendee field. The
 *  visitor does NOT need to type Juan's email — it's already
 *  there. They just confirm and save.
 *
 *  A mailto: fallback is also provided for non-Google users.
 *
 *  ⚠ EVENING SLOTS: "4 PM en adelante" capped at 8 PM.
 *    Change the 20 below to adjust.
 * ══════════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────
 *  CONFIGURATION — Edit here to update schedule
 * ────────────────────────────────────────── */
const MY_EMAIL = 'juan.jbetancur852@gmail.com';
const MY_NAME  = 'Juan Betancur';

/*
 * AVAILABILITY — each day (0=Mon … 5=Sat) has an array of
 * [startHour, endHour] in 24h decimal format.
 * 7.5 = 7:30 AM,  16 = 4:00 PM,  20 = 8:00 PM, etc.
 *
 * Each range generates 30-min slots from start UP TO (not including) end.
 * Example: [16, 20] = 4:00 PM, 4:30, 5:00, 5:30, 6:00, 6:30, 7:00, 7:30 PM
 */
const AVAILABILITY = {
  0: [[7, 7.5], [16, 20]],           // Lunes
  1: [[7, 7.5], [11, 12], [16, 20]], // Martes
  2: [[7, 7.5], [11, 12], [16, 20]], // Miércoles
  3: [[7, 7.5], [10, 11], [16, 20]], // Jueves
  4: [[7, 7.5], [16, 20]],           // Viernes
  5: [[8, 17]],                      // Sábado
};

const DAY_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DAY_FULL  = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTHS    = ['enero','febrero','marzo','abril','mayo','junio',
                   'julio','agosto','septiembre','octubre','noviembre','diciembre'];

const START_HOUR = 7;  // grid starts at 7:00 AM
const END_HOUR   = 20; // grid ends at 8:00 PM
const ROWS = (END_HOUR - START_HOUR) * 2; // 26 half-hour rows

/*
 * FIXED START DATE — The schedule begins on Monday May 4, 2026.
 * weekOffset moves forward from this anchor.
 * To change the start date, update this:
 */
const ANCHOR_MONDAY = new Date(2026, 4, 4); // May 4, 2026 (months are 0-indexed)

/* ──────────────────────────────────────────
 *  STATE
 * ────────────────────────────────────────── */
let weekOffset = 0;
let selected = null; // { dayIdx, hour, dateStr }

/* ──────────────────────────────────────────
 *  HELPERS
 * ────────────────────────────────────────── */

// Get the Monday for the displayed week
function getMonday(offset) {
  var mon = new Date(ANCHOR_MONDAY);
  mon.setDate(mon.getDate() + offset * 7);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function dateForDay(monday, dayIdx) {
  var d = new Date(monday);
  d.setDate(monday.getDate() + dayIdx);
  return d;
}

// 16.5 → "4:30 PM"
function fmt(h) {
  var hh = Math.floor(h);
  var mm = (h % 1) === 0.5 ? '30' : '00';
  var ampm = hh >= 12 ? 'PM' : 'AM';
  var h12 = hh === 0 ? 12 : (hh > 12 ? hh - 12 : hh);
  return h12 + ':' + mm + ' ' + ampm;
}

function isAvail(dayIdx, h) {
  var ranges = AVAILABILITY[dayIdx];
  if (!ranges) return false;
  return ranges.some(function(r) { return h >= r[0] && h < r[1]; });
}

function isToday(d) {
  var n = new Date();
  return d.getFullYear() === n.getFullYear() &&
         d.getMonth() === n.getMonth() &&
         d.getDate() === n.getDate();
}

function isPast(d, h) {
  var now = new Date();
  var slot = new Date(d);
  slot.setHours(Math.floor(h), (h % 1) * 60, 0, 0);
  return slot <= now;
}

function isoDate(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function pad2(n) { return String(n).padStart(2, '0'); }

/* ──────────────────────────────────────────
 *  RENDER THE TABLE
 * ────────────────────────────────────────── */
function render() {
  var monday = getMonday(weekOffset);

  // Week label
  var sat = dateForDay(monday, 5);
  var lbl = document.getElementById('weekLabel');
  if (monday.getMonth() === sat.getMonth()) {
    lbl.textContent = monday.getDate() + ' – ' + sat.getDate() +
      ' de ' + MONTHS[monday.getMonth()] + ' ' + monday.getFullYear();
  } else {
    lbl.textContent = monday.getDate() + ' de ' + MONTHS[monday.getMonth()] +
      ' – ' + sat.getDate() + ' de ' + MONTHS[sat.getMonth()] + ' ' + monday.getFullYear();
  }

  // Disable "prev" if at first week
  document.getElementById('prevWeek').disabled = (weekOffset <= 0);

  // Build table
  var html = '<thead><tr><th></th>';
  for (var d = 0; d < 6; d++) {
    var dt = dateForDay(monday, d);
    var cls = isToday(dt) ? ' class="is-today"' : '';
    html += '<th' + cls + '>' +
      '<div class="day-name">' + DAY_SHORT[d] + '</div>' +
      '<div class="day-date">' + dt.getDate() + '</div></th>';
  }
  html += '</tr></thead><tbody>';

  for (var r = 0; r < ROWS; r++) {
    var h = START_HOUR + r * 0.5;
    var isHour = (r % 2 === 0);
    html += '<tr' + (isHour ? ' class="hour-row"' : '') + '>';

    // Time label column — show text only on the hour
    html += '<td class="time-cell">' + (isHour ? fmt(h) : '') + '</td>';

    // 6 day columns
    for (var d = 0; d < 6; d++) {
      var dt = dateForDay(monday, d);
      var ok = isAvail(d, h) && !isPast(dt, h);
      if (ok) {
        html += '<td class="avail" data-d="' + d + '" data-h="' + h +
                '" data-date="' + isoDate(dt) + '">' +
                '<span class="slot-label">Disponible</span></td>';
      } else {
        html += '<td class="unavail"></td>';
      }
    }
    html += '</tr>';
  }
  html += '</tbody>';

  document.getElementById('grid').innerHTML = html;

  // Attach click to every green slot
  var cells = document.querySelectorAll('td.avail');
  for (var i = 0; i < cells.length; i++) {
    (function(td) {
      td.addEventListener('click', function() {
        openModal(
          parseInt(td.dataset.d),
          parseFloat(td.dataset.h),
          td.dataset.date
        );
      });
    })(cells[i]);
  }
}

/* ──────────────────────────────────────────
 *  MODAL — Confirmation step
 * ────────────────────────────────────────── */
function openModal(dayIdx, hour, dateStr) {
  selected = { dayIdx: dayIdx, hour: hour, dateStr: dateStr };

  var d = new Date(dateStr + 'T00:00:00');
  var info = DAY_FULL[dayIdx] + ' ' + d.getDate() +
    ' de ' + MONTHS[d.getMonth()] + ', ' + d.getFullYear() +
    '  ·  ' + fmt(hour) + ' – ' + fmt(hour + 0.5);

  document.getElementById('slotText').textContent = info;
  document.getElementById('gSubject').value = '';

  document.getElementById('overlay').classList.add('open');
  updateLinks();
}

function closeModal() {
  document.getElementById('overlay').classList.remove('open');
  selected = null;
}

/* ──────────────────────────────────────────
 *  BUILD GOOGLE CALENDAR + MAILTO LINKS
 * ────────────────────────────────────────── */
function updateLinks() {
  if (!selected) return;

  var subj = document.getElementById('gSubject').value.trim();
  var title = subj
    ? 'Reunión con ' + MY_NAME + ': ' + subj
    : 'Reunión con ' + MY_NAME;

  // Build date/time strings: YYYYMMDDTHHmmSS
  var d = new Date(selected.dateStr + 'T00:00:00');
  var y  = d.getFullYear();
  var mo = pad2(d.getMonth() + 1);
  var dd = pad2(d.getDate());
  var sH = Math.floor(selected.hour);
  var sM = (selected.hour % 1) * 60;
  var eH = Math.floor(selected.hour + 0.5);
  var eM = ((selected.hour + 0.5) % 1) * 60;

  var startStr = '' + y + mo + dd + 'T' + pad2(sH) + pad2(sM) + '00';
  var endStr   = '' + y + mo + dd + 'T' + pad2(eH) + pad2(eM) + '00';

  var details = 'Reunión agendada desde el calendario de ' + MY_NAME + '.';
  if (subj) details += '\nAsunto: ' + subj;

  // Google Calendar URL — Juan's email is pre-filled as attendee
  var params = new URLSearchParams({
    action:  'TEMPLATE',
    text:    title,
    dates:   startStr + '/' + endStr,
    details: details,
    add:     MY_EMAIL,
    ctz:     'America/Bogota'
  });

  document.getElementById('btnGcal').href =
    'https://calendar.google.com/calendar/render?' + params.toString();

  // Mailto fallback
  var mailSubject = encodeURIComponent(title);
  var mailBody = encodeURIComponent(
    'Hola ' + MY_NAME + ',\n\n' +
    'Me gustaría agendar una reunión contigo:\n\n' +
    '📅 ' + DAY_FULL[selected.dayIdx] + ' ' + dd + '/' + mo + '/' + y + '\n' +
    '🕐 ' + fmt(selected.hour) + ' – ' + fmt(selected.hour + 0.5) +
    ' (Hora de Colombia, GMT-5)\n' +
    (subj ? '📋 Asunto: ' + subj + '\n' : '') +
    '\n¡Gracias!'
  );

  document.getElementById('btnMailto').href =
    'mailto:' + MY_EMAIL + '?subject=' + mailSubject + '&body=' + mailBody;
}

/* ──────────────────────────────────────────
 *  EVENT LISTENERS
 * ────────────────────────────────────────── */
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('btnCancel').addEventListener('click', closeModal);

document.getElementById('overlay').addEventListener('click', function(e) {
  if (e.target === e.currentTarget) closeModal();
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

document.getElementById('gSubject').addEventListener('input', updateLinks);

document.getElementById('prevWeek').addEventListener('click', function() {
  if (weekOffset > 0) { weekOffset--; render(); }
});
document.getElementById('nextWeek').addEventListener('click', function() {
  weekOffset++; render();
});

/* ──────────────────────────────────────────
 *  INIT
 * ────────────────────────────────────────── */
render();
