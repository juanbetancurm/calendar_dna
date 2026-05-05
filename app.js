const MY_EMAIL = 'juan.jbetancur852@gmail.com';
const MY_NAME = 'Juan Betancur';

const AVAILABILITY = {
  0: [[7, 7.5], [16, 20]],
  1: [[7, 7.5], [11, 12], [16, 20]],
  2: [[7, 7.5], [11, 12], [16, 20]],
  3: [[7, 7.5], [10, 11], [16, 20]],
  4: [[7, 7.5], [16, 20]],
  5: [[8, 17]]
};

const START_HOUR = 7;
const END_HOUR = 20;
const ROWS = (END_HOUR - START_HOUR) * 2;
const ANCHOR_MONDAY = new Date(2026, 4, 4);
const LANGUAGE_STORAGE_KEY = 'calendar-language';
const THEME_STORAGE_KEY = 'calendar-theme';

const I18N = {
  es: {
    htmlLang: 'es',
    documentTitle: 'Agendar reunion - Juan Betancur',
    pageTitle: 'Desarrollo de Aplicación',
    pageSubtitle: 'Seleccione un espacio para agendar una reunion en Google Calendar.',
    tzText: 'Hora de Colombia - GMT-5',
    instructionText: 'Haz clic para agendar',
    prevWeekAria: 'Semana anterior',
    nextWeekAria: 'Semana siguiente',
    legendAvailText: 'Disponible',
    legendUnavailText: 'No disponible',
    noteHtml: '<strong>Nota:</strong> El encuentro se confirmara por correo electronico.',
    modalCloseAria: 'Cerrar',
    modalTitle: 'Confirmar reunion',
    modalDescHtml: 'Se abrira Google Calendar con el evento listo. Solo haz clic en <strong>"Guardar"</strong> para enviar la invitacion a ' + MY_NAME + '.',
    subjectLabel: 'Asunto de la reunion (opcional)',
    subjectPlaceholder: 'Ej: Consulta sobre proyecto, Revision de propuesta...',
    btnGcalText: 'Confirmar y agendar',
    btnCancelText: 'Cancelar',
    themeToggleLight: 'Modo claro',
    themeToggleDark: 'Modo oscuro',
    themeToggleAriaLight: 'Cambiar a modo claro',
    themeToggleAriaDark: 'Cambiar a modo oscuro',
    slotLabel: 'Disponible',
    meetingWith: 'Reunion con ',
    detailsPrefix: 'Reunion agendada desde el agendador de ' + MY_NAME + '.',
    detailsSubject: 'Asunto: ',
    weekJoiner: 'de',
    dayShort: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
    dayFull: ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
    months: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    formatWeekLabel: function(monday, saturday, months) {
      if (monday.getMonth() === saturday.getMonth()) {
        return monday.getDate() + ' - ' + saturday.getDate() + ' de ' + months[monday.getMonth()] + ' ' + monday.getFullYear();
      }

      return monday.getDate() + ' de ' + months[monday.getMonth()] + ' - ' + saturday.getDate() + ' de ' + months[saturday.getMonth()] + ' ' + monday.getFullYear();
    },
    formatSlotText: function(dayName, date, months, start, end) {
      return dayName + ' ' + date.getDate() + ' de ' + months[date.getMonth()] + ', ' + date.getFullYear() + ' - ' + start + ' - ' + end;
    }
  },
  en: {
    htmlLang: 'en',
    documentTitle: 'Schedule meeting - Juan Betancur',
    pageTitle: 'Pipeline Development',
    pageSubtitle: 'Select a slot to schedule a meeting in Google Calendar.',
    tzText: 'Colombia time - GMT-5',
    instructionText: 'Click to schedule',
    prevWeekAria: 'Previous week',
    nextWeekAria: 'Next week',
    legendAvailText: 'Available',
    legendUnavailText: 'Unavailable',
    noteHtml: '<strong>Note:</strong> The meeting will be confirmed by email.',
    modalCloseAria: 'Close',
    modalTitle: 'Confirm meeting',
    modalDescHtml: 'Google Calendar will open with the event ready. Just click <strong>"Save"</strong> to send the invitation to ' + MY_NAME + '.',
    subjectLabel: 'Meeting subject (optional)',
    subjectPlaceholder: 'Example: Project question, Proposal review...',
    btnGcalText: 'Confirm and schedule',
    btnCancelText: 'Cancel',
    themeToggleLight: 'Light mode',
    themeToggleDark: 'Dark mode',
    themeToggleAriaLight: 'Switch to light mode',
    themeToggleAriaDark: 'Switch to dark mode',
    slotLabel: 'Available',
    meetingWith: 'Meeting with ',
    detailsPrefix: 'Meeting scheduled from the calendar page of ' + MY_NAME + '.',
    detailsSubject: 'Subject: ',
    dayShort: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    dayFull: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    formatWeekLabel: function(monday, saturday, months) {
      if (monday.getMonth() === saturday.getMonth()) {
        return months[monday.getMonth()] + ' ' + monday.getDate() + ' - ' + saturday.getDate() + ', ' + monday.getFullYear();
      }

      return months[monday.getMonth()] + ' ' + monday.getDate() + ' - ' + months[saturday.getMonth()] + ' ' + saturday.getDate() + ', ' + monday.getFullYear();
    },
    formatSlotText: function(dayName, date, months, start, end) {
      return dayName + ', ' + months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() + ' - ' + start + ' - ' + end;
    }
  }
};

let weekOffset = 0;
let selected = null;
let currentLang = getInitialLanguage();
let currentTheme = getInitialTheme();

function getInitialLanguage() {
  var stored = null;

  try {
    stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch (err) {
    stored = null;
  }

  if (stored === 'es' || stored === 'en') return stored;
  return 'es';
}

function getCopy() {
  return I18N[currentLang];
}

function getInitialTheme() {
  var stored = null;

  try {
    stored = localStorage.getItem(THEME_STORAGE_KEY);
  } catch (err) {
    stored = null;
  }

  if (stored === 'light' || stored === 'dark') return stored;
  return 'light';
}

function saveLanguage(lang) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (err) {
    return;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (err) {
    return;
  }
}

function getMonday(offset) {
  var monday = new Date(ANCHOR_MONDAY);
  monday.setDate(monday.getDate() + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function dateForDay(monday, dayIdx) {
  var date = new Date(monday);
  date.setDate(monday.getDate() + dayIdx);
  return date;
}

function fmt(hour) {
  var wholeHour = Math.floor(hour);
  var minutes = (hour % 1) === 0.5 ? '30' : '00';
  var ampm = wholeHour >= 12 ? 'PM' : 'AM';
  var hour12 = wholeHour === 0 ? 12 : (wholeHour > 12 ? wholeHour - 12 : wholeHour);
  return hour12 + ':' + minutes + ' ' + ampm;
}

function isAvail(dayIdx, hour) {
  var ranges = AVAILABILITY[dayIdx];
  if (!ranges) return false;

  return ranges.some(function(range) {
    return hour >= range[0] && hour < range[1];
  });
}

function isToday(date) {
  var now = new Date();
  return date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
}

function isPast(date, hour) {
  var now = new Date();
  var slot = new Date(date);
  slot.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);
  return slot <= now;
}

function isoDate(date) {
  return date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0');
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function setText(id, value) {
  var element = document.getElementById(id);
  if (element) element.textContent = value;
}

function setHtml(id, value) {
  var element = document.getElementById(id);
  if (element) element.innerHTML = value;
}

function updateLanguageButtons() {
  var buttons = document.querySelectorAll('.lang-btn');

  for (var i = 0; i < buttons.length; i++) {
    var button = buttons[i];
    var isActive = button.dataset.lang === currentLang;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  }
}

function updateThemeButton() {
  var copy = getCopy();
  var button = document.getElementById('themeToggle');
  var nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  var buttonText = nextTheme === 'dark' ? copy.themeToggleDark : copy.themeToggleLight;
  var ariaText = nextTheme === 'dark' ? copy.themeToggleAriaDark : copy.themeToggleAriaLight;

  document.getElementById('themeToggleText').textContent = buttonText;
  button.setAttribute('aria-label', ariaText);
  button.setAttribute('aria-pressed', String(currentTheme === 'dark'));
}

function applyTheme() {
  document.body.setAttribute('data-theme', currentTheme);
  updateThemeButton();
}

function updateStaticText() {
  var copy = getCopy();

  document.documentElement.lang = copy.htmlLang;
  document.title = copy.documentTitle;

  setText('pageTitle', copy.pageTitle);
  setText('pageSubtitle', copy.pageSubtitle);
  setText('tzText', copy.tzText);
  setText('instructionText', copy.instructionText);
  setText('legendAvailText', copy.legendAvailText);
  setText('legendUnavailText', copy.legendUnavailText);
  setHtml('noteText', copy.noteHtml);
  setText('modalTitle', copy.modalTitle);
  setHtml('modalDesc', copy.modalDescHtml);
  setText('subjectLabel', copy.subjectLabel);
  setText('btnGcalText', copy.btnGcalText);
  setText('btnCancel', copy.btnCancelText);

  document.getElementById('gSubject').placeholder = copy.subjectPlaceholder;
  document.getElementById('prevWeek').setAttribute('aria-label', copy.prevWeekAria);
  document.getElementById('nextWeek').setAttribute('aria-label', copy.nextWeekAria);
  document.getElementById('modalClose').setAttribute('aria-label', copy.modalCloseAria);

  updateLanguageButtons();
  updateThemeButton();
}

function render() {
  var copy = getCopy();
  var monday = getMonday(weekOffset);
  var saturday = dateForDay(monday, 5);
  var html = '<thead><tr><th></th>';

  document.getElementById('weekLabel').textContent = copy.formatWeekLabel(monday, saturday, copy.months);
  document.getElementById('prevWeek').disabled = (weekOffset <= 0);

  for (var day = 0; day < 6; day++) {
    var date = dateForDay(monday, day);
    var cls = isToday(date) ? ' class="is-today"' : '';

    html += '<th' + cls + '>' +
      '<div class="day-name">' + copy.dayShort[day] + '</div>' +
      '<div class="day-date">' + date.getDate() + '</div>' +
      '</th>';
  }

  html += '</tr></thead><tbody>';

  for (var row = 0; row < ROWS; row++) {
    var hour = START_HOUR + row * 0.5;
    var isHour = (row % 2 === 0);

    html += '<tr' + (isHour ? ' class="hour-row"' : '') + '>';
    html += '<td class="time-cell">' + (isHour ? fmt(hour) : '') + '</td>';

    for (var d = 0; d < 6; d++) {
      var dayDate = dateForDay(monday, d);
      var available = isAvail(d, hour) && !isPast(dayDate, hour);

      if (available) {
        html += '<td class="avail" data-d="' + d + '" data-h="' + hour + '" data-date="' + isoDate(dayDate) + '">' +
          '<span class="slot-label">' + copy.slotLabel + '</span></td>';
      } else {
        html += '<td class="unavail"></td>';
      }
    }

    html += '</tr>';
  }

  html += '</tbody>';

  document.getElementById('grid').innerHTML = html;

  var cells = document.querySelectorAll('td.avail');
  for (var i = 0; i < cells.length; i++) {
    (function(td) {
      td.addEventListener('click', function() {
        openModal(
          parseInt(td.dataset.d, 10),
          parseFloat(td.dataset.h),
          td.dataset.date
        );
      });
    })(cells[i]);
  }
}

function updateSlotText() {
  if (!selected) return;

  var copy = getCopy();
  var date = new Date(selected.dateStr + 'T00:00:00');
  var slotText = copy.formatSlotText(
    copy.dayFull[selected.dayIdx],
    date,
    copy.months,
    fmt(selected.hour),
    fmt(selected.hour + 0.5)
  );

  document.getElementById('slotText').textContent = slotText;
}

function openModal(dayIdx, hour, dateStr) {
  selected = {
    dayIdx: dayIdx,
    hour: hour,
    dateStr: dateStr
  };

  document.getElementById('gSubject').value = '';
  updateSlotText();
  document.getElementById('overlay').classList.add('open');
  updateLinks();
}

function closeModal() {
  document.getElementById('overlay').classList.remove('open');
  selected = null;
}

function updateLinks() {
  if (!selected) return;

  var copy = getCopy();
  var subject = document.getElementById('gSubject').value.trim();
  var title = subject ? copy.meetingWith + MY_NAME + ': ' + subject : copy.meetingWith + MY_NAME;
  var date = new Date(selected.dateStr + 'T00:00:00');
  var year = date.getFullYear();
  var month = pad2(date.getMonth() + 1);
  var day = pad2(date.getDate());
  var startHour = Math.floor(selected.hour);
  var startMinute = (selected.hour % 1) * 60;
  var endHour = Math.floor(selected.hour + 0.5);
  var endMinute = ((selected.hour + 0.5) % 1) * 60;
  var startStr = '' + year + month + day + 'T' + pad2(startHour) + pad2(startMinute) + '00';
  var endStr = '' + year + month + day + 'T' + pad2(endHour) + pad2(endMinute) + '00';
  var details = copy.detailsPrefix;

  if (subject) details += '\n' + copy.detailsSubject + subject;

  var params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: startStr + '/' + endStr,
    details: details,
    add: MY_EMAIL,
    ctz: 'America/Bogota'
  });

  document.getElementById('btnGcal').href = 'https://calendar.google.com/calendar/render?' + params.toString();
}

function setLanguage(lang) {
  if (!I18N[lang] || lang === currentLang) return;

  currentLang = lang;
  saveLanguage(lang);
  updateStaticText();
  render();

  if (selected) {
    updateSlotText();
    updateLinks();
  }
}

function setTheme(theme) {
  if ((theme !== 'light' && theme !== 'dark') || theme === currentTheme) return;

  currentTheme = theme;
  saveTheme(theme);
  applyTheme();
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('btnCancel').addEventListener('click', closeModal);
document.getElementById('overlay').addEventListener('click', function(event) {
  if (event.target === event.currentTarget) closeModal();
});

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') closeModal();
});

document.getElementById('gSubject').addEventListener('input', updateLinks);

document.getElementById('prevWeek').addEventListener('click', function() {
  if (weekOffset > 0) {
    weekOffset--;
    render();
  }
});

document.getElementById('nextWeek').addEventListener('click', function() {
  weekOffset++;
  render();
});

document.getElementById('themeToggle').addEventListener('click', function() {
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

var langButtons = document.querySelectorAll('.lang-btn');
for (var i = 0; i < langButtons.length; i++) {
  langButtons[i].addEventListener('click', function() {
    setLanguage(this.dataset.lang);
  });
}

updateStaticText();
applyTheme();
render();
